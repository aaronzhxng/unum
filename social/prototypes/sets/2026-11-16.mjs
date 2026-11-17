// Eight posts for the week of Nov 9-13, 2026, the week the November 16
// Congress Weekly covers: four laws signed on Nov 10, the penny bill on the
// President's desk, nuclear energy and retirement-plan votes, and a discharge
// petition on Veterans Day that forced a vote on a veterans bill.
//
//   node social/prototypes/fetch-data.mjs
//   node social/prototypes/fetch-set.mjs hr1945 hr7730 hr1703 hr997 hr10167 hr5284 hr8352 hr1550 hr1013 hr9612 hr3978 hr2102 hres1247 s5714 hr4930 hr8552 M001136 D000563 L000577 L000491
//   SET=social/prototypes/sets/2026-11-16.mjs OUT=2026-11-16 node social/prototypes/build.mjs
//   OUT=2026-11-16 node social/prototypes/reel.mjs     # then the recap video

import fs from "node:fs";
import path from "node:path";
import {
  esc, page, hl, kicker, bottom, card, photo, policyColor, policyIcon, profileCard,
  prettyBill, appBillId, fmtDate, longDate, OUTPUT_ROOT,
} from "../lib.mjs";
import { member, rollcall, bill, laws } from "../data.mjs";
import { top, detailsCard, appVote } from "../templates.mjs";

const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};
const WEEK = { from: "2026-11-09", to: "2026-11-13", label: "Nov 9–13" };
const GROUP = "Week of Nov 9";
const inWeek = (iso) => iso >= WEEK.from && iso <= WEEK.to;

const readData = (f) => JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", f), "utf8"));
const actions = (id) => readData(`actions-${id}.json`);
const when = (id, re) => actions(id).find((a) => re.test(a.text));
const cosponsors = (id) => (readData(`cosponsors-${id}.json`) || []).filter((c) => !c.sponsorshipWithdrawnDate);
const how = (text) =>
  /voice vote/i.test(text) ? "Voice vote" : /Unanimous Consent/i.test(text) ? "Unanimous consent" : /Yeas and Nays|Roll no/i.test(text) ? "Recorded vote" : "Passed";
const step = (label, sub, iso, done = true) => `<div style="display:grid;grid-template-columns:22px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid #e6e3dc">
    <i style="width:14px;height:14px;border-radius:50%;margin-top:5px;${done ? "background:var(--pass)" : "border:2.5px solid var(--blue)"}"></i>
    <div><div style="font-size:17px;font-weight:700">${label}</div><div style="font-size:15px;color:var(--gray);margin-top:3px">${sub}${iso ? " · " + fmtDate(iso) : ""}</div></div></div>`;
const bullet = (html) => `<div style="display:grid;grid-template-columns:14px 1fr;gap:12px;font-size:17px;line-height:1.45;color:#333;padding:7px 0"><i style="width:8px;height:8px;border-radius:50%;background:var(--blue);margin-top:8px"></i><div>${html}</div></div>`;

// ---------------------------------------------------------------------------
// The week's facts, shared by several posts
// ---------------------------------------------------------------------------

const LAWS = ["hr997", "hr1703", "hr1945", "hr7730"];
const SIGNED_ON = "2026-11-10";
for (const id of LAWS) {
  const b = bill(id);
  check(b.law && /^Became Public Law/.test(b.latest.text) && b.latest.actionDate === SIGNED_ON, `${id} became law Nov 10`);
}
const lawNo = (l) => Number(l.laws[0].number.split("-")[1]);
const newest = [...laws].sort((a, b) => lawNo(b) - lawNo(a))[0];
const LAW_COUNT = lawNo(newest);
check(LAW_COUNT === 142, `the newest law is P.L. 119-${LAW_COUNT}`);

// Sent to the President this week, and the 10-day clock (Sundays don't count)
const SENT = ["hr10167", "hr5284", "hr8352", "hr1550"];
const PENNY = "hr10167";
const SENT_ON = bill(PENNY).latest.actionDate;
check(/^Presented to President/.test(bill(PENNY).latest.text) && SENT_ON === "2026-11-12", "the penny bill was presented Nov 12");
const deadline = (() => {
  const d = new Date(SENT_ON + "T12:00:00Z");
  for (let n = 0; n < 10; ) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0) n++;
  }
  return d.toISOString().slice(0, 10);
})();
check(deadline === "2026-11-24", `10-day deadline is ${deadline}`);

// Counted on Congress.gov for the November 16 newsletter
const PASSED_BOTH = 2, OUT_OF_COMMITTEE = 28, INTRODUCED = 127;

// House roll calls this week
const ENRICH = rollcall(316), REFUEL = rollcall(315);
const RETIRE = rollcall(321);
const DISCHARGE = rollcall(320), STAR = rollcall(323);
check(ENRICH.number === "9612" && REFUEL.number === "3978" && ENRICH.iso === "2026-11-09" && REFUEL.iso === "2026-11-09", "nuclear votes are H.R. 9612 and 3978 on Nov 9");
check(RETIRE.number === "1013" && /On Passage/.test(RETIRE.question) && RETIRE.passed, "roll 321 passed H.R. 1013");
check(DISCHARGE.type === "HRES" && DISCHARGE.number === "1247" && /Discharge/.test(DISCHARGE.question) && DISCHARGE.iso === "2026-11-11", "roll 320 discharged H.Res. 1247 on Veterans Day");
check(STAR.number === "2102" && STAR.passed && STAR.iso === "2026-11-12", "roll 323 passed H.R. 2102 on Nov 12");

export const templates = [];
export const recap = { hook: "What Congress did Nov 9–13", label: "Nov 16" };
const add = (t) => templates.push(t);

// ===========================================================================
// 1. New Laws: the four signed Nov 10
// ===========================================================================

add({
  slug: "1-new-laws",
  name: "New Laws: four signed Nov 10",
  group: GROUP,
  trigger: "Several laws signed on one day",
  data: "Congress.gov law list, bill policy areas",
  caption: "Four bills became law on November 10: a landmark designation for America's National Churchill Museum in Missouri, restored debt limits for small-business bankruptcies, Medicare billing codes for lightweight wheelchairs, and in-house lawyers for the National Taxpayer Advocate. That brings this Congress to 142 laws.",
  render() {
    const list = laws.filter((l) => l.latestAction?.actionDate === SIGNED_ON).sort((a, b) => lawNo(b) - lawNo(a));
    check(list.length === 4, `${list.length} laws signed Nov 10`);
    const rows = list.map((l) => {
      const b = bill(l.type.toLowerCase() + l.number);
      const m = member(b.sponsorId);
      return `<div style="display:flex;gap:22px;align-items:flex-start;padding:20px 0;border-bottom:1px solid #e6e3dc">
          <img src="${policyIcon(b.area)}" style="width:64px;height:64px;flex:none">
          <div style="flex:1;min-width:0">
            <div style="font-size:15px"><span style="color:${policyColor(b.area)};font-weight:700">${esc(prettyBill(b.type, b.number))}</span> <span style="color:var(--muted)">· ${esc(b.area)}</span></div>
            <div style="font-size:21px;font-weight:700;line-height:1.25;margin-top:6px">${esc(b.title)}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:10px">${photo(m, 32)}<span style="font-size:15px;color:var(--gray)">${esc(m.title)} ${esc(m.display)} (${esc(m.tag)})</span></div>
          </div>
          <div style="text-align:right;flex:none"><div class="mono" style="font-size:13px;color:var(--muted)">PUBLIC LAW</div><div class="big" style="font-size:42px;color:var(--pass)">${esc(b.law)}</div></div>
        </div>`;
    });
    return page({
      top: top(card({ label: "New laws", aside: fmtDate(SIGNED_ON), w: 952, pad: "4px 34px", inner: `<div style="margin:auto 0">${rows.join("")}</div>` })),
      bottom: bottom({
        kicker: kicker("Signed into law", longDate(SIGNED_ON)),
        headline: hl(["k", "Four bills"], " became ", ["pk", "law"], " on November 10."),
        text: "A historic landmark for America's National Churchill Museum, restored debt limits for small-business bankruptcies, Medicare billing codes for lightweight wheelchairs, and in-house lawyers for the National Taxpayer Advocate.",
      }),
    });
  },
});

// ===========================================================================
// 2. To the President: the Common Cents Act
// ===========================================================================

add({
  slug: "2-penny",
  name: "To the President: Common Cents Act",
  group: GROUP,
  trigger: "A bill people will notice was presented to the President",
  data: "The bill, its summary and actions",
  caption: "The penny is on its way out. The Common Cents Act, now on the President's desk, would stop making pennies for everyday use. Pennies would still be legal tender, cash totals would round up or down to a multiple of five cents, and the nickel could be made from different metals. The President has until November 24 to act.",
  render() {
    const b = bill(PENNY);
    const m = member(b.sponsorId);
    const house = when(PENNY, /^Passed\/agreed to in House/), senate = when(PENNY, /^Passed\/agreed to in Senate/);
    check(house && senate, "the penny bill passed both chambers");
    check(/legal tender/.test(b.summary) && /round the payment up or down/.test(b.summary) && /nickel/.test(b.summary), "summary covers legal tender, rounding, and the nickel");
    check(m.bioguide === "M001136", "sponsor is Rep. McClain");
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 1, 0.5], last: "To President", sponsor: true }),
        card({
          label: "What it would do",
          inner: `
            ${bullet("The Treasury <b>stops making pennies</b> for everyday use, except for collectors.")}
            ${bullet("Pennies <b>stay legal tender</b>, so the ones you have still count.")}
            ${bullet("Cash totals <b>round up or down</b> to a multiple of five cents. Only cash payments are rounded.")}
            ${bullet("The <b>nickel</b> could be made from different metals.")}
            <div class="sub" style="margin-top:22px">How it got here</div>
            ${step("Passed the House", how(house.text), house.actionDate)}
            ${step("Passed the Senate", how(senate.text), senate.actionDate)}
            ${step("Presented to the President", `Deadline ${longDate(deadline)}`, SENT_ON, false)}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("To the President", appBillId(b.type, b.number)),
        headline: hl("The ", ["k", "penny"], " is on its way out: the ", ["k", "Common Cents Act"], " is on the ", ["p", "President's desk"], "."),
        text: `${m.title} ${m.display}'s ${prettyBill(b.type, b.number)} passed both chambers without a recorded vote. The President has until ${longDate(deadline)} to sign or veto it.`,
      }),
    });
  },
});

// ===========================================================================
// 3. The Big Vote: retirement plans for charities and schools
// ===========================================================================

add({
  slug: "3-big-vote",
  name: "The Big Vote: Retirement Fairness Act",
  group: GROUP,
  trigger: "The week's closest recorded passage vote",
  data: "The bill, House roll call 321 by party",
  caption: `The week's big vote: the House voted ${RETIRE.yeaTotal}–${RETIRE.nayTotal} to let 403(b) retirement plans, the ones offered by public schools, charities, and churches, invest in pooled funds managed by banks, trust companies, and insurers. Every Republican voted yes, joined by ${RETIRE.yea.d} Democrats. It now goes to the Senate.`,
  render() {
    const b = bill("hr1013");
    const m = member(b.sponsorId);
    check(RETIRE.nay.r === 0 && RETIRE.yea.d > 0 && RETIRE.nay.d > 0, "no Republican voted no; Democrats split");
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 0.5, 0], statusText: "Referred to the Senate Banking Committee." }),
        card({ label: "Voting", pad: "22px 22px 24px", inner: appVote(RETIRE) }),
      ),
      bottom: bottom({
        kicker: kicker("The big vote", appBillId(b.type, b.number)),
        headline: hl("The House voted ", ["p", `${RETIRE.yeaTotal}–${RETIRE.nayTotal}`], " to widen what ", ["k", "school and charity retirement plans"], " can invest in."),
        text: `${m.title} ${m.display}'s bill lets 403(b) plans invest in pooled funds run by banks, trust companies, and insurers. Every Republican voted yes, joined by ${RETIRE.yea.d} Democrats; ${RETIRE.nay.d} Democrats voted no.`,
      }),
    });
  },
});

// ===========================================================================
// 4. Nuclear energy: two bills, nearly unanimous
// ===========================================================================

add({
  slug: "4-nuclear",
  name: "Two Votes: nuclear energy bills",
  group: GROUP,
  trigger: "Lopsided bipartisan votes on one topic",
  data: "House roll calls 315 and 316, bill summaries",
  caption: `The House spent Monday on nuclear energy. The American Enrichment Deployment Act, letting a uranium enrichment plant be built before its license is issued, passed ${ENRICH.yeaTotal}–${ENRICH.nayTotal}. The Nuclear REFUEL Act, giving future plants that recycle spent nuclear fuel a simpler licensing path, passed ${REFUEL.yeaTotal}–${REFUEL.nayTotal}. Both go to the Senate.`,
  render() {
    check(/construction of a uranium enrichment facility before a license/.test(bill("hr9612").summary), "enrichment bill summary");
    check(/does not isolate plutonium/.test(bill("hr3978").summary) && /fewer steps/.test(bill("hr3978").summary), "REFUEL bill summary");
    check(ENRICH.nayTotal <= 5 && REFUEL.nayTotal <= 5, "both nearly unanimous");
    check(ENRICH.twoThirds && REFUEL.twoThirds, "both needed two-thirds");
    const titled = (r, title, what) => `<div style="font-size:19px;font-weight:700;line-height:1.25">${title}</div>
      <div style="font-size:15px;color:var(--gray);margin:6px 0 14px">${what}</div>${appVote(r)}`;
    return page({
      top: top(
        card({ label: "H.R. 9612", pad: "22px 22px 24px", inner: titled(ENRICH, "American Enrichment Deployment Act", "Lets a uranium enrichment plant start construction before its license is issued.") }),
        card({ label: "H.R. 3978", pad: "22px 22px 24px", inner: titled(REFUEL, "Nuclear REFUEL Act", "Gives future plants that recycle spent nuclear fuel, without isolating plutonium, a simpler licensing path.") }),
      ),
      bottom: bottom({
        kicker: kicker("Nuclear energy", longDate(ENRICH.iso)),
        headline: hl("Two ", ["k", "nuclear energy"], " bills passed the House with ", ["p", "almost no opposition"], "."),
        text: `On ${longDate(ENRICH.iso)}, the House passed the enrichment bill ${ENRICH.yeaTotal}–${ENRICH.nayTotal} and the fuel recycling bill ${REFUEL.yeaTotal}–${REFUEL.nayTotal}, both under a fast-track rule that takes a two-thirds vote. Both now go to the Senate.`,
      }),
    });
  },
});

// ===========================================================================
// 5. Discharge petition: the Major Richard Star Act
// ===========================================================================

add({
  slug: "5-discharge-petition",
  name: "Discharge Petition: Major Richard Star Act",
  group: GROUP,
  trigger: "A discharge petition forced a floor vote",
  data: "H.Res. 1247 and H.R. 2102 roll calls, bill summary and cosponsors",
  caption: `On Veterans Day, a discharge petition forced a House vote on the Major Richard Star Act, which would let veterans with combat-related disabilities collect their full retirement pay alongside disability compensation. The motion to discharge passed ${DISCHARGE.yeaTotal}–${DISCHARGE.nayTotal}, with ${DISCHARGE.yea.r} Republicans joining every Democrat. The next day the bill passed ${STAR.yeaTotal}–${STAR.nayTotal}. It now goes to the Senate.`,
  render() {
    const b = bill("hr2102");
    const m = member(b.sponsorId);
    check(/combat-related disability to receive retirement pay, without reduction/.test(b.summary), "Star Act summary");
    check(b.cosponsors >= 300, `Star Act has ${b.cosponsors} cosponsors`);
    check(DISCHARGE.nay.d === 0 && DISCHARGE.yea.r > 0, "every Democrat and some Republicans voted to discharge");
    const titled = (r, title, sub) => `<div style="font-size:19px;font-weight:700;line-height:1.25">${title}</div>
      <div style="font-size:15px;color:var(--gray);margin:6px 0 14px">${sub}</div>${appVote(r)}`;
    return page({
      top: top(
        card({ label: "Nov 11 · Veterans Day", pad: "22px 22px 24px", inner: titled(DISCHARGE, "Forcing the vote", "A discharge petition brings a bill to the floor without the leadership's go-ahead.") }),
        card({ label: "Nov 12", pad: "22px 22px 24px", inner: titled(STAR, "Major Richard Star Act", `${m.title} ${m.display} (${m.tag}) · ${b.cosponsors} cosponsors`) }),
      ),
      bottom: bottom({
        kicker: kicker("Discharge petition", appBillId(b.type, b.number)),
        headline: hl("On ", ["k", "Veterans Day"], ", a petition forced a vote on a ", ["k", "veterans' pay bill"], ". It passed ", ["p", `${STAR.yeaTotal}–${STAR.nayTotal}`], "."),
        text: `The bill lets veterans with combat-related disabilities collect full retirement pay alongside disability compensation, instead of having one reduced by the other. ${DISCHARGE.yea.r} Republicans joined every Democrat to bring it to the floor.`,
      }),
    });
  },
});

// ===========================================================================
// 6. Bill of the Day: Competition in Professional Baseball Act
// ===========================================================================

add({
  slug: "6-bill-of-the-day",
  name: "Bill of the Day: baseball's antitrust exemption",
  group: GROUP,
  trigger: "New bill this week, with a lead cosponsor from the other party",
  data: "Bill, cosponsors, sponsor profiles",
  caption: "New this week: the Competition in Professional Baseball Act would end Major League Baseball's century-old exemption from antitrust law, so it would follow the same competition rules as other professional sports. Sen. Dick Durbin (D-IL) introduced it with Sen. Mike Lee (R-UT) as its cosponsor.",
  render() {
    const b = bill("s5714");
    const m = member(b.sponsorId);
    const cos = cosponsors("s5714");
    check(inWeek(b.introduced), "introduced this week");
    check(m.party === "D" && cos.length === 1 && cos[0].bioguideId === "L000577", "Democratic sponsor, Sen. Lee as the one cosponsor");
    const co = member(cos[0].bioguideId);
    check(co.party === "R", "Lee is a Republican");
    const person = (x, role) => `<div class="panel" style="display:flex;align-items:center;gap:16px;padding:16px 18px">${photo(x, 64)}
        <div><div style="font-size:14px;color:var(--muted)">${role}</div><div style="font-size:19px;font-weight:700">${esc(x.title)} ${esc(x.display)}</div>
        <div style="font-size:15px;margin-top:3px"><b class="c-${x.party.toLowerCase()}">${x.party === "D" ? "Democrat" : "Republican"}</b> <span style="color:var(--gray)">· ${esc(x.seat)}</span></div></div></div>`;
    return page({
      top: top(
        detailsCard(b, { fills: [1, 0.5, 0, 0], sponsor: false, statusText: "Referred to the Senate Judiciary Committee.", rows: [["Introduced", fmtDate(b.introduced)], ["Committee", "Senate Judiciary"], ["Type", "Senate Bill"]] }),
        card({
          label: "Sponsors",
          inner: `<div style="display:grid;gap:16px">${person(m, "Sponsor")}${person(co, "Cosponsor")}</div>
            <div class="sub" style="margin-top:28px">What it would do</div>
            <div style="font-size:17px;line-height:1.45;color:#333">Ends the <b>exemption from antitrust law</b> that Major League Baseball has had for about a century.</div>
            <div style="font-size:17px;line-height:1.45;color:#333;margin-top:14px">Baseball would face the <b>same competition rules</b> as every other professional sport.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Bill of the day", appBillId(b.type, b.number)),
        headline: hl("A bipartisan bill would end ", ["k", "baseball's antitrust exemption"], "."),
        text: `${m.title} ${m.display} (${m.tag}) introduced ${prettyBill(b.type, b.number)}, the ${b.title}, on ${longDate(b.introduced)}, with ${co.title} ${co.display} (${co.tag}) as cosponsor. It was sent to the Senate Judiciary Committee.`,
      }),
    });
  },
});

// ===========================================================================
// 7. Member Spotlight: Rep. Lisa McClain, sponsor of the penny bill
// ===========================================================================

add({
  slug: "7-member-spotlight",
  name: "Member Spotlight: Rep. Lisa McClain",
  group: GROUP,
  trigger: "A member's bill reached the President this week",
  data: "Member profile, committees, education, policy areas",
  caption: "Meet Rep. Lisa McClain of Michigan, who wrote the Common Cents Act now on the President's desk. She has represented Michigan's 9th District since 2021 and sits on the Financial Services and Education and Workforce committees. Finance is the top policy area of the bills she has worked on this Congress.",
  render() {
    const b = bill(PENNY);
    const m = member(b.sponsorId);
    check(m.bioguide === "M001136" && m.since === 2021, `McClain, in the House since ${m.since}`);
    check(m.areas[0]?.name === "Finance and Financial Sector", "McClain's top policy area is Finance");
    check(m.committees.length === 2, "McClain sits on two committees");
    return page({
      top: top(
        card({ label: "Profile", inner: profileCard(m, { areas: m.areas.slice(0, 4), lawsText: `${prettyBill(b.type, b.number)} · ${b.title} (to the President)` }) }),
        card({
          label: "At a glance",
          inner: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="panel" style="padding:18px"><div class="big" style="font-size:58px">${m.sponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills sponsored</div></div>
              <div class="panel" style="padding:18px"><div class="big" style="font-size:58px">${m.cosponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills cosponsored</div></div>
            </div>
            <div class="sub" style="margin-top:28px">In Congress since</div><div style="font-size:17px;color:var(--gray)">${m.since}</div>
            <div class="sub" style="margin-top:24px">Committees</div>${m.committees.map((c) => `<div style="font-size:16px;color:var(--gray);padding:3px 0">${esc(c.replace("House Committee on ", ""))}</div>`).join("")}
            <div class="sub" style="margin-top:24px">Education</div>${m.education.map((e) => `<div style="font-size:16px;color:var(--gray);padding:3px 0">${esc(e)}</div>`).join("")}
            <div style="font-size:13.5px;color:var(--muted);margin-top:auto">Sponsored and cosponsored counts cover 2025 to date.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Member spotlight", m.tag),
        headline: hl("Meet ", ["n", `${m.title} ${m.display}`], ", whose ", ["k", "penny bill"], " is on the ", ["p", "President's desk"], "."),
        text: `${m.title} ${m.last} has represented ${m.districtName} since ${m.since} and sits on the Financial Services and Education and Workforce committees. Her Common Cents Act passed both chambers without a recorded vote.`,
      }),
    });
  },
});

// ===========================================================================
// 8. Week in Congress
// ===========================================================================

add({
  slug: "8-week-in-congress",
  name: "Week in Congress: Nov 9–13",
  group: GROUP,
  trigger: "Weekly recap",
  data: "Congress.gov counts for the Nov 16 newsletter, House roll calls, P.L. 119-103",
  caption: `The week in Congress: four bills became law, four more went to the President, including the penny bill, ${PASSED_BOTH} bills passed both chambers, ${OUT_OF_COMMITTEE} came out of committee, and ${INTRODUCED} bills and resolutions were introduced. Government funding runs out December 11.`,
  render() {
    const cr = bill("hr6500");
    check(cr.law === "119-103" && /December 11, 2026/.test(cr.summary), "stopgap funding runs through Dec 11");
    for (const id of SENT) check(/^Presented to President/.test(bill(id).latest.text) && inWeek(bill(id).latest.actionDate), `${id} was presented this week`);
    const stat = (n, label, color = "#111") => `<div class="panel" style="padding:24px 22px 22px"><div class="big" style="font-size:112px;color:${color}">${n}</div><div style="font-size:17.5px;color:var(--gray);margin-top:10px;line-height:1.3">${label}</div></div>`;
    const row = (k, v) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;font-size:19px;padding:15px 0;border-bottom:1px solid #e6e3dc"><span style="color:var(--gray);white-space:nowrap">${k}</span><b style="text-align:right">${v}</b></div>`;
    return page({
      top: top(
        card({
          label: "This week",
          aside: WEEK.label,
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
              ${stat(LAWS.length, "signed into law", "var(--pass)")}${stat(SENT.length, "sent to the President", "var(--blue)")}${stat(OUT_OF_COMMITTEE, "out of committee")}${stat(INTRODUCED, "bills and resolutions introduced")}
            </div>
            <div class="sub" style="margin-top:28px;font-size:19px">Where things stand</div>
            ${row("Biggest House vote", `Retirement plans, ${RETIRE.yeaTotal}–${RETIRE.nayTotal}`)}
            ${row("Forced to a vote", `Major Richard Star Act, ${STAR.yeaTotal}–${STAR.nayTotal}`)}
            ${row("On the President's desk", "Common Cents Act and 3 others")}
            ${row("Government funding runs out", "December 11 (P.L. 119-103)")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Week in Congress", WEEK.label),
        headline: hl(["pk", "Four bills became law"], " and the ", ["k", "penny bill"], " reached the ", ["p", "President"], "."),
        text: `The House passed two nuclear energy bills, a retirement plan bill, and a veterans' pay bill forced to the floor by a discharge petition. Government funding runs out December 11.`,
      }),
    });
  },
});
