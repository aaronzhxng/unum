// Leadership races for the 120th Congress, as of Nov 11, 2026: an overview,
// then one profile per name in the mix. Profiles come from Congress.gov; the
// state of each race comes from news reports and is kept in RACES below, so
// update it and rebuild as the races move.
//
//   SET=social/prototypes/sets/2026-11-11-leaders.mjs OUT=2026-11-11-leaders node social/prototypes/build.mjs
//
// Needs member-, pa- files for the five IDs below, committees.json, and
// officials.json in data/.

import fs from "node:fs";
import path from "node:path";
import { esc, page, hl, kicker, bottom, card, photo, policyColor, OUTPUT_ROOT } from "../lib.mjs";
import { member } from "../data.mjs";
import { top } from "../templates.mjs";

const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};
const AS_OF = "Nov 11";
const GROUP = "Leadership races, Nov 11";
const SOURCE = "Congress.gov, NBC News, Roll Call";
const readData = (f) => JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", f), "utf8"));
const committees = readData("committees.json").committees;

// Where each race stands. badge is the short status; line is the one-line
// version for the overview; detail is the fuller version for the profile.
const RACES = {
  T000250: {
    chamber: "Senate", party: "R",
    badge: "Elected Nov 10", done: true,
    line: "Re-elected Senate Republican leader without opposition",
    detail: "Senate Republicans re-elected him leader on November 10 without opposition. With Democrats winning the Senate, he becomes minority leader in January.",
    next: "Senate Republican Leader",
  },
  J000289: {
    chamber: "House", party: "R",
    badge: "Elected Nov 10", done: true,
    line: "Chosen to lead House Republicans",
    detail: "House Republicans chose him as their leader on November 10. With Democrats winning the House, he will lead the Republican minority.",
    next: "House Republican Leader",
  },
  J000294: {
    chamber: "House", party: "D",
    badge: "Vote Nov 18–19", done: false,
    line: "Running unopposed for House Democratic leader",
    detail: "He is running unopposed to stay House Democratic leader. Democrats vote November 18–19, and their leader is the party's pick for Speaker, elected by the full House in January.",
    next: "House Democratic Leader",
  },
  S000148: {
    chamber: "Senate", party: "D",
    badge: "Vote early Dec.", done: false,
    line: "Seeking another term as Senate Democratic leader",
    detail: "He is seeking another term as Senate Democratic leader, which would make him majority leader. Some Democratic senators have called for new leadership. The vote is expected in early December.",
    next: "Senate Democratic Leader",
  },
  V000128: {
    chamber: "Senate", party: "D",
    badge: "Weighing a run", done: false,
    line: "Weighing a challenge to Schumer; has not announced",
    detail: "On November 6 he said he wasn't looking to be Democratic leader. Since then, he has been reported to be considering a challenge to Schumer. He has not announced a run.",
    next: null,
  },
};
const ORDER = ["S000148", "V000128", "T000250", "J000294", "J000289"];

// Congress.gov's leadership titles, in plain words
const roleName = (m, type) => {
  const ch = m.senate ? "Senate" : "House";
  if (/Democratic Leader/.test(type)) return `${ch} Democratic Leader`;
  if (/Democratic Caucus Chairman/.test(type)) return `${ch} Democratic Caucus Chair`;
  if (/Whip/.test(type)) return `${ch} ${m.party === "R" ? "Republican" : "Democratic"} Whip`;
  if (/Majority Leader/.test(type)) return `${ch} Majority Leader`;
  if (/Minority Leader/.test(type)) return `${ch} Minority Leader`;
  throw new Error(`No plain name for ${type}`);
};
const congressStart = (n) => 1787 + 2 * n;

// Consecutive congresses with the same role, as year ranges
const leadership = (m, raw) => {
  const list = [...raw].sort((a, b) => a.congress - b.congress).map((l) => ({ ...l, name: roleName(m, l.type) }));
  const runs = [];
  for (const l of list) {
    const last = runs[runs.length - 1];
    if (last && last.name === l.name && last.to === l.congress - 1) last.to = l.congress, last.current = l.current;
    else runs.push({ name: l.name, from: l.congress, to: l.congress, current: l.current });
  }
  return runs.map((r) => ({ name: r.name, years: `${congressStart(r.from)}–${r.current ? "now" : congressStart(r.to) + 2}` })).reverse();
};

// Years in each chamber, e.g. House 1981–1999, Senate 1999–now
const service = (raw) => {
  const terms = raw.terms?.item || raw.terms || [];
  const by = {};
  for (const t of terms) {
    const ch = /Senate/.test(t.chamber) ? "Senate" : "House";
    by[ch] ??= { from: Infinity, to: 0, open: false };
    by[ch].from = Math.min(by[ch].from, t.startYear);
    if (t.endYear) by[ch].to = Math.max(by[ch].to, t.endYear);
    else by[ch].open = true;
  }
  return Object.entries(by)
    .sort((a, b) => a[1].from - b[1].from)
    .map(([ch, s]) => `${ch} ${s.from}–${s.open ? "now" : s.to}`);
};

const people = Object.fromEntries(
  ORDER.map((id) => {
    // Names as the members go by them, where the official record differs
    const m = { ...member(id), ...(id === "S000148" ? { display: "Chuck Schumer" } : {}) };
    const raw = readData(`member-${id}.json`).member;
    const race = RACES[id];
    check(m.party === race.party && (m.senate ? "Senate" : "House") === race.chamber, `${id} party and chamber`);
    // Committee seats, with any title held on them
    const seats = (m.committees || []).map((name) => {
      const c = committees.find((k) => k.name === name);
      const title = c?.members.find((x) => x.bioguideId === id)?.title;
      return { name: name.replace(/^(Senate|House) (Select |Permanent Select )?Committee on (the )?/, ""), title };
    });
    return [id, { m, race, raw, lead: leadership(m, raw.leadership || []), service: service(raw), seats }];
  }),
);

// Facts the posts state in words
check(people.T000250.lead[0].name === "Senate Majority Leader" && people.T000250.lead[1].name === "Senate Republican Whip", "Thune: majority leader, after whip");
check(people.S000148.lead.length === 1 && people.S000148.lead[0].years === "2017–now", "Schumer: Democratic leader since 2017");
check(people.J000294.lead[0].name === "House Minority Leader" && people.J000294.lead[0].years === "2023–now", "Jeffries: minority leader since 2023");
check(people.J000289.seats.some((s) => s.name === "the Judiciary" || s.name === "Judiciary") && people.J000289.seats.find((s) => /Judiciary/.test(s.name)).title === "Chair", "Jordan chairs Judiciary");
check(people.V000128.lead.length === 0, "Van Hollen has held no party leadership post");
const served = (id) => people[id].service.join(", ");
check(served("S000148") === "House 1981–1999, Senate 1999–now", `Schumer served ${served("S000148")}`);
check(served("V000128") === "House 2003–2017, Senate 2017–now", `Van Hollen served ${served("V000128")}`);
check(served("T000250") === "House 1997–2003, Senate 2005–now", `Thune served ${served("T000250")}`);
check(served("J000294") === "House 2013–now" && served("J000289") === "House 2007–now", "Jeffries since 2013, Jordan since 2007");

// The career line under each headline, from the checks above
const CAREER = {
  S000148: "Schumer has led Senate Democrats since 2017. He has served in Congress since 1981: 18 years in the House, then the Senate since 1999.",
  V000128: "Van Hollen has served in the Senate since 2017, after 14 years in the House. He sits on the Appropriations, Banking, Budget, and Foreign Relations committees.",
  T000250: "Thune has been Senate majority leader since January 2025, and before that was the Republican whip. He served three terms in the House before joining the Senate in 2005.",
  J000294: "Jeffries has led House Democrats since 2023, after four years as Democratic Caucus chair. He has represented New York's 8th District since 2013.",
  J000289: "Jordan chairs the House Judiciary Committee and has represented Ohio's 4th District since 2007. He has not held a party leadership post before.",
};

const PARTY = { D: "Democrat", R: "Republican" };
const partyChip = (p) => `<span class="b-${p.toLowerCase()}" style="font:600 14px Inter;padding:4px 12px;border-radius:999px;color:#fff;white-space:nowrap">${PARTY[p]}</span>`;
const badge = (race) =>
  `<span style="font:700 14px Inter;padding:5px 12px;border-radius:999px;white-space:nowrap;${race.done ? "background:#e3f3e8;color:var(--pass)" : "background:#fff3c4;color:#7a5b00"}">${esc(race.badge)}</span>`;
const sub = (t, mt = 24) => `<div class="sub" style="margin-top:${mt}px">${t}</div>`;
const line = (t, extra = "") => `<div style="font-size:16px;color:var(--gray);padding:3px 0">${t}${extra}</div>`;

export const templates = [];
export const recap = { hook: "Who will lead the next Congress?", label: AS_OF };
const add = (t) => templates.push({ group: GROUP, source: SOURCE, ...t });

// ===========================================================================
// 1. Overview: where each race stands
// ===========================================================================

add({
  slug: "0-leadership-races",
  name: "Leadership races: where they stand",
  trigger: "Party leadership elections after the midterms",
  data: "Congress.gov member records; news reports on the races",
  caption: `Who will lead the next Congress? Republicans picked their leaders on November 10: John Thune in the Senate and Jim Jordan in the House. House Democrats vote November 18–19, with Hakeem Jeffries unopposed. Senate Democrats vote in early December, where Chuck Schumer is seeking another term and Chris Van Hollen is weighing a challenge. As of ${AS_OF}.`,
  render() {
    const row = (id) => {
      const { m, race } = people[id];
      return `<div style="display:flex;align-items:center;gap:18px;padding:15px 0;border-bottom:1px solid #e6e3dc">
          ${photo(m, 64)}
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px"><b style="font-size:20px">${esc(m.title)} ${esc(m.display)}</b><span style="font-size:15px;color:var(--gray)">${esc(m.tag)}</span></div>
            <div style="font-size:16px;color:var(--gray);margin-top:4px">${esc(race.line)}</div></div>
          ${badge(race)}</div>`;
    };
    const group = (ch) => `${sub(ch, 18)}${ORDER.filter((id) => RACES[id].chamber === ch).map(row).join("")}`;
    return page({
      top: top(card({ label: "Leadership races", aside: `As of ${AS_OF}`, w: 952, pad: "10px 34px", inner: `<div style="margin:auto 0">${group("Senate")}${group("House")}</div>` })),
      bottom: bottom({
        kicker: kicker("Leadership races", "120th Congress"),
        headline: hl("Who will ", ["k", "lead the next Congress"], "? ", ["pr", "Republicans"], " have picked. ", ["pd", "Democrats"], " vote next."),
        text: "House Democrats vote November 18–19. Senate Democrats are expected to vote in early December. The new Congress begins January 3.",
      }),
    });
  },
});

// ===========================================================================
// 2-6. One profile per name
// ===========================================================================

const CAPTIONS = {
  S000148: "Sen. Chuck Schumer of New York has led Senate Democrats since 2017 and is seeking another term, which would make him majority leader. Some Democratic senators have called for new leadership, and the caucus is expected to vote in early December.",
  V000128: "Sen. Chris Van Hollen of Maryland is reported to be weighing a challenge to Chuck Schumer for Senate Democratic leader. He has not announced a run. He has served in the Senate since 2017, after 14 years in the House.",
  T000250: "Sen. John Thune of South Dakota was re-elected Senate Republican leader on November 10 without opposition. He has been majority leader since January 2025 and becomes minority leader when Democrats take control of the Senate.",
  J000294: "Rep. Hakeem Jeffries of New York is running unopposed to stay House Democratic leader. House Democrats vote November 18–19. With Democrats winning the House, their leader is the party's choice for Speaker.",
  J000289: "Rep. Jim Jordan of Ohio was chosen on November 10 to lead House Republicans in the next Congress, where they will be in the minority. He chairs the House Judiciary Committee and has served in the House since 2007.",
};
const HEADLINES = {
  S000148: (m) => hl(["n", `${m.title} ${m.display}`], " wants another term as ", ["k", "Senate Democratic leader"], ", now as ", ["pd", "majority leader"], "."),
  V000128: (m) => hl(["n", `${m.title} ${m.display}`], " is ", ["k", "weighing a challenge"], " to Schumer for ", ["pd", "Senate Democratic leader"], "."),
  T000250: (m) => hl(["n", `${m.title} ${m.display}`], " will keep leading ", ["pr", "Senate Republicans"], ", now ", ["k", "in the minority"], "."),
  J000294: (m) => hl(["n", `${m.title} ${m.display}`], " is ", ["k", "unopposed"], " to keep leading ", ["pd", "House Democrats"], ", now in the majority."),
  J000289: (m) => hl(["n", `${m.title} ${m.display}`], " will lead ", ["pr", "House Republicans"], " in the ", ["k", "next Congress"], "."),
};

for (const [i, id] of ORDER.entries()) {
  const { m, race, lead, service: years, seats } = people[id];
  add({
    slug: `${i + 1}-${m.last.toLowerCase().replace(/\s+/g, "-")}`,
    name: `Leader profile: ${m.title} ${m.display}`,
    trigger: "Name in a party leadership race",
    data: "Congress.gov member record, leadership history, committees, policy areas",
    caption: CAPTIONS[id],
    render() {
      check(m.areas.length >= 3, `${id} has policy areas`);
      check(Number.isInteger(m.sponsored) && Number.isInteger(m.cosponsored), `${id} has bill counts`);
      return page({
        top: top(
          card({
            label: "Profile",
            inner: `<div class="who" style="font-size:17px;font-weight:600">${esc(m.party)} · ${esc(m.roleLine)}</div>
              <div style="display:flex;align-items:center;gap:18px;margin-top:16px">${photo(m, 84)}
                <div><div style="font-size:24px;font-weight:800">${esc(m.display)}</div><div style="margin-top:8px">${partyChip(m.party)}</div></div></div>
              ${sub("Party leadership")}
              ${lead.length
                ? lead.map((l) => `<div style="display:flex;justify-content:space-between;gap:12px;font-size:16.5px;padding:9px 0;border-bottom:1px solid #e6e3dc"><b style="font-weight:600">${esc(l.name)}</b><span style="color:var(--gray);white-space:nowrap">${l.years}</span></div>`).join("")
                : line("No party leadership post")}
              ${sub("Education")}${(m.education || []).map((e) => line(esc(e))).join("")}
              <div class="panel" style="margin-top:auto;padding:18px 20px">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:16px">Next Congress</b>${badge(race)}</div>
                <div style="font-size:15px;line-height:1.45;color:#333;margin-top:10px">${esc(race.detail)}</div></div>`,
          }),
          card({
            label: "At a glance",
            inner: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="panel" style="padding:16px 18px"><div class="big" style="font-size:54px">${m.sponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills sponsored</div></div>
                <div class="panel" style="padding:16px 18px"><div class="big" style="font-size:54px">${m.cosponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills cosponsored</div></div></div>
              ${sub("In Congress")}${years.map((y) => line(esc(y))).join("")}
              ${sub("Committees")}${seats.length ? seats.map((s) => line(esc(s.name.replace(/^the /, "")), s.title ? ` <b style="color:var(--blue)">· ${esc(s.title)}</b>` : "")).join("") : line("None")}
              ${sub("Top policy areas")}${m.areas.slice(0, 3).map((a) => line(`<i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${policyColor(a.name)};margin-right:9px"></i>${esc(a.name)}`, ` <span style="color:var(--muted)">· ${a.count}</span>`)).join("")}
              <div style="font-size:13px;color:var(--muted);margin-top:auto">Bill counts and policy areas cover 2025 to date.</div>`,
          }),
        ),
        bottom: bottom({
          kicker: kicker("Leadership races", m.tag),
          headline: HEADLINES[id](m),
          text: CAREER[id],
        }),
      });
    },
  });
}
