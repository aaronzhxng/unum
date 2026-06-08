import { Platform } from "react-native";

const IOS_BUNDLE_ID = "com.unuminitiative.unum";
const ANDROID_PACKAGE_ID = "com.unuminitiative.unum";

export interface StoreVersionInfo {
  version: string;
  storeUrl: string;
}

export async function getStoreVersionInfo(): Promise<StoreVersionInfo | null> {
  try {
    if (Platform.OS === "ios") {
      const res = await fetch(
        `https://itunes.apple.com/lookup?bundleId=${IOS_BUNDLE_ID}`,
      );
      const json = await res.json();
      const result = json.results?.[0];
      if (!result?.version) return null;
      return { version: result.version, storeUrl: result.trackViewUrl };
    }

    if (Platform.OS === "android") {
      const res = await fetch(
        `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&hl=en&gl=US`,
      );
      const html = await res.text();
      // Google's current structured-data pattern for version in Play Store HTML.
      // If this breaks after a Google HTML update, the check fails gracefully.
      const match = html.match(/\[\["(\d+\.\d+(?:\.\d+)*)"\]\]/);
      if (!match?.[1]) return null;
      return {
        version: match[1],
        storeUrl: `market://details?id=${ANDROID_PACKAGE_ID}`,
      };
    }
  } catch {
    // Network failure or parse error — silently ignore, don't break the app
  }
  return null;
}

// Returns true if storeVersion is strictly newer than currentVersion.
// Compares each dot-separated segment numerically.
export function isNewerVersion(
  storeVersion: string,
  currentVersion: string,
): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const store = parse(storeVersion);
  const current = parse(currentVersion);
  const len = Math.max(store.length, current.length);
  for (let i = 0; i < len; i++) {
    const s = store[i] ?? 0;
    const c = current[i] ?? 0;
    if (s > c) return true;
    if (s < c) return false;
  }
  return false;
}
