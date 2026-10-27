// Loads the cached API responses in data/ (see fetch-data.mjs) into simple
// shapes the templates use: members, roll-call votes, and bills.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fmtDate } from "./lib.mjs";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const has = (f) => fs.existsSync(path.join(DIR, f));

export const STATES = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
  Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
  Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA",
  "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
  "Puerto Rico": "PR", Guam: "GU", "Virgin Islands": "VI", "American Samoa": "AS",
  "Northern Mariana Islands": "MP",
};
const TERRITORIES = new Set(["DC", "PR", "GU", "VI", "AS", "MP"]);

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

const staticInfo = JSON.parse(
  fs.readFileSync(path.join(DIR, "..", "..", "..", "app", "data", "officials-static.json"), "utf8"),
);

export const members = new Map(
  read("officials.json").officials.map((o) => {
    const [last, first = ""] = o.name.split(", ");
    const party = { Democratic: "D", Republican: "R", Independent: "I" }[o.partyName] || "I";
    const abbr = STATES[o.state] || o.state;
    const senate = o.chamber === "Senate";
    const district = o.district ?? null;
    const m = {
      bioguide: o.bioguideId,
      first: first.replace(/\s+[A-Z]\.$/, ""),
      last,
      display: `${first.replace(/\s+[A-Z]\.$/, "")} ${last}`.trim(),
      party,
      partyName: o.partyName,
      state: abbr,
      stateName: o.state,
      district,
      senate,
      voting: !TERRITORIES.has(abbr),
      photo: o.depiction?.imageUrl || "",
      since: Math.min(...(o.terms?.item || []).map((t) => t.startYear).filter(Boolean)),
      ...(staticInfo[o.bioguideId] || {}),
    };
    m.title = senate ? "Sen." : "Rep.";
    m.seat = senate ? m.state : `${m.state}-${district === 0 || district == null ? "AL" : district}`;
    m.tag = `${m.party}-${m.seat}`;
    m.roleLine = senate ? `Senator, ${o.state}` : `Representative, ${o.state}'s ${ordinal(district || 1)}`;
    m.districtName = senate ? o.state : `${o.state}'s ${district ? ordinal(district) : "At-Large"} District`;
    return [o.bioguideId, m];
  }),
);

export const member = (id) => {
  const m = members.get(id);
  if (!m) throw new Error(`Unknown member ${id}`);
  const pa = has(`pa-${id}.json`) ? read(`pa-${id}.json`) : null;
  return { ...m, areas: pa?.policyAreas || [], sponsored: pa?.totalSponsored, cosponsored: pa?.totalCosponsored };
};

// ---------------------------------------------------------------------------
// Roll calls (House, from the Clerk's XML)
// ---------------------------------------------------------------------------

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "’").replace(/&quot;/g, '"');

export const rollcalls = read("house-rollcalls.json").map((r) => {
  const p = (name) => r.parties[name] || { yea: 0, nay: 0, nv: 0 };
  const D = p("Democratic"), R = p("Republican"), I = p("Independent");
  const yea = { d: D.yea, r: R.yea, i: I.yea };
  const nay = { d: D.nay, r: R.nay, i: I.nay };
  const nv = { d: D.nv, r: R.nv, i: I.nv };
  const sum = (o) => o.d + o.r + o.i;
  const [type, number] = (() => {
    const m = r.legis.replace(/\s+/g, "").match(/^([A-Z]+)(\d+)$/);
    return m ? [m[1], m[2]] : [null, null];
  })();
  return {
    roll: r.roll,
    iso: r.date.slice(0, 10),
    date: fmtDate(r.date),
    type,
    number,
    question: decode(r.question),
    result: decode(r.result),
    desc: decode(r.desc),
    passed: /pass|agreed/i.test(r.result),
    twoThirds: /2\/3/.test(r.voteType),
    yea, nay, nv,
    yeaTotal: sum(yea),
    nayTotal: sum(nay),
    members: r.members,
  };
});
export const rollcall = (n) => rollcalls.find((r) => r.roll === n);

// ---------------------------------------------------------------------------
// Bills
// ---------------------------------------------------------------------------

const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const bill = (id) => {
  const b = read(`bill-${id}.json`).bill;
  const sums = has(`sum-${id}.json`) ? read(`sum-${id}.json`).summaries || [] : [];
  const sponsor = b.sponsors?.[0];
  return {
    id,
    type: b.type,
    number: b.number,
    title: b.title,
    area: b.policyArea?.name || "",
    introduced: b.introducedDate,
    latest: b.latestAction,
    law: b.laws?.[0]?.number,
    cosponsors: b.cosponsors?.count ?? 0,
    sponsorId: sponsor?.bioguideId,
    summary: sums.length ? strip(sums[sums.length - 1].text).replace(new RegExp("^" + b.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*"), "") : "",
  };
};

export const laws = read("laws.json").bills;

// All recorded votes on one bill, from the backend's /api/bills/:id/votes
export const billVotes = (id) =>
  (has(`votes-${id}.json`) ? read(`votes-${id}.json`).votes : []).map((v) => ({
    chamber: v.chamber,
    date: fmtDate(v.date),
    question: v.question,
    result: v.result,
    yea: v.total.yea,
    nay: v.total.nay,
  }));
