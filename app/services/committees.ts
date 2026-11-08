import { getDb } from "../utils/database";
import { apiClient } from "./api";

export type CommitteeMember = {
  bioguideId: string;
  side: "majority" | "minority";
  rank: number;
  title: string | null;
};

export type Subcommittee = {
  id: string;
  name: string;
  members: CommitteeMember[];
};

export type Committee = {
  id: string;
  name: string;
  shortName: string;
  chamber: "House" | "Senate" | "Joint";
  members: CommitteeMember[];
  // Missing from copies cached before subcommittees were added
  subcommittees?: Subcommittee[];
};

type CommitteesResponse = { committees: Committee[]; updatedAt: number };

const STALE_MS = 60 * 60 * 1000; // 1 hour, like the officials list

const readCache = (): {
  data: CommitteesResponse;
  fetchedAt: number;
} | null => {
  try {
    const row = getDb().getFirstSync<{ data: string; fetched_at: number }>(
      `SELECT data, fetched_at FROM committees_cache WHERE id = 1`,
    );
    return row
      ? { data: JSON.parse(row.data), fetchedAt: row.fetched_at }
      : null;
  } catch {
    return null;
  }
};

const fetchAndCache = async (): Promise<CommitteesResponse> => {
  const fresh = await apiClient.get<CommitteesResponse>("/committees");
  try {
    getDb().runSync(
      `INSERT INTO committees_cache (id, data, fetched_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
      [JSON.stringify(fresh), Date.now()],
    );
  } catch (error) {
    console.error("Error saving committees cache:", error);
  }
  return fresh;
};

export const committeesService = {
  // A stale copy shows right away while a new one downloads for next time
  getAll: async (): Promise<CommitteesResponse> => {
    const cached = readCache();
    if (!cached) return fetchAndCache();
    if (Date.now() - cached.fetchedAt > STALE_MS) {
      fetchAndCache().catch((error) =>
        console.warn("Background committees refresh failed (silent):", error),
      );
    }
    return cached.data;
  },
};

// The name for the header, where the chamber isn't otherwise shown. A few
// names already say it, like "House Administration" and "Joint Economic
// Committee", or would read oddly with it, like the Helsinki Commission.
export const committeeLabel = ({ chamber, shortName }: Committee): string =>
  shortName.startsWith(chamber) || shortName.startsWith("Commission")
    ? shortName
    : `${chamber} ${shortName}`;
