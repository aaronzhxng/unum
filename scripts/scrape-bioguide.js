const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const officialsStatic = require("../app/data/officials-static.json");
const existingNicknames = require("../app/data/nicknames.json");

const bioguideIds = Object.keys(officialsStatic);
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const parseEducation = (profileText) => {
  if (!profileText) return [];
  const education = [];

  const HIGH_SCHOOL_KEYWORDS = [
    "high school",
    "senior high",
    "junior high",
    "middle school",
    "preparatory school",
    "prep school",
    "elementary school",
    "grammar school",
    "public schools",
    "public school",
    "vocational",
    // Private K-12 schools that don't contain "high school"
    "academy in", // catches "Pinecrest Academy in Florida"
    "paideia school",
    "haverford school",
    "groton school",
    "blake school",
    "milton academy",
    "sidwell friends",
    "phillips academy",
    "choate school",
    "madeira school",
    "cranbrook",
    "wyoming seminary",
    "st. paul academy",
    "woodward academy",
    "tiftarea academy",
    "master's academy",
    "bellarmine college preparatory",
    "chaminade-madonna",
    "strake jesuit",
    "cor jesu",
    "sacred heart academy",
    "trinity valley school",
    "mather academy",
    "st. thomas academy",
    "albany academy",
    "christ church episcopal school",
    "greenhill school",
    "deerborne school",
    "hudson school",
    "moses brown school",
    "pine valley central school",
    "pingry school",
    "st. george's school",
    "st. john's school",
    "worcester academy",
    "notre dame academy",
    "piedmont academy",
    "cab calloway school",
    "institute of notre dame",
    "mary institute",
    "punahou school",
    "national academy", // catches FBI National Academy
    "culver military academy",
    "loretto academy",
    "polytechnic school",
    "sacred hearts academy",
    "same university",
  ];

  const isHighSchoolOrLower = (text) => {
    const lower = text.toLowerCase();
    return HIGH_SCHOOL_KEYWORDS.some((kw) => lower.includes(kw));
  };

  const graduatedMatches = profileText.matchAll(
    /graduated\s+([^,;]+(?:University|College|Institute|Academy|School|Seminary|Center)[^,;]*),?\s*([A-Z][^,;\.]{1,30}\.?(?:\s*,\s*[A-Z][^,;\.]{1,20}\.?)*)?(?:\s*,?\s*\d{4})?/gi,
  );
  for (const match of graduatedMatches) {
    const school = match[1].trim();
    const degrees = match[2]?.trim();
    if (school && !isHighSchoolOrLower(school)) {
      education.push(degrees ? `${school} (${degrees})` : school);
    }
  }

  const attendedMatches = profileText.matchAll(
    /attended\s+([^,;]+(?:University|College|Institute|Academy|School|Seminary|Center)[^,;]*)/gi,
  );
  for (const match of attendedMatches) {
    const school = match[1].trim();
    if (
      school &&
      !isHighSchoolOrLower(school) &&
      !education.some((e) => e.includes(school))
    ) {
      education.push(`${school} (attended)`);
    }
  }

  const receivedMatches = profileText.matchAll(
    /(?:received|earned|holds?|obtained|completed)\s+(?:a\s+)?(?:[A-Z]\.?[A-Z]\.?\s+)?(?:degree|diploma)?\s*(?:from\s+)?([^,;]+(?:University|College|Institute|Seminary|School of)[^,;]*)/gi,
  );
  const INSTITUTION_KEYWORDS = [
    "university",
    "college",
    "institute",
    "seminary",
    "school of",
  ];
  for (const match of receivedMatches) {
    const school = match[1].trim();
    const schoolLower = school.toLowerCase();
    if (
      school &&
      INSTITUTION_KEYWORDS.some((kw) => schoolLower.includes(kw)) &&
      !isHighSchoolOrLower(school) &&
      !education.some((e) => e.includes(school))
    ) {
      education.push(school);
    }
  }

  const cleaned = education.map((e) => {
    return e
      .replace(/\b(magna cum laude|summa cum laude|cum laude)\s*/gi, "")
      .replace(/\s+\d{4}$/, "") // strip trailing year like "1978"
      .trim();
  });

  const seen = new Set();
  return cleaned.filter((e) => {
    if (e.startsWith("from ")) return false; // K-12 graduation phrasing
    const key = e.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  // Warm up — visit the site first to get cookies
  await page.goto("https://bioguide.congress.gov", {
    waitUntil: "networkidle2",
  });
  await delay(2000);

  const newEducation = {};
  const newNicknames = { ...existingNicknames };
  let success = 0;
  let failed = 0;

  console.log(`Scraping ${bioguideIds.length} officials from Bioguide...`);

  for (let i = 0; i < bioguideIds.length; i++) {
    const id = bioguideIds[i];
    try {
      const response = await page.goto(
        `https://bioguide.congress.gov/search/bio/${id}.json`,
        { waitUntil: "networkidle0", timeout: 10000 },
      );

      if (!response.ok()) {
        console.warn(
          `[${i + 1}/${bioguideIds.length}] ${id} — HTTP ${response.status()}`,
        );
        newEducation[id] = officialsStatic[id]?.education ?? [];
        failed++;
        await delay(500);
        continue;
      }

      const text = await page.evaluate(() => document.body.innerText);
      const json = JSON.parse(text);
      const data = json?.data;

      const education = parseEducation(data?.profileText);
      newEducation[id] = education; // empty array is fine — better than bad old data

      const nick = data?.nickName?.trim().toLowerCase();
      const firstName = data?.givenName?.trim().toLowerCase();
      if (nick && nick !== firstName && nick.length > 1) {
        if (!newNicknames[id]) {
          newNicknames[id] = [nick];
        } else if (!newNicknames[id].includes(nick)) {
          newNicknames[id] = [...newNicknames[id], nick];
        }
      }

      success++;
      if ((i + 1) % 50 === 0)
        console.log(
          `Progress: ${i + 1}/${bioguideIds.length} — ${success} success, ${failed} failed`,
        );

      await delay(300);
    } catch (err) {
      console.warn(
        `[${i + 1}/${bioguideIds.length}] ${id} — Error:`,
        err.message,
      );
      newEducation[id] = officialsStatic[id]?.education ?? [];
      failed++;
      await delay(500);
    }
  }

  await browser.close();

  const updatedStatic = {};
  for (const id of bioguideIds) {
    updatedStatic[id] = {
      ...officialsStatic[id],
      education: newEducation[id] ?? [],
    };
  }

  fs.writeFileSync(
    path.join(__dirname, "../app/data/officials-static.json"),
    JSON.stringify(updatedStatic, null, 2),
  );
  console.log("✅ officials-static.json updated");

  fs.writeFileSync(
    path.join(__dirname, "../app/data/nicknames.json"),
    JSON.stringify(newNicknames, null, 2),
  );
  console.log("✅ nicknames.json updated");

  console.log(
    `\nDone: ${success} success, ${failed} failed out of ${bioguideIds.length}`,
  );
};

scrape();
