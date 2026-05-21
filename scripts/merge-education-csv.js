const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "Congressional Education - Sheet1.csv");
const STATIC_PATH = path.join(__dirname, "../app/data/officials-static.json");
const existing = JSON.parse(fs.readFileSync(STATIC_PATH, "utf8"));

// ── Location stripper ──────────────────────────────────────────────────────
const STATE_LIST =
  "Ala|Alaska|Ariz|Ark|Calif|Colo|Conn|Del|Fla|Ga|Hawaii|Idaho|Ill|Ind|Iowa|" +
  "Kans|Ky|La|Me|Md|Mass|Mich|Minn|Miss|Mo|Mont|Nebr|Nev|" +
  "N\\.H|N\\.J|N\\.Mex|N\\.Y|N\\.C|N\\.Dak|Ohio|Okla|Oreg|Oregon|Pa|R\\.I|" +
  "S\\.C|S\\.Dak|Tenn|Tex|Utah|Vt|Va|Wash|W\\.Va|Wis|Wyo|D\\.C|" +
  "England|India|Ukraine|Scotland|Guam|Germany|France|Luxembourg";

const LOCATION_RE = new RegExp(
  `(?:,\\s*[^,]+,\\s*(?:${STATE_LIST})\\.?|,\\s*(?:${STATE_LIST})\\.?).*$`,
);

function stripLocation(s) {
  return s.replace(LOCATION_RE, "").replace(/,\s*$/, "").trim();
}

// ── Degree helpers ─────────────────────────────────────────────────────────
// Matches one degree token: all-caps abbreviation like B.A., Ph.D., LL.M.
// Also explicit mixed-case ones like M.Div., Pharm.D., Ed.M., M.Phil.
const DEGREE_TOKEN_RE =
  /^(?:Ph\.D\.|M\.Phil\.|M\. Phil\.|M\.Div\.|Pharm\.D\.|Ed\.[MD]\.|D\.N\.P\.|D\.D\.S\.|D\.M\.D\.|LL\.[MB]\.|M\.F\.A\.|D\.P\.A\.|[A-Z]{1,4}\.(?:[A-Z]{1,4}\.)*)/;

function extractLeadingDegrees(s) {
  const degrees = [];
  let rest = s;
  while (true) {
    const m = rest.match(DEGREE_TOKEN_RE);
    if (!m) break;
    degrees.push(m[0].trim());
    rest = rest.slice(m[0].length).trim();
    // Continue if followed by ", NextDegree" or " and NextDegree" or "/"
    const sep = rest.match(
      /^(?:,\s*(?=[A-Z]\.)|(?:\s+and\s+|\s*\/\s*)(?=[A-Z]\.))/i,
    );
    if (!sep) break;
    rest = rest.slice(sep[0].length).trim();
  }
  return { degrees, rest: rest.replace(/^[,\s]+/, "") };
}

function cleanDegreeStr(degrees) {
  // Join, strip dots, replace "and" with comma → "BA, JD"
  return degrees
    .join(" and ")
    .replace(/\./g, "")
    .replace(/\s+and\s+/gi, ", ")
    .trim();
}

// ── Main formatter ─────────────────────────────────────────────────────────
function formatEducationEntry(raw) {
  if (!raw) return raw;
  raw = raw.trim();

  // Normalize slash-joined degrees: "M.S.N./M.P.H." → "M.S.N. and M.P.H."
  raw = raw.replace(
    /((?:[A-Z]{1,4}\.)+)\s*\/\s*((?:[A-Z]{1,4}\.)+)/g,
    "$1 and $2",
  );

  // Extract trailing year
  const yearMatch = raw.match(/,?\s*(\d{4}(?:-\d{2,4})?)\s*$/);
  const year = yearMatch ? yearMatch[1] : "";
  if (yearMatch)
    raw = raw.slice(0, yearMatch.index).trim().replace(/,\s*$/, "");

  // ── "attended [the] ..." ──
  if (/^attended\b/i.test(raw)) {
    let rest = raw.replace(/^attended\s+(?:the\s+)?/i, "");
    rest = rest.replace(/\s+in\s+\S.*$/, ""); // strip " in Salem, Oregon" etc.
    const institution = stripLocation(rest);
    return `${institution} (attended)`;
  }

  // ── "studied ..." ──
  if (/^studied\b/i.test(raw)) {
    let rest = raw.replace(/^studied\s+[^,]+,\s*/i, "");
    const institution = stripLocation(rest);
    return year ? `${institution} (${year})` : institution;
  }

  // ── "graduated [from] ..." ──
  if (/^graduated\b/i.test(raw)) {
    let rest = raw.replace(/^graduated\s+(?:from\s+)?/i, "");
    // Degree sometimes appears at the end: "Dartmouth College, B.A."
    const degAtEnd = rest.match(
      /,\s*((?:[A-Z]{1,4}\.)+(?:\s+and\s+(?:[A-Z]{1,4}\.)+)*)\s*$/,
    );
    let deg = "";
    if (degAtEnd) {
      deg = cleanDegreeStr([degAtEnd[1]]);
      rest = rest.slice(0, degAtEnd.index).trim();
    }
    const institution = stripLocation(rest);
    const parts = [];
    if (deg) parts.push(deg);
    if (year) parts.push(year);
    return parts.length ? `${institution} (${parts.join(", ")})` : institution;
  }

  // ── Degree abbreviation(s) at start ──
  const { degrees, rest: afterDeg } = extractLeadingDegrees(raw);
  if (degrees.length > 0) {
    let rest = afterDeg;
    // Skip subject field: lowercase words before institution name
    // e.g. "history, ", "physical education, ", "accounting, "
    const subj = rest.match(/^([a-z][a-z,\s]+),\s*(?=[A-Z])/);
    if (subj) rest = rest.slice(subj[0].length);

    const institution = stripLocation(rest);
    const degStr = cleanDegreeStr(degrees);
    const parts = [degStr];
    if (year) parts.push(year);
    return `${institution} (${parts.join(", ")})`;
  }

  // ── Fallback: strip location, keep year ──
  const institution = stripLocation(raw);
  return year ? `${institution} (${year})` : institution;
}

// ── CSV parser ─────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// ── Main ───────────────────────────────────────────────────────────────────
const rawCSV = fs.readFileSync(CSV_PATH, "utf8");
const lines = rawCSV.split(/\r?\n/);

const educationKeywords = [
  "university",
  "college",
  "school",
  "institute",
  "academy",
  "seminary",
  "polytechnic",
  "conservatory",
  "b.a.",
  "b.s.",
  "b.b.a.",
  "b.s.b.a.",
  "a.b.",
  "a.a.",
  "a.s.",
  "m.a.",
  "m.s.",
  "m.b.a.",
  "m.p.a.",
  "m.p.p.",
  "m.ed.",
  "m.div.",
  "ph.d.",
  "j.d.",
  "m.d.",
  "d.d.s.",
  "ll.b.",
  "ll.m.",
  "d.o.",
  "attended",
  "graduated",
];

let updated = 0;
let skipped = 0;

for (const line of lines) {
  if (!line.trim()) continue;
  const [bioguideId, , , , educationRaw] = parseCSVLine(line);
  if (!bioguideId || bioguideId === "bioguide id") continue;
  if (!existing[bioguideId]) {
    console.log(`  ⚠  Unknown ID: ${bioguideId} — skipping`);
    skipped++;
    continue;
  }
  if (!educationRaw) continue;

  const educationArray = educationRaw
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .filter((s) => {
      const lower = s.toLowerCase();
      return educationKeywords.some((kw) => lower.includes(kw));
    })
    .map(formatEducationEntry);

  existing[bioguideId].education = educationArray;
  updated++;
}

fs.writeFileSync(STATIC_PATH, JSON.stringify(existing, null, 2));
console.log(
  `\nDone — updated ${updated} members, skipped ${skipped} unknown IDs.`,
);
