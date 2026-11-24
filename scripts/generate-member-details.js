// Saves every member's Congress.gov details (name, party, terms, photo,
// website, office) to ../app/data/member-details.json, so a profile can open
// before the network answers. The app checks for newer details in the
// background, so this only needs rerunning before a release.
//
//   cd scripts && node generate-member-details.js
//
// Members come from officials-static.json, so run generate-officials-static.js
// first when the roster changes. Anyone who fails to download keeps their
// previous entry.

require("dotenv").config({ path: "../backend/.env" });
const fs = require("fs");
const axios = require("axios");

const MEMBERS_PATH = "../app/data/officials-static.json";
const OUTPUT_PATH = "../app/data/member-details.json";
const AT_ONCE = 4;

const fetchDetails = async (id) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const { data } = await axios.get(
        `https://api.congress.gov/v3/member/${id}`,
        {
          headers: { "X-Api-Key": process.env.CONGRESS_API_KEY },
          params: { format: "json" },
          timeout: 30000,
        },
      );
      return data.member;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

async function main() {
  if (!process.env.CONGRESS_API_KEY)
    throw new Error("CONGRESS_API_KEY missing from ../backend/.env");
  const ids = Object.keys(JSON.parse(fs.readFileSync(MEMBERS_PATH, "utf8")));
  const previous = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"))
    : {};

  const result = {};
  const failed = [];
  let next = 0;
  const worker = async () => {
    while (next < ids.length) {
      const id = ids[next++];
      try {
        result[id] = await fetchDetails(id);
      } catch (error) {
        failed.push(`${id} (${error.message})`);
        if (previous[id]) result[id] = previous[id];
      }
      const done = Object.keys(result).length + failed.length;
      if (done % 50 === 0) console.log(`${done}/${ids.length}`);
    }
  };
  await Promise.all(Array.from({ length: AT_ONCE }, worker));

  // One member per line keeps diffs readable without the size of full
  // indentation
  const lines = ids
    .filter((id) => result[id])
    .map((id) => `${JSON.stringify(id)}:${JSON.stringify(result[id])}`);
  fs.writeFileSync(OUTPUT_PATH, `{\n${lines.join(",\n")}\n}\n`);

  console.log(`${lines.length} members written to ${OUTPUT_PATH}`);
  if (failed.length)
    console.log(
      `Couldn't download ${failed.length} (kept any previous copy):\n  ${failed.join("\n  ")}`,
    );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
