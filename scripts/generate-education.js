const fs = require("fs");
const path = require("path");
const https = require("https");

const STATIC_PATH = path.join(__dirname, "../app/data/officials-static.json");
const existing = JSON.parse(fs.readFileSync(STATIC_PATH, "utf8"));
const bioguideIds = Object.keys(existing);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetchWikipedia(name) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(name);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
    https
      .get(url, { headers: { "User-Agent": "UnumApp/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

function fetchWikipediaFull(name) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(name);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=revisions&rvprop=content&format=json&rvslots=main`;
    https
      .get(url, { headers: { "User-Agent": "UnumApp/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

function parseEducationFromWikitext(wikitext) {
  if (!wikitext) return [];

  function cleanEntry(s) {
    return s
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2") // [[link|text]] -> text
      .replace(/\[\[([^\]]+)\]\]/g, "$1") // [[text]] -> text
      .replace(/\{\{[^}]+\}\}/g, "") // remove templates
      .replace(/<br\s*\/?>/gi, " / ") // <br> to separator
      .replace(/'''|''/g, "") // remove bold/italic
      .replace(/\s+/g, " ") // collapse whitespace
      .trim();
  }

  function splitUbl(raw) {
    // Pre-clean nested [[link|text]] BEFORE splitting on |
    // so the | inside links doesn't get treated as a separator
    const preCleaned = raw.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
    return preCleaned
      .split("|")
      .map(cleanEntry)
      .filter((s) => s.length > 2);
  }

  // Match education field with {{ubl}} template
  const ublMatch = wikitext.match(
    /\|\s*education\s*=\s*\{\{ubl\s*([\s\S]*?)\}\}(?=\s*\||\s*\}\})/i,
  );
  if (ublMatch) return splitUbl(ublMatch[1]);

  // Match alma_mater with {{ubl}}
  const almaUblMatch = wikitext.match(
    /\|\s*alma_mater\s*=\s*\{\{ubl\s*([\s\S]*?)\}\}(?=\s*\||\s*\}\})/i,
  );
  if (almaUblMatch) return splitUbl(almaUblMatch[1]);

  // Match plain education field
  const plainMatch = wikitext.match(
    /\|\s*education\s*=\s*([\s\S]*?)(?=\n\s*\||\n\s*\}\})/i,
  );
  if (plainMatch) {
    return plainMatch[1]
      .split(/<br\s*\/?>/i)
      .map(cleanEntry)
      .filter((s) => s.length > 2);
  }

  // Match plain alma_mater field
  const almaPlainMatch = wikitext.match(
    /\|\s*alma_mater\s*=\s*([\s\S]*?)(?=\n\s*\||\n\s*\}\})/i,
  );
  if (almaPlainMatch) {
    return almaPlainMatch[1]
      .split(/<br\s*\/?>/i)
      .map(cleanEntry)
      .filter((s) => s.length > 2);
  }

  return [];
}

async function test() {
  const names = ["Jack Reed", "Robert Garcia", "James A. Himes"];
  for (const name of names) {
    const fullData = await fetchWikipediaFull(name);
    const pages = fullData?.query?.pages;
    const page = Object.values(pages)[0];
    console.log(`\n--- ${name} ---`);
    console.log("Page title:", page?.title);
    console.log("Missing:", page?.missing);
    const wikitext =
      page?.revisions?.[0]?.slots?.main?.["*"] ?? page?.revisions?.[0]?.["*"];
    if (wikitext) {
      const eduIdx = wikitext.toLowerCase().indexOf("education");
      const almaIdx = wikitext.toLowerCase().indexOf("alma_mater");
      console.log("education field at:", eduIdx);
      console.log("alma_mater field at:", almaIdx);
      if (eduIdx > -1)
        console.log(
          "education context:",
          wikitext.substring(eduIdx - 2, eduIdx + 200),
        );
      if (almaIdx > -1)
        console.log(
          "alma_mater context:",
          wikitext.substring(almaIdx - 2, almaIdx + 200),
        );
    }
    await delay(300);
  }
}

async function getMemberName(bioguideId) {
  // We need names — fetch from Congress.gov
  return new Promise((resolve) => {
    const apiKey = process.env.CONGRESS_API_KEY;
    const url = `https://api.congress.gov/v3/member/${bioguideId}?api_key=${apiKey}`;
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const m = json.member;
            resolve(m?.directOrderName ?? null);
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

async function getEducationForMember(name) {
  if (!name) return [];

  // Generate name variants to try
  const variants = [name];

  // Remove middle initial: "Kirsten E. Gillibrand" -> "Kirsten Gillibrand"
  const noMiddle = name.replace(/\b[A-Z]\.\s+/g, "");
  if (noMiddle !== name) variants.push(noMiddle);

  // Remove suffix: "Randy K. Weber, Sr." -> "Randy Weber"
  const noSuffix = noMiddle.replace(/,?\s*(Sr\.|Jr\.|III|II|IV)$/i, "").trim();
  if (noSuffix !== noMiddle) variants.push(noSuffix);

  // Remove comma-separated suffix without middle: "Randy Weber, Sr." -> "Randy Weber"
  const noSuffixOriginal = name
    .replace(/,?\s*(Sr\.|Jr\.|III|II|IV)$/i, "")
    .trim();
  if (!variants.includes(noSuffixOriginal)) variants.push(noSuffixOriginal);

  for (const variant of variants) {
    const fullData = await fetchWikipediaFull(variant);
    if (!fullData) continue;

    const pages = fullData?.query?.pages;
    if (!pages) continue;

    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) continue;

    const wikitext =
      page?.revisions?.[0]?.slots?.main?.["*"] ?? page?.revisions?.[0]?.["*"];

    if (!wikitext) continue;

    const education = parseEducationFromWikitext(wikitext);
    if (education.length > 0) return education;
  }

  return [];
}

async function main() {
  console.log(`Processing ${bioguideIds.length} officials...`);
  const result = { ...existing };
  let completed = 0;
  let withEducation = 0;

  // First pass: get all names from Congress.gov
  console.log("Fetching member names...");
  const names = {};
  for (const id of bioguideIds) {
    names[id] = await getMemberName(id);
    await delay(150);
    if (Object.keys(names).length % 20 === 0) {
      console.log(`Names: ${Object.keys(names).length}/${bioguideIds.length}`);
    }
  }

  // Second pass: get education from Wikipedia
  console.log("Fetching education from Wikipedia...");
  for (const id of bioguideIds) {
    // Skip if already has education data
    if (result[id].education && result[id].education.length > 0) {
      completed++;
      withEducation++;
      continue;
    }
    try {
      const name = names[id];
      const education = await getEducationForMember(name);
      result[id] = { ...result[id], education };
      completed++;
      if (education.length > 0) withEducation++;
      if (completed % 10 === 0) {
        console.log(
          `${completed}/${bioguideIds.length} — ${name}: ${education.length} entries (${withEducation} total with education)`,
        );
      }
    } catch (err) {
      console.error(`Failed for ${id}:`, err.message);
    }
    await delay(200);
  }

  fs.writeFileSync(STATIC_PATH, JSON.stringify(result, null, 2));
  console.log(
    `Done! ${withEducation}/${bioguideIds.length} officials have education data.`,
  );
}

// Test first, then switch to main()
// test();
main();
