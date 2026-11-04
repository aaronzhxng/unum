#!/usr/bin/env node
// Saves a small square photo of every sponsor named in the newsletter issues
// (website/src/content/newsletter/*.md, by their sponsorId) to
// website/public/newsletter/members/<bioguideId>.jpg, cropped from the
// official portrait. The web and email versions show them as circles, with
// the sponsor's initials instead when there is no photo. Only missing
// photos are downloaded, so run it after adding an issue:
//
//   node scripts/newsletter/memberPhotos.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ISSUES = path.join(ROOT, "website", "src", "content", "newsletter");
const OUT = path.join(ROOT, "website", "public", "newsletter", "members");
const SIZE = 96; // shown at up to 32px, so sharp on high-density screens

const ids = new Set();
for (const file of fs.readdirSync(ISSUES).filter((f) => f.endsWith(".md"))) {
  for (const [, id] of fs.readFileSync(path.join(ISSUES, file), "utf8").matchAll(/sponsorId:\s*([A-Z]\d{6})/g)) ids.add(id);
}
fs.mkdirSync(OUT, { recursive: true });
const missing = [...ids].filter((id) => !fs.existsSync(path.join(OUT, `${id}.jpg`)));
console.log(`${ids.size} sponsors, ${missing.length} photos to fetch`);

if (missing.length) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (const id of missing) {
    // Bioguide first, then the public-domain @unitedstates collection, which
    // fills some of Bioguide's gaps
    let res = await fetch(`https://bioguide.congress.gov/photo/${id}.jpg`);
    if (!res.ok) res = await fetch(`https://unitedstates.github.io/images/congress/450x550/${id}.jpg`);
    if (!res.ok) {
      console.log(`  ${id}: no photo (${res.status})`);
      continue;
    }
    const src = `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
    // Portraits are taller than wide with the face in the upper part, so the
    // square is taken from just below the top
    const jpg = await page.evaluate(async (src, size) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const top = Math.max(0, Math.min(img.naturalHeight - side, img.naturalHeight * 0.06));
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, top, side, side, 0, 0, size, size);
      return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    }, src, SIZE);
    fs.writeFileSync(path.join(OUT, `${id}.jpg`), Buffer.from(jpg, "base64"));
    console.log(`  ${id}: saved`);
  }
  await browser.close();
}
