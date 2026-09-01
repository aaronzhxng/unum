#!/usr/bin/env node
/**
 * Unum Bill Card Generator
 * -------------------------
 * WHERE THIS FILE LIVES:
 *   scripts/newsletter/generateCard.js
 *
 * HOW TO RUN IT (from the repo root):
 *   node scripts/newsletter/generateCard.js hr10138 --summary "Your tailored summary here"
 *
 * WHAT IT DOES:
 *   Takes one bill ID and a summary you write, and renders a newsletter-
 *   width PNG card for it, matching the app's own visual language:
 *     Line 1: colored badge (bill number) + the bill's name, truncated to
 *             one line if it's long
 *     Line 2: policy-area icon + policy area + sponsor
 *     Line 3: your summary (1-3 lines)
 *     Line 4: the exact same stage-progress bar as app/bill/[id].tsx, plus —
 *             for any stage with a recorded roll-call vote — the same
 *             party-breakdown vote bars as that page's Voting tab, showing
 *             only the final (non-procedural) vote per chamber.
 *   Colors/icons come from app/(tabs)/legislation.tsx's POLICY_AREA_COLORS
 *   and app/utils/billIcons.ts's icon set. Stage logic is ported from
 *   app/bill/[id].tsx's getBillStages/getStageLabels. Vote data comes from
 *   the same backend endpoint the app itself calls
 *   (unum-production.up.railway.app/api/bills/:id/votes), so figures match
 *   what's shown in the app exactly. Writes one PNG to
 *   scripts/newsletter/cards/.
 *
 * WHAT IT DOES NOT DO:
 *   Generate an AI image, or write your summary for you — that's the point
 *   of taking it as input instead of fetching/generating one.
 *
 * REQUIREMENTS:
 *   - Node 18+ (uses built-in fetch — no packages to install)
 *   - CONGRESS_API_KEY, either in backend/.env or passed inline
 *   - puppeteer (already a root-level dependency, used the same way by
 *     scrape-bioguide.js — nothing extra to install)
 *
 * This is a standalone local utility, like the other scripts in this
 * folder. It is not wired into the Express app, any Railway cron, or the
 * deploy process — it only ever runs when you run it by hand.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { API_BASE, API_KEY, fetchJson, prettyBillType, billUrl } = require('./generateDigest.js');

const CARDS_DIR = path.join(__dirname, 'cards');
const CARD_WIDTH = 600;
// Margin around the card in the screenshot, so the box-shadow has room to
// render on all four sides instead of being clipped at the card's own edge.
const SHADOW_MARGIN = 24;
const BACKEND_URL = 'https://unum-production.up.railway.app';

// Mirrors app/(tabs)/legislation.tsx's POLICY_AREA_COLORS exactly.
const POLICY_AREA_COLORS = {
  'Agriculture and Food': '#7CB342',
  Animals: '#8D6E63',
  'Armed Forces and National Security': '#455A64',
  'Arts, Culture, Religion': '#AB47BC',
  'Civil Rights and Liberties, Minority Issues': '#E53935',
  Commerce: '#00ACC1',
  Congress: '#1565C0',
  'Crime and Law Enforcement': '#424242',
  'Economics and Public Finance': '#4CAF82',
  Education: '#F5A623',
  'Emergency Management': '#FF5722',
  Energy: '#E67E22',
  'Environmental Protection': '#43A047',
  Families: '#F06292',
  'Finance and Financial Sector': '#4CAF82',
  'Foreign Trade and International Finance': '#9B59B6',
  'Government Operations and Politics': '#6B7FD4',
  Health: '#E53935',
  'Housing and Community Development': '#FF8F00',
  Immigration: '#00897B',
  'International Affairs': '#1E88E5',
  'Labor and Employment': '#6D4C41',
  Law: '#546E7A',
  'Native Americans': '#BF360C',
  'Public Lands and Natural Resources': '#27AE60',
  'Science, Technology, Communications': '#0288D1',
  'Social Welfare': '#E91E8C',
  'Sports and Recreation': '#00BCD4',
  Taxation: '#F9A825',
  'Transportation and Public Works': '#5C6BC0',
  'Water Resources Development': '#0277BD',
};
const DEFAULT_COLOR = '#008CFF';

// Mirrors app/utils/billIcons.ts's BILL_ICON_MAP filenames.
const POLICY_AREA_ICON_FILES = {
  'Agriculture and Food': 'agriculture.png',
  Animals: 'animals.png',
  'Armed Forces and National Security': 'armed-forces.png',
  'Arts, Culture, Religion': 'arts.png',
  'Civil Rights and Liberties, Minority Issues': 'civil-rights.png',
  Commerce: 'commerce.png',
  Congress: 'congress.png',
  'Crime and Law Enforcement': 'crime.png',
  'Economics and Public Finance': 'economics.png',
  Education: 'education.png',
  'Emergency Management': 'emergency.png',
  Energy: 'energy.png',
  'Environmental Protection': 'environment.png',
  Families: 'families.png',
  'Finance and Financial Sector': 'finance.png',
  'Foreign Trade and International Finance': 'foreign-trade.png',
  'Government Operations and Politics': 'government.png',
  Health: 'health.png',
  'Housing and Community Development': 'housing.png',
  Immigration: 'immigration.png',
  'International Affairs': 'international.png',
  'Labor and Employment': 'labor.png',
  Law: 'law.png',
  'Native Americans': 'native-americans.png',
  'Public Lands and Natural Resources': 'public-lands.png',
  'Science, Technology, Communications': 'science.png',
  'Social Welfare': 'social-welfare.png',
  'Sports and Recreation': 'sports.png',
  Taxation: 'taxation.png',
  'Transportation and Public Works': 'transportation.png',
  'Water Resources Development': 'water.png',
};
const ICONS_DIR = path.join(__dirname, '..', '..', 'assets', 'bills_icons');

function iconDataUri(policyArea) {
  const filename = POLICY_AREA_ICON_FILES[policyArea] || 'default.png';
  const data = fs.readFileSync(path.join(ICONS_DIR, filename)).toString('base64');
  return `data:image/png;base64,${data}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Stage logic — ported directly from app/bill/[id].tsx's getBillStages /
// getStageLabels, operating on plain type + action-text data instead of a
// bill object with React state around it.
// ---------------------------------------------------------------------------

function isVetoStatus(s) {
  return s === 'vetoed' || s === 'pocket_vetoed' || s === 'veto_sustained';
}

function getBillStages(type, latestActionText, actionTexts) {
  const allTexts = [latestActionText, ...actionTexts].filter(Boolean).map((t) => t.toLowerCase());
  const any = (keyword) => allTexts.some((a) => a.includes(keyword));

  if (type === 'HRES' || type === 'SRES') {
    if (any('passed') || any('agreed to')) return ['full', 'full'];
    return ['full', 'half'];
  }
  if (type === 'HCONRES') {
    if (any('passed senate') || any('agreed to in senate')) return ['full', 'full', 'full'];
    if (any('passed house') || any('agreed to in house')) return ['full', 'full', 'half'];
    return ['full', 'half', 'empty'];
  }
  if (type === 'SCONRES') {
    if (any('passed house') || any('agreed to in house')) return ['full', 'full', 'full'];
    if (any('passed senate') || any('agreed to in senate')) return ['full', 'full', 'half'];
    return ['full', 'half', 'empty'];
  }
  if (type === 'PN') {
    if (any('confirmed')) return ['full', 'full', 'full'];
    if (any('committee') || any('hearing')) return ['full', 'full', 'half'];
    return ['full', 'half', 'empty'];
  }
  if (type === 'TREATY') {
    if (any('ratified')) return ['full', 'full', 'full'];
    if (any('committee') || any('hearing')) return ['full', 'full', 'half'];
    return ['full', 'half', 'empty'];
  }

  if (any('became public law') || any('signed by president') || any('veto overridden'))
    return ['full', 'full', 'full', 'full'];
  if (any('pocket veto')) return ['full', 'full', 'full', 'pocket_vetoed'];
  if (any('veto sustained') || any('override failed') || any('failed to override'))
    return ['full', 'full', 'full', 'veto_sustained'];
  if (any('vetoed by president')) return ['full', 'full', 'full', 'vetoed'];
  if (any('presented to president') || any('to president')) return ['full', 'full', 'full', 'half'];

  if (type?.startsWith('H')) {
    if (any('passed senate') || any('senate passed')) return ['full', 'full', 'full', 'half'];
    if (any('passed house') || any('passed/agreed to in house') || any('on passage passed'))
      return ['full', 'full', 'half', 'empty'];
    if (any('senate')) return ['full', 'full', 'half', 'empty'];
    return ['full', 'half', 'empty', 'empty'];
  }
  if (type?.startsWith('S')) {
    if (any('passed house') || any('house passed')) return ['full', 'full', 'full', 'half'];
    if (any('passed senate') || any('passed/agreed to in senate') || any('on passage passed'))
      return ['full', 'full', 'half', 'empty'];
    if (any('house')) return ['full', 'full', 'half', 'empty'];
    return ['full', 'half', 'empty', 'empty'];
  }
  return ['full', 'half', 'empty', 'empty'];
}

function getStageLabels(type, stages, latestActionText, actionTexts) {
  if (type === 'HRES') return ['Introduced', stages[1] === 'full' ? 'Passed House' : 'In House'];
  if (type === 'SRES') return ['Introduced', stages[1] === 'full' ? 'Passed Senate' : 'In Senate'];
  if (type === 'HCONRES')
    return [
      'Introduced',
      stages[1] === 'full' ? 'Passed House' : 'In House',
      stages[2] === 'full' ? 'Passed Senate' : 'In Senate',
    ];
  if (type === 'SCONRES')
    return [
      'Introduced',
      stages[1] === 'full' ? 'Passed Senate' : 'In Senate',
      stages[2] === 'full' ? 'Passed House' : 'In House',
    ];
  if (type === 'PN')
    return ['Received', 'In Committee', stages[2] === 'full' ? 'Confirmed' : 'Pending'];
  if (type === 'TREATY')
    return ['Received', 'In Committee', stages[2] === 'full' ? 'Ratified' : 'Pending'];

  const presidentLabel = (() => {
    const s = stages[3];
    if (s === 'vetoed') return 'Vetoed';
    if (s === 'pocket_vetoed') return 'Pocket Vetoed';
    if (s === 'veto_sustained') return 'Veto Sustained';
    if (s === 'full') {
      const texts = [latestActionText, ...actionTexts].filter(Boolean).map((t) => t.toLowerCase());
      if (texts.some((t) => t.includes('veto overridden'))) return 'Veto Overridden';
      return 'Signed Into Law';
    }
    return 'To President';
  })();

  if (type?.startsWith('S'))
    return [
      'Introduced',
      stages[1] === 'full' ? 'Passed Senate' : 'In Senate',
      stages[2] === 'full' ? 'Passed House' : 'In House',
      presidentLabel,
    ];
  return [
    'Introduced',
    stages[1] === 'full' ? 'Passed House' : 'In House',
    stages[2] === 'full' ? 'Passed Senate' : 'In Senate',
    presidentLabel,
  ];
}

function renderStagesHtml(type, stages, labels) {
  const labelCells = labels
    .map((label, i) => {
      const status = stages[i];
      const isVeto = isVetoStatus(status);
      const color = isVeto ? '#FF3B30' : status === 'empty' ? '#7B7C81' : '#1a1a1a';
      const weight = status === 'empty' ? '400' : '600';
      return `<div style="flex:1;font-size:11px;color:${color};font-weight:${weight};padding-right:4px;">${escapeHtml(label)}</div>`;
    })
    .join('');
  const barCells = stages
    .map((status) => {
      const isVeto = isVetoStatus(status);
      const width = status === 'full' || isVeto ? '100%' : status === 'half' ? '50%' : '0%';
      const fill = isVeto ? '#FF3B30' : '#008CFF';
      return `<div style="flex:1;height:6px;border-radius:3px;background:#e0e0e0;overflow:hidden;"><div style="height:100%;width:${width};background:${fill};border-radius:3px;"></div></div>`;
    })
    .join('<div style="width:3px;"></div>');
  return `
    <div style="display:flex;margin-bottom:4px;">${labelCells}</div>
    <div style="display:flex;">${barCells}</div>
  `;
}

// ---------------------------------------------------------------------------
// Vote bars — ported from app/bill/bill_components/VotingCard.tsx's
// PartyBar/SingleVoteCard, rendering only the final (non-procedural) vote
// per chamber.
// ---------------------------------------------------------------------------

const PROCEDURAL_VOTE_PATTERN = /cloture|motion to (proceed|commit|recommit|discharge|table)|quorum/i;

function pickFinalVotesPerChamber(votes) {
  const substantive = votes.filter(
    (v) => !PROCEDURAL_VOTE_PATTERN.test(v.result || '') && !PROCEDURAL_VOTE_PATTERN.test(v.question || ''),
  );
  const byChamber = {};
  for (const v of substantive) {
    const existing = byChamber[v.chamber];
    if (!existing || new Date(v.date) > new Date(existing.date)) byChamber[v.chamber] = v;
  }
  return Object.values(byChamber);
}

function renderPartyBar(label, total, demCount, repCount, indCount, grandTotal) {
  const pct = (n) => Math.round((n / grandTotal) * 100);
  const percent = pct(total);
  return `
    <div style="flex:1;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#000;margin-bottom:5px;">
        <span>${escapeHtml(label)} (${total})</span>
        <span style="color:#7B7C81;">${percent}%</span>
      </div>
      <div style="height:20px;background:#E5E7EB;border-radius:6px;overflow:hidden;position:relative;">
        <div style="position:absolute;left:0;top:0;height:100%;width:${pct(demCount)}%;background:#008CFF;"></div>
        <div style="position:absolute;left:${pct(demCount)}%;top:0;height:100%;width:${pct(repCount)}%;background:#D45252;"></div>
        <div style="position:absolute;left:${pct(demCount) + pct(repCount)}%;top:0;height:100%;width:${pct(indCount)}%;background:#FAEA70;"></div>
      </div>
    </div>
  `;
}

function renderVoteSection(vote) {
  const grandTotal = vote.total.yea + vote.total.nay + vote.total.present + vote.total.notVoting || 1;
  const resultColor = /pass|agreed/i.test(vote.result || '')
    ? '#16a34a'
    : /fail|rejected/i.test(vote.result || '')
      ? '#dc2626'
      : '#535353';

  return `
    <div style="background:#ffffff;border-radius:12px;padding:14px;margin-top:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:700;color:#1a1a1a;">${escapeHtml(vote.chamber)} · ${formatDate(vote.date)}</span>
        <span style="font-size:12px;font-weight:600;color:${resultColor};">${escapeHtml(vote.result || '')}</span>
      </div>
      <div style="display:flex;gap:16px;">
        ${renderPartyBar('Yea', vote.total.yea, vote.democratic.yea, vote.republican.yea, vote.independent.yea, grandTotal)}
        ${renderPartyBar('Nay', vote.total.nay, vote.democratic.nay, vote.republican.nay, vote.independent.nay, grandTotal)}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Card assembly
// ---------------------------------------------------------------------------

function baseStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fff; }
    .wrapper { display: inline-block; padding: ${SHADOW_MARGIN}px; background: #fff; }
    .card { width: ${CARD_WIDTH}px; background: #fafafa; border-radius: 24px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
    .line1 { display: flex; align-items: center; margin-bottom: 16px; min-width: 0; }
    .badge { flex-shrink: 0; color: #fff; font-size: 13px; font-weight: 700; padding: 5px 10px; border-radius: 8px; margin-right: 10px; white-space: nowrap; }
    .title { flex: 1; min-width: 0; font-size: 18px; font-weight: 700; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .line2 { display: flex; align-items: center; margin-bottom: 18px; }
    .icon { width: 36px; height: 36px; border-radius: 6px; margin-right: 8px; flex-shrink: 0; }
    .sponsor-photo { width: 28px; height: 28px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; object-fit: cover; }
    .policy-area { font-size: 13px; font-weight: 600; }
    .sep { color: #7B7C81; margin: 0 6px; font-size: 13px; }
    .sponsor { font-size: 13px; color: #7B7C81; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .summary { font-size: 14px; color: #535353; line-height: 1.5; margin-bottom: 22px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .stages { margin-bottom: 4px; }
  `;
}

function buildCardHtml(f) {
  const color = POLICY_AREA_COLORS[f.policyArea] || DEFAULT_COLOR;
  const stages = getBillStages(f.type, f.latestAction?.text, f.actionTexts);
  const labels = getStageLabels(f.type, stages, f.latestAction?.text, f.actionTexts);
  const voteSections = pickFinalVotesPerChamber(f.votes).map(renderVoteSection).join('');

  const body = `
    <div class="wrapper">
      <div class="card">
        <div class="line1">
          <div class="badge" style="background:${color}">${escapeHtml(prettyBillType(f.type))} ${escapeHtml(f.number)}</div>
          <div class="title">${escapeHtml(f.title)}</div>
        </div>
        <div class="line2">
          ${f.policyArea ? `<img class="icon" src="${iconDataUri(f.policyArea)}" />` : ''}
          ${f.policyArea ? `<span class="policy-area" style="color:${color}">${escapeHtml(f.policyArea)}</span>` : ''}
          ${f.sponsor ? `${f.policyArea ? '<span class="sep">·</span>' : ''}${f.sponsorPhoto ? `<img class="sponsor-photo" src="${f.sponsorPhoto}" />` : ''}<span class="sponsor">${escapeHtml(f.sponsor)}</span>` : ''}
        </div>
        <div class="summary">${escapeHtml(f.summary)}</div>
        <div class="stages">
          ${renderStagesHtml(f.type, stages, labels)}
          ${voteSections}
        </div>
      </div>
    </div>
  `;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyles()}</style></head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/** "hr6644" -> { type: "hr", number: "6644" } */
function parseBillId(raw) {
  const match = raw.trim().toLowerCase().match(/^([a-z]+)(\d+)$/);
  if (!match) return null;
  return { type: match[1], number: match[2] };
}

async function fetchCardData(billId, congress, summary) {
  const parsed = parseBillId(billId);
  if (!parsed) throw new Error(`Couldn't parse "${billId}" as a bill ID (expected e.g. "hr6644" or "sjres80")`);
  const { type, number } = parsed;

  const detail = await fetchJson(`${API_BASE}/bill/${congress}/${type}/${number}?format=json&api_key=${API_KEY}`);
  const bill = detail.bill;
  if (!bill) throw new Error(`No bill found for ${billId} in the ${congress}th Congress`);

  const actionsRes = await fetchJson(
    `${API_BASE}/bill/${congress}/${type}/${number}/actions?limit=250&format=json&api_key=${API_KEY}`,
  );
  const actionTexts = (actionsRes.actions || []).map((a) => a.text).filter(Boolean);

  let votes = [];
  try {
    const votesRes = await fetch(`${BACKEND_URL}/api/bills/${billId}/votes?congress=${congress}`);
    if (votesRes.ok) {
      const votesData = await votesRes.json();
      votes = votesData.votes || [];
    }
  } catch (err) {
    console.warn(`     (couldn't fetch vote data: ${err.message})`);
  }

  let sponsorPhoto = '';
  const bioguideId = bill.sponsors?.[0]?.bioguideId;
  if (bioguideId) {
    try {
      const memberRes = await fetchJson(`${API_BASE}/member/${bioguideId}?format=json&api_key=${API_KEY}`);
      const imageUrl = memberRes.member?.depiction?.imageUrl;
      if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          sponsorPhoto = `data:${contentType};base64,${buf.toString('base64')}`;
        }
      }
    } catch (err) {
      console.warn(`     (couldn't fetch sponsor photo: ${err.message})`);
    }
  }

  return {
    type: bill.type.toUpperCase(),
    number: bill.number,
    congress,
    title: bill.title || '(no title provided)',
    sponsor: bill.sponsors?.[0]?.fullName?.trim() || '',
    sponsorPhoto,
    policyArea: bill.policyArea?.name || '',
    latestAction: bill.latestAction || null,
    actionTexts,
    votes,
    summary,
    link: billUrl(congress, type, number),
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const summaryIdx = argv.indexOf('--summary');
  if (summaryIdx === -1) return { billId: argv[0], summary: null };
  const billId = argv.find((a, i) => i !== summaryIdx && i !== summaryIdx + 1 && !a.startsWith('--'));
  return { billId, summary: argv[summaryIdx + 1] };
}

async function main() {
  if (!API_KEY) {
    console.error('\n  ERROR: CONGRESS_API_KEY is not set.');
    console.error('  Add it to backend/.env, or run:');
    console.error('     CONGRESS_API_KEY=yourkey node scripts/newsletter/generateCard.js <billId> --summary "..."\n');
    process.exit(1);
  }

  const { billId, summary } = parseArgs(process.argv.slice(2));
  if (!billId || !summary) {
    console.error('\n  Usage: node scripts/newsletter/generateCard.js <billId> --summary "Your summary text"');
    console.error('  Example: node scripts/newsletter/generateCard.js hr10138 --summary "This bill would..."\n');
    process.exit(1);
  }

  console.log(`\n  Unum Bill Card Generator`);
  console.log(`  Building card for: ${billId}\n`);

  const congressRes = await fetchJson(`${API_BASE}/congress/current?format=json&api_key=${API_KEY}`);
  const congress = congressRes.congress?.number;
  if (!congress) throw new Error("Couldn't determine the current Congress number");

  if (!fs.existsSync(CARDS_DIR)) fs.mkdirSync(CARDS_DIR, { recursive: true });

  const f = await fetchCardData(billId, congress, summary);
  const html = buildCardHtml(f);

  const viewportWidth = CARD_WIDTH + SHADOW_MARGIN * 2;
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: viewportWidth, height: 800 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const height = await page.evaluate(() => document.querySelector('.wrapper').getBoundingClientRect().height);
    await page.setViewport({ width: viewportWidth, height: Math.ceil(height) });

    const outPath = path.join(CARDS_DIR, `${billId}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: viewportWidth, height: Math.ceil(height) } });
    await page.close();

    console.log(`  Written: scripts/newsletter/cards/${billId}.png\n`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\n  Script failed:', err.message);
  console.error('  If this is a network or API error, try again in a minute.\n');
  process.exit(1);
});
