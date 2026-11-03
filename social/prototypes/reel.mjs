// Turns a finished build (build.mjs) into vertical 1080 x 1920 videos for
// Instagram Reels, TikTok and YouTube Shorts. Run it after build.mjs, with the
// same OUT:
//
//   OUT=2026-11-02 node social/prototypes/reel.mjs          # the day's recap
//   OUT=2026-11-02 node social/prototypes/reel.mjs 4-week   # one post, animated
//
// With no argument it makes reel-recap.mp4: a hook screen, every post in the
// build in order (about 2.8s each, swiping in), and a follow screen. A set can
// export recap = { hook, label, outro } to word the first and last screens.
//
// With a slug filter it makes reel-<slug>.mp4 for each matching post: the post
// builds itself in (cards, rows, bars and dots, numbers counting up, then the
// headline) and holds so it can be read. Save these for big, already-trending
// bills; a template can set hook to put a line above the post.
//
// The videos have no sound, so a trending sound can be added in each app.
// Needs ffmpeg on the PATH (or FFMPEG_PATH): winget install Gyan.FFmpeg, or
// brew install ffmpeg.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { esc, OUTPUT_ROOT, CHROME, FONTS, LOGO } from "./lib.mjs";

const OUT = path.join(OUTPUT_ROOT, process.env.OUT || "out");
const manifestFile = path.join(OUT, "manifest.json");
if (!fs.existsSync(manifestFile)) throw new Error(`No ${manifestFile}; run build.mjs (without a filter) first`);
const { recap, posts } = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

const FPS = 30;
const W = 1080, H = 1920;
// Where the post sits: clear of the app's caption and buttons along the
// bottom and right edge
const SLOT = { x: 70, y: 330, w: 940, h: 1175 };
const EASE = "cubic-bezier(.2,.8,.2,1)";

const CSS = `
:root { --paper: #f4f1eb; --blue: #008cff; --ink: #000; --gray: #535353; --muted: #7b7c81; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--paper); color: var(--ink);
  font-family: Inter, -apple-system, "Segoe UI", sans-serif; }
.screen { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
.shot { position: absolute; left: ${SLOT.x}px; top: ${SLOT.y}px; width: ${SLOT.w}px; height: ${SLOT.h}px;
  border-radius: 22px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.16); background: var(--paper); }
.shot img { width: 100%; height: 100%; display: block; }
.shot iframe { width: 1000px; height: 1250px; border: 0; transform: scale(${SLOT.w / 1000}); transform-origin: 0 0; }
.kicker { font: 500 34px "DM Mono", monospace; color: var(--blue); text-transform: uppercase; letter-spacing: .02em; }
.mark { display: flex; align-items: center; gap: 16px; font: 500 40px "DM Mono", monospace; letter-spacing: 4px; }
.mark img { width: 52px; height: 52px; border-radius: 8px; }
.say { font-family: Fraunces, serif; font-weight: 900; letter-spacing: -0.02em; line-height: 1.04; }
.bars { position: absolute; left: ${SLOT.x}px; top: 236px; width: ${SLOT.w}px; display: flex; gap: 10px; }
.bars div { flex: 1; height: 8px; border-radius: 4px; background: rgba(0,0,0,.12); overflow: hidden; }
.bars i { display: block; height: 100%; background: var(--blue); transform-origin: 0 0; }
.label { position: absolute; left: ${SLOT.x}px; right: ${SLOT.x}px; top: 266px; display: flex; justify-content: space-between;
  font: 500 26px "DM Mono", monospace; color: var(--muted); text-transform: uppercase; }
`;

// Every animation goes through anim() so the recorder can pause them all and
// step to an exact time, frame by frame. ticks are per-frame callbacks for
// what CSS cannot animate (counting numbers).
const RUNTIME = `
window.anims = []; window.ticks = [];
window.anim = (el, frames, at, dur, { easing = "${EASE}", fill = "both" } = {}) =>
  anims.push(el.animate(frames, { delay: at * 1000, duration: dur * 1000, easing, fill }));
window.seek = (t) => {
  for (const a of anims) { a.pause(); a.currentTime = t * 1000; }
  for (const f of ticks) f(t);
};
`;

const shell = (bodyHtml, script) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}"><style>${CSS}</style></head><body>${bodyHtml}
<script>${RUNTIME}</script><script>window.setup = async () => { ${script} };</script></body></html>`;

const mark = `<div class="mark"><img src="${LOGO}"><span>UNUM</span></div>`;

// ---------------------------------------------------------------------------
// The day's recap
// ---------------------------------------------------------------------------

function recapPage() {
  const shots = posts.map((p) => p.files[0]);
  const n = shots.length;
  const hook = recap.hook || `${n} things from Congress today`;
  const outro = recap.outro || "Follow for tomorrow's recap.";
  const label = recap.label || "";
  const HOOK = 1.8, PER = 2.8, SWIPE = 0.35, OUTRO = 2.4;
  const end = HOOK + n * PER + OUTRO;
  const html = `
<div class="screen" id="hook">
  <div style="position:absolute;left:${SLOT.x}px;right:${SLOT.x}px;top:330px">${mark}</div>
  <div style="position:absolute;left:${SLOT.x}px;right:${SLOT.x}px;top:620px">
    <div class="kicker">${esc(label ? `Daily recap · ${label}` : "Daily recap")}</div>
    <div class="say" style="font-size:112px;margin-top:26px">${esc(hook)}</div>
  </div>
  <div id="thumbs" style="position:absolute;left:${SLOT.x}px;right:${SLOT.x}px;top:1190px;display:flex;gap:12px">
    ${shots.map((f) => `<img src="${esc(f)}" style="width:calc((100% - ${(n - 1) * 12}px) / ${n});border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.14)">`).join("")}
  </div>
</div>
<div class="bars" id="bars">${shots.map(() => "<div><i></i></div>").join("")}</div>
<div class="label" id="label"><span>${esc(label)}</span><span id="count"></span></div>
${shots.map((f) => `<div class="shot"><img src="${esc(f)}"></div>`).join("")}
<div class="screen" id="outro" style="display:flex;flex-direction:column;justify-content:center;padding:0 ${SLOT.x}px 200px">
  <img src="${LOGO}" style="width:140px;height:140px;border-radius:30px">
  <div class="say" style="font-size:104px;margin-top:48px">${esc(outro)}</div>
  <div class="kicker" style="margin-top:36px;color:var(--gray)">Every bill, every vote · Unum app</div>
</div>`;
  const script = `
const HOOK = ${HOOK}, PER = ${PER}, SWIPE = ${SWIPE};
const out = { transform: ["translateX(0)", "translateX(-${W}px)"] };
const inn = { transform: ["translateX(${W}px)", "translateX(0)"] };
// The hook is on screen from the first frame, so it also works as the cover
anim(document.querySelector("#hook .say"), { transform: ["scale(1.04)", "scale(1)"], transformOrigin: ["0 50%", "0 50%"] }, 0, 1.2);
[...document.querySelectorAll("#thumbs img")].forEach((el, i) =>
  anim(el, { transform: ["translateY(24px)", "none"] }, i * 0.06, 0.8));
anim(document.getElementById("hook"), out, HOOK - SWIPE, SWIPE, { fill: "forwards" });
for (const id of ["bars", "label"]) {
  anim(document.getElementById(id), { opacity: [0, 1] }, HOOK - SWIPE, SWIPE);
  anim(document.getElementById(id), { opacity: [1, 0] }, HOOK + ${n} * PER - SWIPE, SWIPE, { fill: "forwards" });
}
const count = document.getElementById("count");
ticks.push((t) => { count.textContent = Math.min(${n}, Math.max(1, Math.floor((t - HOOK + SWIPE) / PER) + 1)) + " / ${n}"; });
[...document.querySelectorAll(".shot")].forEach((el, i) => {
  const start = HOOK + i * PER - SWIPE;
  anim(el, inn, start, SWIPE);
  anim(el, out, start + PER, SWIPE, { fill: "forwards" });
  // A slow push-in so a still post never sits frozen
  anim(el.firstElementChild, { transform: ["scale(1)", "scale(1.03)"] }, start, PER + SWIPE, { easing: "linear" });
  anim(document.querySelectorAll("#bars i")[i], { transform: ["scaleX(0)", "scaleX(1)"] }, start + SWIPE, PER - SWIPE, { easing: "linear" });
});
anim(document.getElementById("outro"), inn, HOOK + ${n} * PER - SWIPE, SWIPE);`;
  return { html: shell(html, script), end, file: "reel-recap.mp4" };
}

// ---------------------------------------------------------------------------
// One post, built in
// ---------------------------------------------------------------------------

// Runs inside the reel page against the post's iframe. It works from the
// shared design system's structure (.top cards and their rows, .bottom's
// kicker / headline / body), so every template animates without changes.
const BUILD_IN = `
const doc = document.querySelector("iframe").contentDocument;
await doc.fonts.ready;
await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const rise = (el, at, d = 24) => anim(el, { opacity: [0, 1], translate: ["0 " + d + "px", "0 0"] }, at, 0.5);
let t = 0.3;
const tops = [...doc.querySelectorAll(".top > *")];
tops.forEach((el, i) => rise(el, t + i * 0.12, 40));
t += 0.2 + tops.length * 0.12;

// Rows inside each card, one after another; grids (like a row of stat
// panels) reveal their cells
const items = [];
const collect = (el) => {
  for (const c of el.children) {
    if (getComputedStyle(c).display === "grid" && c.children.length > 1) collect(c);
    else items.push(c);
  }
};
for (const el of tops) {
  const inner = el.querySelector(":scope > .in");
  if (inner) collect(inner);
}
const step = Math.min(0.16, Math.max(0.06, 1.8 / (items.length || 1)));
items.forEach((el, i) => {
  const at = t + i * step;
  rise(el, at, 16);
  // Numbers count up to their value
  for (const big of el.querySelectorAll(".big")) {
    const text = big.textContent.trim();
    if (!/^\\d[\\d,]*$/.test(text) || text === "0") continue;
    const target = Number(text.replace(/,/g, "")), commas = text.includes(",");
    big.style.fontVariantNumeric = "tabular-nums";
    ticks.push((now) => {
      const p = Math.min(1, Math.max(0, (now - at) / 0.9));
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      big.textContent = commas ? v.toLocaleString("en-US") : String(v);
    });
  }
  // Vote bars and stage tracks fill from the left
  for (const bar of el.querySelectorAll(".track i, .trk i")) {
    bar.style.transformOrigin = "0 50%";
    anim(bar, { scale: ["0 1", "1 1"] }, at + 0.15, 0.7);
  }
  // Seat charts and dot grids fill in seat by seat
  for (const svg of el.querySelectorAll("svg")) {
    const dots = [...svg.querySelectorAll("circle")];
    dots.forEach((c, k) => anim(c, { opacity: [0, 1] }, at + 0.1 + (k / dots.length) * 0.9, 0.15, { easing: "linear" }));
  }
});
t += items.length * step + 0.5;
// Then the kicker, headline and body
[...doc.querySelectorAll(".bottom > *")].forEach((el, i) => rise(el, t + i * 0.2, 20));
return t + doc.querySelectorAll(".bottom > *").length * 0.2 + 0.5;`;

function postPage(p) {
  const htmlFile = path.join(OUT, p.files[0].replace(/\.png$/, ".html"));
  const post = fs.readFileSync(htmlFile, "utf8");
  const html = `
<div style="position:absolute;left:${SLOT.x}px;right:${SLOT.x}px;top:150px;height:${SLOT.y - 180}px;display:flex;flex-direction:column;justify-content:flex-end;gap:18px">
  ${p.hook ? `<div class="say" style="font-size:58px">${esc(p.hook)}</div>` : mark}
</div>
<div class="shot"><iframe srcdoc="${esc(post)}"></iframe></div>`;
  return { html: shell(html, BUILD_IN), file: `reel-${p.slug}.mp4` };
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

async function record({ html, end, file }, browser) {
  const pageFile = path.join(OUT, file.replace(/\.mp4$/, ".html"));
  fs.writeFileSync(pageFile, html);
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(pageFile).href, { waitUntil: "load" });
  await page.waitForFunction(() => [...document.querySelectorAll("iframe")].every((f) => f.contentDocument?.readyState === "complete"));
  await page.evaluate(() => document.fonts.ready);
  const revealed = await page.evaluate(() => window.setup());
  // A built-in post holds long enough to read once it is all on screen
  const duration = end ?? revealed + 5;

  const outFile = path.join(OUT, file);
  const ffmpeg = spawn(process.env.FFMPEG_PATH || "ffmpeg", [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", outFile,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((resolve, reject) => {
    ffmpeg.on("error", (e) => reject(e.code === "ENOENT" ? new Error("ffmpeg not found; install it or set FFMPEG_PATH") : e));
    ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });

  const frames = Math.ceil(duration * FPS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.seek(t), i / FPS);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
  }
  ffmpeg.stdin.end();
  await done;
  await page.close();
  console.log(`  ${file} (${duration.toFixed(1)}s)`);
}

const filter = process.argv[2];
const jobs = filter ? posts.filter((p) => p.slug.includes(filter)).map(postPage) : [recapPage()];
if (!jobs.length) throw new Error(`No post in ${OUT} matches "${filter}"`);
const browser = await puppeteer.launch({ executablePath: CHROME, args: ["--hide-scrollbars"] });
try {
  for (const job of jobs) await record(job, browser);
} finally {
  await browser.close();
}
