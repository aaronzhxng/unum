// Resolves a street address to its exact congressional district using the
// U.S. Census Bureau Geocoder (geocoding.geo.census.gov). Unlike a zip code
// lookup, a street address falls in exactly one district.

// Pinned to the 119th Congress districts, which current members represent.
// The "Current" vintage already returns the 120th Congress districts (seated
// January 2027) — switch to Current_Current when the 120th Congress begins.
// Keep in sync with DISTRICT_LAYER_URL in CongressionalDistrictMap.tsx.
const CENSUS_VINTAGE = "ACS2025_Current";
const CONGRESSIONAL_DISTRICTS_LAYER = "54";

const GEOCODER_URL =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP",
  "72": "PR", "78": "VI",
};

export type AddressDistrict = {
  matchedAddress: string;
  latitude: number;
  longitude: number;
  stateAbbr: string;
  // 0 for at-large seats and non-voting delegates
  district: number;
  geoid: string;
};

type CensusDistrictGeography = {
  GEOID?: string;
  STATE?: string;
};

type CensusGeocoderResponse = {
  result?: {
    addressMatches?: {
      matchedAddress: string;
      coordinates: { x: number; y: number };
      geographies?: Record<string, CensusDistrictGeography[]>;
    }[];
  };
};

// Census GEOIDs are state FIPS + 2-digit district code. "00" is an at-large
// seat and "98" a non-voting delegate; both map to district 0 in our data.
function districtFromGeoid(geoid: string): number {
  const code = Number.parseInt(geoid.slice(2), 10);
  if (!Number.isFinite(code) || code === 98) return 0;
  return code;
}

export async function geocodeAddressToDistrict(
  query: string,
): Promise<AddressDistrict | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const params = [
    `address=${encodeURIComponent(trimmed)}`,
    "benchmark=Public_AR_Current",
    `vintage=${CENSUS_VINTAGE}`,
    `layers=${CONGRESSIONAL_DISTRICTS_LAYER}`,
    "format=json",
  ].join("&");

  const response = await fetch(`${GEOCODER_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Census geocoder request failed (${response.status})`);
  }

  const data = (await response.json()) as CensusGeocoderResponse;
  const match = data.result?.addressMatches?.[0];
  if (!match?.geographies) return null;

  const districtKey = Object.keys(match.geographies).find((key) =>
    key.includes("Congressional Districts"),
  );
  const geography = districtKey ? match.geographies[districtKey]?.[0] : null;
  if (!geography?.GEOID || !geography.STATE) return null;

  const stateAbbr = FIPS_TO_ABBR[geography.STATE];
  if (!stateAbbr) return null;

  return {
    matchedAddress: match.matchedAddress,
    latitude: match.coordinates.y,
    longitude: match.coordinates.x,
    stateAbbr,
    district: districtFromGeoid(geography.GEOID),
    geoid: geography.GEOID,
  };
}
