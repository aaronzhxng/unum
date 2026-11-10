// Nine posts for the week of Nov 2-8, 2026, using only that week's bills.
// Neither chamber held a recorded vote, so there are no vote posts: two
// bills became law on Election Day, two went to the President, and new
// bills kept coming in.
//
//   SET=social/prototypes/sets/2026-11-09.mjs OUT=2026-11-09 node social/prototypes/build.mjs
//   OUT=2026-11-09 node social/prototypes/reel.mjs     # then the recap video
//
// Needs bill/sum/actions/cosponsors files for hr8205, hr1744, hr1945, hr7730,
// hr10959, pa files for Q000023 and S001226, and a fresh laws.json in data/.

import fs from "node:fs";
import path from "node:path";
import {
  esc, page, hl, kicker, bottom, card, photo, policyColor, policyIcon, stages,
  profileCard, prettyBill, appBillId, fmtDate, longDate, OUTPUT_ROOT,
} from "../lib.mjs";
import { member, rollcalls, bill, laws } from "../data.mjs";
import { top, detailsCard } from "../templates.mjs";

const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};
const WEEK = { from: "2026-11-02", to: "2026-11-08", label: "Nov 2–8" };
const GROUP = "Week of Nov 2";
const inWeek = (iso) => iso >= WEEK.from && iso <= WEEK.to;

const readData = (f) => JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", f), "utf8"));
const actions = (id) => readData(`actions-${id}.json`);
// The first action whose text matches, so House and Senate copies of the
// same action count once
const when = (id, re) => actions(id).find((a) => re.test(a.text));
const cosponsors = (id) => (readData(`cosponsors-${id}.json`) || []).filter((c) => !c.sponsorshipWithdrawnDate);

// How each chamber passed it, in plain words
const how = (text) =>
  /voice vote/i.test(text) ? "Voice vote" : /Unanimous Consent/i.test(text) ? "Unanimous consent" : /Yeas and Nays|Roll no/i.test(text) ? "Recorded vote" : "Passed";
const path3 = (id) => {
  const house = when(id, /^Passed\/agreed to in House/), senate = when(id, /^Passed\/agreed to in Senate/);
  check(house && senate, `${id} passed both chambers`);
  return { house, senate };
};
const step = (label, sub, iso, done = true) => `<div style="display:grid;grid-template-columns:22px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid #e6e3dc">
    <i style="width:14px;height:14px;border-radius:50%;margin-top:5px;${done ? "background:var(--pass)" : "border:2.5px solid var(--blue)"}"></i>
    <div><div style="font-size:17px;font-weight:700">${label}</div><div style="font-size:15px;color:var(--gray);margin-top:3px">${sub}${iso ? " · " + fmtDate(iso) : ""}</div></div></div>`;

// The week's facts, shared by several posts
const LAWS = ["hr8205", "hr1744"];
const SENT = ["hr1945", "hr7730"];
for (const id of LAWS) {
  const b = bill(id);
  check(b.law && /^Became Public Law/.test(b.latest.text) && inWeek(b.latest.actionDate), `${id} became law this week`);
}
for (const id of SENT) {
  const b = bill(id);
  check(/^Presented to President/.test(b.latest.text) && inWeek(b.latest.actionDate), `${id} was sent to the President this week`);
}
const SIGNED_ON = bill("hr8205").latest.actionDate;
check(SIGNED_ON === "2026-11-03" && bill("hr1744").latest.actionDate === SIGNED_ON, "both laws were signed Nov 3, Election Day");
const SENT_ON = bill("hr1945").latest.actionDate;
check(SENT_ON === "2026-11-05" && bill("hr7730").latest.actionDate === SENT_ON, "both bills went to the President Nov 5");
// Counted on Congress.gov for the Nov 9 newsletter: House bills reported
// from committee and bills and resolutions introduced, Nov 2-8
const REPORTED = 11, INTRODUCED = 14;
// The House's last recorded vote; none this week
const lastVote = [...rollcalls].sort((a, b) => b.iso.localeCompare(a.iso))[0];
check(lastVote.iso === "2026-09-16", `last House vote is ${lastVote.iso}`);

// Laws signed so far this Congress, by public law number
const lawNo = (l) => Number(l.laws[0].number.split("-")[1]);
const newest = [...laws].sort((a, b) => lawNo(b) - lawNo(a))[0];
const LAW_COUNT = lawNo(newest);
check(LAW_COUNT === 138 && newest.type + newest.number === "HR8205", `the newest law is P.L. 119-${LAW_COUNT}`);

// The President has 10 days, not counting Sundays, to act on a bill once
// it is presented
const deadline = (() => {
  const d = new Date(SENT_ON + "T12:00:00Z");
  for (let n = 0; n < 10; ) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0) n++;
  }
  return d.toISOString().slice(0, 10);
})();
check(deadline === "2026-11-17", `10-day deadline is ${deadline}`);

export const templates = [];
export const recap = { hook: "What Congress did on Election Week", label: "Nov 9" };
const add = (t) => templates.push(t);

// ===========================================================================
// 1-2. Signed Into Law: the two Election Day laws
// ===========================================================================

const signedPost = ({ slug, id, name, caption, headline, text }) =>
  add({
    slug,
    name,
    group: GROUP,
    trigger: "Latest action became \"Became Public Law\" this week",
    data: "The bill, its actions",
    caption,
    render() {
      const b = bill(id);
      const { house, senate } = path3(id);
      const signed = when(id, /^Signed by President/);
      check(signed?.actionDate === b.latest.actionDate, `${id} was signed the day it became law`);
      return page({
        top: top(
          detailsCard(b, {
            fills: [1, 1, 1, 1],
            last: "Signed Into Law",
            rows: [["Became Law", fmtDate(signed.actionDate)], ["Introduced", fmtDate(b.introduced)], ["Policy Area", b.area]],
          }),
          card({
            label: "Public Law",
            inner: `
              <div class="mono" style="font-size:20px;color:var(--muted)">PUBLIC LAW NO.</div>
              <div class="big" style="font-size:118px;color:var(--pass);margin:8px 0 6px">${esc(b.law)}</div>
              <div style="font-size:18px;color:var(--gray)">Signed ${esc(longDate(signed.actionDate))}, 2026, Election Day</div>
              <div class="sub" style="margin-top:30px">How it got here</div>
              ${step("Passed the House", how(house.text), house.actionDate)}
              ${step("Passed the Senate", how(senate.text), senate.actionDate)}
              ${step("Signed by the President", "Public Law " + b.law, signed.actionDate)}`,
          }),
        ),
        bottom: bottom({ kicker: kicker("Now law", prettyBill(b.type, b.number).replace(" ", "")), headline: headline(b), text: text(b) }),
      });
    },
  });

signedPost({
  slug: "1-signed-als",
  id: "hr8205",
  name: "Signed Into Law: ALS research reauthorization",
  caption: "Now law: federal research programs for ALS and other neurodegenerative diseases are renewed through 2031. The President signed the bill on Election Day. It passed the House and Senate by voice vote, with 103 cosponsors from both parties.",
  headline: () => hl("The ", ["k", "ALS research bill"], " is ", ["pk", "now law"], ", signed on ", ["k", "Election Day"], "."),
  text: (b) => {
    const m = member(b.sponsorId);
    check(b.law === "119-138", "ALS bill is P.L. 119-138");
    return `${m.title} ${m.display}'s ${prettyBill(b.type, b.number)} renews NIH and FDA programs that fund research and treatments for ALS and other neurodegenerative diseases through 2031.`;
  },
});

signedPost({
  slug: "2-signed-religious-freedom",
  id: "hr1744",
  name: "Signed Into Law: Religious freedom commission",
  caption: "Now law: the U.S. Commission on International Religious Freedom is renewed through 2028. Its authorization would have ended December 11. The bill passed the House by voice vote and the Senate by unanimous consent, and was signed on Election Day.",
  headline: () => hl("The ", ["k", "religious freedom commission"], " is renewed ", ["pk", "through 2028"], "."),
  text: (b) => {
    const m = member(b.sponsorId);
    check(b.law === "119-137", "religious freedom bill is P.L. 119-137");
    return `${m.title} ${m.display}'s ${prettyBill(b.type, b.number)} keeps the independent commission that monitors religious freedom abroad and advises on U.S. policy. Its authorization would have ended December 11.`;
  },
});

// ===========================================================================
// 3. New Laws roundup: both Election Day laws
// ===========================================================================

add({
  slug: "3-new-laws",
  name: "New Laws: Election Day",
  group: GROUP,
  trigger: "Several laws signed on one day",
  data: "Congress.gov law list, bill policy areas",
  caption: "On Election Day, the President signed two bills into law: one renewing ALS research programs through 2031, and one renewing the U.S. Commission on International Religious Freedom through 2028. That brings this Congress to 138 laws.",
  render() {
    const list = laws.filter((l) => l.latestAction?.actionDate === SIGNED_ON).sort((a, b) => lawNo(b) - lawNo(a));
    check(list.length === 2, `${list.length} laws signed Nov 3`);
    const rows = list.map((l) => {
      const b = bill(l.type.toLowerCase() + l.number);
      const m = member(b.sponsorId);
      return `<div style="display:flex;gap:26px;align-items:flex-start;padding:30px 0;border-bottom:1px solid #e6e3dc">
          <img src="${policyIcon(b.area)}" style="width:84px;height:84px;flex:none">
          <div style="flex:1">
            <div style="font-size:16px"><span style="color:${policyColor(b.area)};font-weight:700">${esc(prettyBill(b.type, b.number))}</span> <span style="color:var(--muted)">· ${esc(b.area)}</span></div>
            <div style="font-size:25px;font-weight:700;line-height:1.25;margin-top:8px">${esc(b.title)}</div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px">${photo(m, 40)}<span style="font-size:16px;color:var(--gray)">${esc(m.title)} ${esc(m.display)} (${esc(m.tag)})</span></div>
          </div>
          <div style="text-align:right;flex:none"><div class="mono" style="font-size:14px;color:var(--muted)">PUBLIC LAW</div><div class="big" style="font-size:52px;color:var(--pass)">${esc(b.law)}</div></div>
        </div>`;
    });
    return page({
      top: top(card({ label: "New laws", aside: fmtDate(SIGNED_ON), w: 952, pad: "14px 34px", inner: `<div style="margin:auto 0">${rows.join("")}</div>` })),
      bottom: bottom({
        kicker: kicker("Signed into law", longDate(SIGNED_ON)),
        headline: hl(["k", "Two bills"], " became ", ["pk", "law"], " on ", ["k", "Election Day"], "."),
        text: `One renews federal ALS research programs through 2031. The other keeps the U.S. Commission on International Religious Freedom running through 2028. Both passed Congress without a recorded vote.`,
      }),
    });
  },
});

// ===========================================================================
// 4. Bill Tracker: the four bills that moved this week
// ===========================================================================

add({
  slug: "4-bill-tracker",
  name: "Bill Tracker: four bills that moved",
  group: GROUP,
  trigger: "Weekly: bills whose stage changed this week",
  data: "Bill status for H.R. 8205, 1744, 1945, 7730",
  caption: "Four bills moved closer to, or onto, the books last week. The ALS research bill we covered last week is now law, and so is the religious freedom commission renewal. Two more, on the Churchill museum and bankruptcy limits, are on the President's desk.",
  render() {
    const rows = [
      ...LAWS.map((id) => ({ id, fills: [1, 1, 1, 1], last: "Signed Into Law", note: `Public Law ${bill(id).law} · ${fmtDate(bill(id).latest.actionDate)}` })),
      ...SENT.map((id) => ({ id, fills: [1, 1, 1, 0.5], last: "To President", note: `Sent ${fmtDate(bill(id).latest.actionDate)}` })),
    ].map((x) => {
      const b = bill(x.id);
      const list = [
        { label: "Introduced", fill: 1 }, { label: "Passed House", fill: 1 }, { label: "Passed Senate", fill: 1 }, { label: x.last, fill: x.fills[3] },
      ];
      return `<div style="padding:18px 0;border-bottom:1px solid #e6e3dc">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span class="badge" style="background:${policyColor(b.area)}">${esc(prettyBill(b.type, b.number))}</span>
          <span style="font-size:16.5px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b.title)}</span>
          <span style="font-size:14px;color:var(--muted);white-space:nowrap">${esc(x.note)}</span></div>
        ${stages(list, 1.25)}</div>`;
    });
    return page({
      top: top(card({ label: "Bill tracker", aside: WEEK.label, w: 952, pad: "6px 34px", inner: `<div style="margin:auto 0">${rows.join("")}</div>` })),
      bottom: bottom({
        kicker: kicker("Bill tracker", WEEK.label),
        headline: hl(["k", "Four bills"], " moved this week: ", ["pk", "two became law"], " and ", ["p", "two reached the President"], "."),
        text: `The President has 10 days, not counting Sundays, to sign or veto the two bills sent on ${longDate(SENT_ON)}: the Churchill museum landmark bill and the bankruptcy threshold bill.`,
      }),
    });
  },
});

// ===========================================================================
// 5. Member Spotlight: Rep. Mike Quigley, whose bill just became law
// ===========================================================================

add({
  slug: "5-member-spotlight",
  name: "Member Spotlight: Rep. Mike Quigley",
  group: GROUP,
  trigger: "A member's bill became law this week",
  data: "Member profile, committees, education, policy areas, laws",
  caption: "Meet Rep. Mike Quigley of Illinois, whose ALS research bill became law on Election Day. He has represented Illinois's 5th District since 2009 and sits on the Appropriations and Intelligence committees. Health is the top policy area of the bills he has worked on this Congress.",
  render() {
    const b = bill("hr8205");
    const m = member(b.sponsorId);
    check(m.bioguide === "Q000023" && m.since === 2009, "Quigley, in the House since 2009");
    check(m.areas[0]?.name === "Health", "Quigley's top policy area is Health");
    check(m.committees.length === 2, "Quigley sits on two committees");
    return page({
      top: top(
        card({ label: "Profile", inner: profileCard(m, { areas: m.areas.slice(0, 4), lawsText: `${prettyBill(b.type, b.number)} · ${b.title} (Public Law ${b.law})` }) }),
        card({
          label: "At a glance",
          inner: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="panel" style="padding:18px"><div class="big" style="font-size:58px">${m.sponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills sponsored</div></div>
              <div class="panel" style="padding:18px"><div class="big" style="font-size:58px">${m.cosponsored}</div><div style="font-size:15px;color:var(--gray);margin-top:6px">bills cosponsored</div></div>
            </div>
            <div class="sub" style="margin-top:28px">In Congress since</div><div style="font-size:17px;color:var(--gray)">${m.since}</div>
            <div class="sub" style="margin-top:24px">Committees</div>${m.committees.map((c) => `<div style="font-size:16px;color:var(--gray);padding:3px 0">${esc(c.replace("House Committee on ", "").replace("House ", ""))}</div>`).join("")}
            <div class="sub" style="margin-top:24px">Education</div>${m.education.map((e) => `<div style="font-size:16px;color:var(--gray);padding:3px 0">${esc(e)}</div>`).join("")}
            <div style="font-size:13.5px;color:var(--muted);margin-top:auto">Sponsored and cosponsored counts cover 2025 to date.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Member spotlight", m.tag),
        headline: hl("Meet ", ["n", `${m.title} ${m.display}`], ", whose ", ["k", "ALS research bill"], " ", ["pk", "became law"], " on Election Day."),
        text: `${m.title} ${m.last} has represented ${m.districtName} since ${m.since} and sits on the Appropriations and Intelligence committees. His bill, ${prettyBill(b.type, b.number)}, had 103 cosponsors from both parties.`,
      }),
    });
  },
});

// ===========================================================================
// 6. Bill of the Day: Right to Re-Enroll Act, introduced Nov 5
// ===========================================================================

add({
  slug: "6-bill-of-the-day",
  name: "Bill of the Day: Right to Re-Enroll Act",
  group: GROUP,
  trigger: "New bill this week, with a lead cosponsor from the other party",
  data: "Bill, cosponsors, sponsor profile and policy areas",
  caption: "New this week: the Right to Re-Enroll Act. If your ACA marketplace plan drops your doctor or hospital, you could switch plans outside open enrollment, and keep paying in-network rates for that provider in the meantime. It was introduced by a Democrat with a Republican lead cosponsor.",
  render() {
    const b = bill("hr10959");
    const m = member(b.sponsorId);
    const cos = cosponsors("hr10959");
    check(inWeek(b.introduced) && b.introduced === "2026-11-05", "introduced Nov 5");
    check(m.party === "D" && cos.length === 1 && cos[0].party === "R" && cos[0].bioguideId === "M001230", "Democratic sponsor, one Republican cosponsor (Mackenzie)");
    const co = member(cos[0].bioguideId);
    const person = (x, role) => `<div class="panel" style="display:flex;align-items:center;gap:16px;padding:16px 18px">${photo(x, 64)}
        <div><div style="font-size:14px;color:var(--muted)">${role}</div><div style="font-size:19px;font-weight:700">${esc(x.title)} ${esc(x.display)}</div>
        <div style="font-size:15px;margin-top:3px"><b class="c-${x.party.toLowerCase()}">${x.party === "D" ? "Democrat" : "Republican"}</b> <span style="color:var(--gray)">· ${esc(x.seat)}</span></div></div></div>`;
    return page({
      top: top(
        detailsCard(b, { fills: [1, 0.5, 0, 0], sponsor: false }),
        card({
          label: "Sponsors",
          inner: `<div style="display:grid;gap:16px">${person(m, "Sponsor")}${person(co, "Lead cosponsor")}</div>
            <div class="sub" style="margin-top:28px">What it would do</div>
            <div style="font-size:17px;line-height:1.45;color:#333">If an ACA marketplace plan drops a doctor, hospital, or other provider from its network, patients get a <b>special enrollment period</b> to switch plans.</div>
            <div style="font-size:17px;line-height:1.45;color:#333;margin-top:14px">During that window, their costs for that provider stay at <b>in-network levels</b>.</div>
            <div style="font-size:13.5px;color:var(--muted);margin-top:auto">Referred to the Energy and Commerce Committee, ${fmtDate(b.latest.actionDate)}.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Bill of the day", appBillId(b.type, b.number)),
        headline: hl("If your plan ", ["k", "drops your doctor"], ", a new bill would let you ", ["k", "switch plans"], "."),
        text: `${m.title} ${m.display} (${m.tag}) introduced ${prettyBill(b.type, b.number)}, the ${b.title}, on ${longDate(b.introduced)}, with ${co.title} ${co.display} (${co.tag}) as lead cosponsor.`,
      }),
    });
  },
});

// ===========================================================================
// 7. Week in Congress
// ===========================================================================

add({
  slug: "7-week-in-congress",
  name: "Week in Congress: Election Week",
  group: GROUP,
  trigger: "Weekly recap",
  data: "Congress.gov actions Nov 2-8, last House roll call, P.L. 119-103",
  caption: "Election Week in Congress: two bills became law, two more went to the President, House committees reported 11 bills, and 14 new bills and resolutions were introduced. Neither chamber passed a bill. Government funding runs out December 11.",
  render() {
    const cr = bill("hr6500");
    check(cr.law === "119-103" && /December 11, 2026/.test(cr.summary), "stopgap funding runs through Dec 11");
    const stat = (n, label, color = "#111") => `<div class="panel" style="padding:24px 22px 22px"><div class="big" style="font-size:112px;color:${color}">${n}</div><div style="font-size:17.5px;color:var(--gray);margin-top:10px;line-height:1.3">${label}</div></div>`;
    const row = (k, v) => `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;font-size:19px;padding:15px 0;border-bottom:1px solid #e6e3dc"><span style="color:var(--gray);white-space:nowrap">${k}</span><b style="text-align:right">${v}</b></div>`;
    const short = { hr1945: "Churchill museum landmark", hr7730: "Bankruptcy debt limits" };
    return page({
      top: top(
        card({
          label: "This week",
          aside: WEEK.label,
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
              ${stat(LAWS.length, "signed into law", "var(--pass)")}${stat(SENT.length, "sent to the President", "var(--blue)")}${stat(REPORTED, "out of House committees")}${stat(INTRODUCED, "bills and resolutions introduced")}
            </div>
            <div class="sub" style="margin-top:28px;font-size:19px">Where things stand</div>
            ${row("Bills passed by either chamber", "None")}
            ${row("Last House vote", longDate(lastVote.iso))}
            ${SENT.map((id) => row("On the President's desk", `${short[id]} (${prettyBill(bill(id).type, bill(id).number)})`)).join("")}
            ${row("Government funding runs out", "December 11 (P.L. 119-103)")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Week in Congress", WEEK.label),
        headline: hl(["pk", "Two bills became law"], " on Election Day, but Congress ", ["k", "passed none"], "."),
        text: `Members were home for the election. House committees still reported ${REPORTED} bills, and ${INTRODUCED} new bills and resolutions were introduced. Government funding runs out December 11.`,
      }),
    });
  },
});

// ===========================================================================
// 8. By the Numbers: 138 laws
// ===========================================================================

add({
  slug: "8-by-the-numbers",
  name: "By the Numbers: 138 laws",
  group: GROUP,
  trigger: "New laws this week moved the count",
  data: "Congress.gov law list",
  caption: "138 bills have become law in the 119th Congress so far. The two newest, signed on Election Day, renew ALS research programs and the U.S. Commission on International Religious Freedom.",
  render() {
    const b = bill(newest.type.toLowerCase() + newest.number);
    return page({
      topH: 760,
      top: top(
        card({
          label: "By the numbers",
          aside: "119th Congress",
          w: 952,
          h: 712,
          inner: `<div class="big" style="font-size:330px;color:var(--pass);margin-top:10px">${LAW_COUNT}</div>
            <div class="mono" style="font-size:26px;margin-top:6px">BILLS SIGNED INTO LAW SINCE JAN. 2025</div>
            <div class="panel" style="margin-top:auto;display:flex;gap:18px;align-items:center">
              <img src="${policyIcon(b.area)}" style="width:60px;height:60px;flex:none">
              <div><div style="font-size:14px;color:var(--muted)">Most recent · ${fmtDate(newest.latestAction.actionDate)}</div><div style="font-size:18px;font-weight:600;margin-top:4px">Public Law ${newest.laws[0].number} · ${esc(newest.title)}</div></div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("By the numbers", ""),
        headline: hl(["k", `${LAW_COUNT} bills`], " have become ", ["pk", "law"], " in the 119th Congress so far."),
        text: `The two newest were signed on Election Day, ${longDate(SIGNED_ON)}: the ALS research bill and the religious freedom commission renewal.`,
      }),
    });
  },
});

// ===========================================================================
// 9. Term of the Week: Presented to the President
// ===========================================================================

add({
  slug: "9-term-of-the-week",
  name: "Term of the Week: Presented to the President",
  group: GROUP,
  trigger: "Explainer tied to this week's actions",
  data: "H.R. 1945 and H.R. 7730 actions",
  caption: "Term of the week: presented to the President. Passing both chambers isn't the last step. The bill has to be formally delivered to the President, which starts a 10-day clock, not counting Sundays, to sign or veto it. Two bills were presented on November 5.",
  render() {
    const item = (id, t) => {
      const b = bill(id);
      return `<div style="display:grid;grid-template-columns:22px 1fr auto;gap:14px;padding:14px 0;border-top:1px solid #e6e3dc;align-items:start">
        <i style="width:14px;height:14px;border-radius:50%;border:2.5px solid var(--blue);margin-top:5px"></i>
        <div><div style="font-size:19px;font-weight:700">${t}</div><div style="font-size:15.5px;color:var(--gray);margin-top:3px">${esc(prettyBill(b.type, b.number))} · passed the Senate ${longDate(path3(id).senate.actionDate)}</div></div>
        <span style="font-size:15.5px;color:var(--gray);white-space:nowrap">Sent ${fmtDate(b.latest.actionDate)}</span></div>`;
    };
    return page({
      top: top(
        card({
          label: "Term of the week",
          w: 952,
          inner: `<div class="big" style="font-size:96px;line-height:1.02">Presented to<br>the President</div>
            <div class="mono" style="font-size:22px;color:var(--muted);margin-top:18px">bill status · final step before signing</div>
            <div style="font-size:28px;line-height:1.4;margin-top:28px;max-width:860px">The bill is formally delivered to the White House. The President then has <b style="color:var(--blue)">10 days</b>, not counting Sundays, to sign or veto it.</div>
            <div style="margin-top:auto">
              <div class="sub" style="margin-bottom:4px">Presented ${longDate(SENT_ON)} · deadline ${longDate(deadline)}</div>
              ${item("hr1945", "Churchill museum landmark")}
              ${item("hr7730", "Bankruptcy debt limits")}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Term of the week", "Presented"),
        headline: hl("Passing Congress ", ["k", "isn't the last step"], ". A bill has to be ", ["k", "presented to the President"], "."),
        text: "Bills can wait weeks between passing and presentment. Both bills sent November 5 passed the Senate in late September. If the President doesn't act within 10 days while Congress is in session, the bill becomes law anyway.",
      }),
    });
  },
});
