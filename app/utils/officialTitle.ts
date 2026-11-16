// DC and the territories each send one non-voting member to the House instead
// of a Representative: Puerto Rico's is the Resident Commissioner, and DC,
// Guam, the U.S. Virgin Islands, American Samoa, and the Northern Mariana
// Islands each have a Delegate. Accepts either the state name or its
// two-letter code, since both appear across the app's data.

const RESIDENT_COMMISSIONER_SEATS = new Set(["PR", "Puerto Rico"]);

const DELEGATE_SEATS = new Set([
  "DC",
  "District of Columbia",
  "GU",
  "Guam",
  "VI",
  "U.S. Virgin Islands",
  "Virgin Islands",
  "AS",
  "American Samoa",
  "MP",
  "Northern Mariana Islands",
]);

export function isNonVotingSeat(state?: string | null): boolean {
  if (!state) return false;
  return RESIDENT_COMMISSIONER_SEATS.has(state) || DELEGATE_SEATS.has(state);
}

// What to call a place in labels like "Priority State": DC is a district,
// the other non-voting seats are territories
export function placeKind(
  state?: string | null,
): "State" | "Territory" | "District" {
  if (state === "DC" || state === "District of Columbia") return "District";
  return isNonVotingSeat(state) ? "Territory" : "State";
}

// The House member's title for a state or territory, in full and shortened
// form (for narrow screens and tight layouts).
export function houseTitle(state?: string | null): {
  full: string;
  abbr: string;
} {
  if (state && RESIDENT_COMMISSIONER_SEATS.has(state)) {
    return { full: "Resident Commissioner", abbr: "Res. Comm." };
  }
  if (state && DELEGATE_SEATS.has(state)) {
    return { full: "Delegate", abbr: "Del" };
  }
  return { full: "Representative", abbr: "Rep" };
}

const STATE_CODES: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
  "Puerto Rico": "PR",
  Guam: "GU",
  "U.S. Virgin Islands": "VI",
  "Virgin Islands": "VI",
  "American Samoa": "AS",
  "Northern Mariana Islands": "MP",
};

// The two-letter code for a state or territory, given its name or its code
export function stateCode(state?: string | null): string | undefined {
  if (!state) return undefined;
  if (/^[A-Z]{2}$/.test(state)) return state;
  return STATE_CODES[state];
}

// A member's role line, in the order to try when space runs out. Senators:
// "Senator, Texas", "Sen, Texas", "Sen, TX". House members:
// "Representative, Texas, District 12", "Rep, Texas, District 12",
// "Rep, Texas, 12", "Rep, TX, 12". FitText shows the first that fits.
export function roleOptions({
  house,
  state,
  place = state ?? "",
  district,
}: {
  house: boolean;
  state?: string | null;
  // The state as written out, when state is its code
  place?: string;
  district?: number | string | null;
}): string[] {
  const title = house ? houseTitle(state) : { full: "Senator", abbr: "Sen" };
  const code = stateCode(state) ?? stateCode(place);
  const options = [
    `${title.full}, ${place}${district ? `, District ${district}` : ""}`,
    `${title.abbr}, ${place}${district ? `, District ${district}` : ""}`,
  ];
  if (district) options.push(`${title.abbr}, ${place}, ${district}`);
  if (code && code !== place) {
    options.push(`${title.abbr}, ${code}${district ? `, ${district}` : ""}`);
  }
  return options;
}
// The same steps for a role that arrives as text. Saved lists keep roles
// in whatever form they were added in, like "Representative, New York,
// District 12", "Rep, New York, District 12" or "Sen, TX", so any of them
// starts again from the full form.
const TITLES: Record<string, string> = {
  Representative: "Representative",
  Rep: "Representative",
  "Resident Commissioner": "Resident Commissioner",
  "Res. Comm.": "Resident Commissioner",
  Delegate: "Delegate",
  Del: "Delegate",
  Senator: "Senator",
  Sen: "Senator",
};
const STATE_NAMES: Record<string, string> = {};
for (const [name, code] of Object.entries(STATE_CODES)) {
  STATE_NAMES[code] ??= name;
}
export function roleOptionsFromText(role: string): string[] {
  const m = role.match(
    /^(Representative|Rep|Resident Commissioner|Res\. Comm\.|Delegate|Del|Senator|Sen),\s*([^,]+?)(?:(?:,| -)\s*(?:District\s*)?(\d+))?\s*$/,
  );
  if (!m) return [role];
  const [, title, written, district] = m;
  const place = STATE_NAMES[written] ?? written;
  return roleOptions({
    house: TITLES[title] !== "Senator",
    state: stateCode(place) ?? place,
    place,
    district,
  });
}
