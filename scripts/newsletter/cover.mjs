// Gives a Congress Weekly issue its cover photo, from the shared photo
// library in media/photos:
//
//   node scripts/newsletter/cover.mjs november-9-13-2026 capitol-dome-clouds
//   node scripts/newsletter/cover.mjs november-9-13-2026 capitol-dome-clouds --focus 30
//
// It crops the photo to 1200 x 630 (the size link previews use) into
// website/public/newsletter/covers/<issue>.jpg, and writes the cover's src,
// alt text and credit into the issue. --focus picks which part of a photo
// that's too tall or too wide to keep, from 0 (top or left) to 100 (bottom
// or right); the middle, 50, is the default.
//
// Uses sips, which comes with macOS. Run with no photo to list the library.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIBRARY = path.join(REPO, "media", "photos");
const photos = JSON.parse(fs.readFileSync(path.join(LIBRARY, "photos.json"), "utf8"));

const [slug, photoId] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const focusArg = process.argv.indexOf("--focus");
const focus = focusArg > 0 ? Number(process.argv[focusArg + 1]) : 50;

if (!slug || !photoId) {
  console.log("Usage: node scripts/newsletter/cover.mjs <issue> <photo> [--focus 0-100]\n\nPhotos:");
  for (const [id, p] of Object.entries(photos)) console.log(`  ${id.padEnd(28)} ${p.title}  [${p.tags.join(", ")}]`);
  process.exit(slug ? 1 : 0);
}
const photo = photos[photoId];
if (!photo) throw new Error(`No photo "${photoId}" in media/photos/photos.json`);
if (!(focus >= 0 && focus <= 100)) throw new Error("--focus is a number from 0 to 100");
const issueFile = path.join(REPO, "website", "src", "content", "newsletter", `${slug}.md`);
if (!fs.existsSync(issueFile)) throw new Error(`No issue at ${issueFile}`);

// Crop to 1200 x 630: scale so the photo covers that box, then keep the
// focused part of whatever runs over
const W = 1200, H = 630;
const size = (file) => {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
  return { w: Number(out.match(/pixelWidth: (\d+)/)[1]), h: Number(out.match(/pixelHeight: (\d+)/)[1]) };
};
const source = path.join(LIBRARY, photo.file);
const { w, h } = size(source);
const scale = Math.max(W / w, H / h);
const sw = Math.round(w * scale), sh = Math.round(h * scale);
const offsetY = Math.round(((sh - H) * focus) / 100);
const offsetX = Math.round(((sw - W) * focus) / 100);

const covers = path.join(REPO, "website", "public", "newsletter", "covers");
fs.mkdirSync(covers, { recursive: true });
const out = path.join(covers, `${slug}.jpg`);
execFileSync("sips", ["-z", String(sh), String(sw), source, "--out", out], { stdio: "ignore" });
execFileSync("sips", ["-c", String(H), String(W), "--cropOffset", String(offsetY), String(offsetX), out, "--out", out], { stdio: "ignore" });
execFileSync("sips", ["-s", "formatOptions", "82", out, "--out", out], { stdio: "ignore" });

// Into the issue, after its description, replacing any cover it had
const yaml = (s) => JSON.stringify(s);
const block = [
  "cover:",
  `  src: ${yaml(`/newsletter/covers/${slug}.jpg`)}`,
  `  alt: ${yaml(photo.alt)}`,
  ...(photo.credit ? [`  credit: ${yaml(photo.credit)}`] : []),
].join("\n");
let text = fs.readFileSync(issueFile, "utf8");
text = text.replace(/^cover:\n(?:  .*\n)+/m, "");
text = text.replace(/^(description: .*\n)/m, `$1${block}\n`);
fs.writeFileSync(issueFile, text);

const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`${path.relative(REPO, out)} (${kb} KB), from ${photo.file}\n${block}`);
