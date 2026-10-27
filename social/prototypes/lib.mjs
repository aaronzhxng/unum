// Shared design system for the social post prototypes: tokens, the app-style
// cards, the kicker / headline / body / footer stack, and charts. Every
// template in templates.mjs is built only from these pieces, so the posts
// stay consistent with the hand-made "Bill of the Day" designs in
// ../templates/bill-of-the-day/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const dataUri = (file, type = "image/png") =>
  `data:${type};base64,${fs.readFileSync(file).toString("base64")}`;

export const LOGO = dataUri(path.join(REPO, "assets", "app_icons", "app_icon_ios.png"));

// Mirrors app/(tabs)/legislation.tsx's POLICY_AREA_COLORS (via
// scripts/newsletter/generateCard.js)
export const POLICY_AREA_COLORS = {
  "Agriculture and Food": "#7CB342",
  Animals: "#8D6E63",
  "Armed Forces and National Security": "#455A64",
  "Arts, Culture, Religion": "#AB47BC",
  "Civil Rights and Liberties, Minority Issues": "#E53935",
  Commerce: "#00ACC1",
  Congress: "#1565C0",
  "Crime and Law Enforcement": "#424242",
  "Economics and Public Finance": "#4CAF82",
  Education: "#F5A623",
  "Emergency Management": "#FF5722",
  Energy: "#E67E22",
  "Environmental Protection": "#43A047",
  Families: "#F06292",
  "Finance and Financial Sector": "#4CAF82",
  "Foreign Trade and International Finance": "#9B59B6",
  "Government Operations and Politics": "#6B7FD4",
  Health: "#E53935",
  "Housing and Community Development": "#FF8F00",
  Immigration: "#00897B",
  "International Affairs": "#1E88E5",
  "Labor and Employment": "#6D4C41",
  Law: "#546E7A",
  "Native Americans": "#BF360C",
  "Public Lands and Natural Resources": "#27AE60",
  "Science, Technology, Communications": "#0288D1",
  "Social Welfare": "#E91E8C",
  "Sports and Recreation": "#00BCD4",
  Taxation: "#F9A825",
  "Transportation and Public Works": "#5C6BC0",
  "Water Resources Development": "#0277BD",
};

// Mirrors app/utils/billIcons.ts's BILL_ICON_MAP
const POLICY_AREA_ICONS = {
  "Agriculture and Food": "agriculture",
  Animals: "animals",
  "Armed Forces and National Security": "armed-forces",
  "Arts, Culture, Religion": "arts",
  "Civil Rights and Liberties, Minority Issues": "civil-rights",
  Commerce: "commerce",
  Congress: "congress",
  "Crime and Law Enforcement": "crime",
  "Economics and Public Finance": "economics",
  Education: "education",
  "Emergency Management": "emergency",
  Energy: "energy",
  "Environmental Protection": "environment",
  Families: "families",
  "Finance and Financial Sector": "finance",
  "Foreign Trade and International Finance": "foreign-trade",
  "Government Operations and Politics": "government",
  Health: "health",
  "Housing and Community Development": "housing",
  Immigration: "immigration",
  "International Affairs": "international",
  "Labor and Employment": "labor",
  Law: "law",
  "Native Americans": "native-americans",
  "Public Lands and Natural Resources": "public-lands",
  "Science, Technology, Communications": "science",
  "Social Welfare": "social-welfare",
  "Sports and Recreation": "sports",
  Taxation: "taxation",
  "Transportation and Public Works": "transportation",
  "Water Resources Development": "water",
};

const iconCache = {};
export const policyIcon = (area) => {
  const name = POLICY_AREA_ICONS[area] || "default";
  return (iconCache[name] ??= dataUri(path.join(REPO, "assets", "bills_icons", `${name}.png`)));
};
export const policyColor = (area) => POLICY_AREA_COLORS[area] || "#008CFF";

// "HJRES" -> "H.J.Res." (badges and prose); app headers use "HJRES.1"
const PRETTY_TYPES = {
  HR: "H.R.", S: "S.", HRES: "H.Res.", SRES: "S.Res.", HJRES: "H.J.Res.",
  SJRES: "S.J.Res.", HCONRES: "H.Con.Res.", SCONRES: "S.Con.Res.",
};
export const prettyBill = (type, number) => `${PRETTY_TYPES[type] || type} ${number}`;
export const appBillId = (type, number) => `${type}.${number}`;

export const fmtDate = (iso) => {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", timeZone: "America/New_York" });
};
export const longDate = (iso) => {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });
};

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=block";

const CSS = `
:root {
  --paper: #f4f1eb; --card: #fafafa; --blue: #008cff; --ink: #000;
  --gray: #535353; --muted: #7b7c81; --track: #e5e7eb; --rule: #c9c9c9;
  --pass: #21954a; --fail: #d45252; --name: #1741ff;
  --dem: #008cff; --rep: #d45252; --ind: #faea70; --ind-text: #b59f00;
  --pill: #e1effc; --vacant: #d6d3cc;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--paper); }
.post {
  width: 1000px; height: 1250px; position: relative; overflow: hidden;
  background: var(--paper); font-family: Inter, -apple-system, "Segoe UI", sans-serif; color: var(--ink);
}

/* Layout: the visual on top, the editorial stack below, as in the
   Bill of the Day posts (748 / 502) */
.top { position: absolute; left: 0; top: 0; width: 1000px; height: var(--top-h, 748px);
  padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.bottom { position: absolute; left: 0; top: var(--top-h, 748px); width: 1000px;
  height: calc(1250px - var(--top-h, 748px)); padding: 24px 28px 0;
  display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }

/* Editorial type */
.kicker { font: 500 24px/39px "DM Mono", monospace; color: var(--blue); text-transform: uppercase; }
.kicker b { font-weight: 500; color: var(--ink); }
/* Inter 600, as on the website; key phrases stand out by color, not weight */
.hl { font-weight: 600; font-size: calc(48px * var(--fit, 1));
  line-height: 1.2; color: var(--gray); letter-spacing: -0.015em; text-wrap: pretty; }
.hl .k { color: var(--ink); }
.hl .n { color: var(--name); }
.hl .p, .hl .pk { color: var(--pass); }
.hl .f, .hl .fk { color: var(--fail); }
.body { font: 500 calc(24px * var(--fit, 1))/1.32 "DM Mono", monospace; color: var(--gray); text-wrap: pretty; }
.footer { display: flex; align-items: center; gap: 24px; padding-bottom: 12px; }
.footer .rule { flex: 1; height: 1px; background: var(--ink); }
.footer .mark { display: flex; align-items: center; gap: 12px; }
.footer img { width: 36px; height: 36px; border-radius: 4px; }
.footer span { font: 500 32px "DM Mono", monospace; letter-spacing: 3.2px; }

/* App-style card with the blue header bar */
.card { background: var(--card); border-radius: 24px; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 4px 4px 4px rgba(0,0,0,.25), -4px 4px 4px rgba(0,0,0,.25); }
.card > .bar { height: 69px; flex: none; background: var(--blue); color: #fff; padding: 0 29px;
  display: flex; align-items: center; justify-content: space-between;
  font: 500 24px "DM Mono", monospace; text-transform: uppercase; }
.card > .bar small { font-size: 18px; opacity: .85; }
.card > .in { flex: 1; padding: 26px 34px; display: flex; flex-direction: column; min-height: 0; }

/* App UI recreations (bill screen, vote card, profile) */
.bill-head { display: flex; gap: 18px; align-items: center; }
/* The policy icons include their own circle */
.bill-head .icon { width: 80px; height: 80px; flex: none; }
.bill-head .icon img { width: 100%; height: 100%; }
.bill-head .meta { font-size: 13px; color: var(--muted); margin-bottom: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bill-head .title { font-size: 16.5px; font-weight: 500; line-height: 1.28; color: #111;
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
.tabs { display: flex; justify-content: space-between; border-bottom: 2px solid #c8c8c8; margin: 24px 0 26px; padding: 0 18px; }
.tabs span { font-size: 17.5px; color: var(--gray); padding-bottom: 11px; }
.tabs span.on { color: #111; font-weight: 500; box-shadow: inset 0 -3px 0 #111; margin-bottom: -2px; }
.stages { display: grid; gap: 4px 4px; padding: 0 2px; }
.stages .lbl { font-size: 11px; font-weight: 600; color: #1a1a1a; white-space: nowrap; }
.stages .lbl.off { font-weight: 400; color: var(--muted); }
.stages .lbl.veto { color: #dc2626; }
.stages .trk { height: 6px; border-radius: 3px; background: #e0e0e0; overflow: hidden; }
.stages .trk i { display: block; height: 100%; background: var(--blue); border-radius: 3px; }
.stages .trk i.veto { background: #dc2626; }
.status { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center; margin-top: 30px; }
.status > b { font-size: 16px; font-weight: 500; }
.status .pill { background: var(--pill); color: var(--blue); border-radius: 8px; padding: 9px 13px;
  font-size: 15.5px; font-weight: 500; line-height: 1.3; }
.jargon { font-size: 13.5px; color: var(--gray); line-height: 1.35; margin: 14px 8px 0; }
.jargon b { font-weight: 600; }
.fields { margin-top: auto; display: grid; gap: 22px; }
.fields div { font-size: 16.5px; }
.fields b { font-weight: 500; margin-right: 8px; }
.fields span { color: var(--gray); }

.vote { background: var(--card); border-radius: 24px; padding: 22px 24px 20px; flex: 1;
  box-shadow: 0 1px 10px rgba(0,0,0,.09); display: flex; flex-direction: column; }
.vote .vh { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.vote .vh b { font-size: 18.5px; font-weight: 500; }
.vote .vh span { border: 1.5px solid #5d5d5d; border-radius: 10px; padding: 7px 16px; font-size: 15.5px; font-weight: 500; white-space: nowrap; }
.vote .res { font-size: 16px; font-weight: 600; margin-top: 20px; line-height: 1.3; }
.vote .row { margin-top: 22px; }
.vote .row .lab { display: flex; justify-content: space-between; font-size: 17.5px; margin-bottom: 8px; }
.vote .row .lab span { color: var(--muted); }
.vote .track { height: 30px; border-radius: 7px; background: var(--track); overflow: hidden; display: flex; }
.vote .track i { height: 100%; }
.vote .cnt { display: flex; gap: 22px; font-size: 13.5px; margin-top: 8px; }
.legend { display: flex; gap: 20px; font-size: 14px; color: var(--gray); margin-top: auto; padding-top: 18px; }
.legend i { display: inline-block; width: 13px; height: 13px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
.c-d { color: var(--dem); } .c-r { color: var(--rep); } .c-i { color: var(--ind-text); }
.b-d { background: var(--dem); } .b-r { background: var(--rep); } .b-i { background: var(--ind); } .b-v { background: var(--vacant); }

.profile .who { font-size: 16px; font-weight: 600; margin: 0 0 18px 4px; }
.profile .id { display: flex; align-items: center; gap: 24px; margin-left: 4px; }
.photo { border-radius: 50%; object-fit: cover; background: #ddd; flex: none; }
.ring-d { box-shadow: 0 0 0 4px var(--dem); } .ring-r { box-shadow: 0 0 0 4px var(--rep); } .ring-i { box-shadow: 0 0 0 4px var(--ind); }
.profile .id b { font-size: 22px; font-weight: 700; display: block; }
.profile .links { font-size: 15px; color: var(--blue); font-weight: 600; margin-top: 6px; display: flex; gap: 26px; }
.sub { font-size: 16.5px; font-weight: 600; margin: 4px 0 12px; }
.note { font-size: 14.5px; color: var(--muted); line-height: 1.4; }
.panel { background: var(--card); border-radius: 22px; box-shadow: 0 1px 10px rgba(0,0,0,.09); padding: 20px 24px; }
.palist { display: grid; gap: 0; }
.palist div { display: grid; grid-template-columns: 22px 1fr auto; align-items: center; font-size: 15px; padding: 14px 0; }
.palist i { width: 13px; height: 13px; border-radius: 50%; }

/* Generic content for custom visuals */
.big { font-weight: 600; line-height: .95; letter-spacing: -0.02em; }
.mono { font-family: "DM Mono", monospace; font-weight: 500; }
.badge { display: inline-block; color: #fff; font: 700 15px Inter, sans-serif; padding: 5px 10px; border-radius: 8px; white-space: nowrap; }
.list-row { display: grid; grid-template-columns: 54px 1fr; gap: 14px; align-items: center; padding: 20px 0; border-bottom: 1px solid #e6e3dc; }
.list-row:last-child { border-bottom: 0; }
.list-row .ic img { width: 54px; height: 54px; display: block; }
.list-row .t { font-size: 16px; font-weight: 600; line-height: 1.25; color: #111; }
.list-row .m { font-size: 13px; color: var(--muted); margin-top: 3px; }
.sample { position: absolute; right: 28px; top: calc(var(--top-h, 748px) + 24px); z-index: 9; background: #fff3c4; color: #7a5b00;
  font: 500 15px "DM Mono", monospace; padding: 6px 12px; border-radius: 8px; border: 1px solid #e0c96a; }
`;

// Shrinks the headline and body together until the editorial stack fits
// its box, so long titles never overflow in automated runs.
const FIT_SCRIPT = `
document.fonts.ready.then(() => {
  for (const box of document.querySelectorAll('.bottom, [data-fit]')) {
    let s = 1;
    while (box.scrollHeight > box.clientHeight + 1 && s > 0.55) {
      s -= 0.025;
      box.style.setProperty('--fit', s.toFixed(3));
    }
  }
});`;

export function page({ top, bottom, topH, css = "", sample = false }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}${css}</style></head><body>
<div class="post" style="${topH ? `--top-h:${topH}px` : ""}">
${sample ? '<div class="sample">SAMPLE DATA</div>' : ""}
${top}
${bottom}
</div><script>${FIT_SCRIPT}</script></body></html>`;
}

// ---------------------------------------------------------------------------
// Editorial stack
// ---------------------------------------------------------------------------

// Headline parts: plain strings are the gray connecting words; [cls, text]
// pairs are k (key phrase, black heavy), n (member name, blue), p / pk
// (passed, green), f / fk (failed, red).
export const hl = (...parts) =>
  `<div class="hl">${parts
    .map((p) => (typeof p === "string" ? esc(p) : `<span class="${p[0]}">${esc(p[1])}</span>`))
    .join("")}</div>`;

export const kicker = (label, id) => `<div class="kicker">${esc(label)}${id ? ` : <b>${esc(id)}</b>` : ""}</div>`;
export const body = (text) => `<div class="body">${esc(text)}</div>`;
export const footer = () =>
  `<div class="footer"><div class="rule"></div><div class="mark"><img src="${LOGO}"><span>UNUM</span></div><div class="rule"></div></div>`;

export const bottom = ({ kicker: k, headline, text }) =>
  `<div class="bottom">${k}${headline}${text ? body(text) : ""}${footer()}</div>`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export const card = ({ label, aside = "", w = 466, h = 702, inner, pad }) =>
  `<div class="card" style="width:${w}px;height:${h}px"><div class="bar"><span>${esc(label)}</span>${aside ? `<small>${esc(aside)}</small>` : ""}</div><div class="in" style="${pad ? `padding:${pad}` : ""}">${inner}</div></div>`;

export const billHead = ({ area, date, id, title }) => `
  <div class="bill-head">
    <div class="icon"><img src="${policyIcon(area)}"></div>
    <div style="min-width:0">
      <div class="meta">${esc(date)}${area ? ` • ${esc(area)}` : ""}</div>
      <div class="title">${esc(id)} - ${esc(title)}</div>
    </div>
  </div>`;

export const tabs = (items, on = 0) =>
  `<div class="tabs">${items.map((t, i) => `<span class="${i === on ? "on" : ""}">${esc(t)}</span>`).join("")}</div>`;

// stages: [{label, fill: 0 | .5 | 1, veto?}]
export const stages = (list, scale = 1) => `
  <div class="stages" style="grid-template-columns:repeat(${list.length},1fr);${scale !== 1 ? `zoom:${scale}` : ""}">
    ${list.map((s) => `<div class="lbl ${s.fill ? "" : "off"} ${s.veto ? "veto" : ""}">${esc(s.label)}</div>`).join("")}
    ${list.map((s) => `<div class="trk"><i class="${s.veto ? "veto" : ""}" style="width:${s.fill * 100}%"></i></div>`).join("")}
  </div>`;

export const status = (text) => `<div class="status"><b>Status:</b><div class="pill">${esc(text)}</div></div>`;
export const jargon = (term, def) => `<div class="jargon"><b>${esc(term)}</b> · ${esc(def)}</div>`;
export const fields = (rows) =>
  `<div class="fields">${rows.map(([k, v]) => `<div><b>${esc(k)}:</b><span>${esc(v)}</span></div>`).join("")}</div>`;

const pct = (n, t) => (t ? (n / t) * 100 : 0);

// vote: { chamber, date, result, passed, yea:{d,r,i}, nay:{...}, nv:{...}, total, jargon? }
export function voteCard(v, { jargonHtml = "", showNv = true } = {}) {
  const sum = (o) => o.d + o.r + o.i;
  const total = v.total ?? sum(v.yea) + sum(v.nay) + sum(v.nv);
  const row = (label, o) => {
    const n = sum(o);
    return `<div class="row">
      <div class="lab">${label} (${n})<span>${Math.round(pct(n, total))}%</span></div>
      <div class="track"><i class="b-d" style="width:${pct(o.d, total)}%"></i><i class="b-r" style="width:${pct(o.r, total)}%"></i><i class="b-i" style="width:${pct(o.i, total)}%"></i></div>
      <div class="cnt"><span class="c-d">D: ${o.d}</span><span class="c-r">R: ${o.r}</span>${o.i ? `<span class="c-i">I: ${o.i}</span>` : ""}</div>
    </div>`;
  };
  return `<div class="vote">
    <div class="vh"><b>${esc(v.chamber)} · ${esc(v.date)}</b><span>See all votes (${total})</span></div>
    <div class="res" style="color:var(${v.passed ? "--pass" : "--fail"})">${esc(v.result)}</div>
    ${jargonHtml}
    ${row("Yea", v.yea)}${row("Nay", v.nay)}${showNv ? row("Not Voting", v.nv) : ""}
    <div class="legend"><span><i class="b-d"></i>Democrat</span><span><i class="b-r"></i>Republican</span><span><i class="b-i"></i>Independent</span></div>
  </div>`;
}

export const partyClass = (p) => ({ D: "d", R: "r", I: "i" })[p] || "i";

export const photo = (m, size, ring = true) =>
  `<img class="photo ${ring ? `ring-${partyClass(m.party)}` : ""}" src="${esc(m.photo)}" style="width:${size}px;height:${size}px">`;

export function profileCard(m, { areas, lawsText }) {
  return `<div class="profile">
    <div class="who">${esc(m.party)} · ${esc(m.roleLine)}</div>
    <div class="id">${photo(m, 76)}<div><b>${esc(m.display)}</b><div class="links"><span>Website</span><span>Contact</span></div></div></div>
    ${tabs(["Profile", "Bio", "Sponsor", "Cosponsor"])}
    <div class="sub" style="margin-left:18px">Bills Signed Into Law (2025 - )</div>
    <div class="note" style="margin:0 18px 22px">${esc(lawsText)}</div>
    <div class="panel" style="margin:0 6px">
      <div class="sub">Top Policy Areas (2025 - )</div>
      <div class="palist">${areas
        .map((a) => `<div><i style="background:${policyColor(a.name)}"></i><span>${esc(a.name)}</span><span>${a.count} bills</span></div>`)
        .join("")}</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

// Half-circle seat chart. groups: [{n, cls}] in left-to-right order.
export function hemicycle(groups, { width = 400, rows = 8, dot = 0, inner = 0.4 } = {}) {
  const N = groups.reduce((a, g) => a + g.n, 0);
  const R = width / 2 - 8;
  const radii = [...Array(rows)].map((_, i) => inner + ((1 - inner) * i) / (rows - 1));
  const sumR = radii.reduce((a, r) => a + r, 0);
  const counts = radii.map((r) => Math.floor((N * r) / sumR));
  let left = N - counts.reduce((a, c) => a + c, 0);
  for (let i = rows - 1; left > 0; i = (i - 1 + rows) % rows, left--) counts[i]++;
  const seats = [];
  radii.forEach((r, i) => {
    const n = counts[i];
    for (let k = 0; k < n; k++) {
      const a = Math.PI * (1 - (n === 1 ? 0.5 : k / (n - 1)));
      seats.push({ a, x: width / 2 + R * r * Math.cos(a), y: R + 4 - R * r * Math.sin(a) });
    }
  });
  seats.sort((p, q) => q.a - p.a);
  const d = dot || Math.max(2.5, (R * (1 - inner)) / rows / 2.4);
  let gi = 0, used = 0;
  const circles = seats.map((s) => {
    while (used >= groups[gi].n) { gi++; used = 0; }
    used++;
    return `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${d.toFixed(1)}" fill="${groups[gi].fill}"/>`;
  });
  return `<svg width="${width}" height="${R + 6 + d}" viewBox="0 0 ${width} ${R + 6 + d}">${circles.join("")}</svg>`;
}

// Grid of dots, one per member, filled in order. groups: [{n, fill, ring?}]
export function dotGrid(groups, { cols, size = 12, gap = 4 }) {
  const all = groups.flatMap((g) => Array(g.n).fill(g));
  const rows = Math.ceil(all.length / cols);
  const step = size + gap;
  const dots = all.map((g, i) => {
    const x = (i % cols) * step + size / 2, y = Math.floor(i / cols) * step + size / 2;
    return g.ring
      ? `<circle cx="${x}" cy="${y}" r="${size / 2 - 1}" fill="none" stroke="${g.ring}" stroke-width="2"/>`
      : `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${g.fill}"/>`;
  });
  return `<svg width="${cols * step - gap}" height="${rows * step - gap}">${dots.join("")}</svg>`;
}
