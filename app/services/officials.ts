import { getDb } from "../utils/database";
import { apiClient } from "./api";

interface Official {
  bioguideId: string;
  name: string;
  state: string;
  district?: string;
  partyName: string;
  updateDate: string;
}

interface OfficialsResponse {
  officials: Official[];
  count: number;
}

const OFFICIALS_LIST_STALE_MS = 60 * 60 * 1000; // 1 hour
const OFFICIALS_CACHE_VERSION = 2; // bump this to force a cache clear

// ─── Cache helpers ────────────────────────────────────────────────────────────

const getCachedOfficialsList = (): {
  data: OfficialsResponse;
  fetchedAt: number;
} | null => {
  try {
    const db = getDb();
    const row = db.getFirstSync<{
      data: string;
      fetched_at: number;
      version?: number;
    }>(`SELECT data, fetched_at FROM officials_list_cache WHERE id = 1`);
    if (!row) return null;
    // Force cache clear if version doesn't match
    const parsed = JSON.parse(row.data);
    if (parsed.__cacheVersion !== OFFICIALS_CACHE_VERSION) return null;
    return { data: parsed, fetchedAt: row.fetched_at };
  } catch {
    return null;
  }
};

const saveOfficialsListCache = (response: OfficialsResponse): void => {
  try {
    const db = getDb();
    const stamped = { ...response, __cacheVersion: OFFICIALS_CACHE_VERSION };
    db.runSync(
      `INSERT INTO officials_list_cache (id, data, fetched_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
      [JSON.stringify(stamped), Date.now()],
    );
  } catch (error) {
    console.error("Error saving officials list cache:", error);
  }
};

// ─── Background refresh ───────────────────────────────────────────────────────

let backgroundRefreshInProgress = false;

const refreshOfficialsInBackground = async (): Promise<void> => {
  if (backgroundRefreshInProgress) return;
  backgroundRefreshInProgress = true;

  try {
    // console.log(
    //   "🔄 Background refresh: fetching fresh officials from Railway...",
    // );
    const fresh = await apiClient.get<OfficialsResponse>("/officials");
    saveOfficialsListCache(fresh);
    // console.log(
    //   `✅ Background refresh complete — ${fresh.officials.length} officials cached`,
    // );
  } catch (error) {
    console.warn("Background officials refresh failed (silent):", error);
  } finally {
    backgroundRefreshInProgress = false;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const officialsService = {
  getAll: async (): Promise<OfficialsResponse> => {
    const cached = getCachedOfficialsList();

    if (cached) {
      const isStale = Date.now() - cached.fetchedAt > OFFICIALS_LIST_STALE_MS;
      if (isStale) {
        refreshOfficialsInBackground();
      }
      return cached.data;
    }

    // console.log(
    //   "📡 No officials cache found — fetching from Railway (first launch)...",
    // );
    const fresh = await apiClient.get<OfficialsResponse>("/officials");
    saveOfficialsListCache(fresh);
    return fresh;
  },

  getById: async (bioguideId: string): Promise<any> => {
    return apiClient.get(`/officials/${bioguideId}`);
  },

  getSponsored: async (bioguideId: string): Promise<any> => {
    return apiClient.get(`/officials/${bioguideId}/sponsored`);
  },

  getCosponsored: async (bioguideId: string): Promise<any> => {
    return apiClient.get(`/officials/${bioguideId}/cosponsored`);
  },

  getBio: async (bioguideId: string): Promise<any> => {
    const response = await fetch(
      `https://bioguide.congress.gov/search/bio/${bioguideId}.json`,
    );
    if (!response.ok) throw new Error("Failed to fetch bio");
    const json = await response.json();
    const data = json?.data;
    return {
      profileText: data?.profileText ?? null,
      birthDate: data?.birthDate ?? null,
      nickName: data?.nickName ?? null,
      creativeWork: data?.creativeWork ?? [],
    };
  },
};
