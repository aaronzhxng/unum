type NominatimAddress = {
  postcode?: string;
  state?: string;
  state_code?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  road?: string;
  house_number?: string;
  country_code?: string;
};

type NominatimSearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

export type OsmResolvedLocation = {
  displayName: string;
  latitude: number;
  longitude: number;
  postcode: string | null;
  stateAbbr: string | null;
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const STATE_NAME_TO_ABBR: Record<string, string> = {
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
  Guam: "GU",
  "Northern Mariana Islands": "MP",
  "Puerto Rico": "PR",
  "U.S. Virgin Islands": "VI",
  "American Samoa": "AS",
};

function normalizePostcode(postcode?: string): string | null {
  if (!postcode) return null;
  const match = postcode.match(/\d{5}/);
  return match ? match[0] : null;
}

function extractStateAbbr(address?: NominatimAddress): string | null {
  if (!address) return null;

  if (address.state_code && address.state_code.length === 2) {
    return address.state_code.toUpperCase();
  }

  if (address.state && STATE_NAME_TO_ABBR[address.state]) {
    return STATE_NAME_TO_ABBR[address.state];
  }

  return null;
}

async function fetchNominatimJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function geocodeAddress(
  query: string,
): Promise<OsmResolvedLocation | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const searchUrl = new URL(`${NOMINATIM_BASE}/search`);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("limit", "1");
  searchUrl.searchParams.set("addressdetails", "1");
  searchUrl.searchParams.set("countrycodes", "us");
  searchUrl.searchParams.set("q", trimmed);

  const results = await fetchNominatimJson<NominatimSearchResult[]>(
    searchUrl.toString(),
  );

  const first = results[0];
  if (!first) return null;

  const postcode = normalizePostcode(first.address?.postcode);
  const stateAbbr = extractStateAbbr(first.address);

  if (postcode && stateAbbr) {
    return {
      displayName: first.display_name,
      latitude: Number.parseFloat(first.lat),
      longitude: Number.parseFloat(first.lon),
      postcode,
      stateAbbr,
    };
  }

  const reverseUrl = new URL(`${NOMINATIM_BASE}/reverse`);
  reverseUrl.searchParams.set("format", "jsonv2");
  reverseUrl.searchParams.set("addressdetails", "1");
  reverseUrl.searchParams.set("lat", first.lat);
  reverseUrl.searchParams.set("lon", first.lon);

  const reverse = await fetchNominatimJson<{
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: NominatimAddress;
  }>(reverseUrl.toString());

  return {
    displayName: reverse.display_name ?? first.display_name,
    latitude: Number.parseFloat(reverse.lat ?? first.lat),
    longitude: Number.parseFloat(reverse.lon ?? first.lon),
    postcode: normalizePostcode(
      reverse.address?.postcode ?? first.address?.postcode,
    ),
    stateAbbr: extractStateAbbr(reverse.address) ?? stateAbbr,
  };
}
