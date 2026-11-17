// Fetches what one set's posts need, beyond fetch-data.mjs's shared files:
// each bill's details, summaries, votes, actions and cosponsors, and each
// member's profile, policy areas and bills. Run fetch-data.mjs first.
//
//   node social/prototypes/fetch-set.mjs hr10167 hr1013 s5714 M001136
//
// Bills are lowercase type and number (hr10167, s5714, hres12); members are
// Bioguide IDs (M001136). Also saves committees.json.

import fs from "node:fs";
import path from "node:path";
import { OUTPUT_ROOT } from "./lib.mjs";

const DIR = path.join(OUTPUT_ROOT, "data");
const BACKEND = "https://unum-production.up.railway.app";
fs.mkdirSync(DIR, { recursive: true });

const ids = process.argv.slice(2);
if (!ids.length) throw new Error("Usage: node social/prototypes/fetch-set.mjs <bill or member ID>...");

const save = (name, data) => fs.writeFileSync(path.join(DIR, name), JSON.stringify(data));
async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (attempt === 3) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

for (const id of ids) {
  if (/^[A-Z]\d{6}$/.test(id)) {
    console.log("  member", id);
    save(`member-${id}.json`, await get(`${BACKEND}/api/officials/${id}`));
    save(`pa-${id}.json`, await get(`${BACKEND}/api/officials/${id}/policy-areas`));
    save(`sponsored-${id}.json`, await get(`${BACKEND}/api/officials/${id}/sponsored`));
    save(`cosponsored-${id}.json`, await get(`${BACKEND}/api/officials/${id}/cosponsored`));
  } else if (/^[a-z]+\d+$/.test(id)) {
    console.log("  bill", id);
    save(`bill-${id}.json`, await get(`${BACKEND}/api/bills/${id}`));
    save(`sum-${id}.json`, await get(`${BACKEND}/api/bills/${id}/summaries`));
    save(`votes-${id}.json`, await get(`${BACKEND}/api/bills/${id}/votes?congress=119`));
    save(`actions-${id}.json`, (await get(`${BACKEND}/api/bills/${id}/actions`)).actions ?? []);
    save(`cosponsors-${id}.json`, (await get(`${BACKEND}/api/bills/${id}/cosponsors`)).cosponsors ?? []);
  } else {
    throw new Error(`Not a bill or member ID: ${id}`);
  }
}
console.log("  committees");
save("committees.json", await get(`${BACKEND}/api/committees`));
console.log(`  Saved to ${DIR}`);
