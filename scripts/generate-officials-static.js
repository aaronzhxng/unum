require("dotenv").config({ path: "../backend/.env" });
const fs = require("fs");
const axios = require("axios");

const API_KEY = process.env.CONGRESS_API_KEY;
const OUTPUT_PATH = "../app/data/officials-static.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Fetching committee membership data...");

  // Fetch committee membership (bioguideId -> committee IDs)
  const membershipRes = await axios.get(
    "https://unitedstates.github.io/congress-legislators/committee-membership-current.json",
  );
  const membership = membershipRes.data;

  // Fetch committee names (committee ID -> name)
  const committeesRes = await axios.get(
    "https://unitedstates.github.io/congress-legislators/committees-current.json",
  );
  const committees = committeesRes.data;

  // Build committee ID -> name map
  const committeeNameMap = {};
  for (const c of committees) {
    committeeNameMap[c.thomas_id] = c.name;
    if (c.subcommittees) {
      for (const sub of c.subcommittees) {
        committeeNameMap[c.thomas_id + sub.thomas_id] =
          `${c.name} — ${sub.name}`;
      }
    }
  }

  // Build bioguideId -> [committee names] map
  const bioguideToCommittees = {};
  for (const [committeeId, members] of Object.entries(membership)) {
    const committeeName = committeeNameMap[committeeId];
    if (!committeeName) continue;
    for (const member of members) {
      const id = member.bioguide;
      if (!id) continue;
      if (!bioguideToCommittees[id]) bioguideToCommittees[id] = [];
      // Only add parent committees, not subcommittees (keep it clean)
      if (committeeId.length === 4) {
        bioguideToCommittees[id].push(committeeName);
      }
    }
  }

  console.log(
    `Built committee map for ${Object.keys(bioguideToCommittees).length} members`,
  );

  // Fetch all current members from Congress.gov for education
  console.log("Fetching all current members from Congress.gov...");
  let members = [];
  let offset = 0;
  const limit = 250;
  while (true) {
    const url = `https://api.congress.gov/v3/member?limit=${limit}&offset=${offset}&currentMember=true&api_key=${API_KEY}&format=json`;
    const res = await axios.get(url);
    const page = res.data.members || [];
    members = members.concat(page);
    if (!res.data.pagination?.next || page.length < limit) break;
    offset += limit;
    await sleep(500);
  }
  console.log(`Found ${members.length} members. Fetching education...`);

  // Load existing file to resume
  let result = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      result = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
      console.log(`Resuming — ${Object.keys(result).length} already done`);
    } catch {}
  }

  let count = 0;
  for (const m of members) {
    const id = m.bioguideId;
    if (!id) continue;

    // Fetch education from member detail
    let education = result[id]?.education ?? [];
    if (education.length === 0) {
      try {
        const url = `https://api.congress.gov/v3/member/${id}?api_key=${API_KEY}&format=json`;
        const res = await axios.get(url);
        const member = res.data.member || {};
        education = (member.education || [])
          .map((e) => `${e.institution}${e.degree ? ` (${e.degree})` : ""}`)
          .filter(Boolean)
          .slice(0, 5);
        await sleep(300);
      } catch {}
    }

    result[id] = {
      committees: bioguideToCommittees[id] ?? [],
      caucuses: result[id]?.caucuses ?? [],
      education,
    };

    count++;
    const firstName = m.name?.split(",")?.[1]?.trim() ?? "";
    const lastName = m.name?.split(",")?.[0]?.trim() ?? "";
    console.log(
      `[${count}/${members.length}] ${firstName} ${lastName} — ${result[id].committees.length} committees, ${education.length} education`,
    );

    if (count % 20 === 0) {
      fs.mkdirSync("../app/data", { recursive: true });
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
      console.log(`  Saved progress (${count} done)`);
    }
  }

  fs.mkdirSync("../app/data", { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`\nDone! ${count} members written to ${OUTPUT_PATH}`);
}

main().catch(console.error);
