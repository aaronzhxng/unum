// Policy area colors and icons, matching the app (app/(tabs)/legislation.tsx
// and app/utils/billIcons.ts). Icons are in public/newsletter/icons.
export const POLICY_AREAS = {
  "Agriculture and Food": { color: "#7CB342", icon: "agriculture.png" },
  "Animals": { color: "#8D6E63", icon: "animals.png" },
  "Armed Forces and National Security": { color: "#455A64", icon: "armed-forces.png" },
  "Arts, Culture, Religion": { color: "#AB47BC", icon: "arts.png" },
  "Civil Rights and Liberties, Minority Issues": { color: "#E53935", icon: "civil-rights.png" },
  "Commerce": { color: "#00ACC1", icon: "commerce.png" },
  "Congress": { color: "#1565C0", icon: "congress.png" },
  "Crime and Law Enforcement": { color: "#424242", icon: "crime.png" },
  "Economics and Public Finance": { color: "#4CAF82", icon: "economics.png" },
  "Education": { color: "#F5A623", icon: "education.png" },
  "Emergency Management": { color: "#FF5722", icon: "emergency.png" },
  "Energy": { color: "#E67E22", icon: "energy.png" },
  "Environmental Protection": { color: "#43A047", icon: "environment.png" },
  "Families": { color: "#F06292", icon: "families.png" },
  "Finance and Financial Sector": { color: "#4CAF82", icon: "finance.png" },
  "Foreign Trade and International Finance": { color: "#9B59B6", icon: "foreign-trade.png" },
  "Government Operations and Politics": { color: "#6B7FD4", icon: "government.png" },
  "Health": { color: "#E53935", icon: "health.png" },
  "Housing and Community Development": { color: "#FF8F00", icon: "housing.png" },
  "Immigration": { color: "#00897B", icon: "immigration.png" },
  "International Affairs": { color: "#1E88E5", icon: "international.png" },
  "Labor and Employment": { color: "#6D4C41", icon: "labor.png" },
  "Law": { color: "#546E7A", icon: "law.png" },
  "Native Americans": { color: "#BF360C", icon: "native-americans.png" },
  "Public Lands and Natural Resources": { color: "#27AE60", icon: "public-lands.png" },
  "Science, Technology, Communications": { color: "#0288D1", icon: "science.png" },
  "Social Welfare": { color: "#E91E8C", icon: "social-welfare.png" },
  "Sports and Recreation": { color: "#00BCD4", icon: "sports.png" },
  "Taxation": { color: "#F9A825", icon: "taxation.png" },
  "Transportation and Public Works": { color: "#5C6BC0", icon: "transportation.png" },
  "Water Resources Development": { color: "#0277BD", icon: "water.png" },
};

export const DEFAULT_POLICY = { color: "#008CFF", icon: "default.png" };

export function policyArea(name) {
  return (name && POLICY_AREAS[name]) || DEFAULT_POLICY;
}

// "hconres89" -> { label: "H.Con.Res. 89", url: congress.gov page }
const BILL_TYPES = {
  hr: ["H.R.", "house-bill"],
  s: ["S.", "senate-bill"],
  hres: ["H.Res.", "house-resolution"],
  sres: ["S.Res.", "senate-resolution"],
  hjres: ["H.J.Res.", "house-joint-resolution"],
  sjres: ["S.J.Res.", "senate-joint-resolution"],
  hconres: ["H.Con.Res.", "house-concurrent-resolution"],
  sconres: ["S.Con.Res.", "senate-concurrent-resolution"],
};

export function billInfo(id, congress = 119) {
  const [, type, number] = id.toLowerCase().match(/^([a-z]+)(\d+)$/);
  const [prefix, path] = BILL_TYPES[type];
  return {
    label: `${prefix} ${number}`,
    url: `https://www.congress.gov/bill/${congress}th-congress/${path}/${number}`,
  };
}
