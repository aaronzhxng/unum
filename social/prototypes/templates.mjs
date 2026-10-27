// Post templates. Each takes the loaded data and returns one or more slides.
// Facts come from data/ (live API snapshots); anything not backed by data is
// marked `sample: true` and gets a SAMPLE DATA tag on the image.

import {
  esc, page, hl, kicker, bottom, card, billHead, tabs, stages, status, jargon, fields,
  voteCard, profileCard, photo, partyClass, hemicycle, dotGrid, policyIcon, policyColor,
  prettyBill, appBillId, fmtDate, longDate,
} from "./lib.mjs";
import { member, members, rollcall, rollcalls, bill, billVotes, laws } from "./data.mjs";

const TODAY = "2026-10-25";
const ELECTION = "2026-11-03";

const top = (...cards) => `<div class="top">${cards.join("")}</div>`;
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const STD_STAGES = (type, fills, last = "To President") => {
  const senateFirst = type.startsWith("S");
  const one = senateFirst ? "Senate" : "House", two = senateFirst ? "House" : "Senate";
  return [
    { label: "Introduced", fill: fills[0] },
    { label: fills[1] === 1 ? `Passed ${one}` : `In ${one}`, fill: fills[1] },
    { label: fills[2] === 1 ? `Passed ${two}` : `In ${two}`, fill: fills[2] },
    { label: last, fill: fills[3] },
  ];
};
const appVote = (r, { jargonHtml = "" } = {}) =>
  voteCard(
    {
      chamber: "House",
      date: r.date,
      result: `${r.question} ${r.result} (${r.yeaTotal}-${r.nayTotal}${r.twoThirds ? ", 2/3 required" : ""})`,
      passed: r.passed,
      yea: r.yea, nay: r.nay, nv: r.nv,
    },
    { jargonHtml },
  );
const detailsCard = (b, { fills, last, statusText, jargonHtml = "", rows }) =>
  card({
    label: "Details",
    inner: `${billHead({ area: b.area, date: fmtDate(b.latest.actionDate), id: appBillId(b.type, b.number), title: b.title })}
      ${tabs(["Details", "Voting", "Actions", "Cosponsors"])}
      ${stages(STD_STAGES(b.type, fills, last))}
      ${status(statusText ?? b.latest.text)}
      ${jargonHtml}
      ${fields(rows ?? [["Latest Action", fmtDate(b.latest.actionDate)], ["Introduced", fmtDate(b.introduced)], ["Policy Area", b.area || "Not yet assigned"]])}`,
  });

export const templates = [];
const add = (t) => templates.push(t);

// ===========================================================================
// BILLS
// ===========================================================================

add({
  slug: "bill-of-the-day",
  name: "Bill of the Day: new bill + sponsor",
  group: "Bills",
  trigger: "Daily, from backend/src/featuredBills.json",
  data: "Bill, actions, sponsor profile and policy areas",
  render() {
    const b = bill("hr10841");
    const m = member(b.sponsorId);
    return page({
      top: top(
        detailsCard(b, { fills: [1, 0.5, 0, 0], rows: [["Latest Action", fmtDate(b.latest.actionDate)], ["Introduced", fmtDate(b.introduced)], ["Type", "House Bill"]] }),
        card({
          label: "Profile",
          inner: `<div class="profile">
            <div class="who">${m.party} · ${esc(m.roleLine)}</div>
            <div class="id">${photo(m, 76)}<div><b>${esc(m.display)}</b><div class="links"><span>Website</span><span>Contact</span></div></div></div>
            ${tabs(["Profile", "Bio", "Sponsor", "Cosponsor"])}
            <div class="panel" style="margin:0 6px">
              <div class="sub">Top Policy Areas (2025 - )</div>
              <div class="palist">${m.areas.map((a) => `<div><i style="background:${policyColor(a.name)}"></i><span>${esc(a.name)}</span><span>${a.count} bills</span></div>`).join("")}</div>
            </div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Bill of the day", appBillId(b.type, b.number)),
        headline: hl(["n", `${m.title} ${m.display}`], " introduces the ", ["k", b.title], "."),
        text: `${prettyBill(b.type, b.number)} would prohibit using artificial intelligence to deprive or defraud people of their right to vote in elections for public office. It was referred to the House Energy and Commerce Committee on ${longDate(b.latest.actionDate)}.`,
      }),
    });
  },
});

add({
  slug: "bill-of-the-day-vote",
  name: "Bill of the Day: passed a chamber",
  group: "Bills",
  trigger: "A featured bill gets a recorded passage vote",
  data: "Bill, actions, roll-call vote by party",
  render() {
    const b = bill("hr9576");
    const r = rollcall(309);
    const m = member(b.sponsorId);
    return page({
      top: top(
        detailsCard(b, { fills: [1, 1, 0.5, 0], statusText: "Placed on Senate Legislative Calendar under General Orders." }),
        card({ label: "Voting", pad: "22px 22px 24px", inner: appVote(r) }),
      ),
      bottom: bottom({
        kicker: kicker("Bill of the day", appBillId(b.type, b.number)),
        headline: hl(["n", `${m.title} ${m.display}'s`], " ", ["k", "National Fraud Enforcement Division Act"], " ", ["p", `passes the House ${r.yeaTotal}–${r.nayTotal}`], " and ", ["p", "heads to the Senate"], "."),
        text: `${prettyBill(b.type, b.number)} would write into law the Justice Department's National Fraud Enforcement Division, created in April 2026, which investigates and prosecutes fraud against taxpayer-funded programs.`,
      }),
    });
  },
});

add({
  slug: "signed-into-law",
  name: "Signed Into Law",
  group: "Bills",
  trigger: "Latest action becomes \"Became Public Law\"",
  data: "Bill, law number, House votes",
  render() {
    const b = bill("hr6500");
    const votes = billVotes("hr6500").sort((a, b) => new Date(a.date) - new Date(b.date));
    const signed = b.latest.actionDate;
    return page({
      top: top(
        detailsCard(b, {
          fills: [1, 1, 1, 1],
          last: "Signed Into Law",
          rows: [["Became Law", fmtDate(signed)], ["Introduced", fmtDate(b.introduced)], ["Policy Area", b.area]],
        }),
        card({
          label: "Public Law",
          inner: `
            <div class="mono" style="font-size:20px;color:var(--muted)">PUBLIC LAW NO.</div>
            <div class="big" style="font-size:118px;color:var(--pass);margin:8px 0 6px">${esc(b.law)}</div>
            <div style="font-size:18px;color:var(--gray)">Signed ${esc(longDate(signed))}, 2026</div>
            <div class="panel" style="margin-top:30px">
              <div class="sub">Funds the government through</div>
              <div class="big" style="font-size:44px;font-weight:700;margin-top:6px">December 11, 2026</div>
            </div>
            <div class="sub" style="margin-top:28px">House votes</div>
            ${votes
              .map((v) => `<div style="display:flex;justify-content:space-between;font-size:15.5px;padding:10px 0;border-bottom:1px solid #e6e3dc">
                <span>${/Concur/.test(v.question) ? "Agreed to Senate changes" : "Passed the House"} · ${v.date}</span>
                <b style="color:var(--pass)">${v.yea}–${v.nay}</b></div>`)
              .join("")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Now law", prettyBill(b.type, b.number).replace(" ", "")),
        headline: hl(["k", "A stopgap funding bill"], " is ", ["pk", "now law"], ", keeping federal agencies funded through ", ["k", "December 11"], "."),
        text: `${prettyBill(b.type, b.number)}, the ${b.title}, became Public Law ${b.law} on ${longDate(signed)}. It funds federal agencies through December 11, 2026, and extends several expiring programs.`,
      }),
    });
  },
});

add({
  slug: "new-laws-roundup",
  name: "New Laws roundup",
  group: "Bills",
  trigger: "Weekly, or whenever several laws are signed on one day",
  data: "Congress.gov law list, bill policy areas",
  render() {
    const day = "2026-10-20";
    const list = laws.filter((l) => l.latestAction?.actionDate === day);
    const rows = list.map((l) => {
      const b = bill(l.type.toLowerCase() + l.number);
      return `<div class="list-row"><div class="ic"><img src="${policyIcon(b.area)}"></div>
        <div><div class="t">${esc(b.title.length > 64 ? b.title.slice(0, 62) + "…" : b.title)}</div>
        <div class="m"><span style="color:${policyColor(b.area)};font-weight:600">${esc(prettyBill(b.type, b.number))}</span> · Public Law ${esc(b.law)}</div></div></div>`;
    });
    const lands = list.filter((l) => /Public Lands|Native Americans/.test(bill(l.type.toLowerCase() + l.number).area)).length;
    return page({
      top: top(
        card({
          label: "New laws",
          aside: fmtDate(day),
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:36px;margin:auto 0">${rows.join("")}</div>`,
          pad: "14px 34px",
        }),
      ),
      bottom: bottom({
        kicker: kicker("Signed into law", longDate(day)),
        headline: hl(["k", `${list.length} bills`], " became ", ["pk", "law"], ` on ${longDate(day)}.`),
        text: `They include the Romance Scam Prevention Act, the Clergy Act, and the Enhancing Detection of Human Trafficking Act. ${lands === 5 ? "Five" : lands} of the ${list.length} deal with public or tribal lands.`,
      }),
    });
  },
});

add({
  slug: "party-split",
  name: "Vote breakdown by party",
  group: "Votes",
  trigger: "Any notable recorded vote",
  data: "Roll-call vote by party",
  render() {
    const r = rollcall(311);
    const col = (name, cls, o) => {
      const voted = o.yea + o.nay;
      const max = 220;
      return `<div style="flex:1;text-align:center">
        <div style="height:400px;display:flex;align-items:flex-end;justify-content:center;gap:18px">
          <div><div class="mono" style="font-size:20px;margin-bottom:8px">${o.yea}</div><div class="b-${cls}" style="width:84px;height:${(o.yea / max) * 340}px;border-radius:10px 10px 0 0"></div></div>
          <div><div class="mono" style="font-size:20px;margin-bottom:8px">${o.nay}</div><div class="b-${cls}" style="width:84px;height:${Math.max(2, (o.nay / max) * 340)}px;border-radius:10px 10px 0 0;opacity:.35"></div></div>
        </div>
        <div style="display:flex;justify-content:center;gap:18px;border-top:2px solid #333;padding-top:10px">
          <span class="mono" style="width:84px;font-size:17px">YEA</span><span class="mono" style="width:84px;font-size:17px">NAY</span></div>
        <div style="font-size:22px;font-weight:700;margin-top:18px">${name}</div>
        <div style="font-size:15px;color:var(--muted);margin-top:4px">${voted} voting</div>
      </div>`;
    };
    return page({
      top: top(
        card({
          label: "Vote",
          aside: `House · ${r.date}`,
          w: 952,
          inner: `<div style="font-size:17px;font-weight:600;color:var(--pass);margin-bottom:6px">${esc(r.question)} ${esc(r.result)} (${r.yeaTotal}-${r.nayTotal})</div>
            <div style="font-size:15px;color:var(--gray);line-height:1.4;max-width:820px">${esc(r.desc.slice(0, 170))}…</div>
            <div style="display:flex;margin-top:auto">${col("Democrats", "d", { yea: r.yea.d, nay: r.nay.d })}${col("Republicans", "r", { yea: r.yea.r, nay: r.nay.r })}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("The vote", prettyBill(r.type, r.number).replace(/\s/g, "")),
        headline: hl("The House votes ", ["p", `${r.yeaTotal}–${r.nayTotal}`], " to ", ["k", "overturn EPA's approval of California's harbor-craft emission rules"], "."),
        text: "H.J.Res. 213 would revoke EPA's partial authorization of California's Commercial Harbor Craft regulation, which sets new emission standards for vessels such as commercial fishing boats.",
      }),
    });
  },
});

add({
  slug: "closest-vote",
  name: "Closest Vote",
  group: "Votes",
  trigger: "Weekly: smallest margin among the week's recorded votes",
  data: "Roll-call vote by party",
  render() {
    const r = rollcall(281);
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
            <div class="legend" style="margin-top:auto"><span><i class="b-d"></i>Democrat</span><span><i class="b-r"></i>Republican</span><span><i class="b-i"></i>Independent</span><span style="margin-left:auto">${r.nv.d + r.nv.r + r.nv.i} not voting</span></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Closest vote", "H.CON.RES.113"),
        headline: hl("The House adopts ", ["k", "its 2027 budget resolution"], " by ", ["p", `${r.yeaTotal - r.nayTotal} votes, ${r.yeaTotal}–${r.nayTotal}`], "."),
        text: "H.Con.Res. 113 sets the congressional budget for fiscal year 2027 and spending targets through 2036. It includes reconciliation instructions for future legislation.",
      }),
    });
  },
});

add({
  slug: "two-thirds",
  name: "Majority, but not enough",
  group: "Votes",
  trigger: "A two-thirds vote that fails despite a majority",
  data: "Roll-call vote, vote type",
  render() {
    const r = rollcall(293);
    const voting = r.yeaTotal + r.nayTotal;
    const needed = Math.ceil((voting * 2) / 3);
    const at = (n) => `${(n / voting) * 100}%`;
    return page({
      top: top(
        card({
          label: "Two-thirds rule",
          aside: `House · ${r.date}`,
          w: 952,
          inner: `
            <div style="display:flex;gap:60px;align-items:flex-end">
              <div><div class="mono" style="font-size:20px;color:var(--muted)">VOTED YES</div><div class="big" style="font-size:128px;color:var(--fail)">${r.yeaTotal}</div></div>
              <div><div class="mono" style="font-size:20px;color:var(--muted)">NEEDED</div><div class="big" style="font-size:128px">${needed}</div></div>
            </div>
            <div style="position:relative;margin-top:60px">
              <div style="height:64px;border-radius:12px;background:var(--track);overflow:hidden;display:flex">
                <i class="b-d" style="width:${at(r.yea.d)}"></i><i class="b-r" style="width:${at(r.yea.r)}"></i><i class="b-i" style="width:${at(r.yea.i)}"></i>
              </div>
              <div style="position:absolute;left:${at(needed)};top:-22px;bottom:-22px;border-left:3px dashed #111"></div>
              <div class="mono" style="position:absolute;left:${at(needed)};top:-56px;transform:translateX(-50%);font-size:18px;white-space:nowrap">2/3 = ${needed}</div>
              <div class="mono" style="position:absolute;left:50%;top:-56px;transform:translateX(-50%);font-size:18px;color:var(--muted)">1/2</div>
              <div style="position:absolute;left:50%;top:-22px;bottom:-22px;border-left:2px dotted #999"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:17px;margin-top:34px;color:var(--gray)">
              <span>${r.yeaTotal} yea · ${r.nayTotal} nay · ${voting} voting</span><span style="color:var(--fail);font-weight:600">${esc(r.result)}</span></div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:34px">
              <div class="panel"><div style="font-size:15px;color:var(--muted)">Democrats</div><div style="font-size:21px;font-weight:600;margin-top:4px"><span class="c-d">${r.yea.d} yea</span> · ${r.nay.d} nay</div></div>
              <div class="panel"><div style="font-size:15px;color:var(--muted)">Republicans</div><div style="font-size:21px;font-weight:600;margin-top:4px"><span class="c-r">${r.yea.r} yea</span> · ${r.nay.r} nay</div></div></div>
            <div class="panel" style="margin-top:auto;background:var(--pill);box-shadow:none"><div style="font-size:16px;line-height:1.45;color:var(--gray)"><b style="color:#111">Proposing an amendment:</b> two-thirds of both chambers, then ratification by three-fourths of the states (38).</div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("The vote", "HJRES.1"),
        headline: hl("An amendment to ", ["k", "fix the Supreme Court at nine justices"], " ", ["fk", "fails"], " in the House, ", ["f", `${r.yeaTotal}–${r.nayTotal}`], "."),
        text: `H.J.Res. 1 won a majority, but amending the Constitution takes two-thirds of those voting: ${needed} of ${voting} here.`,
      }),
    });
  },
});

add({
  slug: "unanimous",
  name: "Unanimous Vote",
  group: "Votes",
  trigger: "A recorded vote with zero (or near-zero) nays",
  data: "Roll-call vote by party",
  render() {
    const r = rollcall(303);
    const b = bill("hr4646");
    const tot = r.yeaTotal;
    return page({
      top: top(
        card({
          label: "Voting",
          aside: `House · ${r.date}`,
          w: 952,
          inner: `<div style="display:flex;align-items:center;justify-content:space-between">
              <div class="big" style="font-size:210px;color:var(--pass)">${r.yeaTotal}–${r.nayTotal}</div>
              <div style="text-align:right"><div class="mono" style="font-size:20px;color:var(--muted)">NOT VOTING</div><div class="big" style="font-size:80px;color:var(--gray)">${r.nv.d + r.nv.r + r.nv.i}</div></div>
            </div>
            <div class="mono" style="font-size:20px;margin-top:auto;margin-bottom:12px">EVERY MEMBER WHO VOTED SAID YES</div>
            <div style="height:56px;border-radius:12px;overflow:hidden;display:flex">
              <i class="b-d" style="width:${(r.yea.d / tot) * 100}%"></i><i class="b-r" style="width:${(r.yea.r / tot) * 100}%"></i><i class="b-i" style="width:${(r.yea.i / tot) * 100}%"></i></div>
            <div class="cnt" style="display:flex;gap:28px;font-size:17px;margin-top:12px"><span class="c-d">D: ${r.yea.d}</span><span class="c-r">R: ${r.yea.r}</span><span class="c-i">I: ${r.yea.i}</span></div>
            <div style="display:flex;gap:16px;align-items:center;margin-top:auto">
              <img src="${policyIcon(b.area)}" style="width:64px;height:64px">
              <div><div style="font-size:19px;font-weight:600">${esc(appBillId(b.type, b.number))} - ${esc(b.title)}</div><div style="font-size:15px;color:var(--muted);margin-top:4px">${esc(b.area)}</div></div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Unanimous", "HR.4646"),
        headline: hl("The House passes the ", ["k", "Whistleblower Protection Act"], " ", ["pk", `${r.yeaTotal}–${r.nayTotal}`], "."),
        text: "H.R. 4646 extends whistleblower protections to employees on all HUD-funded contracts and grants, regardless of when they were signed. Not one member voted no.",
      }),
    });
  },
});

add({
  slug: "both-parties",
  name: "Bipartisan Vote",
  group: "Votes",
  trigger: "A vote where a majority of each party voted the same way",
  data: "Roll-call vote by party",
  render() {
    const r = rollcall(304);
    const ring = (name, cls, yea, nay) => {
      const p = yea / (yea + nay);
      const C = 2 * Math.PI * 120;
      return `<div style="text-align:center;flex:1">
        <svg width="300" height="300" viewBox="0 0 300 300"><circle cx="150" cy="150" r="120" fill="none" stroke="var(--track)" stroke-width="34"/>
        <circle cx="150" cy="150" r="120" fill="none" stroke="var(--${cls === "d" ? "dem" : "rep"})" stroke-width="34" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 150 150)"/>
        <text x="150" y="168" text-anchor="middle" font-family="Inter" font-weight="600" font-size="64">${Math.round(p * 100)}%</text></svg>
        <div style="font-size:22px;font-weight:700;margin-top:10px">${name}</div>
        <div style="font-size:16px;color:var(--gray);margin-top:6px">${yea} of ${yea + nay} voted yes</div></div>`;
    };
    return page({
      top: top(
        card({
          label: "Both parties",
          aside: `House · ${r.date}`,
          w: 952,
          inner: `<div style="font-size:17px;font-weight:600;color:var(--pass)">${esc(r.question)} ${esc(r.result)} (${r.yeaTotal}-${r.nayTotal}, 2/3 required)</div>
            <div style="display:flex;margin-top:auto;margin-bottom:auto">${ring("Democrats", "d", r.yea.d, r.nay.d)}${ring("Republicans", "r", r.yea.r, r.nay.r)}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Bipartisan", "HR.2140"),
        headline: hl("Majorities of both parties pass the ", ["k", "Diesel Emissions Reduction Act"], ", ", ["p", `${r.yeaTotal}–${r.nayTotal}`], "."),
        text: `H.R. 2140 reauthorizes through 2029 an EPA program of grants, rebates, and loans for replacing or retrofitting diesel engines. ${r.yea.d} of ${r.yea.d + r.nay.d} voting Democrats and ${r.yea.r} of ${r.yea.r + r.nay.r} voting Republicans voted yes.`,
      }),
    });
  },
});

add({
  slug: "crossover-votes",
  name: "Crossover Votes",
  group: "Votes",
  trigger: "A notable vote where members split from most of their party",
  data: "Roll-call member positions, member photos",
  render() {
    const r = rollcall(278);
    const yeaSide = r.yea.r > r.yea.d ? "R" : "D";
    const cross = r.members.filter((m) => (m.party === "D" || m.party === "R") && ["Yea", "Nay"].includes(m.vote) && (m.vote === "Yea") !== (m.party === yeaSide));
    const tile = (x) => {
      const m = members.get(x.bioguide);
      return `<div style="display:flex;align-items:center;gap:14px;padding:9px 0">
        ${photo(m, 56)}<div><div style="font-size:16.5px;font-weight:600">${esc(m.title)} ${esc(m.display)}</div>
        <div style="font-size:14px;color:var(--muted);margin-top:2px">${esc(m.tag)} · voted <b style="color:var(${x.vote === "Yea" ? "--pass" : "--fail"})">${x.vote}</b></div></div></div>`;
    };
    const d = cross.filter((x) => x.party === "D"), rr = cross.filter((x) => x.party === "R");
    return page({
      top: top(
        card({
          label: "Crossover votes",
          aside: `House · ${r.date}`,
          w: 952,
          pad: "22px 34px",
          inner: `<div style="font-size:16px;font-weight:600;color:var(--pass);margin-bottom:12px">On Passage Passed (${r.yeaTotal}-${r.nayTotal}) · H.R. 8800, National Defense Authorization Act for FY2027</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:30px">
              <div><div class="sub c-d">Democrats voting Yea (${d.length})</div>${d.map(tile).join("")}</div>
              <div><div class="sub c-r">Republicans voting Nay (${rr.length})</div>${rr.map(tile).join("")}</div>
            </div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Crossover votes", "HR.8800"),
        headline: hl(["k", `${cross.length} members`], " voted differently from most of their party on ", ["k", "the NDAA"], ", which ", ["p", `passed ${r.yeaTotal}–${r.nayTotal}`], "."),
        text: `${d.length} Democrats joined most Republicans in voting for the fiscal 2027 defense policy bill, and ${rr.length} Republicans joined most Democrats in voting against it.`,
      }),
    });
  },
});

add({
  slug: "next-stop",
  name: "Next Stop (where a bill goes next)",
  group: "Bills",
  trigger: "A bill passes one chamber",
  data: "Bill status, passage vote",
  render() {
    const b = bill("hr9497");
    const r = rollcall(313);
    const step = (label, sub, state) => {
      const col = state === "done" ? "var(--blue)" : state === "now" ? "#111" : "var(--muted)";
      const dot = state === "done"
        ? `<div style="width:62px;height:62px;border-radius:50%;background:var(--blue);display:grid;place-items:center;color:#fff;font-size:32px;font-weight:700">✓</div>`
        : state === "now"
          ? `<div style="width:62px;height:62px;border-radius:50%;border:5px solid var(--blue);background:#fff;display:grid;place-items:center"><div style="width:22px;height:22px;border-radius:50%;background:var(--blue)"></div></div>`
          : `<div style="width:62px;height:62px;border-radius:50%;border:3px solid #cfcfcf;background:#fff"></div>`;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:1">${dot}
        <div style="font-size:21px;font-weight:700;margin-top:16px;color:${col}">${label}</div>
        <div style="font-size:15.5px;color:var(--gray);margin-top:6px;line-height:1.35">${sub}</div></div>`;
    };
    return page({
      top: top(
        card({
          label: "Where it stands",
          aside: fmtDate(b.latest.actionDate),
          w: 952,
          inner: `${billHead({ area: b.area, date: fmtDate(b.latest.actionDate), id: appBillId(b.type, b.number), title: b.title })}
            <div style="position:relative;display:flex;margin-top:90px">
              <div style="position:absolute;left:12.5%;right:12.5%;top:29px;height:6px;background:#e0e0e0;border-radius:3px"><div style="width:50%;height:100%;background:var(--blue);border-radius:3px"></div></div>
              ${step("Introduced", fmtDate(b.introduced), "done")}
              ${step("House", `Passed ${r.yeaTotal}–${r.nayTotal}<br>${r.date}`, "done")}
              ${step("Senate", "Up next", "now")}
              ${step("President", "", "todo")}
            </div>
            <div class="panel" style="margin-top:auto"><div style="font-size:16px;color:var(--gray);line-height:1.45"><b style="color:#111">Next:</b> the Senate can pass it as is, change it and send it back, or let it sit. It needs to pass both chambers in identical form before the President can sign it.</div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Next stop", "HR.9497"),
        headline: hl("The ", ["k", "Water Resources Development Act of 2026"], " ", ["p", `passes the House ${r.yeaTotal}–${r.nayTotal}`], " and ", ["p", "heads to the Senate"], "."),
        text: "H.R. 9497 authorizes and changes Army Corps of Engineers projects, from port and harbor maintenance to flood protection and ecosystem restoration.",
      }),
    });
  },
});

add({
  slug: "bill-tracker",
  name: "Bill Tracker (follow-ups)",
  group: "Bills",
  trigger: "Weekly: every bill posted before whose stage changed",
  data: "Bill status and stage logic for previously posted bills",
  render() {
    const rows = [
      { id: "hr6500", fills: [1, 1, 1, 1], last: "Signed Into Law", note: "Public Law 119-103" },
      { id: "hr9497", fills: [1, 1, 0.5, 0], note: "Passed the House 415–9" },
      { id: "hr9576", fills: [1, 1, 0.5, 0], note: "On the Senate calendar" },
      { id: "hjres1", custom: [{ label: "Introduced", fill: 1 }, { label: "Failed in House", fill: 1, veto: true }, { label: "In Senate", fill: 0 }, { label: "To States", fill: 0 }], note: "Failed 212–206 (2/3 needed)" },
      { id: "hr10841", fills: [1, 0.5, 0, 0], note: "In committee" },
    ].map((x) => {
      const b = bill(x.id);
      return `<div style="padding:16px 0;border-bottom:1px solid #e6e3dc">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span class="badge" style="background:${policyColor(b.area)}">${esc(prettyBill(b.type, b.number))}</span>
          <span style="font-size:16.5px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b.title)}</span>
          <span style="font-size:14px;color:var(--muted);white-space:nowrap">${esc(x.note)}</span></div>
        ${stages(x.custom || STD_STAGES(b.type, x.fills, x.last), 1.25)}</div>`;
    });
    return page({
      top: top(card({ label: "Bill tracker", aside: "Updated " + fmtDate(TODAY), w: 952, pad: "6px 34px", inner: rows.join("") })),
      bottom: bottom({
        kicker: kicker("Bill tracker", ""),
        headline: hl("Where ", ["k", "five bills we've covered"], " stand now."),
        text: "One became law, two passed the House and wait on the Senate, one failed, and one is still in committee.",
      }),
    });
  },
});

// ===========================================================================
// WEEKLY AND NUMBERS
// ===========================================================================

add({
  slug: "week-in-congress",
  name: "Week in Congress",
  group: "Weekly",
  trigger: "Weekly (skipped or replaced by an explainer during recess)",
  data: "All recorded votes in the week, bill titles",
  render() {
    const from = "2026-09-14", to = "2026-09-18";
    const wk = rollcalls.filter((r) => r.iso >= from && r.iso <= to);
    const passed = wk.filter((r) => r.passed && /Pass|Concur/.test(r.question) && !["HRES", "SRES"].includes(r.type));
    const closest = [...passed].sort((a, b) => Math.abs(a.yeaTotal - a.nayTotal) - Math.abs(b.yeaTotal - b.nayTotal))[0];
    const suspended = passed.filter((r) => /Suspend/.test(r.question)).length;
    const unanimous = wk.filter((r) => r.nayTotal === 0).length;
    const stat = (n, label, color = "#111") => `<div class="panel" style="padding:22px 24px"><div class="big" style="font-size:${String(n).length > 4 ? 56 : 76}px;color:${color};white-space:nowrap">${n}</div><div style="font-size:16.5px;color:var(--gray);margin-top:10px;line-height:1.3">${label}</div></div>`;
    const top3 = passed.slice(0, 4).map((r) => `<div style="display:flex;justify-content:space-between;gap:14px;font-size:16px;padding:12px 0;border-bottom:1px solid #e6e3dc">
        <span><b>${esc(prettyBill(r.type, r.number))}</b> ${esc(r.desc.length > 52 ? r.desc.slice(0, 50) + "…" : r.desc)}</span><b style="color:var(--pass);white-space:nowrap">${r.yeaTotal}–${r.nayTotal}</b></div>`);
    return page({
      top: top(
        card({
          label: "This week",
          aside: "House · Sep 14–16",
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
              ${stat(wk.length, "recorded votes")}${stat(passed.length, "bills passed", "var(--pass)")}${stat(`${closest.yeaTotal}–${closest.nayTotal}`, "closest passage")}
            </div>
            <div class="sub" style="margin-top:28px">Passed this week</div>${top3.join("")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Week in Congress", "Sep 14–16"),
        headline: hl("The House held ", ["k", `${wk.length} votes`], " and ", ["p", `passed ${passed.length} bills`], ` this week, ${unanimous ? "including one " : ""}`, ...(unanimous ? [["k", "without a single no"]] : []), "."),
        text: `${suspended} of the ${passed.length} passed under suspension of the rules, which takes two-thirds. The closest was ${closest.yeaTotal}–${closest.nayTotal}, on ${prettyBill(closest.type, closest.number)}.`,
      }),
    });
  },
});

add({
  slug: "by-the-numbers",
  name: "By the Numbers",
  group: "Weekly",
  trigger: "Every two weeks, or on a milestone (100th law, etc.)",
  data: "Congress.gov law list",
  render() {
    const latest = laws[0];
    const n = Number(latest.laws[0].number.split("-")[1]);
    return page({
      topH: 760,
      top: top(
        card({
          label: "By the numbers",
          aside: "119th Congress",
          w: 952,
          h: 712,
          inner: `<div class="big" style="font-size:330px;color:var(--pass);margin-top:10px">${n}</div>
            <div class="mono" style="font-size:26px;margin-top:6px">BILLS SIGNED INTO LAW SINCE JAN. 2025</div>
            <div class="panel" style="margin-top:auto;display:flex;gap:18px;align-items:center">
              <img src="${policyIcon(bill("hr7831").area)}" style="width:60px;height:60px;flex:none">
              <div><div style="font-size:14px;color:var(--muted)">Most recent · ${fmtDate(latest.latestAction.actionDate)}</div><div style="font-size:18px;font-weight:600;margin-top:4px">Public Law ${latest.laws[0].number} · ${esc(latest.title)}</div></div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("By the numbers", ""),
        headline: hl(["k", `${n} bills`], " have become ", ["pk", "law"], " in the 119th Congress so far."),
        text: "The most recent, the License to Drill Act, was signed October 20. Every new law gets the next public law number, so this count updates itself.",
      }),
    });
  },
});

add({
  slug: "seats",
  name: "Seats in Congress",
  group: "Weekly",
  trigger: "Monthly, and whenever a seat changes hands or opens",
  data: "Current member list",
  render() {
    const all = [...members.values()].filter((m) => m.voting);
    const count = (senate, p) => all.filter((m) => m.senate === senate && m.party === p).length;
    const H = { d: count(false, "D"), i: count(false, "I"), r: count(false, "R") };
    const S = { d: count(true, "D"), i: count(true, "I"), r: count(true, "R") };
    const hv = 435 - H.d - H.i - H.r, sv = 100 - S.d - S.i - S.r;
    const chart = (title, o, vac, total, rows) => card({
      label: title,
      aside: `${total} seats`,
      inner: `<div style="margin-top:30px;display:flex;justify-content:center">${hemicycle(
        [{ n: o.d, fill: "#008cff" }, { n: o.i, fill: "#e8d24a" }, { n: vac, fill: "#d6d3cc" }, { n: o.r, fill: "#d45252" }],
        total === 100 ? { width: 400, rows: 5, dot: 9.5, inner: 0.36 } : { width: 400, rows: 12, dot: 4.6, inner: 0.32 },
      )}</div>
      <div style="display:grid;gap:14px;margin-top:auto">
        ${[["Democrats", o.d, "b-d"], ["Republicans", o.r, "b-r"], ["Independents", o.i, "b-i"], ["Vacant", vac, "b-v"]]
          .filter(([, n]) => n)
          .map(([l, n, c]) => `<div style="display:flex;justify-content:space-between;font-size:19px"><span><i class="${c}" style="display:inline-block;width:16px;height:16px;border-radius:4px;margin-right:10px;vertical-align:-2px"></i>${l}</span><b>${n}</b></div>`)
          .join("")}
        <div style="font-size:15px;color:var(--muted);border-top:1px solid #e6e3dc;padding-top:12px">Majority: ${Math.floor(total / 2) + 1} seats</div>
      </div>`,
    });
    return page({
      top: top(chart("House", H, hv, 435, 11), chart("Senate", S, sv, 100, 5)),
      bottom: bottom({
        kicker: kicker("Seats in Congress", fmtDate(TODAY)),
        headline: hl("Who holds ", ["k", "Congress's 535 voting seats"], " right now."),
        text: `Republicans hold ${H.r} House seats and ${S.r} Senate seats. Democrats hold ${H.d} and ${S.d}. ${S.i} senators${H.i ? ` and ${H.i} representative` : ""} are independents.${hv ? ` ${hv} House seat${hv > 1 ? "s are" : " is"} vacant.` : ""}`,
      }),
    });
  },
});

// ===========================================================================
// MEMBERS
// ===========================================================================

add({
  slug: "member-spotlight",
  name: "Member Spotlight",
  group: "Members",
  trigger: "Weekly, rotating; or when a member's bill becomes law",
  data: "Member profile, committees, education, policy areas, laws",
  render() {
    const m = member("T000193");
    const lawBill = bill("hr4467");
    return page({
      top: top(
        card({ label: "Profile", inner: profileCard(m, { areas: m.areas, lawsText: `${prettyBill(lawBill.type, lawBill.number)} · ${lawBill.title} (Public Law ${lawBill.law})` }) }),
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
        headline: hl("Meet ", ["n", `${m.title} ${m.display}`], ", whose ", ["k", "Vicksburg park bill"], " ", ["pk", "became law"], " this month."),
        text: `${m.title} ${m.last} has represented ${m.districtName} since ${m.since} and sits on the Homeland Security Committee. ${m.last}'s H.R. 4467 adjusts the boundary of Vicksburg National Military Park.`,
      }),
    });
  },
});

add({
  slug: "state-delegation",
  name: "State Delegation",
  group: "Members",
  trigger: "Weekly, cycling through the states",
  data: "Current member list with photos",
  render() {
    const st = "AZ";
    const list = [...members.values()].filter((m) => m.state === st);
    const sen = list.filter((m) => m.senate);
    const reps = list.filter((m) => !m.senate).sort((a, b) => a.district - b.district);
    const tile = (m, size) => `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px">
      ${photo(m, size)}<div style="font-size:${size > 100 ? 18 : 15}px;font-weight:600;line-height:1.2">${esc(m.display)}</div>
      <div style="font-size:13.5px;color:var(--muted);margin-top:-6px">${esc(m.senate ? `Senator · ${m.party}` : `District ${m.district} · ${m.party}`)}</div></div>`;
    return page({
      top: top(
        card({
          label: "Arizona",
          aside: `${sen.length} senators · ${reps.length} representatives`,
          w: 952,
          pad: "24px 30px",
          inner: `<div class="sub">Senate</div><div style="display:flex;gap:70px;justify-content:center;margin-bottom:22px">${sen.map((m) => tile(m, 112)).join("")}</div>
            <div class="sub">House</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:20px 10px">${reps.map((m) => tile(m, 82)).join("")}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Your delegation", st),
        headline: hl("Who represents ", ["k", "Arizona"], " in Congress."),
        text: "Two senators for the whole state and nine representatives, one per district. Enter your ZIP code in the Unum app to find yours.",
      }),
    });
  },
});

add({
  slug: "new-members",
  name: "New Members",
  group: "Members",
  trigger: "A new member is sworn in (new bioguide ID in the member list)",
  data: "Current member list, term start years",
  render() {
    const list = [...members.values()].filter((m) => !m.senate && m.since === 2026).sort((a, b) => a.state.localeCompare(b.state));
    return page({
      top: top(
        card({
          label: "New in the House",
          aside: "2026",
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:34px 18px;margin-top:20px">${list
            .map((m) => `<div style="display:flex;flex-direction:column;align-items:center;text-align:center">${photo(m, 132)}
              <div style="font-size:19px;font-weight:700;margin-top:16px">${esc(m.display)}</div>
              <div style="font-size:15px;color:var(--muted);margin-top:4px">${esc(m.tag)}</div></div>`)
            .join("")}</div>
            <div class="legend" style="margin-top:auto"><span><i class="b-d"></i>Democrat</span><span><i class="b-r"></i>Republican</span></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("New members", ""),
        headline: hl(["k", `${list.length} new members`], " have joined the House in 2026."),
        text: `They fill seats in ${[...new Set(list.map((m) => m.stateName))].join(", ").replace(/, ([^,]*)$/, ", and $1")}. Each began their term during the 119th Congress, after special elections.`,
      }),
    });
  },
});

// ===========================================================================
// ELECTION SERIES
// ===========================================================================

add({
  slug: "district-spotlight",
  name: "District Spotlight (election series)",
  group: "Election",
  trigger: "Weekly through Election Day, one notable House race",
  data: "Incumbent profile, committees, sponsored bills, positions on recent votes",
  render() {
    const m = member("C001133");
    const picks = [311, 303, 293, 278].map((n) => rollcall(n));
    const lawBill = bill("hr6380");
    const pos = (r) => r.members.find((x) => x.bioguide === m.bioguide)?.vote || "—";
    return page({
      top: top(
        card({
          label: "The district",
          inner: `<div class="mono" style="font-size:20px;color:var(--muted)">ARIZONA</div>
            <div class="big" style="font-size:96px;margin:4px 0 2px">6th</div>
            <div style="font-size:18px;color:var(--gray)">Congressional District</div>
            <div class="panel" style="margin-top:28px;display:flex;align-items:center;gap:18px">${photo(m, 76)}
              <div><div style="font-size:14px;color:var(--muted)">Incumbent</div><div style="font-size:20px;font-weight:700">${esc(m.title)} ${esc(m.display)}</div><div style="font-size:14.5px;color:var(--gray);margin-top:2px">${esc(m.partyName)} · since ${m.since}</div></div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">
              <div class="panel" style="padding:16px"><div class="big" style="font-size:46px">${m.sponsored}</div><div style="font-size:14.5px;color:var(--gray)">bills sponsored</div></div>
              <div class="panel" style="padding:16px"><div class="big" style="font-size:46px;color:var(--pass)">1</div><div style="font-size:14.5px;color:var(--gray)">became law</div></div></div>
            <div class="sub" style="margin-top:22px">Committees</div>${m.committees.map((c) => `<div style="font-size:15.5px;color:var(--gray)">${esc(c.replace("House Committee on ", ""))}</div>`).join("")}`,
        }),
        card({
          label: "Recent votes",
          inner: picks
            .map((r) => `<div style="padding:16px 0;border-bottom:1px solid #e6e3dc">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-size:16px">${esc(prettyBill(r.type, r.number))}</b>
                <span style="font:600 15px Inter;padding:5px 14px;border-radius:999px;color:#fff;background:var(${pos(r) === "Yea" ? "--pass" : "--fail"})">${pos(r)}</span></div>
                <div style="font-size:14.5px;color:var(--gray);margin-top:6px;line-height:1.35">${esc(r.desc.length > 92 ? r.desc.slice(0, 90) + "…" : r.desc)}</div>
                <div style="font-size:13px;color:var(--muted);margin-top:6px">${esc(r.result)} ${r.yeaTotal}–${r.nayTotal} · ${r.date}</div></div>`)
            .join("") + `<div style="font-size:13.5px;color:var(--muted);margin-top:auto">Votes shown are a fixed set of the House's most-watched roll calls, the same for every district.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("District spotlight", "AZ-06"),
        headline: hl(["k", "Arizona's 6th District"], " votes November 3. Here is ", ["n", `${m.title} ${m.display}'s`], " record."),
        text: `First elected in 2022, ${m.last} has sponsored ${m.sponsored} bills this Congress, including the ${lawBill.title}, now law.`,
      }),
    });
  },
});

add({
  slug: "on-your-ballot",
  name: "What's on Your Ballot (election series)",
  group: "Election",
  trigger: "Once or twice before Election Day",
  data: "Static election facts (verify each cycle)",
  render() {
    const sec = (title, rows) => `<div style="margin-bottom:20px"><div class="mono" style="font-size:16px;color:var(--blue);border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:6px">${title}</div>
      ${rows.map(([a, b]) => `<div style="display:flex;align-items:center;gap:14px;padding:9px 0;font-size:17px"><span style="width:22px;height:22px;border:2px solid #333;border-radius:50%;flex:none"></span><b style="font-weight:600">${a}</b><span style="margin-left:auto;color:var(--gray);font-size:15px">${b}</span></div>`).join("")}</div>`;
    return page({
      top: top(
        card({
          label: "Sample ballot",
          aside: "Nov 3, 2026",
          w: 952,
          pad: "22px 40px",
          inner: `<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:44px">
            <div>${sec("FEDERAL", [["U.S. House", "all 435 seats"], ["U.S. Senate", "35 seats"]])}${sec("STATE", [["Governor", "36 states"], ["State legislature", "most states"], ["Attorney general, secretary of state", "many states"]])}</div>
            <div>${sec("LOCAL", [["Mayor, county officials", "varies"], ["School board", "varies"], ["Judges", "many states"]])}${sec("MEASURES", [["Ballot questions", "many states"], ["Local bonds and levies", "varies"]])}</div></div>
            <div style="font-size:14px;color:var(--muted);margin-top:auto">Races differ by address. Your state or county election office publishes your exact sample ballot.</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Election 2026", "Your ballot"),
        headline: hl("Your November ballot is ", ["k", "about far more than Congress"], "."),
        text: "Every House seat and about a third of the Senate are up, but most ballots also include state and local races and ballot questions. Look up your sample ballot before you vote.",
      }),
    });
  },
});

add({
  slug: "election-countdown",
  name: "Election Countdown (election series)",
  group: "Election",
  trigger: "Daily or at milestones (30, 14, 7, 1 days out)",
  data: "Today's date and Election Day",
  render() {
    const days = Math.round((new Date(ELECTION) - new Date(TODAY)) / 864e5);
    const cal = () => {
      const start = new Date("2026-11-01T12:00:00Z");
      const cells = [...Array(7)].map((_, i) => {
        const d = new Date(start.getTime() + i * 864e5).getUTCDate();
        const on = d === 3;
        return `<div style="height:84px;border-radius:14px;display:grid;place-items:center;font:${on ? 600 : 500} 32px Inter;${on ? "background:var(--blue);color:#fff" : "background:#fff;color:#333"}">${d}</div>`;
      });
      return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px">${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="mono" style="text-align:center;font-size:16px;color:var(--muted)">${d}</div>`).join("")}${cells.join("")}</div>`;
    };
    return page({
      top: top(
        card({
          label: "Election Day",
          aside: "Tuesday, Nov 3",
          w: 952,
          inner: `<div style="display:flex;align-items:baseline;gap:22px"><div class="big" style="font-size:300px;color:var(--blue)">${days}</div><div class="big" style="font-size:96px">days</div></div>
            <div class="mono" style="font-size:22px;color:var(--muted);margin:4px 0 0">UNTIL POLLS OPEN NATIONWIDE</div>
            <div style="margin-top:auto"><div class="sub">November 2026</div>${cal()}</div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Election 2026", `${days} days`),
        headline: hl(["k", `${days} days`], " until ", ["k", "Election Day"], ", Tuesday, November 3."),
        text: "Polling hours and early voting rules differ by state. Check your polling place and hours with your state election office before you go.",
      }),
    });
  },
});

add({
  slug: "registration-deadline",
  name: "Registration Deadline (election series)",
  group: "Election",
  sample: true,
  trigger: "Per state, 7 and 1 days before its deadline",
  data: "Needs a state-by-state deadline source (not in the repo yet)",
  render() {
    return page({
      sample: true,
      top: top(
        card({
          label: "Register to vote",
          aside: "Example State",
          w: 952,
          inner: `<div class="mono" style="font-size:22px;color:var(--muted)">REGISTRATION DEADLINE</div>
            <div class="big" style="font-size:150px;margin-top:10px">Oct 13</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:auto">
              ${[["Online", "Oct 13"], ["By mail (postmarked)", "Oct 13"], ["In person", "Oct 13"]].map(([a, b]) => `<div class="panel"><div style="font-size:15px;color:var(--muted)">${a}</div><div class="big" style="font-size:40px;font-weight:700;margin-top:6px">${b}</div></div>`).join("")}
            </div>
            <div class="panel" style="margin-top:16px;background:var(--pill);box-shadow:none"><div style="font-size:17px;color:var(--blue);font-weight:600">Same-day registration: not available</div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Election 2026", "Example State"),
        headline: hl(["k", "2 days left"], " to register to vote in ", ["k", "Example State"], "."),
        text: "Check whether you're registered, and register if you aren't, through your state's election website. It takes a few minutes online.",
      }),
    });
  },
});

add({
  slug: "what-a-majority-controls",
  name: "What a Majority Controls (post-election explainer)",
  group: "Election",
  trigger: "After Election Day, once control of each chamber is known",
  data: "Static civics content + current seat counts",
  render() {
    const item = (t, d) => `<div style="display:grid;grid-template-columns:34px 1fr;gap:12px;padding:17px 0;border-bottom:1px solid #e6e3dc">
      <div style="width:30px;height:30px;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font-weight:700;font-size:16px">✓</div>
      <div><div style="font-size:19.5px;font-weight:600">${t}</div><div style="font-size:16px;color:var(--gray);margin-top:4px;line-height:1.35">${d}</div></div></div>`;
    const all = [...members.values()].filter((m) => m.voting);
    const seatsOf = (senate, p) => all.filter((m) => m.senate === senate && m.party === p).length;
    const today = (senate) => {
      const d = seatsOf(senate, "D"), r = seatsOf(senate, "R");
      const lead = r > d ? ["Republicans", r, "c-r"] : ["Democrats", d, "c-d"];
      return `<div class="panel" style="margin-top:auto"><div style="font-size:14.5px;color:var(--muted)">Majority today</div><div style="font-size:21px;font-weight:700;margin-top:4px" class="${lead[2]}">${lead[0]}, ${lead[1]} seats</div></div>`;
    };
    return page({
      top: top(
        card({
          label: "House majority",
          inner: [
            item("Elects the Speaker", "Who runs the floor and the chamber's schedule."),
            item("Chairs every committee", "And holds a majority of seats on each one."),
            item("Picks which bills get a vote", "Through the Rules Committee."),
            item("Starts every tax bill", "The Constitution requires revenue bills to begin in the House."),
          ].join("") + today(false),
        }),
        card({
          label: "Senate majority",
          inner: [
            item("Elects the majority leader", "Who decides what comes to the floor."),
            item("Chairs every committee", "Including the ones that hold confirmation hearings."),
            item("Schedules confirmations", "Judges, Cabinet members, and other nominees."),
            item("Still needs 60 for most bills", "Ending a filibuster takes 60 votes, whoever is in charge."),
          ].join("") + today(true),
        }),
      ),
      bottom: bottom({
        kicker: kicker("After the election", "120th Congress"),
        headline: hl("What ", ["k", "a new majority"], " actually controls when Congress returns ", ["k", "January 3"], "."),
        text: "The party holding more seats in each chamber picks its leader, chairs every committee, and decides which bills reach the floor. Here is what changes and what doesn't.",
      }),
    });
  },
});

// ===========================================================================
// CIVICS
// ===========================================================================

add({
  slug: "term-of-the-week",
  name: "Term of the Week",
  group: "Civics",
  trigger: "Weekly, ideally tied to a term in that week's news",
  data: "constants/politicalJargon.ts + a real recent vote",
  render() {
    return page({
      top: top(
        card({
          label: "Term of the week",
          w: 952,
          inner: `<div class="big" style="font-size:150px">Cloture</div>
            <div class="mono" style="font-size:22px;color:var(--muted);margin-top:16px">/ˈklō-chər/ · noun · Senate procedure</div>
            <div style="font-size:30px;line-height:1.4;margin-top:34px;max-width:820px">A Senate procedure to end debate and force a vote on a bill. Requires <b style="color:var(--blue)">60 votes</b> to pass.</div>
            <div class="vote" style="flex:none;margin-top:auto">
              <div class="vh"><b>Senate · 08/03/2026</b><span>H.R. 6500</span></div>
              <div class="res" style="color:var(--pass)">Cloture on the Motion to Proceed Agreed to (89-4, 3/5 majority required)</div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Term of the week", "Cloture"),
        headline: hl(["k", "Cloture"], " is the vote that ", ["k", "ends debate"], " in the Senate, and it takes 60 senators."),
        text: "That's why bills with majority support can still stall in the Senate. In August, senators voted 89–4 for cloture to begin work on H.R. 6500.",
      }),
    });
  },
});

add({
  slug: "bill-types",
  name: "Bill Types Explained",
  group: "Civics",
  trigger: "One-off, pinned; reshared when a rare type is in the news",
  data: "Static civics content",
  render() {
    const row = (badges, name, path, law) => `<div style="display:grid;grid-template-columns:250px 1fr 150px;align-items:center;gap:20px;padding:34px 0;border-bottom:1px solid #e6e3dc">
      <div style="display:flex;gap:8px">${badges.map((b) => `<span class="badge" style="background:var(--blue);font-size:17px">${b}</span>`).join("")}</div>
      <div><div style="font-size:22px;font-weight:600">${name}</div><div style="font-size:16.5px;color:var(--gray);margin-top:6px">${path}</div></div>
      <div style="text-align:right;font:600 16px Inter;color:var(${law ? "--pass" : "--muted"})">${law ? "Can become law" : "Stays in Congress"}</div></div>`;
    return page({
      top: top(
        card({
          label: "Bill types",
          w: 952,
          pad: "8px 34px",
          inner: [
            row(["H.R.", "S."], "Bill", "Both chambers, then the President", true),
            row(["H.J.Res.", "S.J.Res."], "Joint resolution", "Same path as a bill; amendments go to the states", true),
            row(["H.Con.Res.", "S.Con.Res."], "Concurrent resolution", "Both chambers, no President (e.g. the budget)", false),
            row(["H.Res.", "S.Res."], "Simple resolution", "One chamber only (rules, honors, opinions)", false),
          ].join(""),
        }),
      ),
      bottom: bottom({
        kicker: kicker("Civics", "Bill types"),
        headline: hl("What the letters before ", ["k", "a bill number"], " mean."),
        text: "H.R. is a House bill and S. a Senate bill. Only bills and joint resolutions can become law; the others stay inside Congress.",
      }),
    });
  },
});

add({
  slug: "how-a-bill-becomes-law",
  name: "How a Bill Becomes Law",
  group: "Civics",
  trigger: "One-off, pinned; carousel cover for the civics guide",
  data: "Education content + the app's stage bar",
  render() {
    const steps = [
      ["Introduced", "A member files it and it gets a number."],
      ["Committee", "Experts study it, hold hearings, and amend it. Most bills stop here."],
      ["First chamber", "A floor vote: majority in the House, often 60 to end debate in the Senate."],
      ["Second chamber", "It must pass in identical form."],
      ["President", "Signs it, or vetoes it (Congress can override with two-thirds)."],
    ];
    return page({
      top: top(
        card({
          label: "How a bill becomes law",
          w: 952,
          pad: "18px 40px",
          inner: steps
            .map(([t, d], i) => `<div style="display:grid;grid-template-columns:70px 1fr;gap:20px;align-items:stretch">
              <div style="display:flex;flex-direction:column;align-items:center">
                <div style="width:52px;height:52px;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font:600 26px Inter">${i + 1}</div>
                ${i < steps.length - 1 ? '<div style="flex:1;width:6px;background:var(--blue);opacity:.35;border-radius:3px;margin:4px 0"></div>' : ""}</div>
              <div style="padding:10px 0 40px"><div style="font-size:26px;font-weight:700">${t}</div><div style="font-size:18.5px;color:var(--gray);margin-top:6px">${d}</div></div></div>`)
            .join(""),
        }),
      ),
      bottom: bottom({
        kicker: kicker("Civics", "The path"),
        headline: hl("How ", ["k", "a bill becomes law"], ", in five steps."),
        text: "Every bill in the Unum app shows where it is on this path. Most never make it past committee.",
      }),
    });
  },
});

const QUIZ = {
  q: "How many House members must vote yes to propose a constitutional amendment?",
  options: ["A simple majority", "Three-fifths", "Two-thirds of those voting", "Three-fourths"],
  answer: 2,
};
add({
  slug: "civics-quiz",
  name: "Civics Quiz (2 slides)",
  group: "Civics",
  trigger: "Weekly; answer slide uses a real vote when one fits",
  data: "Education content, a real vote for the answer",
  render() {
    const r = rollcall(293);
    const opts = (reveal) => QUIZ.options
      .map((o, i) => {
        const right = reveal && i === QUIZ.answer;
        return `<div style="display:flex;align-items:center;gap:18px;padding:18px 22px;border-radius:16px;margin-top:14px;font-size:21px;font-weight:500;
          ${right ? "background:var(--pass);color:#fff" : `background:#fff;border:1.5px solid #d9d6cf;${reveal ? "opacity:.45" : ""}`}">
          <span class="mono" style="font-size:20px">${"ABCD"[i]}</span>${o}${right ? '<span style="margin-left:auto">✓</span>' : ""}</div>`;
      })
      .join("");
    const slide = (reveal) => page({
      top: top(card({ label: reveal ? "Answer" : "Quiz", aside: reveal ? "" : "Swipe for the answer →", w: 952, inner: `<div style="font:600 50px/1.2 Inter;margin-top:10px">${esc(QUIZ.q)}</div><div style="margin-top:auto">${opts(reveal)}</div>` })),
      bottom: bottom(reveal
        ? {
            kicker: kicker("Civics quiz", "Answer"),
            headline: hl("It takes ", ["pk", "two-thirds"], ", which is why ", ["k", "H.J.Res. 1"], " ", ["f", `failed at ${r.yeaTotal}–${r.nayTotal}`], "."),
            text: `A majority voted yes in September, but ${Math.ceil(((r.yeaTotal + r.nayTotal) * 2) / 3)} votes were needed. The amendment would have fixed the Supreme Court at nine justices.`,
          }
        : {
            kicker: kicker("Civics quiz", "Question"),
            headline: hl("Do you know ", ["k", "what it takes to amend the Constitution"], "?"),
            text: "The House voted on a constitutional amendment in September. Guess the threshold, then swipe to see how that vote turned out.",
          }),
    });
    return [slide(false), slide(true)];
  },
});

add({
  slug: "did-you-know",
  name: "Did You Know",
  group: "Civics",
  trigger: "Weekly, from the civics guide",
  data: "app/education_tab/content.ts",
  render() {
    return page({
      top: top(
        card({
          label: "Did you know",
          w: 952,
          inner: `<div style="display:flex;align-items:flex-end;gap:30px"><div class="big" style="font-size:300px;color:var(--blue)">435</div>
              <div style="padding-bottom:30px"><div class="mono" style="font-size:24px">HOUSE SEATS</div><div style="font-size:20px;color:var(--gray);margin-top:8px">fixed since 1929</div></div></div>
            <div class="panel" style="margin-top:auto"><div style="font-size:20px;line-height:1.5;color:var(--gray)">The number of representatives each state gets depends on its population. <b style="color:#111">California has 52</b>, while <b style="color:#111">five states have just 1</b> district covering the whole state.</div></div>`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Did you know", "The House"),
        headline: hl("The House has had ", ["k", "435 seats"], " since 1929. Only who gets them changes."),
        text: "After every census, seats move between states as populations shift. The process is called reapportionment.",
      }),
    });
  },
});
