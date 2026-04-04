const fs = require("fs");
const path = require("path");

const wiki = require("../app/data/officials-static.json");

// Paste the Bioguide education data here (Document 10 entries that have data)
const bioguideOverrides = {
  W000802: ["Yale University"],
  W000817: ["Rutgers University", "George Washington University (attended)"],
  R000584: ["the University of Wisconsin (attended)"],
  P000603: ["Duke University", "Baylor University (attended)"],
  L000577: ["Brigham Young University"],
  K000367: ["Yale University"],
  K000383: ["Dartmouth College"],
  K000394: ["Deep Springs College (attended)"],
  K000384: ["Harvard University"],
  H001079: ["Copiah-Lincoln Community College"],
  H001061: ["Dartmouth College", "Northwestern University"],
  M001169: ["Exeter College (attended)"],
  M001153: ["Willamette University in Salem (attended)"],
  M001190: ["Missouri Valley College (attended)"],
  M000934: ["Kansas University School of Law (Lawrence, Kans.)"],
  B001236: [
    "Southern College of Optometry",
    "the University of Arkansas (attended)",
  ],
  B001277: [
    "Harvard University",
    "Yale University",
    "Cambridge University (attended)",
  ],
  B001261: [
    "Georgetown University (Washington)",
    "Georgetown University School of Medicine",
  ],
  D000622: ["Northern Illinois University (attended)"],
  C001098: ["Princeton University", "Harvard University"],
  C001095: ["Claremont Graduate University (attended)"],
  S001184: ["Presbyterian College (attended)"],
  S001228: ["Independence Community College (attended)"],
  P000621: [
    "Kean College of New Jersey (now Kean University) (attended)",
    "Rutgers University (attended)",
  ],
  M001239: ["Okaloosa Walton Community College (attended)"],
  M001236: ["Campbell University (attended)"],
  M001235: ["C.S. Monroe Technology Center (attended)"],
  S001188: [
    "Trine State University (attended)",
    "Glen Oaks Community College (attended)",
  ],
  M001234: ["Boston University (attended)"],
  B001318: ["Barnard College (attended)"],
  M001212: ["Troy State University (attended)"],
  F000472: ["the Air Command and Staff College (attended)"],
  G000553: ["Tuskegee University (attended)"],
  B001324: ["St. Louis Community College-Florissant Valley (attended)"],
  B001317: ["Southeastern Oklahoma State University (attended)"],
  A000379: [
    "Lee College (attended)",
    "Southwest Texas State College (attended)",
  ],
  M001215: ["San Antonio Junior College (attended)"],
  M001136: ["Lansing Community College (attended)"],
  G000593: ["Harvard University (attended)"],
  M001199: [
    "Palm Beach Atlantic University (attended)",
    "American Military University (attended)",
  ],
  R000609: ["Jacksonville Junior College (attended)"],
  S001224: [
    "the United States Army Command and General Staff College (attended)",
  ],
  M001224: ["the United States Military Academy (attended)"],
  L000603: ["Harvard University (attended)"],
  H001096: ["Casper College (attended)"],
  C001130: ["Thurgood Marshall School of Law (attended)"],
  B001306: ["Muskingum College (attended)", "Ohio State University (attended)"],
  G000585: ["Riverside Community College (attended)"],
  M001213: ["Utah State University (attended)"],
  G000594: ["Georgetown University (attended)"],
  J000302: ["Pennsylvania State University (attended)"],
  M001204: [
    "New York Maritime University (now SUNY Maritime College) (attended)",
  ],
  D000631: [
    "Montgomery County College (attended)",
    "Fels Institute of Government (attended)",
  ],
  S001199: ["Lebanon Valley College (attended)"],
  E000246: ["Blue Ridge Community College (attended)"],
  B001257: ["St. Petersburg Junior College (attended)"],
  W000798: [
    "Western Illinois University (attended)",
    "Moody Bible College Institute (attended)",
  ],
  D000600: ["the University of South Florida (attended)"],
  C001116: ["the University of Notre Dame (attended)"],
  F000246: ["the University of Massachusetts (attended)"],
  C001067: ["Oberlin College (attended)"],
  H001077: ["Louisiana State University (attended)"],
  H001086: ["East Tennessee State University (attended)"],
  R000600: [
    "George Mason University (attended)",
    "Loyola Marymount University (attended)",
  ],
  P000609: ["Northwest Alabama Junior College (attended)"],
  E000297: ["New York University (attended)", "Rutgers University (attended)"],
  T000474: [
    "Mount San Antonio College (attended)",
    "Rio Hondo College (attended)",
  ],
  M000194: ["Trident Technical College (attended)"],
  T000482: ["Harvard University (attended)"],
  D000629: ["Haskell Indian Nations University (attended)"],
  K000400: ["Compton College (attended)"],
  C001132: ["Arizona Western College (attended)"],
  R000395: ["Western Kentucky University (attended)"],
  S000522: ["Worcester College (attended)"],
  K000009: ["the University of Manchester (attended)"],
  F000476: ["the Valencia College (attended)"],
  D000216: ["the London School of Economics (attended)"],
  H001094: ["Bunker Hill Community College (attended)"],
  T000486: ["New York University (attended)"],
  W000814: ["Alvin Community College in Alvin (attended)"],
  G000600: ["Warren Wilson College (attended)", "Reed College (BA)"], // keep both
  P000617: ["Boston University (attended)"],
  H001086: ["East Tennessee State University (attended)"],
  M001199: [
    "Palm Beach Atlantic University (attended)",
    "American Military University (attended)",
  ],
  S001176: [],
};

const merged = {};
for (const id of Object.keys(wiki)) {
  const wikiEdu = wiki[id]?.education ?? [];
  // Only use bioguide if wiki is empty
  const bioEdu = bioguideOverrides[id] ?? [];
  merged[id] = {
    ...wiki[id],
    education: wikiEdu.length > 0 ? wikiEdu : bioEdu,
  };
}

const total = Object.keys(merged).length;
const filled = Object.values(merged).filter(
  (v) => v.education.length > 0,
).length;
console.log(`Total: ${total}`);
console.log(`With education: ${filled}`);
console.log(`Empty: ${total - filled}`);

fs.writeFileSync(
  path.join(__dirname, "../app/data/officials-static.json"),
  JSON.stringify(merged, null, 2),
);
console.log("✅ Merged file written");
