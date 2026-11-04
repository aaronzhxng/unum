#!/usr/bin/env node
// Drafts a Last Week in Congress issue from Congress.gov, as a file in
// website/src/content/newsletter/ marked draft: true, so it shows on
// preview links but not the live site until the draft line is removed.
//
//   node scripts/newsletter/draftIssue.mjs                    # last week
//   node scripts/newsletter/draftIssue.mjs --week 2026-10-26  # the week starting that Monday
//   node scripts/newsletter/draftIssue.mjs --out draft.md     # write somewhere else
//   node scripts/newsletter/draftIssue.mjs --force            # replace an existing file
//
// It counts the week from every bill's full action history (signed, sent to
// the President, passed both chambers, passed one, out of committee,
// introduced), fills in each featured bill (title, sponsor and photo, policy
// area, stages, votes, the official summary), puts the closest final vote
// in "The big vote", and lists the week's new bills to pick from. Left for
// editing: the headline, description, opening, which bills to keep, and
// summaries for bills with no official one yet (marked TODO).
//
// Needs CONGRESS_API_KEY in backend/.env (or the environment).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const ISSUES = path.join(ROOT, "website", "src", "content", "newsletter");
const CONGRESS = 119;
const SIGNOFF = "Justin and Aaron at Unum Initiative";

const envFile = path.join(ROOT, "backend", ".env");
const KEY =
  process.env.CONGRESS_API_KEY ||
  (fs.existsSync(envFile) && fs.readFileSync(envFile, "utf8").match(/^CONGRESS_API_KEY=["']?([^"'\r\n]+)/m)?.[1]);
if (!KEY) throw new Error("CONGRESS_API_KEY not set (env or backend/.env)");

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// The week runs Monday through Sunday; the issue covers Monday to Friday by
// name and goes out the next Monday
function weekOf(monday) {
  const start = new Date(`${monday}T00:00:00Z`);
  if (start.getUTCDay() !== 1) throw new Error(`${monday} is not a Monday`);
  const friday = addDays(start, 4);
  const [m1, m2] = [MONTHS[start.getUTCMonth()], MONTHS[friday.getUTCMonth()]];
  const [d1, d2] = [start.getUTCDate(), friday.getUTCDate()];
  const year = friday.getUTCFullYear();
  return {
    start: iso(start),
    end: iso(addDays(start, 6)),
    send: iso(addDays(start, 7)),
    week: m1 === m2 ? `${m1} ${d1}–${d2}` : `${m1} ${d1}–${m2} ${d2}`,
    slug: (m1 === m2 ? `${m1}-${d1}-${d2}` : `${m1}-${d1}-${m2}-${d2}`).toLowerCase() + `-${year}`,
  };
}

function lastMonday() {
  const today = new Date(`${iso(new Date())}T00:00:00Z`);
  const thisMonday = addDays(today, -((today.getUTCDay() + 6) % 7));
  return iso(addDays(thisMonday, -7));
}

// ---------------------------------------------------------------------------
// Congress.gov
// ---------------------------------------------------------------------------

async function api(route, params = {}) {
  const url = new URL(`https://api.congress.gov/v3${route}`);
  for (const [k, v] of Object.entries({ format: "json", ...params })) url.searchParams.set(k, v);
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "X-Api-Key": KEY } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`Congress.gov ${res.status} for ${route}`);
  }
}

async function pages(route, key, params) {
  const all = [];
  for (let offset = 0; ; offset += 250) {
    const data = await api(route, { ...params, limit: 250, offset });
    all.push(...(data[key] || []));
    if (!data.pagination?.next) return all;
  }
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const idOf = (b) => `${b.type}${b.number}`.toLowerCase();
const routeOf = (id) => {
  const [, type, number] = id.match(/^([a-z]+)(\d+)$/);
  return `/bill/${CONGRESS}/${type}/${number}`;
};

// ---------------------------------------------------------------------------
// Reading a bill's actions
// ---------------------------------------------------------------------------

const PASSED = /^Passed\/agreed to in (House|Senate)/;
const FAILED = /Failed of passage|On passage Failed|pass the bill[^.]*Failed|not agreed to in (the )?(House|Senate)/i;
const REPORTED = /Reported by|Ordered to be Reported|Placed on .*Calendar/i;
const FINAL_VOTE = /passage|pass the bill|pass the joint resolution|agreed to|cloture|override|concur/i;

const chamberOf = (a) => (/Senate/.test(a.text) ? "Senate" : /House/.test(a.text) ? "House" : a.sourceSystem?.name?.includes("House") ? "House" : "Senate");

function facts(id, actions) {
  const type = id.replace(/\d+/, "");
  const origin = type.startsWith("h") ? "House" : "Senate";
  const other = origin === "House" ? "Senate" : "House";
  const first = (re, chamber) =>
    actions.filter((a) => re.test(a.text) && (!chamber || chamberOf(a) === chamber)).map((a) => a.actionDate).sort()[0];
  const passed = { House: first(PASSED, "House"), Senate: first(PASSED, "Senate") };
  return {
    id, type, origin, other, passed,
    failed: { House: first(FAILED, "House"), Senate: first(FAILED, "Senate") },
    law: first(/Became Public Law/),
    presented: first(/Presented to President/),
    vetoed: first(/Vetoed by President/),
    // Reported in whichever chamber it is in now
    reported: actions.some((a) => REPORTED.test(a.text) && chamberOf(a) === (passed[origin] ? other : origin)),
    introduced: first(/^Introduced in (House|Senate)/) || actions.map((a) => a.actionDate).sort()[0],
  };
}

// The app's stage track. Simple resolutions stop at one chamber, concurrent
// resolutions at two; bills and joint resolutions go on to the President.
function stages(f) {
  const steps = [{ label: "Introduced", status: "done" }];
  const chamber = (name) => {
    if (f.passed[name]) return { label: `Passed ${name}`, status: "done" };
    if (f.failed[name]) return { label: `Failed in ${name}`, status: "failed" };
    return { label: `In ${name}`, status: "todo" };
  };
  const one = chamber(f.origin);
  if (one.status === "todo" && f.reported) one.label = "Out of committee";
  steps.push(one);
  if (!/res$/.test(f.type) || /conres$/.test(f.type)) {
    const two = chamber(f.other);
    if (one.status === "done" && two.status === "todo" && f.reported) two.label = "Out of committee";
    steps.push(two);
  }
  if (!/res$/.test(f.type) || /jres$/.test(f.type)) {
    if (f.law) steps.push({ label: "Signed into law", status: "done" });
    else if (f.vetoed) steps.push({ label: "Vetoed", status: "failed" });
    else steps.push({ label: "To President", status: "todo" });
  }
  // The first stage not yet reached is where it is now
  const next = steps.find((s) => s.status === "todo");
  if (next && !steps.some((s) => s.status === "failed")) next.status = "current";
  return steps;
}

// Recorded final votes in the week, with counts from the action text, e.g.
// "Failed of passage in Senate by Yea-Nay Vote. 49 - 50"
function votes(actions, w) {
  return actions
    .filter((a) => a.recordedVotes?.length && a.actionDate >= w.start && a.actionDate <= w.end && FINAL_VOTE.test(a.text))
    .map((a) => {
      const m = a.text.match(/(\d+)\s*-\s*(\d+)/);
      if (!m) return null;
      const result = /not invoked/i.test(a.text) ? "Blocked"
        : /invoked/i.test(a.text) ? "Advanced"
        : /fail|rejected|not agreed/i.test(a.text) ? "Failed"
        : /agreed to/i.test(a.text) ? "Agreed to"
        : "Passed";
      return { chamber: a.recordedVotes[0].chamber || chamberOf(a), date: a.actionDate, result, yea: +m[1], nay: +m[2] };
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Bill details
// ---------------------------------------------------------------------------

function sponsorName(s) {
  const title = /^Sen\./.test(s.fullName) ? "Sen." : /^Del\./.test(s.fullName) ? "Del." : "Rep.";
  const seat = s.district != null && title !== "Sen." ? `${s.state}-${s.district}` : s.state;
  return `${title} ${s.firstName} ${s.lastName} (${s.party}-${seat})`;
}

// The official (CRS) summary's first paragraph that describes the bill,
// trimmed to two sentences when long
function summaryText(summaries) {
  const latest = [...(summaries || [])].sort((a, b) => (a.updateDate || "").localeCompare(b.updateDate || "")).pop();
  if (!latest) return null;
  const paras = latest.text
    .split(/<\/p>/i)
    .map((p) => p.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  let text = paras.find((p) => /^This (bill|act|resolution|joint resolution|concurrent resolution)\b/.test(p)) || paras[1] || paras[0];
  if (text.length > 420) text = text.match(/^(.+?\.\s.+?\.)(\s|$)/)?.[1] || text.slice(0, 400);
  return text;
}

async function details(id) {
  const [{ bill }, { summaries }] = await Promise.all([api(routeOf(id)), api(`${routeOf(id)}/summaries`)]);
  const s = bill.sponsors?.[0];
  return {
    title: bill.title,
    policyArea: bill.policyArea?.name,
    sponsor: s ? sponsorName(s) : "Unknown sponsor",
    sponsorId: s?.bioguideId,
    summary: summaryText(summaries),
  };
}

// ---------------------------------------------------------------------------
// Writing the issue
// ---------------------------------------------------------------------------

const q = (s) => JSON.stringify(String(s));
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function billYaml(b) {
  const lines = [
    `      - id: ${b.id}`,
    `        title: ${q(b.title)}`,
    b.policyArea && `        policyArea: ${q(b.policyArea)}`,
    `        sponsor: ${q(b.sponsor)}`,
    b.sponsorId && `        sponsorId: ${b.sponsorId}`,
    `        summary: ${q(b.summary || "TODO: no official summary yet; write one from the bill text")}`,
    `        stages:`,
    ...b.stages.map((s) => `          - { label: ${q(s.label)}, status: ${s.status} }`),
  ];
  if (b.votes.length) {
    lines.push(`        votes:`);
    for (const v of b.votes) lines.push(`          - { chamber: ${v.chamber}, date: ${v.date}, result: ${q(v.result)}, yea: ${v.yea}, nay: ${v.nay} }`);
  }
  return lines.filter(Boolean).join("\n");
}

async function main() {
  const w = weekOf(arg("week") || lastMonday());
  const outFile = arg("out") ? path.resolve(arg("out")) : path.join(ISSUES, `${w.slug}.md`);
  if (fs.existsSync(outFile) && !process.argv.includes("--force")) throw new Error(`${outFile} exists; pass --force to replace it`);
  console.log(`Drafting ${w.week} (${w.start} to ${w.end}), going out ${w.send}`);

  // Any bill with an action in the week was updated since it began and has
  // its latest action on or after the first day
  const updated = await pages(`/bill/${CONGRESS}`, "bills", { fromDateTime: `${w.start}T00:00:00Z`, sort: "updateDate+desc" });
  const candidates = updated.filter((b) => b.latestAction?.actionDate >= w.start);
  console.log(`  ${updated.length} bills updated since, ${candidates.length} with recent actions; reading their histories…`);
  const histories = await pool(candidates, 5, async (b) => ({ id: idOf(b), title: b.title, actions: await pages(`${routeOf(idOf(b))}/actions`, "actions") }));

  const inWeek = (d) => d && d >= w.start && d <= w.end;
  const groups = { signed: [], presented: [], passedBoth: [], passedOne: [], committee: [], introduced: [] };
  const byId = new Map();
  for (const h of histories) {
    const f = facts(h.id, h.actions);
    const v = votes(h.actions, w);
    byId.set(h.id, { ...h, f, v });
    const weekActions = h.actions.filter((a) => inWeek(a.actionDate));
    const passedThisWeek = ["House", "Senate"].filter((c) => inWeek(f.passed[c]));
    const both = f.passed.House && f.passed.Senate && inWeek([f.passed.House, f.passed.Senate].sort()[1]);
    if (inWeek(f.law)) groups.signed.push(h.id);
    else if (inWeek(f.presented)) groups.presented.push(h.id);
    else if (both && !/^(h|s)res$/.test(f.type)) groups.passedBoth.push(h.id);
    else if (passedThisWeek.length) groups.passedOne.push(h.id);
    if (weekActions.some((a) => REPORTED.test(a.text))) groups.committee.push(h.id);
    if (inWeek(f.introduced)) groups.introduced.push(h.id);
  }
  const stats = {
    signed: groups.signed.length,
    passedBoth: histories.filter((h) => {
      const f = byId.get(h.id).f;
      return f.passed.House && f.passed.Senate && inWeek([f.passed.House, f.passed.Senate].sort()[1]) && !/^(h|s)res$/.test(f.type);
    }).length,
    outOfCommittee: groups.committee.length,
    introduced: groups.introduced.length,
  };
  console.log(`  ${JSON.stringify(stats)}`);

  // The closest final vote of the week leads the issue
  const voted = [...byId.values()].filter((b) => b.v.length).sort((a, b) => Math.abs(a.v[0].yea - a.v[0].nay) - Math.abs(b.v[0].yea - b.v[0].nay));
  const bigVote = voted[0]?.id;
  const without = (ids) => ids.filter((id) => id !== bigVote);
  const CAP = 5;
  const sections = [
    bigVote && { heading: "The big vote", ids: [bigVote] },
    { heading: "Signed into law", ids: without(groups.signed) },
    { heading: "Sent to the President", ids: without(groups.presented) },
    { heading: "Passed both chambers", ids: without(groups.passedBoth) },
    { heading: "Passed one chamber", ids: without(groups.passedOne).slice(0, CAP), more: without(groups.passedOne).slice(CAP) },
    { heading: "Out of committee", ids: without(groups.committee).filter((id) => !groups.passedOne.includes(id)).slice(0, CAP),
      more: without(groups.committee).filter((id) => !groups.passedOne.includes(id)).slice(CAP) },
  ].filter((s) => s && s.ids.length);

  const featured = [...new Set(sections.flatMap((s) => s.ids))];
  console.log(`  filling in ${featured.length} bills…`);
  const info = new Map(await pool(featured, 4, async (id) => [id, await details(id)]));
  const bill = (id) => ({ id, ...info.get(id), stages: stages(byId.get(id).f), votes: byId.get(id).v });

  const titleOf = (id) => byId.get(id).title.replace(/\s+/g, " ");
  const comments = [
    ...sections.filter((s) => s.more?.length).map((s) => `# Also ${s.heading.toLowerCase()}: ${s.more.join(", ")}`),
    `# Introduced this week (${groups.introduced.length}). Pick a few for a "Newly introduced" section:`,
    ...groups.introduced.filter((id) => !/^(h|s)res/.test(id)).map((id) => `#   ${id}: ${titleOf(id).slice(0, 110)}`),
  ];

  const s = groups.signed.length, p = groups.presented.length;
  const opening = [
    `Good morning. Last week, ${s ? `${plural(s, "bill was", "bills were")} signed into law` : "no bills were signed into law"}${p ? `, and ${plural(p, "more bill was", "more bills were")} sent to the President` : ""}.`,
    `${stats.passedBoth ? `${plural(stats.passedBoth, "bill")} passed both chambers, ` : "No bills passed both chambers, "}${plural(stats.outOfCommittee, "bill")} came out of committee, and ${stats.introduced} bills and resolutions were introduced.`,
  ];

  const md = [
    "---",
    "draft: true",
    `week: ${w.week}`,
    `date: ${w.send}`,
    `headline: ${q("TODO: headline")}`,
    `description: ${q("TODO: one-line summary for the archive and link previews")}`,
    "stats:",
    ...Object.entries(stats).map(([k, v]) => `  ${k}: ${v}`),
    "sections:",
    ...sections.flatMap((sec) => [`  - heading: ${sec.heading}`, "    bills:", ...sec.ids.map((id) => billYaml(bill(id)))]),
    `signoff: ${SIGNOFF}`,
    ...comments,
    "---",
    "",
    opening.join("\n\n"),
    "",
  ].join("\n");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, md);
  console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);

  if (!arg("out")) execFileSync(process.execPath, [path.join(HERE, "memberPhotos.mjs")], { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
