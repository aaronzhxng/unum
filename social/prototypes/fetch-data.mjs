// Refreshes the API snapshots in data/ that the templates read.
//
//   node social/prototypes/fetch-data.mjs
//
// Sources: the Unum backend (bills, votes, summaries, members), Congress.gov
// (laws, House roll-call list; needs CONGRESS_API_KEY in backend/.env), and
// the House Clerk's roll-call XML (party totals and member positions).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OUTPUT_ROOT } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(OUTPUT_ROOT, "data");
const BACKEND = "https://unum-production.up.railway.app";
const CONGRESS = "https://api.congress.gov/v3";
fs.mkdirSync(DIR, { recursive: true });

const KEY =
  process.env.CONGRESS_API_KEY ||
  (fs.readFileSync(path.join(HERE, "..", "..", "backend", ".env"), "utf8").match(/CONGRESS_API_KEY=["']?([^"'\r\n]+)/) || [])[1];
if (!KEY) throw new Error("CONGRESS_API_KEY not set (env or backend/.env)");

// Bills and members the current templates feature
const BILLS = [
  "hr10841", "hr9576", "hr6500", "hr9497", "hr2140", "hr4646", "hr8800", "hjres1", "hjres213",
  "hconres113", "hr7831", "hr6380", "hr4467", "hr4307", "hr3620", "hr2481", "hr2388", "hr1721",
  "hr837", "hr227", "s2403", "s283", "s195", "s240", "hr5345",
];
const MEMBERS = ["C001133", "T000193", "B001313", "S001195"];

const save = (name, data) => fs.writeFileSync(path.join(DIR, name), JSON.stringify(data));
async function get(url, headers = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) return url.endsWith(".xml") ? res.text() : res.json();
    if (attempt === 3) throw new Error(`${res.status} ${url.replace(KEY, "***")}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

console.log("  backend: officials, featured");
save("officials.json", await get(`${BACKEND}/api/officials`));
save("featured.json", await get(`${BACKEND}/api/bills/featured`));

for (const id of BILLS) {
  console.log("  backend: bill", id);
  save(`bill-${id}.json`, await get(`${BACKEND}/api/bills/${id}`));
  save(`votes-${id}.json`, await get(`${BACKEND}/api/bills/${id}/votes?congress=119`));
  save(`sum-${id}.json`, await get(`${BACKEND}/api/bills/${id}/summaries`));
}
for (const id of MEMBERS) {
  console.log("  backend: member", id);
  save(`member-${id}.json`, await get(`${BACKEND}/api/officials/${id}`));
  save(`pa-${id}.json`, await get(`${BACKEND}/api/officials/${id}/policy-areas`));
}

console.log("  congress.gov: laws, House roll calls");
save("laws.json", await get(`${CONGRESS}/law/119?limit=25&format=json&api_key=${KEY}`));
const list = [];
for (let offset = 0; ; offset += 250) {
  const page = await get(`${CONGRESS}/house-vote/119/2?limit=250&offset=${offset}&format=json&api_key=${KEY}`);
  list.push(...(page.houseRollCallVotes || []));
  if (!page.pagination?.next) break;
}
save("house-votes-s2.json", list);

// The Clerk's XML has totals by party and every member's position
const tag = (x, t) => (x.match(new RegExp("<" + t + "[^>]*>([^]*?)</" + t + ">", "i")) || [])[1]?.trim() || "";
const recent = list.sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 60);
const rollcalls = [];
for (const v of recent) {
  const xml = await get(v.sourceDataURL, { "User-Agent": "Mozilla/5.0" });
  const parties = {};
  for (const m of xml.matchAll(/<totals-by-party>([^]*?)<\/totals-by-party>/gi)) {
    parties[tag(m[1], "party")] = {
      yea: +tag(m[1], "yea-total"), nay: +tag(m[1], "nay-total"),
      present: +tag(m[1], "present-total"), nv: +tag(m[1], "not-voting-total"),
    };
  }
  const members = [...xml.matchAll(/<recorded-vote>([^]*?)<\/recorded-vote>/gi)].map((m) => {
    const l = m[1].match(/<legislator([^>]*)>([^<]*)<\/legislator>/i);
    const at = (k) => (l[1].match(new RegExp(k + '="([^"]*)"')) || [])[1];
    return { name: l[2], bioguide: at("name-id"), party: at("party"), state: at("state"), vote: tag(m[1], "vote") };
  });
  rollcalls.push({
    roll: v.rollCallNumber, date: v.startDate, legis: tag(xml, "legis-num"),
    question: tag(xml, "vote-question"), result: tag(xml, "vote-result"), desc: tag(xml, "vote-desc"),
    voteType: tag(xml, "vote-type"), parties, members,
  });
}
save("house-rollcalls.json", rollcalls);
console.log(`\n  Saved ${fs.readdirSync(DIR).length} files to ${DIR}`);
