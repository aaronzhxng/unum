// Publishes an approved build (build.mjs) to social platforms. Bluesky for
// now; Threads, Instagram and X come next. Run it with the build's OUT:
//
//   OUT=2026-11-02 node social/prototypes/post.mjs              # preview, sends nothing
//   OUT=2026-11-02 node social/prototypes/post.mjs approve 4 5  # approve posts by slug prefix, or "all"
//   OUT=2026-11-02 node social/prototypes/post.mjs send         # post the next approved post
//   OUT=2026-11-02 node social/prototypes/post.mjs send all     # post every approved post
//
// The preview prepares each post exactly as it would be sent (text, image,
// alt text) and stops on anything a platform would reject. Approvals and
// what has been posted are kept in OUT/posting.json, so nothing is ever
// posted twice.
//
// Text is the template's captions.bluesky, else its caption. Alt text is the
// template's alt, else the post's own words read from its HTML.
//
// Needs BLUESKY_HANDLE and BLUESKY_APP_PASSWORD (an app password from
// Bluesky's Settings > Privacy and security > App passwords, never the real
// password), in the environment or backend/.env.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { OUTPUT_ROOT, CHROME } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(OUTPUT_ROOT, process.env.OUT || "out");
const manifestFile = path.join(OUT, "manifest.json");
if (!fs.existsSync(manifestFile)) throw new Error(`No ${manifestFile}; run build.mjs (without a filter) first`);
const { posts } = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

const stateFile = path.join(OUT, "posting.json");
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
state.approved ??= [];
state.posted ??= {};
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

const envFile = path.join(HERE, "..", "..", "backend", ".env");
const dotenv = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
const env = (name) =>
  process.env[name] || (dotenv.match(new RegExp(`^${name}=["']?([^"'\\r\\n]+)`, "m")) || [])[1];

const graphemes = (s) => [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(s)].length;

// ---------------------------------------------------------------------------
// Bluesky
// ---------------------------------------------------------------------------

const BSKY_MAX_TEXT = 300;
const BSKY_MAX_IMAGES = 4;
const BSKY_MAX_BYTES = 1_000_000;

// Links and hashtags only become clickable with facets, which point at byte
// ranges of the UTF-8 text
function facets(text) {
  const enc = new TextEncoder();
  const out = [];
  const add = (m, feature) => {
    const byteStart = enc.encode(text.slice(0, m.index)).length;
    out.push({ index: { byteStart, byteEnd: byteStart + enc.encode(m[0]).length }, features: [feature] });
  };
  for (const m of text.matchAll(/https?:\/\/[^\s]+[^\s.,;:!?)"']/g)) add(m, { $type: "app.bsky.richtext.facet#link", uri: m[0] });
  for (const m of text.matchAll(/(?<![\w#])#([A-Za-z][\w]*)/g)) add(m, { $type: "app.bsky.richtext.facet#tag", tag: m[1] });
  return out;
}

async function bluesky() {
  const identifier = env("BLUESKY_HANDLE"), password = env("BLUESKY_APP_PASSWORD");
  if (!identifier || !password) throw new Error("Set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD (env or backend/.env)");
  const call = async (host, method, body, { token, type = "application/json" } = {}) => {
    const res = await fetch(`${host}/xrpc/${method}`, {
      method: "POST",
      headers: { "Content-Type": type, ...(token && { Authorization: `Bearer ${token}` }) },
      body: type === "application/json" ? JSON.stringify(body) : body,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Bluesky ${method}: ${res.status} ${json.message || json.error || ""}`);
    return json;
  };
  const session = await call("https://bsky.social", "com.atproto.server.createSession", { identifier, password });
  // Writes go to the account's own server, which the login names
  const pds = session.didDoc?.service?.find((s) => s.id === "#atproto_pds")?.serviceEndpoint || "https://bsky.social";
  const token = session.accessJwt;
  return async ({ text, images }) => {
    const embedded = [];
    for (const img of images) {
      const { blob } = await call(pds, "com.atproto.repo.uploadBlob", img.jpg, { token, type: "image/jpeg" });
      embedded.push({ alt: img.alt, image: blob, aspectRatio: { width: img.width, height: img.height } });
    }
    const { uri } = await call(pds, "com.atproto.repo.createRecord", {
      repo: session.did,
      collection: "app.bsky.feed.post",
      record: {
        $type: "app.bsky.feed.post",
        text,
        facets: facets(text),
        langs: ["en"],
        createdAt: new Date().toISOString(),
        embed: { $type: "app.bsky.embed.images", images: embedded },
      },
    }, { token });
    return { uri, url: `https://bsky.app/profile/${session.handle}/post/${uri.split("/").pop()}` };
  };
}

// ---------------------------------------------------------------------------
// Preparing a post
// ---------------------------------------------------------------------------

// Re-encodes a rendered PNG as the best-quality JPEG under the size limit
async function toJpeg(page, pngFile, maxBytes) {
  const src = `data:image/png;base64,${fs.readFileSync(pngFile).toString("base64")}`;
  const { data, width, height } = await page.evaluate(async (src, maxBytes) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    for (let q = 0.92; q > 0.4; q -= 0.06) {
      const url = canvas.toDataURL("image/jpeg", q);
      if ((url.length - 23) * 0.75 <= maxBytes) return { data: url.slice(23), width: img.naturalWidth, height: img.naturalHeight };
    }
    throw new Error("image will not compress under the limit");
  }, src, maxBytes);
  return { jpg: Buffer.from(data, "base64"), width, height };
}

// The post's own words, headline first, then the text on its cards
async function altText(page, htmlFile) {
  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "domcontentloaded" });
  return page.evaluate(() => {
    const text = (sel) => [...document.querySelectorAll(sel)].map((el) => el.innerText.replace(/\s+/g, " ").trim()).join(" ");
    // The kicker's source text, since it is shown in capitals
    const kicker = document.querySelector(".bottom .kicker")?.textContent.replace(/\s+:\s+/, ": ").trim();
    const lead = [kicker, text(".bottom .hl"), text(".bottom .body")].filter(Boolean).join(". ");
    const graphic = text(".top");
    return (graphic ? `${lead} The graphic shows: ${graphic}` : lead).slice(0, 1900);
  });
}

async function prepare(page, p) {
  const text = (p.captions?.bluesky ?? p.caption ?? "").trim();
  const problems = [];
  if (!text) problems.push("no caption");
  if (graphemes(text) > BSKY_MAX_TEXT) problems.push(`text is ${graphemes(text)} characters, over Bluesky's ${BSKY_MAX_TEXT}; add captions.bluesky`);
  if (p.files.length > BSKY_MAX_IMAGES) problems.push(`${p.files.length} images, over Bluesky's ${BSKY_MAX_IMAGES}`);
  const images = [];
  for (const f of p.files.slice(0, BSKY_MAX_IMAGES)) {
    const img = await toJpeg(page, path.join(OUT, f), BSKY_MAX_BYTES);
    img.alt = p.alt || (await altText(page, path.join(OUT, f.replace(/\.png$/, ".html"))));
    images.push(img);
  }
  return { text, images, problems };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const [cmd, ...args] = process.argv.slice(2);
const match = (list) => (list.includes("all") ? posts : posts.filter((p) => list.some((a) => p.slug.startsWith(a))));

if (cmd === "approve") {
  const picked = match(args);
  if (!picked.length) throw new Error(`No posts match ${args.join(" ") || "(nothing given)"}`);
  for (const p of picked) if (!state.approved.includes(p.slug)) state.approved.push(p.slug);
  save();
  console.log(`Approved: ${picked.map((p) => p.slug).join(", ")}`);
} else if (cmd === "unapprove") {
  const picked = new Set(match(args).map((p) => p.slug));
  state.approved = state.approved.filter((s) => !picked.has(s));
  save();
  console.log(`Approved now: ${state.approved.join(", ") || "none"}`);
} else if (cmd && cmd !== "send") {
  throw new Error(`Unknown command "${cmd}"; use approve, unapprove or send`);
} else {
  const sending = cmd === "send";
  const posted = (state.posted.bluesky ??= {});
  const browser = await puppeteer.launch({ executablePath: CHROME });
  try {
    const page = await browser.newPage();
    if (!sending) {
      console.log(`Preview of ${OUT} for Bluesky (nothing is sent)\n`);
      for (const p of posts) {
        const { text, images, problems } = await prepare(page, p);
        const mark = posted[p.slug] ? "posted" : state.approved.includes(p.slug) ? "approved" : "not approved";
        console.log(`${p.slug}  [${mark}]`);
        console.log(`  text (${graphemes(text)}/${BSKY_MAX_TEXT}): ${text}`);
        for (const img of images) console.log(`  image: ${img.width}x${img.height}, ${Math.round(img.jpg.length / 1024)} KB; alt: ${img.alt.slice(0, 110)}…`);
        for (const pr of problems) console.log(`  PROBLEM: ${pr}`);
        if (posted[p.slug]) console.log(`  ${posted[p.slug].url}`);
        console.log("");
      }
      console.log(`Bluesky account: ${env("BLUESKY_HANDLE") && env("BLUESKY_APP_PASSWORD") ? env("BLUESKY_HANDLE") : "not set up (add BLUESKY_HANDLE and BLUESKY_APP_PASSWORD to backend/.env)"}`);
    } else {
      const queue = posts.filter((p) => state.approved.includes(p.slug) && !posted[p.slug]);
      const batch = args.includes("all") ? queue : queue.slice(0, 1);
      if (!batch.length) console.log("Nothing to send: every approved post is already posted.");
      else {
        // Check every post in the batch before sending any of them
        const ready = [];
        for (const p of batch) {
          const prepared = await prepare(page, p);
          if (prepared.problems.length) throw new Error(`${p.slug}: ${prepared.problems.join("; ")}`);
          ready.push([p, prepared]);
        }
        const send = await bluesky();
        for (const [p, prepared] of ready) {
          posted[p.slug] = { ...(await send(prepared)), at: new Date().toISOString() };
          save();
          console.log(`Posted ${p.slug}: ${posted[p.slug].url}`);
        }
        const left = queue.length - batch.length;
        if (left) console.log(`${left} approved post${left > 1 ? "s" : ""} still to send.`);
      }
    }
  } finally {
    await browser.close();
  }
}
