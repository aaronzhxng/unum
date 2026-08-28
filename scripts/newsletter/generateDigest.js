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
 *   Congress.gov API, sorts them into buckets by how far they got (signed
 *   into law, passed a chamber, out of committee, other floor action,
 *   introduced), and writes a condensed Markdown scan-and-pick list to
 *   scripts/newsletter/output/.
 *
 * WHAT IT DOES NOT DO:
 *   Pick your stories or write your commentary. It's a menu, not a draft —
 *   once you've picked a few bill IDs from the list (each entry includes one,
 *   e.g. `hr6644`), run:
 *     node scripts/newsletter/curatePicks.js hr6644 s269 ...
 *   to get a detailed, sourced writeup for just those picks.
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

// Shared with the /law endpoint sweep (Step 2.5) so it can verify a bill's
// action text actually describes enactment before trusting it.
const LAW_PATTERNS = [/became public law/i, /signed by president/i];

// Bills whose latest action matches these patterns get sorted into each bucket.
// Order matters: the first bucket that matches wins, so "became law" is checked
// before "passed the House".
const BUCKETS = [
  {
    key: 'law',
    heading: 'Signed into law',
    patterns: LAW_PATTERNS,
  },
  {
    key: 'toPresident',
    heading: 'Sent to the President',
    patterns: [/presented to president/i, /cleared for white house/i],
  },
  {
    key: 'passedBoth',
    heading: 'Passed both chambers',
    patterns: [
      /passed senate.*without amendment/i,
      /agreed to in senate.*without amendment/i,
      /agreed to without amendment/i,
    ],
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
  {
    key: 'introduced',
    heading: 'Introduced',
    // No patterns here on purpose — a bill's "Introduced in House" text
    // gets superseded by "Referred to committee" within a day, so by the
    // time we look, hardly any bill's *current* action is still literally
    // "introduced". This bucket is populated directly from each bill's
    // introducedDate field instead (see Step 2a below), which catches every
    // bill introduced this week regardless of what happened to it since.
    patterns: [],
  },
];

// Anything matching these is procedural noise we skip entirely.
const IGNORE_PATTERNS = [
  /^referred to the (house |senate )?committee/i,
  /^referred to the subcommittee/i,
  /^sponsor introductory remarks/i,
  /^read twice and referred/i,
  /^held at the desk\.?$/i,
  /^message on (house|senate) action (sent|received)/i,
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

/** "2026-07-11" -> "Jul 11", for compact one-line entries. */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** Truncates a title for a one-line entry, on a word boundary where possible. */
function truncateTitle(title, maxLength = 80) {
  if (title.length <= maxLength) return title;
  const cut = title.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : maxLength)}…`;
}

/** Congress.gov wants ISO timestamps like 2026-08-18T00:00:00Z */
function toApiTimestamp(d) {
  return d.toISOString().split('.')[0] + 'Z';
}

/** Sleep, to stay polite with the API (limit is 5,000 requests/hour). */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The API's fromDateTime/toDateTime filter matches a bill's record-update
 * date, not when its latest action actually happened — a bill can get its
 * Congress.gov record touched (e.g. a law citation attached) long after the
 * action it describes. This checks the action itself actually falls in the
 * target week, so stale bills don't leak into the digest.
 */
function actionIsWithinWindow(actionDate, start, end) {
  if (!actionDate) return false;
  const d = new Date(`${actionDate}T00:00:00Z`);
  return d >= start && d < end;
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
  // Well above any week's real update volume — this just guards against an
  // infinite loop if the API misbehaves, not a data-truncation limit.
  const FETCH_CAP = 20000;

  while (true) {
    const url =
      `${API_BASE}/bill?fromDateTime=${toApiTimestamp(start)}` +
      `&toDateTime=${toApiTimestamp(end)}` +
      `&sort=updateDate+desc&limit=${LIMIT}&offset=${offset}&format=json&api_key=${API_KEY}`;

    let data;
    try {
      data = await fetchJson(url);
    } catch (err) {
      // Congress.gov's API can be flaky on deep pagination. Results are
      // sorted by updateDate desc, so what we already have is the most
      // recently touched (and thus most likely to be relevant) slice —
      // keep it rather than losing the whole run over a tail-end page.
      console.log(`  Pagination stopped early at offset ${offset} (${err.message}). Continuing with ${bills.length} bills already fetched.`);
      break;
    }
    const page = data.bills || [];
    bills.push(...page);

    if (page.length < LIMIT) break;
    offset += LIMIT;
    if (offset >= FETCH_CAP) {
      console.log(`  Hit the ${FETCH_CAP}-bill fetch cap — some records may not have been retrieved.`);
      break;
    }
    await sleep(300);
  }

  console.log(`  Found ${bills.length} bills with record activity.`);

  // Step 2: sort into buckets by latest action, keeping only bills whose
  // latest action actually happened this week (see actionIsWithinWindow).
  const buckets = {};
  BUCKETS.forEach((b) => (buckets[b.key] = []));

  let skippedStale = 0;
  let skippedIgnored = 0;
  const uncategorized = [];

  for (const bill of bills) {
    // Step 2a: introducedDate is a dedicated field, independent of
    // latestAction — checking it directly catches every bill introduced
    // this week, even ones already referred to committee (which would
    // otherwise hide them from the latestAction-based check below).
    if (actionIsWithinWindow(bill.introducedDate, start, end)) {
      buckets.introduced.push({
        congress: bill.congress,
        type: bill.type,
        number: bill.number,
        title: bill.title || '(no title provided)',
        actionText: 'Introduced',
        actionDate: bill.introducedDate,
      });
    }

    const actionText = bill.latestAction?.text || '';
    const actionDate = bill.latestAction?.actionDate || '';
    if (!actionIsWithinWindow(actionDate, start, end)) {
      skippedStale++;
      continue;
    }

    const trimmed = actionText.trim();
    if (IGNORE_PATTERNS.some((p) => p.test(trimmed))) {
      skippedIgnored++;
      continue;
    }

    const key = bucketFor(actionText);
    if (!key) {
      uncategorized.push({ type: bill.type, number: bill.number, actionText: trimmed });
      continue;
    }

    buckets[key].push({
      congress: bill.congress,
      type: bill.type,
      number: bill.number,
      title: bill.title || '(no title provided)',
      actionText: trimmed,
      actionDate: bill.latestAction?.actionDate || '',
    });
  }

  if (skippedStale) {
    console.log(`  Skipped ${skippedStale} bills whose record updated this week but whose latest action didn't.`);
  }
  if (skippedIgnored) {
    console.log(`  Skipped ${skippedIgnored} bills as routine procedural noise (referred to committee, held at the desk, etc.).`);
  }
  if (uncategorized.length) {
    console.log(`  ${uncategorized.length} bills had this-week action text that matched no bucket and no ignore pattern:`);
    for (const u of uncategorized.slice(0, 15)) {
      console.log(`     ${prettyBillType(u.type)} ${u.number}: "${u.actionText}"`);
    }
    if (uncategorized.length > 15) {
      console.log(`     ...and ${uncategorized.length - 15} more.`);
    }
  }
  console.log('');

  // Step 2.5: bills that became law are especially likely to get their
  // Congress.gov record touched again weeks later (public law number
  // assignment, Statutes-at-Large citation, etc.), which drags updateDate
  // well past the target week and makes the general updateDate-windowed
  // fetch above miss them entirely — even though the actual enactment
  // happened this week. The /law endpoint lists every law for the whole
  // Congress in a handful of requests, with no date filtering needed, so we
  // sweep it directly and filter by actionDate instead of relying on
  // updateDate at all.
  try {
    const congressRes = await fetchJson(`${API_BASE}/congress/current?format=json&api_key=${API_KEY}`);
    const congress = congressRes.congress?.number;
    if (congress) {
      const alreadyFound = new Set(buckets.law.map((b) => `${b.type}${b.number}`));
      let lawOffset = 0;
      let lawsAdded = 0;
      while (true) {
        const url = `${API_BASE}/law/${congress}?limit=250&offset=${lawOffset}&format=json&api_key=${API_KEY}`;
        const data = await fetchJson(url);
        const page = data.bills || [];
        for (const bill of page) {
          const actionText = (bill.latestAction?.text || '').trim();
          const actionDate = bill.latestAction?.actionDate || '';
          // The /law endpoint lists every bill with a laws[] entry, but a
          // bill's own latestAction doesn't always describe the enactment
          // (e.g. a companion bill can carry the same public law number
          // while its own record is still stuck on an earlier committee
          // action) — only trust entries whose action text actually says so.
          if (!LAW_PATTERNS.some((p) => p.test(actionText))) continue;
          if (!actionIsWithinWindow(actionDate, start, end)) continue;
          const key = `${bill.type}${bill.number}`;
          if (alreadyFound.has(key)) continue;
          alreadyFound.add(key);
          lawsAdded++;
          buckets.law.push({
            congress: bill.congress,
            type: bill.type,
            number: bill.number,
            title: bill.title || '(no title provided)',
            actionText,
            actionDate,
          });
        }
        if (page.length < 250) break;
        lawOffset += 250;
        await sleep(300);
      }
      if (lawsAdded) {
        console.log(`  Found ${lawsAdded} more law(s) via the /law endpoint (would've been missed by the updateDate-windowed fetch).\n`);
      }
    }
  } catch (err) {
    console.warn(`  Couldn't sweep the /law endpoint (${err.message}) — relying on the general fetch for law bucket only.\n`);
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

  // Step 4: write the Markdown draft. This is a scan-and-pick menu, not a
  // finished writeup — grab the bill IDs you want (e.g. "hr6644 s269") and
  // hand them to curatePicks.js for the detailed, publishable version.
  const lines = [];
  const weekLabel = `${formatDate(start)} - ${formatDate(new Date(end.getTime() - 86400000))}`;

  lines.push(`# Unum Weekly - Week of ${weekLabel}`);
  lines.push('');
  lines.push('<!-- Scan-and-pick menu, not a draft to publish directly.');
  lines.push('     Pick the bills that matter, then run:');
  lines.push('       node scripts/newsletter/curatePicks.js <billId> <billId> ...');
  lines.push('     e.g. node scripts/newsletter/curatePicks.js hr6644 s269');
  lines.push('     to get a detailed, sourced writeup for just those picks.');
  lines.push('');
  lines.push('     Known gap: "Passed one chamber" and "Sent to the President" are');
  lines.push('     structurally undercounted. Congress.gov only exposes a bill\'s');
  lines.push('     single current action, and a fast-moving bill often gets referred');
  lines.push('     to the other chamber (or further) within days — so the passage');
  lines.push('     moment is overwritten before this script ever sees it. A bill');
  lines.push('     that passed one chamber this week may not appear until it later');
  lines.push('     becomes law (which has its own dedicated, reliable sweep). -->');
  lines.push('');

  const nonEmptyBuckets = BUCKETS.filter((bucket) => buckets[bucket.key].length);
  if (nonEmptyBuckets.length) {
    const toc = nonEmptyBuckets.map((b) => `${b.heading} (${buckets[b.key].length})`).join(' | ');
    lines.push(`**Contents:** ${toc}`);
    lines.push('');
  }

  let totalIncluded = 0;
  let significantIncluded = 0;

  for (const bucket of BUCKETS) {
    const items = buckets[bucket.key];
    if (!items.length) continue;
    totalIncluded += items.length;
    if (bucket.key !== 'introduced') significantIncluded += items.length;

    lines.push(`## ${bucket.heading} (${items.length})`);
    lines.push('');

    for (const b of items) {
      const label = `${prettyBillType(b.type)} ${b.number}`;
      const billId = `${b.type.toLowerCase()}${b.number}`;
      const link = billUrl(b.congress, b.type, b.number);
      const parts = [`[${label}](${link})`, `\`${billId}\``, truncateTitle(b.title)];
      if (b.actionDate) parts.push(formatShortDate(b.actionDate));
      lines.push(`- ${parts.join(' — ')}`);
    }
    lines.push('');
  }

  if (significantIncluded === 0) {
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

if (require.main === module) {
  main().catch((err) => {
    console.error('\n  Script failed:', err.message);
    console.error('  If this is a network or API error, try again in a minute.\n');
    process.exit(1);
  });
}

module.exports = {
  API_BASE,
  API_KEY,
  BUCKETS,
  LAW_PATTERNS,
  fetchJson,
  sleep,
  prettyBillType,
  billUrl,
};
