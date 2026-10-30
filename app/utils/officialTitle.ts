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
