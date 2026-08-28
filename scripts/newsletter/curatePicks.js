#!/usr/bin/env node
/**
 * Unum Newsletter Feature Builder
 * --------------------------------
 * WHERE THIS FILE LIVES:
 *   scripts/newsletter/curatePicks.js
 *
 * HOW TO RUN IT (from the repo root):
 *   node scripts/newsletter/curatePicks.js hr6644 s269 sjres80
 *
 * WHAT IT DOES:
 *   Takes the bill IDs you picked from a generateDigest.js scan-and-pick
 *   list (each entry there includes one, e.g. `hr6644`) and builds a
 *   detailed, sourced writeup for just those bills — sponsor, cosponsor
 *   count, official CRS summary, and a timeline of every significant action
 *   in the bill's history (introduced, passed a chamber, sent to the
 *   president, signed into law). Writes a Markdown draft to
 *   scripts/newsletter/features/.
 *
 * WHAT IT DOES NOT DO:
 *   Write your commentary. It gathers everything sourced; you decide what
 *   it means and explain why it matters.
 *
 * REQUIREMENTS:
 *   - Node 18+ (uses built-in fetch — no packages to install)
 *   - CONGRESS_API_KEY, either in backend/.env or passed inline:
 *       CONGRESS_API_KEY=yourkey node scripts/newsletter/curatePicks.js hr6644
 *
 * This is a standalone local utility, like generateDigest.js and the other
 * scripts in this folder. It is not wired into the Express app, any Railway
 * cron, or the deploy process — it only ever runs when you run it by hand.
 */

const fs = require('fs');
const path = require('path');

const {
  API_BASE,
  API_KEY,
  BUCKETS,
  fetchJson,
  sleep,
  prettyBillType,
  billUrl,
} = require('./generateDigest.js');

const FEATURES_DIR = path.join(__dirname, 'features');

/** "hr6644" -> { type: "hr", number: "6644" } */
function parseBillId(raw) {
  const match = raw.trim().toLowerCase().match(/^([a-z]+)(\d+)$/);
  if (!match) return null;
  return { type: match[1], number: match[2] };
}

/** Strips the basic HTML CRS summaries come wrapped in, down to plain text. */
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Strips inline HTML tags (e.g. discharge-petition links) some action text carries. */
function stripTags(text) {
  return text.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim();
}

/** Every bucket a bill's action history matched, in chronological order. */
function buildTimeline(actions, introducedDate) {
  const timeline = [];
  if (introducedDate) {
    timeline.push({ date: introducedDate, text: 'Introduced' });
  }
  const sorted = [...actions].sort((a, b) => a.actionDate.localeCompare(b.actionDate));
  const seen = new Set();
  for (const action of sorted) {
    const text = stripTags((action.text || '').trim());
    const hit = BUCKETS.find((b) => b.patterns.some((p) => p.test(text)));
    if (!hit) continue;
    // The /actions endpoint returns exact duplicate rows for some actions
    // (e.g. "Presented to President" often appears twice) — same date and
    // text, so dedupe on that pair rather than trusting the API's own list.
    const dedupeKey = `${action.actionDate}|${text}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    timeline.push({ date: action.actionDate, text });
  }
  return timeline;
}

async function fetchBillFeature(billId, congress) {
  const parsed = parseBillId(billId);
  if (!parsed) {
    throw new Error(`Couldn't parse "${billId}" as a bill ID (expected e.g. "hr6644" or "sjres80")`);
  }
  const { type, number } = parsed;

  const detail = await fetchJson(`${API_BASE}/bill/${congress}/${type}/${number}?format=json&api_key=${API_KEY}`);
  const bill = detail.bill;
  if (!bill) {
    throw new Error(`No bill found for ${billId} in the ${congress}th Congress`);
  }
  await sleep(250);

  const [cosponsorsRes, summariesRes, actionsRes] = await Promise.all([
    fetchJson(`${API_BASE}/bill/${congress}/${type}/${number}/cosponsors?limit=1&format=json&api_key=${API_KEY}`),
    fetchJson(`${API_BASE}/bill/${congress}/${type}/${number}/summaries?format=json&api_key=${API_KEY}`),
    fetchJson(`${API_BASE}/bill/${congress}/${type}/${number}/actions?limit=250&format=json&api_key=${API_KEY}`),
  ]);
  await sleep(250);

  const cosponsorCount = cosponsorsRes.pagination?.count ?? 0;
  const summaries = summariesRes.summaries || [];
  const latestSummary = summaries.length ? stripHtml(summaries[summaries.length - 1].text || '') : '';
  const timeline = buildTimeline(actionsRes.actions || [], bill.introducedDate);

  return {
    billId,
    type,
    number,
    congress,
    title: bill.title || '(no title provided)',
    // fullName from the API already reads like "Rep. Hill, J. French [R-AR-2]"
    // — party/district are baked in, so nothing needs appending here.
    sponsor: bill.sponsors?.[0]?.fullName?.trim() || '',
    cosponsorCount,
    policyArea: bill.policyArea?.name || '',
    introducedDate: bill.introducedDate || '',
    latestAction: bill.latestAction
      ? { actionDate: bill.latestAction.actionDate, text: stripTags(bill.latestAction.text || '') }
      : null,
    summary: latestSummary,
    timeline,
    link: billUrl(congress, type, number),
  };
}

async function main() {
  if (!API_KEY) {
    console.error('\n  ERROR: CONGRESS_API_KEY is not set.');
    console.error('  Add it to backend/.env, or run:');
    console.error('     CONGRESS_API_KEY=yourkey node scripts/newsletter/curatePicks.js <billId> ...\n');
    process.exit(1);
  }

  const billIds = process.argv.slice(2);
  if (billIds.length === 0) {
    console.error('\n  Usage: node scripts/newsletter/curatePicks.js <billId> <billId> ...');
    console.error('  Example: node scripts/newsletter/curatePicks.js hr6644 s269 sjres80\n');
    process.exit(1);
  }

  console.log(`\n  Unum Newsletter Feature Builder`);
  console.log(`  Building detailed writeups for: ${billIds.join(', ')}\n`);

  const congressRes = await fetchJson(`${API_BASE}/congress/current?format=json&api_key=${API_KEY}`);
  const congress = congressRes.congress?.number;
  if (!congress) {
    throw new Error("Couldn't determine the current Congress number");
  }

  const features = [];
  for (const billId of billIds) {
    try {
      console.log(`  Fetching ${billId}...`);
      features.push(await fetchBillFeature(billId, congress));
    } catch (err) {
      console.warn(`     Skipped ${billId}: ${err.message}`);
    }
  }

  if (features.length === 0) {
    console.error('\n  No bills could be fetched — nothing to write.\n');
    process.exit(1);
  }

  const lines = [];
  lines.push(`# Unum Feature Draft`);
  lines.push('');
  lines.push('<!-- Everything below is sourced from Congress.gov. Write your');
  lines.push('     plain-language explanation for each bill, then trim this');
  lines.push('     down to whatever you actually publish. -->');
  lines.push('');

  for (const f of features) {
    const label = `${prettyBillType(f.type)} ${f.number}`;
    lines.push(`## ${label} - ${f.title}`);
    lines.push('');
    if (f.sponsor) lines.push(`- **Sponsor:** ${f.sponsor}`);
    lines.push(`- **Cosponsors:** ${f.cosponsorCount}`);
    if (f.policyArea) lines.push(`- **Policy area:** ${f.policyArea}`);
    if (f.introducedDate) lines.push(`- **Introduced:** ${f.introducedDate}`);
    if (f.latestAction) {
      lines.push(`- **Latest action (${f.latestAction.actionDate}):** ${f.latestAction.text}`);
    }
    lines.push(`- **Source:** ${f.link}`);
    lines.push('');

    if (f.timeline.length) {
      lines.push('**Timeline:**');
      lines.push('');
      for (const t of f.timeline) {
        lines.push(`- ${t.date}: ${t.text}`);
      }
      lines.push('');
    }

    if (f.summary) {
      lines.push('**Official summary:**');
      lines.push('');
      lines.push(f.summary);
      lines.push('');
    }

    lines.push('_Your plain-language explanation goes here._');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(`_Generated ${new Date().toISOString()} from the Congress.gov API._`);
  lines.push('');

  if (!fs.existsSync(FEATURES_DIR)) {
    fs.mkdirSync(FEATURES_DIR, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `feature-${today}.md`;
  const outPath = path.join(FEATURES_DIR, filename);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(`\n  Done. ${features.length} of ${billIds.length} bill(s) written.`);
  console.log(`  Draft written to: scripts/newsletter/features/${filename}\n`);
}

main().catch((err) => {
  console.error('\n  Script failed:', err.message);
  console.error('  If this is a network or API error, try again in a minute.\n');
  process.exit(1);
});
