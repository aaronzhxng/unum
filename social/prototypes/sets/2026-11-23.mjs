// Five posts for the week of Nov 16-20, 2026, drawn only from what the
// November 23 Congress Weekly covers: the Senate's energy permitting package,
// its vote on the Iran war powers resolution, the three bills sent to the
// President, the House bills the Senate passed, and the week's counts.
//
//   node social/prototypes/fetch-set.mjs hr2347 hconres93 hr8552 hr4930 hr10159 hr2478 hr1520 hr973 hr5254 hr4624 S001199 M001196
//   Senate roll calls 269 and 270, saved as data/senate-vote-<n>.xml from
//   https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00<n>.xml
//   SET=social/prototypes/sets/2026-11-23.mjs OUT=2026-11-23 node social/prototypes/build.mjs
//   OUT=2026-11-23 node social/prototypes/reel.mjs     # then the recap video

import fs from "node:fs";
import path from "node:path";
import {
  esc, page, hl, kicker, bottom, card, photo, policyColor, policyIcon,
  prettyBill, appBillId, fmtDate, longDate, voteCard, OUTPUT_ROOT,
} from "../lib.mjs";
import { member, members, bill } from "../data.mjs";
import { top, detailsCard } from "../templates.mjs";

const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};
const WEEK = { from: "2026-11-16", to: "2026-11-20", label: "Nov 16–20" };
const GROUP = "Week of Nov 16";
const inWeek = (iso) => iso >= WEEK.from && iso <= WEEK.to;

const readData = (f) => fs.readFileSync(path.join(OUTPUT_ROOT, "data", f), "utf8");
const actions = (id) => JSON.parse(readData(`actions-${id}.json`));
const when = (id, re) => actions(id).find((a) => re.test(a.text));

// ---------------------------------------------------------------------------
// Senate roll calls, from the Senate's XML
// ---------------------------------------------------------------------------

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function senateVote(n) {
  const x = readData(`senate-vote-${n}.xml`);
  const tag = (s, t) => (s.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1]?.trim() ?? "";
  const [, mon, day, year] = tag(x, "vote_date").match(/^(\w+) (\d+), (\d+)/);
  const iso = `${year}-${String(MONTHS.indexOf(mon) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
  const people = [...x.matchAll(/<member>[\s\S]*?<\/member>/g)].map(([m]) => {
    const last = tag(m, "last_name"), state = tag(m, "state");
    const bio = [...members.values()].find((o) => o.senate && o.last === last && o.state === state)?.bioguide;
    return { last, state, party: tag(m, "party"), vote: tag(m, "vote_cast"), bio };
  });
  const count = (v) => {
    const o = { d: 0, r: 0, i: 0 };
    for (const p of people) if (p.vote === v) o[p.party.toLowerCase()]++;
    return o;
  };
  const yea = count("Yea"), nay = count("Nay"), nv = count("Not Voting");
  const sum = (o) => o.d + o.r + o.i;
  const result = tag(x, "vote_result");
  return {
    roll: n, iso, people, yea, nay, nv,
    yeaTotal: sum(yea), nayTotal: sum(nay),
    passed: /passed|agreed/i.test(result),
    card: voteCard({ chamber: "Senate", date: fmtDate(iso), result: `${tag(x, "question")}: ${result} (${sum(yea)}-${sum(nay)})`, passed: /passed|agreed/i.test(result), yea, nay, nv }),
  };
}

const PERMITS = senateVote(270), IRAN = senateVote(269);
check(PERMITS.iso === "2026-11-19" && PERMITS.yeaTotal === 62 && PERMITS.nayTotal === 33 && PERMITS.passed, "roll 270: H.R. 2347 passed 62-33 on Nov 19");
check(IRAN.iso === "2026-11-19" && IRAN.yeaTotal === 48 && IRAN.nayTotal === 51 && !IRAN.passed, "roll 269: H.Con.Res. 93 failed 48-51 on Nov 19");
check(/<document_name>H\.R\. 2347</.test(readData("senate-vote-270.xml")), "roll 270 is on H.R. 2347");
check(/<document_name>H\.\s?Con\.\s?Res\. 93</.test(readData("senate-vote-269.xml")), "roll 269 is on H.Con.Res. 93");

// Members who voted against most of their party
const crossers = (v) =>
  v.people.filter((p) => (p.party === "R" && p.vote === "Yea" && v.yea.r < v.nay.r) || (p.party === "R" && p.vote === "Nay" && v.nay.r < v.yea.r) ||
    (p.party === "D" && p.vote === "Yea" && v.yea.d < v.nay.d) || (p.party === "D" && p.vote === "Nay" && v.nay.d < v.yea.d));

// Counted on Congress.gov for the November 23 newsletter
const PASSED_BOTH = 8, OUT_OF_COMMITTEE = 61, INTRODUCED = 235;

const SENT = ["hr8552", "hr4930", "hr10159"];
for (const id of SENT) check(inWeek(when(id, /^Presented to President/)?.actionDate || ""), `${id} was presented this week`);
for (const id of SENT) check(!bill(id).law, `${id} is not law yet`);

// House bills the Senate passed this week: unchanged ones go to the President,
// amended ones back to the House
const CLEARED = ["hr2478", "hr973", "hr5254"], AMENDED = ["hr1520", "hr4624"];
for (const id of CLEARED) check(inWeek(when(id, /^Passed Senate without amendment/)?.actionDate || ""), `${id} passed the Senate unchanged this week`);
for (const id of AMENDED) check(inWeek(when(id, /^Passed Senate with an amendment/)?.actionDate || ""), `${id} passed the Senate amended this week`);

export const templates = [];
export const recap = { hook: "What Congress did Nov 16–20", label: "Nov 23" };
const add = (t) => templates.push(t);

const listRow = (id, right) => {
  const b = bill(id);
  const m = member(b.sponsorId);
  return `<div style="display:flex;gap:20px;align-items:flex-start;padding:17px 0;border-bottom:1px solid #e6e3dc">
      <img src="${policyIcon(b.area)}" style="width:56px;height:56px;flex:none">
      <div style="flex:1;min-width:0">
        <div style="font-size:15px"><span style="color:${policyColor(b.area)};font-weight:700">${esc(prettyBill(b.type, b.number))}</span> <span style="color:var(--muted)">· ${esc(b.area)}</span></div>
        <div style="font-size:20px;font-weight:700;line-height:1.25;margin-top:5px">${esc(b.title)}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:9px">${photo(m, 30)}<span style="font-size:15px;color:var(--gray)">${esc(m.title)} ${esc(m.display)} (${esc(m.tag)})</span></div>
      </div>
      <div style="text-align:right;flex:none;max-width:190px">${right}</div>
    </div>`;
};
const tagBox = (label, value, color) =>
  `<div class="mono" style="font-size:13px;color:var(--muted)">${esc(label)}</div><div style="font-size:21px;font-weight:800;color:${color};margin-top:4px">${esc(value)}</div>`;

// ===========================================================================
// 1. The Big Vote: the Senate's energy permitting package
// ===========================================================================

add({
  slug: "1-permitting",
  name: "The Big Vote: energy permitting package",
  group: GROUP,
  trigger: "The week's biggest Senate passage vote",
  data: "H.R. 2347, Senate roll call 270, the Senate amendment's table of contents",
  source: "Congress.gov, Senate.gov",
  caption: `The Senate passed a broad energy and permitting package, ${PERMITS.yeaTotal}–${PERMITS.nayTotal}. It speeds up federal environmental reviews, limits lawsuits against approved projects, changes Clean Water Act and Endangered Species Act permitting, and eases approval of power lines, geothermal, hydropower, and offshore energy. The Senate carried it on a House bill, H.R. 2347, replacing that bill's text, so it now goes back to the House.`,
  render() {
    const b = bill("hr2347");
    check(b.title === "Bipartisan American Affordability and Jobs Act of 2026", "the bill carries the package's title");
    check(/with an amendment/.test(b.latest.text), "the Senate amended it");
    const dYes = PERMITS.yea.d + PERMITS.yea.i, rNo = PERMITS.nay.r;
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 1, 0.5], last: "Back to House", statusText: `Passed the Senate with an amendment, ${PERMITS.yeaTotal}-${PERMITS.nayTotal}. It goes back to the House.` }),
        card({ label: "Voting", pad: "22px 22px 24px", inner: PERMITS.card }),
      ),
      bottom: bottom({
        kicker: kicker("The big vote", appBillId(b.type, b.number)),
        headline: hl("The Senate passed a ", ["k", "sweeping energy permitting package"], ", ", ["p", `${PERMITS.yeaTotal}–${PERMITS.nayTotal}`], "."),
        text: `It speeds up environmental reviews, limits lawsuits against approved projects, and eases approval of power lines and energy projects. ${dYes} Democrats and independents voted yes${rNo ? ` and ${rNo} Republicans voted no` : ""}. It now goes back to the House.`,
      }),
    });
  },
});

// ===========================================================================
// 2. Iran war powers resolution
// ===========================================================================

add({
  slug: "2-iran-war-powers",
  name: "Senate Vote: Iran war powers resolution",
  group: GROUP,
  trigger: "A close vote with members crossing party lines",
  data: "H.Con.Res. 93, Senate roll call 269",
  source: "Congress.gov, Senate.gov",
  caption: `The Senate rejected a House-passed resolution directing the President to withdraw U.S. forces from hostilities with Iran, ${IRAN.yeaTotal}–${IRAN.nayTotal}. Republican Sens. Susan Collins, Lisa Murkowski, and Rand Paul voted for it, and Democratic Sen. John Fetterman voted against it.`,
  render() {
    const b = bill("hconres93");
    const x = crossers(IRAN);
    check(x.map((p) => p.last).sort().join() === "Collins,Fetterman,Murkowski,Paul", `crossers: ${x.map((p) => p.last).join(", ")}`);
    check(when("hconres93", /^Passed\/agreed to in House/), "it passed the House");
    const person = (p) => {
      const m = member(p.bio);
      return `<div class="panel" style="display:flex;align-items:center;gap:16px;padding:14px 16px">${photo(m, 58)}
        <div style="flex:1"><div style="font-size:19px;font-weight:700">${esc(m.title)} ${esc(m.display)}</div>
        <div style="font-size:15px;margin-top:3px"><b class="c-${m.party.toLowerCase()}">${m.party === "D" ? "Democrat" : "Republican"}</b> <span style="color:var(--gray)">· ${esc(m.state)}</span></div></div>
        <div style="font-size:19px;font-weight:800;color:var(${p.vote === "Yea" ? "--pass" : "--fail"})">${p.vote}</div></div>`;
    };
    const order = ["Collins", "Murkowski", "Paul", "Fetterman"];
    return page({
      top: top(
        card({ label: "Voting", pad: "22px 22px 24px", inner: IRAN.card }),
        card({
          label: "Crossed party lines",
          inner: `<div style="display:grid;gap:12px">${order.map((n) => person(x.find((p) => p.last === n))).join("")}</div>
            <div style="font-size:15px;color:var(--gray);line-height:1.45;margin-top:20px">${esc(prettyBill(b.type, b.number))} directs the President to remove U.S. forces from hostilities with Iran unless Congress declares war or authorizes force.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Senate vote", appBillId(b.type, b.number)),
        headline: hl("The Senate rejected an ", ["k", "Iran war powers resolution"], ", ", ["k", `${IRAN.yeaTotal}–${IRAN.nayTotal}`], "."),
        text: "Three Republicans, Susan Collins, Lisa Murkowski, and Rand Paul, voted for it. One Democrat, John Fetterman, voted against it. The House passed it in September.",
      }),
    });
  },
});

// ===========================================================================
// 3. To the President: three bills
// ===========================================================================

add({
  slug: "3-to-the-president",
  name: "To the President: three bills",
  group: GROUP,
  trigger: "Bills presented to the President",
  data: "Bill actions and summaries",
  caption: "Three bills went to the President last week: the annual cost-of-living raise for veterans' disability compensation, wider sharing of information on suspected counterfeit imports, and a parcel of Fort Bragg land for a North Carolina veterans home.",
  render() {
    check(/cost-of-living increase/.test(bill("hr8552").summary), "COLA summary");
    check(/intellectual property rights/.test(bill("hr4930").summary), "IP summary");
    check(/Fort Bragg/.test(bill("hr10159").summary) && /state home/.test(bill("hr10159").summary), "Fort Bragg summary");
    const rows = SENT.map((id) => listRow(id, tagBox("PRESENTED", fmtDate(when(id, /^Presented to President/).actionDate), "var(--blue)")));
    return page({
      top: top(card({ label: "To the President", aside: WEEK.label, w: 952, pad: "4px 34px", inner: `<div style="margin:auto 0">${rows.join("")}</div>` })),
      bottom: bottom({
        kicker: kicker("To the President", WEEK.label),
        headline: hl(["p", "Three bills"], " reached the ", ["p", "President's desk"], ", including a ", ["k", "raise for disabled veterans"], "."),
        text: "The yearly cost-of-living increase for veterans' disability compensation, more information sharing on suspected counterfeit imports, and Fort Bragg land for a North Carolina veterans home.",
      }),
    });
  },
});

// ===========================================================================
// 4. House bills the Senate passed
// ===========================================================================

add({
  slug: "4-passed-senate",
  name: "Passed the Senate: five House bills",
  group: GROUP,
  trigger: "House bills cleared the Senate",
  data: "Bill actions",
  caption: "The Senate passed five House bills last week. Three passed unchanged and head to the President: protections for older investors from financial exploitation, a safety standard for e-bike and scooter batteries, and private events at the Gateway Arch. Two were amended and go back to the House: a ban on denying organ transplants because of disability, and a new framework for professional boxing.",
  render() {
    const sent = (id) => tagBox("NEXT", "To President", "var(--pass)");
    const back = (id) => tagBox("AMENDED", "Back to House", "var(--blue)");
    const rows = [...CLEARED.map((id) => listRow(id, sent(id))), ...AMENDED.map((id) => listRow(id, back(id)))];
    return page({
      top: top(card({ label: "Passed the Senate", aside: WEEK.label, w: 952, pad: "0 34px", inner: `<div style="margin:auto 0">${rows.join("")}</div>` })),
      bottom: bottom({
        kicker: kicker("Passed the Senate", WEEK.label),
        headline: hl("The Senate passed ", ["k", "five House bills"], ". ", ["p", "Three"], " head to the President."),
        text: "Protections for older investors, an e-bike battery safety standard, and Gateway Arch events go to the President. The organ transplant and boxing bills were amended, so they go back to the House.",
      }),
    });
  },
});

// ===========================================================================
// 5. Week in Congress
// ===========================================================================

add({
  slug: "5-week-in-congress",
  name: "Week in Congress: Nov 16–20",
  group: GROUP,
  trigger: "Weekly recap",
  data: "Congress.gov counts for the Nov 23 newsletter, Senate roll calls 269 and 270",
  source: "Congress.gov, Senate.gov",
  caption: `The week in Congress: no bills became law, ${SENT.length} went to the President, ${PASSED_BOTH} passed both chambers, ${OUT_OF_COMMITTEE} came out of committee, and ${INTRODUCED} bills and resolutions were introduced. The Senate passed an energy permitting package and rejected an Iran war powers resolution.`,
  render() {
    const stat = (n, label, color = "#111") => `<div class="panel" style="padding:24px 22px 22px"><div class="big" style="font-size:112px;color:${color}">${n}</div><div style="font-size:17.5px;color:var(--gray);margin-top:10px;line-height:1.3">${label}</div></div>`;
    const row = (k, v) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;font-size:19px;padding:15px 0;border-bottom:1px solid #e6e3dc"><span style="color:var(--gray);white-space:nowrap">${k}</span><b style="text-align:right">${v}</b></div>`;
    return page({
      top: top(
        card({
          label: "This week",
          aside: WEEK.label,
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
              ${stat(SENT.length, "sent to the President", "var(--blue)")}${stat(PASSED_BOTH, "passed both chambers", "var(--pass)")}${stat(OUT_OF_COMMITTEE, "out of committee")}${stat(INTRODUCED, "bills and resolutions introduced")}
            </div>
            <div class="sub" style="margin-top:28px;font-size:19px">Where things stand</div>
            ${row("Biggest Senate vote", `Energy permitting, ${PERMITS.yeaTotal}–${PERMITS.nayTotal}`)}
            ${row("Rejected", `Iran war powers, ${IRAN.yeaTotal}–${IRAN.nayTotal}`)}
            ${row("On the President's desk", "Veterans' cost-of-living raise and 2 others")}
            ${row("Signed into law", "None this week")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Week in Congress", WEEK.label),
        headline: hl("The Senate passed an ", ["k", "energy permitting package"], " and rejected an ", ["k", "Iran war powers"], " resolution."),
        text: `No bills became law. ${SENT.length} went to the President, ${PASSED_BOTH} passed both chambers, ${OUT_OF_COMMITTEE} came out of committee, and ${INTRODUCED} bills and resolutions were introduced.`,
      }),
    });
  },
});
