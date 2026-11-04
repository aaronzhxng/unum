// Midterm results, the day after the Nov 3, 2026 election: control of each
// chamber, the seats that flipped, the new senators, governors, and what
// comes next. Built entirely from sets/2026-11-04-results.mjs, a one-time
// pull of the race calls, so it needs no API key or data/ snapshots.
//
//   SET=social/prototypes/sets/2026-11-04.mjs OUT=2026-11-04 node social/prototypes/build.mjs
//
// When more races are called, update the results file and rebuild.

import { esc, page, hl, kicker, bottom, card, hemicycle } from "../lib.mjs";
import { AS_OF, SOURCES, senate, house, governors } from "./2026-11-04-results.mjs";

const check = (ok, what) => {
  if (!ok) throw new Error(`Fact check failed: ${what}`);
};
const sum = (o) => Object.values(o).reduce((a, n) => a + n, 0);
check(sum(senate.seats) === 100, "Senate seats add up to 100");
check(sum(house.seats) === 435, "House seats add up to 435");
check(senate.seats.D - senate.before.D === senate.flips.length, "Senate gains match the flips listed");

const GROUP = "Midterm results, Nov 4";
const DATA = `One-time pull of race calls as of ${AS_OF}: ${SOURCES.join(", ")}`;

// templates.mjs needs the Congress.gov data/ snapshots, so the one piece
// used from it is repeated here
const top = (...cards) => `<div class="top">${cards.join("")}</div>`;

const COLOR = { D: "var(--dem)", R: "var(--rep)", uncalled: "var(--vacant)" };
const pct = (n) => `${n.toFixed(1)}%`;
const lastName = (name) => name.split(" ").slice(1).join(" ") || name;
// Newcomers have no official photo yet, so everyone gets initials in their
// party's color
const initials = (name) => {
  const words = name.split(" ");
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
const face = (name, party, size = 64) =>
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${COLOR[party]};color:#fff;display:grid;place-items:center;font:700 ${Math.round(size * 0.36)}px Inter;flex:none">${esc(initials(name))}</div>`;

const stat = (n, label, color) =>
  `<div class="panel" style="padding:18px 22px;text-align:center"><div class="big" style="font-size:88px;color:${color}">${n}</div><div style="font-size:17px;color:var(--gray);margin-top:6px">${label}</div></div>`;
const statRow = (seats) =>
  `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">${stat(seats.D, "Democrats", COLOR.D)}${stat(seats.uncalled, "Not yet called", "var(--muted)")}${stat(seats.R, "Republicans", COLOR.R)}</div>`;
const chip = (text, color = COLOR.D) =>
  `<span style="font:600 15px Inter;padding:5px 12px;border-radius:999px;color:#fff;background:${color};white-space:nowrap">${esc(text)}</span>`;
const tag = (text) =>
  `<span style="font:600 13px Inter;padding:3px 10px;border-radius:999px;background:#fff3c4;color:#7a5b00;white-space:nowrap">${esc(text)}</span>`;
const row = (left, right, extra = "") =>
  `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #e6e3dc">${left}<div style="display:flex;align-items:center;gap:10px">${extra}${right}</div></div>`;
const result = (winner, wParty, loser, lParty) =>
  `<span style="font-size:17px"><b class="c-${wParty.toLowerCase()}">${esc(lastName(winner[0]))} ${pct(winner[1])}</b> <span style="color:var(--muted)">·</span> <span style="color:var(--gray)">${esc(lastName(loser[0]))} ${pct(loser[1])}</span></span>`;
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const houseMembers = (list) => NUMBER_WORDS[list.filter((n) => n.now === "U.S. representative").length];
const asOf = `<div style="font-size:14px;color:var(--muted);margin-top:auto;padding-top:14px">Projected winners, as of ${esc(AS_OF)}. Results can change as votes are counted.</div>`;

export const templates = [];
const add = (t) => templates.push({ group: GROUP, data: DATA, ...t });

// ===========================================================================
// 1. Senate control
// ===========================================================================

add({
  slug: "1-senate-control",
  name: "Senate control",
  trigger: "Day after the election",
  caption: `Democrats won control of the Senate, flipping ${senate.flips.length} Republican seats. Together with the independents who caucus with them, they will hold at least ${senate.seats.D} seats in January, up from ${senate.before.D}. Mississippi and Alaska are still too close to call.`,
  render() {
    const chart = hemicycle(
      [{ n: senate.seats.D, fill: COLOR.D }, { n: senate.seats.uncalled, fill: COLOR.uncalled }, { n: senate.seats.R, fill: COLOR.R }],
      { width: 600, rows: 5 },
    );
    return page({
      top: top(
        card({
          label: "The next Senate",
          aside: AS_OF,
          w: 952,
          inner: `<div style="display:flex;justify-content:center;margin:6px 0 18px">${chart}</div>
            ${statRow(senate.seats)}
            <div class="sub" style="margin-top:24px;font-size:17px">Flipped to Democrats</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">${senate.flips.map((f) => chip(f.state)).join("")}</div>
            ${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "Senate"),
        headline: hl(["pd", "Democrats"], " won the ", ["k", "Senate"], ", flipping ", ["k", `${senate.flips.length} seats`], " held by ", ["pr", "Republicans"], "."),
        text: `They will hold at least ${senate.seats.D} of 100 seats, up from ${senate.before.D}. Mississippi and Alaska are still too close to call.`,
      }),
    });
  },
});

// ===========================================================================
// 2. House control
// ===========================================================================

add({
  slug: "2-house-control",
  name: "House control",
  trigger: "Day after the election",
  caption: `Democrats won control of the House. With ${house.seats.uncalled} races still being counted, they have ${house.seats.D} seats, past the ${house.majority} needed for a majority, after flipping at least ${house.netGainD}. NBC News estimates they will finish with about ${house.projected.D}.`,
  render() {
    const chart = hemicycle(
      [{ n: house.seats.D, fill: COLOR.D }, { n: house.seats.uncalled, fill: COLOR.uncalled }, { n: house.seats.R, fill: COLOR.R }],
      { width: 640, rows: 10 },
    );
    return page({
      top: top(
        card({
          label: "The next House",
          aside: AS_OF,
          w: 952,
          inner: `<div style="display:flex;justify-content:center;margin:6px 0 18px">${chart}</div>
            ${statRow(house.seats)}
            <div style="display:flex;justify-content:space-between;font-size:17px;margin-top:22px;color:var(--gray)">
              <span><b style="color:#111">${house.majority}</b> seats needed for a majority</span>
              <span>Democrats flipped at least <b style="color:#111">${house.netGainD}</b></span></div>
            ${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "House"),
        headline: hl(["pd", "Democrats"], " won the ", ["k", "House"], ", flipping at least ", ["k", `${house.netGainD} seats`], "."),
        text: `They have ${house.seats.D} seats with ${house.seats.uncalled} races still being counted. NBC News estimates they will finish with about ${house.projected.D}.`,
      }),
    });
  },
});

// ===========================================================================
// 3. Senate seats that flipped
// ===========================================================================

add({
  slug: "3-senate-flips",
  name: "Senate seats that flipped",
  trigger: "Day after the election",
  caption: `Seven Senate seats flipped from Republican to Democrat: ${senate.flips.map((f) => f.state).join(", ")}. Four Republican senators lost their seats, including Susan Collins in Maine. In Texas, James Talarico beat Ken Paxton.`,
  render() {
    const beaten = senate.flips.filter((f) => f.beatIncumbent).length;
    return page({
      top: top(
        card({
          label: "Flipped from R to D",
          aside: `${senate.flips.length} seats`,
          w: 952,
          inner: `${senate.flips
            .map((f) =>
              row(
                `<div style="display:flex;align-items:center;gap:16px">${face(f.winner[0], "D", 52)}<div><b style="font-size:20px">${esc(f.state)}</b><div style="font-size:15px;color:var(--gray);margin-top:2px">${esc(f.winner[0])} defeats ${esc(f.loser[0])}</div></div></div>`,
                result(f.winner, "D", f.loser, "R"),
                [f.beatIncumbent && tag("Beat incumbent"), f.special && tag("Special election")].filter(Boolean).join(""),
              ),
            )
            .join("")}${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "Senate flips"),
        headline: hl(["k", `${senate.flips.length} Senate seats`], " flipped to ", ["pd", "Democrats"], ", including ", ["n", "Texas"], " and ", ["n", "North Carolina"], "."),
        text: `${beaten} Republican senators lost to Democratic challengers, including Susan Collins in Maine.`,
      }),
    });
  },
});

// ===========================================================================
// 4. The new senators
// ===========================================================================

add({
  slug: "4-new-senators",
  name: "Meet the new senators",
  trigger: "Day after the election",
  caption: `${senate.newcomers.length} people who have never served in the Senate won seats on Tuesday: ${senate.newcomers.filter((n) => n.party === "D").length} Democrats and ${senate.newcomers.filter((n) => n.party === "R").length} Republicans. Sherrod Brown of Ohio also returns after losing his seat in 2024. Follow them in the Unum app once they are sworn in.`,
  render() {
    const d = senate.newcomers.filter((n) => n.party === "D").length;
    const r = senate.newcomers.length - d;
    return page({
      top: top(
        card({
          label: "New to the Senate",
          aside: `${senate.newcomers.length} senators-elect`,
          w: 952,
          inner: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px 16px">${senate.newcomers
            .map((n) => `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px">${face(n.name, n.party, 70)}
                <div style="font-size:16px;font-weight:700;line-height:1.2">${esc(n.name)}</div>
                <div style="font-size:13px;color:var(--gray);line-height:1.3;margin-top:-4px">${n.party}-${n.state}${n.now ? ` · ${esc(n.now)}` : ""}</div></div>`)
            .join("")}</div>${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "New senators"),
        headline: hl(["k", `${senate.newcomers.length} newcomers`], " won Senate seats: ", ["pd", `${d} Democrats`], " and ", ["pr", `${r} Republicans`], "."),
        text: `${houseMembers(senate.newcomers)} of them are House members moving across the Capitol. Sherrod Brown of Ohio returns after losing his seat in 2024.`,
      }),
    });
  },
});

// ===========================================================================
// 5. Governors
// ===========================================================================

add({
  slug: "5-governors",
  name: "Governors",
  trigger: "Day after the election",
  caption: `Democrats flipped ${governors.flips.length} governorships: ${governors.flips.map((f) => f.state).join(", ")}. In Texas, Gina Hinojosa defeated Governor Greg Abbott. Kansas and Alaska are still too close to call.`,
  render() {
    return page({
      top: top(
        card({
          label: "Governors · flipped from R to D",
          aside: `${governors.races} races`,
          w: 952,
          inner: `${governors.flips
            .map((f) =>
              row(
                `<div style="display:flex;align-items:center;gap:16px">${face(f.winner[0], "D", 52)}<div><b style="font-size:20px">${esc(f.state)}</b><div style="font-size:15px;color:var(--gray);margin-top:2px">${esc(f.winner[0])} defeats ${esc(f.loser[0])}</div></div></div>`,
                result(f.winner, "D", f.loser, "R"),
                f.beatIncumbent ? tag("Beat incumbent") : "",
              ),
            )
            .join("")}
            <div class="sub" style="margin-top:22px;font-size:17px">Not yet called</div>
            ${governors.uncalled
              .map((u) => row(`<b style="font-size:18px">${esc(u.state)}</b>`, `<span style="font-size:17px"><span class="c-d">${esc(u.d[0])} ${pct(u.d[1])}</span> · <span class="c-r">${esc(u.r[0])} ${pct(u.r[1])}</span></span>`))
              .join("")}${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "Governors"),
        headline: hl(["pd", "Democrats"], " flipped ", ["k", `${governors.flips.length} governorships`], ", including ", ["n", "Texas"], ", ", ["n", "Georgia"], ", and ", ["n", "Ohio"], "."),
        text: `Two sitting Republican governors lost: Greg Abbott in Texas and Joe Lombardo in Nevada. Kansas and Alaska are still too close to call.`,
      }),
    });
  },
});

// ===========================================================================
// 6. House Republicans who lost
// ===========================================================================

add({
  slug: "6-house-incumbents",
  name: "House Republicans who lost",
  trigger: "Day after the election",
  caption: `At least ${house.incumbentsLost.length} House Republicans lost their seats in battleground races, including four in Pennsylvania. In North Carolina's 1st District, from our district spotlight, Democrat Don Davis held his seat, ${pct(house.nc1.winner[1])} to ${pct(house.nc1.loser[1])}.`,
  render() {
    const pa = house.incumbentsLost.filter((x) => x.district.startsWith("PA")).length;
    return page({
      top: top(
        card({
          label: "Republican incumbents defeated",
          aside: "Battleground races",
          w: 952,
          pad: "18px 34px",
          inner: `<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:36px">${house.incumbentsLost
            .map((x) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:17px 0;border-bottom:1px solid #e6e3dc">
                <span class="mono" style="font-size:17px;color:var(--muted);width:68px">${esc(x.district)}</span>
                <span style="flex:1;font-size:18.5px"><s style="color:var(--gray)">${esc(x.loser[0])}</s> <span style="color:var(--muted)">→</span> <b class="c-d">${esc(x.winner[0])}</b></span>
                <span style="font-size:16px;color:var(--gray)">${pct(x.winner[1])}</span></div>`)
            .join("")}</div>
            <div class="panel" style="margin-top:28px;display:flex;align-items:center;gap:18px;padding:20px 22px">${face(house.nc1.winner[0], "D", 56)}
              <div style="font-size:18px;line-height:1.4"><b>NC-1, from our district spotlight:</b> Don Davis (D) held his seat, ${pct(house.nc1.winner[1])} to ${pct(house.nc1.loser[1])}.</div></div>
            ${asOf}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "House"),
        headline: hl("At least ", ["k", `${house.incumbentsLost.length} House Republicans`], " lost their seats, including ", ["k", `${pa} in Pennsylvania`], "."),
        text: `These are the battleground races called so far. ${house.seats.uncalled} House races are still being counted.`,
      }),
    });
  },
});

// ===========================================================================
// 7. What happens next
// ===========================================================================

add({
  slug: "7-what-next",
  name: "What happens next",
  trigger: "Day after the election",
  caption: `The current Congress returns for a lame-duck session before the new one takes over in January. Its first deadline is December 11, when government funding runs out. Meanwhile, ${house.seats.uncalled} House races and the Senate races in Mississippi and Alaska are still being counted.`,
  render() {
    const step = (when, what, detail) => `<div style="display:grid;grid-template-columns:210px 1fr;gap:24px;padding:28px 0;border-bottom:1px solid #e6e3dc">
        <div class="mono" style="font-size:20px;color:var(--blue);text-transform:uppercase">${esc(when)}</div>
        <div><b style="font-size:24px">${esc(what)}</b><div style="font-size:18.5px;color:var(--gray);margin-top:8px;line-height:1.4">${esc(detail)}</div></div></div>`;
    return page({
      top: top(
        card({
          label: "What happens next",
          w: 952,
          inner: `${step("Now", "Counting continues", `${house.seats.uncalled} House races, the Senate races in Mississippi and Alaska, and the governor races in Kansas and Alaska are not yet called.`)}
            ${step("Coming weeks", "States certify results", "Each state confirms its official count on its own schedule. Close races can go to recounts.")}
            ${step("December 11", "Government funding runs out", "The current Congress, with Republican majorities, returns for a lame-duck session and has to pass more funding to avoid a shutdown.")}
            ${step("January", "The new Congress is sworn in", "Democrats take control of the House and Senate. Most newly elected governors also take office in January.")}`,
        }),
      ),
      bottom: bottom({
        kicker: kicker("Midterm results", "What next"),
        headline: hl("The ", ["k", "current Congress"], " still has one deadline before ", ["pd", "Democrats"], " take over in ", ["n", "January"], "."),
        text: `Government funding runs out December 11, and the lame-duck Congress has to act before then.`,
      }),
    });
  },
});
