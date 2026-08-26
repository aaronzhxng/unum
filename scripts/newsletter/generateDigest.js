#!/usr/bin/env node
/**
 * Unum Weekly Digest Generator
 * ----------------------------
 * WHERE THIS FILE LIVES:
 *   scripts/newsletter/generateDigest.js
 *
 * HOW TO RUN IT (from the repo root):
 *   node scripts/newsletter/generateDigest.js
 *
 * Optional: generate a digest for an older week (1 = last week, 2 = two weeks ago)
 *   node scripts/newsletter/generateDigest.js --weeks-ago 1
 *
 * WHAT IT DOES:
 *   Pulls every bill whose status changed in the last 7 days from the
 *   Congress.gov API, sorts them into buckets by how far they got, and writes
 *   a Markdown draft to scripts/newsletter/output/.
 *
 * WHAT IT DOES NOT DO:
 *   Write your commentary. It gathers; you decide what matters and explain why.
 *
 * REQUIREMENTS:
 *   - Node 18+ (uses built-in fetch — no packages to install)
 *   - CONGRESS_API_KEY, either in backend/.env or passed inline:
 *       CONGRESS_API_KEY=yourkey node scripts/newsletter/generateDigest.js
 *
 * This is a standalone local utility, like the other scripts in this folder
 * (generate-education.js, scrape-bioguide.js, etc). It is not wired into the
 * Express app, any Railway cron, or the deploy process — it only ever runs
 * when you run it by hand.
 */

const fs = require('fs');
const path = require('path');

// Loads backend/.env if it exists, so CONGRESS_API_KEY is available without
// retyping it. backend/.env is gitignored and may not exist locally (e.g. if
// the key is only configured on Railway) — that's fine, this is a no-op in
// that case and you can instead run:
//   CONGRESS_API_KEY=yourkey node scripts/newsletter/generateDigest.js
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });
} catch (e) {
  // dotenv not installed — that's fine, we'll read from the environment directly.
}

const API_KEY = process.env.CONGRESS_API_KEY;
const API_BASE = 'https://api.congress.gov/v3';
const OUTPUT_DIR = path.join(__dirname, 'output');

// ---------------------------------------------------------------------------
// CONFIG — tweak these as your editorial taste develops
// ---------------------------------------------------------------------------

// Bills whose latest action matches these patterns get sorted into each bucket.
// Order matters: the first bucket that matches wins, so "became law" is checked
// before "passed the House".
const BUCKETS = [
  {
    key: 'law',
    heading: 'Signed into law',
    patterns: [/became public law/i, /signed by president/i],
  },
  {
    key: 'toPresident',
    heading: 'Sent to the President',
    patterns: [/presented to president/i, /cleared for white house/i],
  },
  {
    key: 'passedBoth',
    heading: 'Passed both chambers',
    patterns: [/passed senate.*without amendment/i, /agreed to in senate.*without amendment/i],
  },
  {
    key: 'passedOne',
    heading: 'Passed one chamber',
    patterns: [/passed house/i, /passed senate/i, /agreed to in house/i, /agreed to in senate/i],
  },
  {
    key: 'committee',
    heading: 'Advanced out of committee',
    patterns: [
      /reported by/i,
      /ordered to be reported/i,
      /placed on .*calendar/i,
      /committee consideration and mark-?up/i,
    ],
  },
  {
    key: 'floorAction',
    heading: 'Other floor activity',
    patterns: [
      /cloture/i,
      /motion to (commit|recommit|proceed|discharge|table)/i,
      /failed of passage/i,
      /rejected/i,
      /veto/i,
    ],
  },
];

// Anything matching these is procedural noise we skip entirely.
const IGNORE_PATTERNS = [
  /^introduced in (house|senate)$/i,
  /^referred to the (house |senate )?committee/i,
  /^referred to the subcommittee/i,
  /^sponsor introductory remarks/i,
  /^read twice and referred/i,
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--weeks-ago');
  const weeksAgo = idx !== -1 ? parseInt(args[idx + 1], 10) || 0 : 0;
  return { weeksAgo };
}

/** Returns the Monday–Sunday window for the requested week. */
function getWeekWindow(weeksAgo = 0) {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysSinceMonday - weeksAgo * 7);
  monday.setUTCHours(0, 0, 0, 0);

  const nextMonday = new Date(monday);
  nextMonday.setUTCDate(monday.getUTCDate() + 7);

  return { start: monday, end: nextMonday };
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Congress.gov wants ISO timestamps like 2026-08-18T00:00:00Z */
function toApiTimestamp(d) {
  return d.toISOString().split('.')[0] + 'Z';
}

/** Sleep, to stay polite with the API (limit is 5,000 requests/hour). */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      // Rate limited — back off and retry.
      if (attempt > 3) throw new Error('Rate limited after 3 attempts');
      await sleep(2000 * attempt);
      return fetchJson(url, attempt + 1);
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url.replace(API_KEY, 'REDACTED')}`);
    }
    return await res.json();
  } catch (err) {
    if (attempt <= 3) {
      await sleep(1000 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw err;
  }
}

/** Turn "hr" into "H.R.", "hjres" into "H.J.Res.", etc. */
function prettyBillType(type) {
  const map = {
    hr: 'H.R.',
    s: 'S.',
    hres: 'H.Res.',
    sres: 'S.Res.',
    hjres: 'H.J.Res.',
    sjres: 'S.J.Res.',
    hconres: 'H.Con.Res.',
    sconres: 'S.Con.Res.',
  };
  return map[type.toLowerCase()] || type.toUpperCase();
}

/** Congress.gov public URL for a bill — mirrors the typeMap approach in id.tsx */
function billUrl(congress, type, number) {
  const slugMap = {
    hr: 'house-bill',
    s: 'senate-bill',
    hres: 'house-resolution',
    sres: 'senate-resolution',
    hjres: 'house-joint-resolution',
    sjres: 'senate-joint-resolution',
    hconres: 'house-concurrent-resolution',
    sconres: 'senate-concurrent-resolution',
  };
  const slug = slugMap[type.toLowerCase()] || 'house-bill';
  return `https://www.congress.gov/bill/${congress}th-congress/${slug}/${number}`;
}

function bucketFor(actionText) {
  if (!actionText) return null;
  if (IGNORE_PATTERNS.some((p) => p.test(actionText.trim()))) return null;
  for (const bucket of BUCKETS) {
    if (bucket.patterns.some((p) => p.test(actionText))) return bucket.key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  if (!API_KEY) {
    console.error('\n  ERROR: CONGRESS_API_KEY is not set.');
    console.error('  Add it to backend/.env, or run:');
    console.error('     CONGRESS_API_KEY=yourkey node scripts/newsletter/generateDigest.js\n');
    process.exit(1);
  }

  const { weeksAgo } = parseArgs();
  const { start, end } = getWeekWindow(weeksAgo);

  console.log(`\n  Unum Weekly Digest Generator`);
  console.log(`  Window: ${formatDate(start)} - ${formatDate(new Date(end.getTime() - 86400000))}\n`);

  // Step 1: get every bill updated in the window.
  console.log('  Fetching bills updated this week...');
  const bills = [];
  let offset = 0;
  const LIMIT = 250;

  while (true) {
    const url =
      `${API_BASE}/bill?fromDateTime=${toApiTimestamp(start)}` +
      `&toDateTime=${toApiTimestamp(end)}` +
      `&sort=updateDate+desc&limit=${LIMIT}&offset=${offset}&format=json&api_key=${API_KEY}`;

    const data = await fetchJson(url);
    const page = data.bills || [];
    bills.push(...page);

    if (page.length < LIMIT) break;
    offset += LIMIT;
    if (offset >= 2000) break; // safety cap
    await sleep(300);
  }

  console.log(`  Found ${bills.length} bills with activity.\n`);

  // Step 2: sort into buckets by latest action.
  const buckets = {};
  BUCKETS.forEach((b) => (buckets[b.key] = []));

  for (const bill of bills) {
    const actionText = bill.latestAction?.text || '';
    const key = bucketFor(actionText);
    if (!key) continue;

    buckets[key].push({
      congress: bill.congress,
      type: bill.type,
      number: bill.number,
      title: bill.title || '(no title provided)',
      actionText: actionText.trim(),
      actionDate: bill.latestAction?.actionDate || '',
    });
  }

  // Step 3: enrich the most significant bills with sponsor + summary.
  // We only enrich the top buckets to keep the request count low.
  const ENRICH_KEYS = ['law', 'toPresident', 'passedBoth', 'passedOne'];
  const toEnrich = ENRICH_KEYS.flatMap((k) => buckets[k]).slice(0, 25);

  if (toEnrich.length) {
    console.log(`  Enriching ${toEnrich.length} significant bills with sponsor info...`);
    for (const b of toEnrich) {
      try {
        const url = `${API_BASE}/bill/${b.congress}/${b.type.toLowerCase()}/${b.number}?format=json&api_key=${API_KEY}`;
        const detail = await fetchJson(url);
        const sponsor = detail.bill?.sponsors?.[0];
        if (sponsor) {
          b.sponsor = `${sponsor.fullName || ''}`.trim();
        }
        b.policyArea = detail.bill?.policyArea?.name || '';
        await sleep(250);
      } catch (err) {
        console.warn(`     (couldn't enrich ${b.type}${b.number}: ${err.message})`);
      }
    }
    console.log('');
  }

  // Step 4: write the Markdown draft.
  const lines = [];
  const weekLabel = `${formatDate(start)} - ${formatDate(new Date(end.getTime() - 86400000))}`;

  lines.push(`# Unum Weekly - Week of ${weekLabel}`);
  lines.push('');
  lines.push('<!-- DRAFT. Nothing below is publishable as-is.');
  lines.push('     Pick 2-3 bills that actually matter, write why they matter,');
  lines.push('     and delete the rest. Verify every action description against');
  lines.push('     the Congress.gov link before publishing. -->');
  lines.push('');

  let totalIncluded = 0;

  for (const bucket of BUCKETS) {
    const items = buckets[bucket.key];
    if (!items.length) continue;
    totalIncluded += items.length;

    lines.push(`## ${bucket.heading} (${items.length})`);
    lines.push('');

    for (const b of items) {
      const label = `${prettyBillType(b.type)} ${b.number}`;
      const link = billUrl(b.congress, b.type, b.number);
      lines.push(`### ${label} - ${b.title}`);
      if (b.sponsor) lines.push(`- **Sponsor:** ${b.sponsor}`);
      if (b.policyArea) lines.push(`- **Policy area:** ${b.policyArea}`);
      lines.push(`- **Latest action (${b.actionDate}):** ${b.actionText}`);
      lines.push(`- **Source:** ${link}`);
      lines.push('');
      lines.push('  _Your plain-language explanation goes here._');
      lines.push('');
    }
  }

  if (totalIncluded === 0) {
    lines.push('## No significant legislative activity this week');
    lines.push('');
    lines.push('Congress was likely in recess. Consider running an explainer issue instead:');
    lines.push('a procedural concept, a committee profile, or a look ahead at the calendar.');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`_Generated ${new Date().toISOString()} from the Congress.gov API._`);
  lines.push('');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = `digest-${start.toISOString().split('T')[0]}.md`;
  const outPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(`  Done. ${totalIncluded} bills included.`);
  console.log(`  Draft written to: scripts/newsletter/output/${filename}\n`);
}

main().catch((err) => {
  console.error('\n  Script failed:', err.message);
  console.error('  If this is a network or API error, try again in a minute.\n');
  process.exit(1);
});
