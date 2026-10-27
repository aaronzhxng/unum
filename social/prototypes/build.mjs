// Renders every template in templates.mjs to out/<slug>.html and
// out/<slug>.png (2000 x 2500, i.e. 1000 x 1250 at 2x), then writes
// out/index.html, a gallery for reviewing them side by side.
//
//   node social/prototypes/build.mjs            # all templates
//   node social/prototypes/build.mjs seats      # only slugs containing "seats"
//   OUT=out-inter node social/prototypes/build.mjs   # render to another folder

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { templates } from "./templates.mjs";
import { esc } from "./lib.mjs";

const run = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, process.env.OUT || "out");
fs.mkdirSync(OUT, { recursive: true });

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && fs.existsSync(p));
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

async function screenshot(htmlFile, pngFile) {
  await run(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
    "--window-size=1000,1250", "--virtual-time-budget=10000",
    `--user-data-dir=${path.join(OUT, ".chrome")}`,
    `--screenshot=${pngFile}`, pathToFileURL(htmlFile).href,
  ], { timeout: 120000 });
}

const filter = process.argv[2];
const built = [];
for (const t of templates) {
  if (filter && !t.slug.includes(filter)) continue;
  const slides = [].concat(t.render());
  const files = [];
  for (const [i, html] of slides.entries()) {
    const name = slides.length > 1 ? `${t.slug}-${i + 1}` : t.slug;
    const htmlFile = path.join(OUT, `${name}.html`);
    fs.writeFileSync(htmlFile, html);
    await screenshot(htmlFile, path.join(OUT, `${name}.png`));
    files.push(`${name}.png`);
    console.log("  rendered", name);
  }
  built.push({ ...t, files });
}

if (!filter) {
  const groups = [...new Set(built.map((t) => t.group))];
  const gallery = `<!doctype html><html><head><meta charset="utf-8"><title>Social post prototypes</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; background: #f4f1eb; font: 15px/1.5 Inter, -apple-system, "Segoe UI", sans-serif; color: #222; }
  header, section { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
  h1 { font-size: 28px; margin: 32px 0 4px; } h2 { font-size: 20px; margin: 36px 0 12px; color: #008cff; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
  figure { margin: 0; background: #fff; border-radius: 14px; padding: 12px; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
  figure img { width: 100%; border-radius: 6px; display: block; cursor: zoom-in; }
  .slides { display: grid; grid-auto-flow: column; gap: 6px; }
  figcaption b { display: block; margin-top: 10px; font-size: 16px; }
  figcaption span { display: block; color: #666; font-size: 13px; margin-top: 4px; }
  .tag { display: inline-block; background: #fff3c4; color: #7a5b00; font-size: 12px; padding: 1px 8px; border-radius: 6px; margin-left: 6px; }
</style></head><body>
<header><h1>Social post prototypes</h1><p>${built.length} templates, ${built.reduce((a, t) => a + t.files.length, 0)} images, 4:5. Real data from Congress.gov, the House Clerk, and the Unum backend unless tagged sample. Click an image to open it full size.</p></header>
${groups
  .map((g) => `<section><h2>${esc(g)}</h2><div class="grid">${built
    .filter((t) => t.group === g)
    .map((t) => `<figure><div class="slides">${t.files.map((f) => `<a href="${f}" target="_blank"><img src="${f}" loading="lazy"></a>`).join("")}</div>
      <figcaption><b>${esc(t.name)}${t.sample ? '<span class="tag">sample data</span>' : ""}</b>
      <span><strong>Posts when:</strong> ${esc(t.trigger)}</span><span><strong>Data:</strong> ${esc(t.data)}</span></figcaption></figure>`)
    .join("")}</div></section>`)
  .join("")}
<p style="height:40px"></p></body></html>`;
  fs.writeFileSync(path.join(OUT, "index.html"), gallery);
  console.log(`\n  ${built.length} templates -> ${path.join(OUT, "index.html")}`);
}
