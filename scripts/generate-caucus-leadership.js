// Adds caucus leadership to ../app/data/officials-static.json, as each
// member's caucusLeadership: [{ title, name }].
//
//   cd scripts && node generate-caucus-leadership.js
//
// The source is the House Administration Committee's list of registered
// caucuses (Congressional Member Organizations), a PDF it updates every few
// months. It names each caucus's officers only. No official list of full
// membership exists, since each caucus keeps its own.
//
// Officers are listed by name, so they're matched to members through the
// congress-legislators roster. Anyone who can't be matched is printed at the
// end; add them to NAME_FIXES and run again.

const fs = require("fs");
const axios = require("axios");
const yaml = require("js-yaml");
// The package's main file runs a self-test that needs files it doesn't ship
const pdf = require("pdf-parse/lib/pdf-parse.js");

const PAGE =
  "https://cha.house.gov/congressional-member-and-staff-organizations";
const LEGISLATORS =
  "https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.yaml";
const OUTPUT_PATH = "../app/data/officials-static.json";

// Names the PDF misspells -> bioguide ID
const NAME_FIXES = {
  "Chellie Pinegree": "P000597",
  "David Schwiekert": "S001183",
  "Slyvia Garcia": "G000587",
  "Eric Sorenson": "S001225",
  "Marianette Miller-Meeks": "M001215",
  "Josh Breechen": "B001317",
};

const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // Any kind of hyphen, since the PDF and the roster use different ones
    .replace(/[-‐-―]/g, " ")
    .replace(/[^a-z\s]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Officer lines start with their title; everything else between caucuses is
// staff contact details, which wrap unpredictably
const OFFICER = /^(Rep\.|Sen\.|Del\.|Delegate|Resident Commissioner)\s+(.+)$/;
const ROLE_HEADER = /^(Chair\/Co-Chair\(s\)|Chair|Vice Chairs?)\s*:$/;
const isContactLine = (line) =>
  line.startsWith("•") || /@|\(\d{3}\)|\d{3}-\d{4}|^\d+$|^\d{3}-/.test(line);

function parseCaucuses(text) {
  const caucuses = [];
  let pending = []; // lines since the last officer, the next caucus's name
  let current = null;
  let role = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || /^Updated \d/.test(line)) continue;
    const header = line.match(ROLE_HEADER);
    if (header) {
      if (pending.length) {
        const name = pending
          .join(" ")
          .replace(/\s+/g, " ")
          // The PDF's opening note runs straight into the first caucus's name
          .replace(/^.*employing Member\.\s*/, "");
        current = { name, officers: [] };
        caucuses.push(current);
        pending = [];
      }
      role = header[1];
      continue;
    }
    const officer = line.match(OFFICER);
    if (officer && current) {
      current.officers.push({
        prefix: officer[1],
        name: officer[2].trim(),
        role,
      });
      pending = [];
      continue;
    }
    if (!isContactLine(line)) pending.push(line);
  }
  // A single officer under Chair/Co-Chair(s) is the chair; several share it
  for (const caucus of caucuses) {
    const shared =
      caucus.officers.filter((o) => o.role === "Chair/Co-Chair(s)").length > 1;
    for (const o of caucus.officers) {
      o.title = /^Vice/.test(o.role)
        ? "Vice Chair"
        : o.role === "Chair" || !shared
          ? "Chair"
          : "Co-Chair";
    }
  }
  // The PDF opens with a preamble before the first caucus, which would
  // otherwise join the first name
  return caucuses.filter((c) => c.officers.length > 0);
}

function matcher(legislators) {
  const people = legislators.map((l) => {
    const term = l.terms[l.terms.length - 1];
    const firsts = [
      l.name.first,
      l.name.nickname,
      l.name.middle,
      l.name.official_full?.split(" ")[0],
    ]
      .filter(Boolean)
      .map(normalize);
    return {
      id: l.id.bioguide,
      chamber: term.type, // "rep" or "sen"
      last: normalize(l.name.last),
      firsts,
    };
  });
  return (prefix, name) => {
    const fix = Object.keys(NAME_FIXES).find(
      (typo) => normalize(typo) === normalize(name),
    );
    if (fix) return NAME_FIXES[fix];
    const chamber = prefix === "Sen." ? "sen" : "rep";
    const tokens = normalize(name).split(" ");
    const full = tokens.join(" ");
    const sameLast = people.filter(
      (p) =>
        p.chamber === chamber &&
        (full.endsWith(p.last) ||
          p.last
            .split(" ")
            .some((part) => part.length > 2 && tokens.includes(part))),
    );
    if (sameLast.length === 1) return sameLast[0].id;
    // Whole names only, or "Chris" for "Christopher". Initials would let a
    // middle "G." match any first name starting with G.
    const first = tokens[0];
    const sameFirst = sameLast.filter((p) =>
      p.firsts.some(
        (f) =>
          f.length > 2 &&
          (f === first ||
            (first.length > 2 && (f.startsWith(first) || first.startsWith(f)))),
      ),
    );
    return sameFirst.length === 1 ? sameFirst[0].id : null;
  };
}

async function main() {
  const page = await axios.get(PAGE, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const href = page.data.match(
    /href="([^"]*119th-congress-cmo-list\.pdf)"/i,
  )?.[1];
  if (!href)
    throw new Error(
      "Couldn't find the caucus list on the House Administration page",
    );
  const url = href.startsWith("//")
    ? `https:${href}`
    : new URL(href, PAGE).toString();
  console.log(`Caucus list: ${url}`);

  const file = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const caucuses = parseCaucuses((await pdf(Buffer.from(file.data))).text);
  const legislators = yaml.load((await axios.get(LEGISLATORS)).data);
  const match = matcher(legislators);

  const byMember = {};
  const unmatched = [];
  for (const caucus of caucuses) {
    for (const officer of caucus.officers) {
      const id = match(officer.prefix, officer.name);
      if (!id) {
        unmatched.push(`${officer.prefix} ${officer.name} (${caucus.name})`);
        continue;
      }
      (byMember[id] ??= []).push({ title: officer.title, name: caucus.name });
    }
  }

  const result = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
  for (const id of Object.keys(result)) {
    // Chairs first, then alphabetical
    result[id].caucusLeadership = (byMember[id] ?? []).sort(
      (a, b) =>
        (a.title === "Chair" ? 0 : 1) - (b.title === "Chair" ? 0 : 1) ||
        a.name.localeCompare(b.name),
    );
  }
  const missing = Object.keys(byMember).filter((id) => !result[id]);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

  const seats = Object.values(byMember).reduce((n, list) => n + list.length, 0);
  console.log(
    `${caucuses.length} caucuses, ${seats} officer seats, ${Object.keys(byMember).length} members`,
  );
  if (missing.length)
    console.log(`Matched but not in ${OUTPUT_PATH}: ${missing.join(", ")}`);
  if (unmatched.length)
    console.log(
      `Couldn't match ${unmatched.length}:\n  ${unmatched.join("\n  ")}`,
    );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
