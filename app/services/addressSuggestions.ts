// Address autocomplete for the district search, via the Mapbox Geocoding API.
// Suggestions only fill in the text field — the district itself still comes
// from the Census geocoder (censusGeocoding.ts) once the user searches.

import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";

// Kept out of git. Locally it comes from the root .env; EAS builds can't see
// .env (.easignore excludes it), so for builds it's set as an EAS environment
// variable (`eas env:create --name EXPO_PUBLIC_MAPBOX_TOKEN ...`).
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const MAPBOX_GEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/forward";

export type AddressSuggestion = {
  id: string;
  // e.g. "1600 Pennsylvania Avenue Northwest"
  street: string;
  // e.g. "Washington, District of Columbia 20500"
  place: string;
  fullAddress: string;
};

type MapboxFeature = {
  properties: {
    mapbox_id: string;
    name: string;
    place_formatted?: string;
    full_address?: string;
  };
};

const stripCountry = (text: string) => text.replace(/,\s*United States$/, "");

export async function fetchAddressSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  // No token configured: the address field still works, just without
  // suggestions
  if (!MAPBOX_TOKEN) return [];

  const params = [
    `q=${encodeURIComponent(query)}`,
    "autocomplete=true",
    "country=us",
    "types=address",
    "limit=5",
    // Rank addresses near the user first, without needing location permission
    "proximity=ip",
    `access_token=${MAPBOX_TOKEN}`,
  ].join("&");

  const response = await fetch(`${MAPBOX_GEOCODE_URL}?${params}`, { signal });
  if (!response.ok) return [];

  const data = (await response.json()) as { features?: MapboxFeature[] };
  return (data.features ?? []).map((feature) => {
    const { mapbox_id, name, place_formatted, full_address } =
      feature.properties;
    const place = stripCountry(place_formatted ?? "");
    return {
      id: mapbox_id,
      street: name,
      place,
      fullAddress: stripCountry(full_address ?? `${name}, ${place}`),
    };
  });
}

// Suggestions for what's typed into an address field, looked up once the user
// pauses typing.
export function useAddressSuggestions(query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const trimmed = query.trim();
    if (!enabled || trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchAddressSuggestions(trimmed, controller.signal)
        .then((results) => {
          // A lookup can finish after the user has already closed the keyboard
          if (Keyboard.isVisible()) setSuggestions(results);
        })
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  // The dropdown floats over the screen, so it goes away with the keyboard
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () =>
      setSuggestions([]),
    );
    return () => subscription.remove();
  }, []);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  // Call before filling the field from a picked suggestion, so that fill
  // doesn't trigger another lookup
  const skipNextLookup = useCallback(() => {
    skipNext.current = true;
    setSuggestions([]);
  }, []);

  return { suggestions, clearSuggestions, skipNextLookup };
}
