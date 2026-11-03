// Six posts for the week of Oct 26 - Nov 1, 2026, leaning into the Nov 3
// midterms. Congress spent the week home campaigning, so these cover the
// last big votes before the recess and what's waiting when it returns.
//
//   SET=social/prototypes/sets/2026-11-02.mjs OUT=2026-11-02 node social/prototypes/build.mjs
//
// Needs bill-hr10326, bill-hr8800, bill-hr2481 (+ votes/sum), actions-hr2481,
// and member/pa files for V000133, V000129, D000230 in data/.

import fs from "node:fs";
import path from "node:path";
import {
  esc, page, hl, kicker, bottom, card, tabs, photo, dotGrid, policyColor,
  prettyBill, appBillId, fmtDate, longDate, OUTPUT_ROOT,
} from "../lib.mjs";
import { member, rollcall, rollcalls, bill } from "../data.mjs";
import { top, appVote, detailsCard } from "../templates.mjs";

const ELECTION = "November 3";
const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};

// Names as the members go by them, where the official record differs
const known = (m, display) => ({ ...m, display });

// The House's last recorded vote before the campaign recess
const lastVote = [...rollcalls].sort((a, b) => b.iso.localeCompare(a.iso) || b.roll - a.roll)[0];
check(lastVote.iso === "2026-09-16", `last House vote is ${lastVote.iso}`);

// Final votes on bills (not resolutions or procedural votes), closest first
const finalVotes = rollcalls
  .filter((r) => r.type && !["HRES", "SRES"].includes(r.type) && /Pass/.test(r.question))
  .sort((a, b) => Math.abs(a.yeaTotal - a.nayTotal) - Math.abs(b.yeaTotal - b.nayTotal));
const closestSix = finalVotes.slice(0, 6);
const firstIso = [...rollcalls].sort((a, b) => a.iso.localeCompare(b.iso))[0].iso;

const isYea = (v) => /Yea|Aye/.test(v);
const cast = (v) => /Yea|Aye|Nay|No/.test(v);
const partyMajority = (r, party) => {
  const votes = r.members.filter((x) => x.party === party && cast(x.vote));
  const yea = votes.filter((x) => isYea(x.vote)).length;
  return yea >= votes.length - yea ? "Yea" : "Nay";
};
const crossovers = (r) =>
  r.members.filter((x) => ["D", "R"].includes(x.party) && cast(x.vote) && (isYea(x.vote) ? "Yea" : "Nay") !== partyMajority(r, x.party));

export const templates = [];
const add = (t) => templates.push(t);

// ===========================================================================
// 1. Bill of the Day: ALS research bill, sent to the President on Oct 26
// ===========================================================================

add({
  slug: "1-bill-of-the-day",
  name: "Bill of the Day: ALS therapies reauthorization",
  group: "Week of Oct 26",
  trigger: "Biggest bill with an action this week: presented to the President",
  data: "H.R. 8205, its actions and cosponsors",
  caption: "Headed to the President's desk: a bill renewing federal research into treatments for ALS and other neurodegenerative diseases through 2031. It has 103 cosponsors, 64 Democrats and 39 Republicans, and passed the House and Senate by voice vote.",
  render() {
    const b = bill("hr8205");
    const m = member(b.sponsorId);
    const actions = JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", "actions-hr8205.json"), "utf8"));
    const act = (re) => actions.find((a) => re.test(a.text));
    const house = act(/^Passed\/agreed to in House/), senate = act(/^Passed\/agreed to in Senate/), sent = act(/^Presented to President/);
    check(sent?.actionDate === "2026-10-26" && b.latest.actionDate === "2026-10-26", "H.R. 8205 was presented to the President Oct 26 and nothing since");
    check(/voice vote/i.test(house.text) && /Voice Vote/i.test(senate.text), "both chambers passed it by voice vote");
    const cos = JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", "cosponsors-hr8205.json"), "utf8")).filter((c) => !c.sponsorshipWithdrawnDate);
    const byParty = (p) => cos.filter((c) => c.party === p).length;
    const D = byParty("D"), R = byParty("R");
    check(D + R === cos.length && cos.length === b.cosponsors, "cosponsors are all D or R and match the bill's count");
    const step = (label, how, iso, done = true) => `<div style="display:grid;grid-template-columns:22px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid #e6e3dc">
        <i style="width:14px;height:14px;border-radius:50%;margin-top:5px;${done ? "background:var(--pass)" : "border:2.5px solid var(--blue)"}"></i>
        <div><div style="font-size:17px;font-weight:700">${label}</div><div style="font-size:15px;color:var(--gray);margin-top:3px">${how}${iso ? " · " + fmtDate(iso) : ""}</div></div></div>`;
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 1, 0.5] }),
        card({
          label: "Cosponsors",
          inner: `
            <div class="big" style="font-size:118px;margin:4px 0 6px">${cos.length}</div>
            <div style="font-size:18px;color:var(--gray)">cosponsors from both parties</div>
            <div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin-top:24px"><i style="flex:${D};background:var(--dem)"></i><i style="flex:${R};background:var(--rep)"></i></div>
            <div class="legend" style="margin-top:12px"><span><i class="b-d"></i>${D} Democrats</span><span><i class="b-r"></i>${R} Republicans</span></div>
            <div class="sub" style="margin-top:30px">Path to the President</div>
            ${step("Passed the House", "Voice vote", house.actionDate)}
            ${step("Passed the Senate", "Voice vote", senate.actionDate)}
            ${step("Sent to the President", "Awaiting signature", sent.actionDate, false)}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Bill of the day", appBillId(b.type, b.number)),
        headline: hl(["n", `${m.title} ${m.display}'s`], " ", ["k", "ALS research bill"], " ", ["p", "passes Congress"], " and ", ["p", "heads to the President"], "."),
        text: `${prettyBill(b.type, b.number)} renews NIH and FDA programs that fund research and treatments for ALS and other neurodegenerative diseases through 2031. It went to the President on ${longDate(sent.actionDate)}.`,
      }),
    });
  },
});

// ===========================================================================
// 2. Signed Into Law: Romance Scam Prevention Act, signed during the recess
// ===========================================================================

add({
  slug: "2-signed-into-law",
  name: "Signed Into Law: Romance Scam Prevention Act",
  group: "Week of Oct 26",
  trigger: "Latest law signed during the campaign recess",
  data: "H.R. 2481, its actions",
  caption: "Signed into law while Congress was home campaigning: the Romance Scam Prevention Act. Dating apps and sites will have to warn you if someone who messaged you is banned for fraud. It passed the House by voice vote and the Senate by unanimous consent.",
  render() {
    const b = bill("hr2481");
    const m = member(b.sponsorId);
    const actions = JSON.parse(fs.readFileSync(path.join(OUTPUT_ROOT, "data", "actions-hr2481.json"), "utf8"));
    const when = (re) => actions.find((a) => re.test(a.text))?.actionDate;
    const house = when(/^Passed\/agreed to in House/), senate = when(/^Passed\/agreed to in Senate/);
    const signed = when(/^Became Public Law/);
    check(b.law === "119-129" && signed === "2026-10-20", "H.R. 2481 became law 119-129 on Oct 20");
    check(/voice vote/.test(actions.find((a) => /^Passed\/agreed to in House/.test(a.text)).text), "House passed it by voice vote");
    check(/Unanimous Consent/.test(actions.find((a) => /^Passed\/agreed to in Senate/.test(a.text)).text), "Senate passed it by unanimous consent");
    const step = (label, how, iso) => `<div style="display:grid;grid-template-columns:22px 1fr;gap:14px;padding:14px 0;border-bottom:1px solid #e6e3dc">
        <i style="width:14px;height:14px;border-radius:50%;background:var(--pass);margin-top:5px"></i>
        <div><div style="font-size:17px;font-weight:700">${label}</div><div style="font-size:15px;color:var(--gray);margin-top:3px">${how} · ${fmtDate(iso)}</div></div></div>`;
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 1, 1], last: "Signed Into Law" }),
        card({
          label: "Public Law",
          inner: `
            <div class="mono" style="font-size:20px;color:var(--muted)">PUBLIC LAW NO.</div>
            <div class="big" style="font-size:118px;color:var(--pass);margin:8px 0 6px">${esc(b.law)}</div>
            <div style="font-size:18px;color:var(--gray)">Signed ${esc(longDate(signed))}, 2026</div>
            <div class="sub" style="margin-top:30px">How it got here</div>
            ${step("Passed the House", "Voice vote", house)}
            ${step("Passed the Senate", "Unanimous consent", senate)}
            ${step("Signed by the President", "Public Law " + b.law, signed)}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Now law", prettyBill(b.type, b.number).replace(" ", "")),
        headline: hl("The ", ["k", "Romance Scam Prevention Act"], " is ", ["pk", "now law"], ", signed while Congress was ", ["k", "home campaigning"], "."),
        text: `${m.title} ${m.display}'s bill requires dating apps and sites to notify users who got messages from an account banned for fraud. It passed both chambers without a roll-call vote.`,
      }),
    });
  },
});

// ===========================================================================
// 3. Closest Vote: the NDAA, 216-212
// ===========================================================================

add({
  slug: "3-closest-vote",
  name: "Closest Vote: NDAA",
  group: "Week of Oct 26",
  trigger: "Closest final vote on a bill before the recess",
  data: "Roll call 278 by party",
  caption: "The closest final vote on a bill before the House left to campaign: the annual defense bill, 216–212. 15 members crossed party lines. The NDAA has been waiting in the Senate since September 14, so it's likely work for after the election.",
  render() {
    const r = rollcall(278);
    const b = bill("hr8800");
    check(finalVotes[0].roll === 278, "NDAA is the closest final vote");
    check(/Received in the Senate/.test(b.latest.text) && b.latest.actionDate === "2026-09-14", "NDAA's latest action is Senate receipt on Sep 14");
    const crossed = crossovers(r).length;
    const yeaDots = dotGrid([{ n: r.yea.d, fill: "var(--dem)" }, { n: r.yea.r, fill: "var(--rep)" }, { n: r.yea.i, fill: "var(--ind)" }], { cols: 18, size: 17, gap: 5 });
    const nayDots = dotGrid([{ n: r.nay.d, fill: "var(--dem)" }, { n: r.nay.r, fill: "var(--rep)" }, { n: r.nay.i, fill: "var(--ind)" }], { cols: 18, size: 17, gap: 5 });
    return page({
      top: top(
        card({
          label: "Closest vote",
          aside: `House · ${r.date}`,
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
              <div><div class="big" style="font-size:120px;color:var(--pass)">${r.yeaTotal}</div><div class="mono" style="font-size:20px;margin:10px 0 18px">YEA</div>${yeaDots}</div>
              <div><div class="big" style="font-size:120px;color:var(--gray)">${r.nayTotal}</div><div class="mono" style="font-size:20px;margin:10px 0 18px">NAY</div>${nayDots}</div>
            </div>
            <div class="legend" style="margin-top:auto"><span><i class="b-d"></i>Democrat</span><span><i class="b-r"></i>Republican</span><span><i class="b-i"></i>Independent</span><span style="margin-left:auto">${crossed} crossed party lines · ${r.nv.d + r.nv.r + r.nv.i} not voting</span></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Closest vote", appBillId(b.type, b.number)),
        headline: hl("The House passed ", ["k", "the annual defense bill"], " by ", ["p", `${r.yeaTotal - r.nayTotal} votes, ${r.yeaTotal}–${r.nayTotal}`], ". It's still ", ["k", "waiting in the Senate"], "."),
        text: `${prettyBill(b.type, b.number)}, the National Defense Authorization Act, sets policy and spending levels for the Pentagon. ${crossed} members crossed party lines. The Senate received it on ${longDate(b.latest.actionDate)}.`,
      }),
    });
  },
});

// ===========================================================================
// 4. Week in Congress: no votes, one day to the election
// ===========================================================================

add({
  slug: "4-week-in-congress",
  name: "Week in Congress: on the campaign trail",
  group: "Week of Oct 26",
  trigger: "Weekly recap, recess edition",
  data: "Congress.gov actions Oct 26 - Nov 1, last House roll call, P.L. 119-103",
  caption: "It's Election Day. Congress passed no bills last week, and the House hasn't voted since September 16. All 435 House seats and 35 Senate seats are on the ballot today. When Congress returns, government funding runs out December 11.",
  render() {
    const cr = bill("hr6500");
    check(cr.law === "119-103" && /December 11, 2026/.test(cr.summary), "stopgap funding runs through Dec 11");
    const stat = (n, label, color = "#111") => `<div class="panel" style="padding:22px 24px"><div class="big" style="font-size:76px;color:${color};white-space:nowrap">${n}</div><div style="font-size:16.5px;color:var(--gray);margin-top:10px;line-height:1.3">${label}</div></div>`;
    const row = (k, v) => `<div style="display:flex;justify-content:space-between;gap:14px;font-size:17px;padding:14px 0;border-bottom:1px solid #e6e3dc"><span style="color:var(--gray)">${k}</span><b>${v}</b></div>`;
    return page({
      top: top(
        card({
          label: "This week",
          aside: "Oct 26 – Nov 1",
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
              ${stat(0, "House votes")}${stat(0, "bills passed by either chamber")}${stat(0, "days until Election Day", "var(--blue)")}
            </div>
            <div class="sub" style="margin-top:28px">Where things stand</div>
            ${row("Last House vote", longDate(lastVote.iso))}
            ${row("On the ballot today", "All 435 House seats · 35 Senate seats")}
            ${row("Government funding runs out", "December 11 (P.L. 119-103)")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Week in Congress", "Oct 26 – Nov 1"),
        headline: hl("Congress passed ", ["k", "no bills"], " last week. Members were home ", ["k", "campaigning"], " for ", ["n", "today's election"], "."),
        text: `The House hasn't voted since ${longDate(lastVote.iso)}. When Congress returns, its first deadline is December 11, when the stopgap funding bill runs out.`,
      }),
    });
  },
});

// ===========================================================================
// 5. District Spotlight: NC-01, the member who crossed on every close vote
// ===========================================================================

add({
  slug: "5-district-spotlight",
  name: "District Spotlight: NC-01",
  group: "Week of Oct 26",
  trigger: "Election series: a seat on the ballot, with the member's record",
  data: "Member profile, positions on the six closest final votes",
  caption: "North Carolina's 1st District votes November 3. On all six of the House's closest final votes since July, Rep. Don Davis, a Democrat, voted with most Republicans, including on the defense bill and the PROOF Act. Look up your own district in the Unum app.",
  render() {
    const m = known(member("D000230"), "Don Davis");
    // Works either way: a Democrat voting with Republicans, or the reverse
    const PARTY = { D: { one: "Democrat", many: "Democrats", cls: "d" }, R: { one: "Republican", many: "Republicans", cls: "r" } };
    check(PARTY[m.party], "the member is a Democrat or Republican");
    const own = PARTY[m.party], other = PARTY[m.party === "D" ? "R" : "D"];
    const otherCode = m.party === "D" ? "R" : "D";
    const rows = closestSix.map((r) => {
      const v = r.members.find((x) => x.bioguide === m.bioguide)?.vote || "Not Voting";
      const pos = isYea(v) ? "Yea" : "Nay";
      return { r, pos, crossed: cast(v) && pos !== partyMajority(r, m.party) && pos === partyMajority(r, otherCode) };
    });
    check(rows.every((x) => x.crossed), `${m.display} voted with most ${other.many} against most ${own.many} on all six`);
    check(firstIso <= "2026-07-21", `vote data starts by July (${firstIso})`);
    const short = (r) => {
      const t = {
        HR8800: "Annual defense bill (NDAA)",
        HR10326: "PROOF Act",
        HR9770: "Stopgap government funding",
        HJRES1: "Supreme Court amendment (needed 2/3)",
        HJRES210: "Overturn California ship emissions rule",
        HJRES213: "Overturn California harbor craft rule",
      }[r.type + r.number];
      check(t, `a short title for ${r.type}${r.number}`);
      return t;
    };
    const tag = (p, text) => `<span style="font:600 14px Inter;padding:4px 12px;border-radius:999px;color:#fff;white-space:nowrap" class="b-${p.cls}">${text}</span>`;
    const word = (p, text) => `<b class="c-${p.cls}" style="font-weight:600">${text}</b>`;
    return page({
      top: top(
        card({
          label: "The district",
          inner: `<div class="mono" style="font-size:20px;color:var(--muted)">NORTH CAROLINA</div>
            <div class="big" style="font-size:96px;margin:4px 0 2px">1st</div>
            <div style="font-size:18px;color:var(--gray)">Congressional District</div>
            <div class="panel" style="margin-top:28px;display:flex;align-items:center;gap:18px">${photo(m, 76)}
              <div><div style="font-size:14px;color:var(--muted)">Incumbent</div><div style="font-size:20px;font-weight:700">${esc(m.title)} ${esc(m.display)}</div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:6px">${tag(own, own.one)}<span style="font-size:14.5px;color:var(--gray)">since ${m.since}</span></div></div></div>
            <div class="panel" style="margin-top:20px;padding:18px 20px">
              <div class="big c-${other.cls}" style="font-size:56px">6 of 6</div>
              <div style="font-size:16px;color:var(--gray);margin-top:6px">closest votes sided with ${word(other, other.many)}, not ${word(own, own.many)}</div></div>
            <div class="sub" style="margin-top:22px">Committees</div>${m.committees.map((c) => `<div style="font-size:15.5px;color:var(--gray)">${esc(c.replace("House Committee on ", ""))}</div>`).join("")}`,
        }),
        card({
          label: "Crossed party lines",
          inner: rows
            .map(({ r, pos }) => `<div style="padding:11px 0;border-bottom:1px solid #e6e3dc">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:15.5px">${esc(short(r))}</b>${tag(other, "With " + other.many)}</div>
                <div style="font-size:13.5px;color:var(--gray);margin-top:5px">${esc(m.last)}: <b style="color:#111">${pos}</b> · most ${word(own, own.many)}: ${partyMajority(r, m.party)} · ${esc(r.result)} ${r.yeaTotal}–${r.nayTotal}</div></div>`)
            .join("") + `<div style="font-size:13px;color:var(--muted);margin-top:auto">The six closest final votes on bills and joint resolutions since July, by margin.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("District spotlight", "NC-01"),
        headline: hl(["k", "North Carolina's 1st District"], ` votes ${ELECTION}. `, ["n", `${m.title} ${m.display}`], ", a ", ["p" + own.cls, own.one], ", voted with ", ["p" + other.cls, other.many], " on ", ["k", "all six"], " of the House's closest votes."),
        text: `Each time, most ${own.many} voted the other way. The six include the defense bill and the PROOF Act.`,
      }),
    });
  },
});

// ===========================================================================
// 6. Term of the Week: Lame duck
// ===========================================================================

add({
  slug: "6-term-of-the-week",
  name: "Term of the Week: Lame duck",
  group: "Week of Oct 26",
  trigger: "Explainer tied to the election",
  data: "P.L. 119-103 deadline, H.R. 8800 status",
  caption: "Term of the week: lame duck. After Tuesday's election, the current Congress comes back for one more stretch, and members who lost or retired still vote until the new Congress starts January 3. This year's to-do list includes government funding, which runs out December 11.",
  render() {
    const ndaa = bill("hr8800");
    check(/Received in the Senate/.test(ndaa.latest.text), "NDAA still waiting in the Senate");
    const item = (t, d) => `<div style="display:grid;grid-template-columns:22px 1fr;gap:14px;padding:14px 0;border-top:1px solid #e6e3dc">
        <i style="width:14px;height:14px;border-radius:4px;border:2.5px solid var(--blue);margin-top:5px"></i>
        <div><div style="font-size:19px;font-weight:700">${t}</div><div style="font-size:15.5px;color:var(--gray);margin-top:3px">${d}</div></div></div>`;
    return page({
      top: top(
        card({
          label: "Term of the week",
          w: 952,
          inner: `<div class="big" style="font-size:150px">Lame duck</div>
            <div class="mono" style="font-size:22px;color:var(--muted);margin-top:16px">/lām dək/ · noun</div>
            <div style="font-size:30px;line-height:1.4;margin-top:30px;max-width:840px">The session after an election and before the new Congress takes office on <b style="color:var(--blue)">January 3</b>. Members who lost or retired still vote.</div>
            <div style="margin-top:auto">
              <div class="sub" style="margin-bottom:4px">Waiting for this year's lame duck</div>
              ${item("Government funding", "The stopgap law (P.L. 119-103) runs out December 11")}
              ${item("Annual defense bill (NDAA)", `Passed the House 216–212; in the Senate since ${longDate(ndaa.latest.actionDate)}`)}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Term of the week", "Lame duck"),
        headline: hl("After Tuesday, Congress enters its ", ["k", "lame-duck session"], ", when ", ["k", "outgoing members"], " still cast votes."),
        text: "The new Congress begins January 3, 2027. Until then, the current members have to finish this year's work, starting with government funding, which runs out December 11.",
      }),
    });
  },
});
