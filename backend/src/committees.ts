// Who sits on each committee of Congress, and in what order. Congress.gov has
// no membership data, so this comes from the congress-legislators project. Its
// main branch is read directly because the JSON copies it publishes on
// github.io can lag behind by weeks. A job refreshes this daily, and a failed
// refresh keeps the last good copy.
import axios from "axios";
import yaml from "js-yaml";
import cron from "node-cron";
import db from "./db";

const SOURCE = "https://raw.githubusercontent.com/unitedstates/congress-legislators/main";
// Official names too long for the app's header
const SHORT_NAMES: Record<string, string> = {
  HSZS: "China Select Committee",
  HSQJ: "January 6 Select Subcommittee",
};
// Listed as committees by the source, but they aren't. The January 6 panel
// returns with subcommittees, and the Narcotics Caucus with caucuses.
const HIDDEN = new Set(["HSQJ", "SCNC"]);
// Congress has about 50 committees and about 1,300 seats on them, so anything
// far below that is a bad download rather than a real change
const MIN_COMMITTEES = 40;
const MIN_SEATS = 1000;

db.exec(`
  CREATE TABLE IF NOT EXISTS committee_roster (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`);

type Side = "majority" | "minority";

export type CommitteeMember = {
  bioguideId: string;
  side: Side;
  rank: number;
  title: string | null;
};

export type Committee = {
  id: string;
  name: string;
  shortName: string;
  chamber: "House" | "Senate" | "Joint";
  members: CommitteeMember[];
};

const CHAMBERS = { house: "House", senate: "Senate", joint: "Joint" } as const;

// "Senate Committee on the Judiciary" becomes "Judiciary". Names that don't
// follow the pattern, like "Joint Economic Committee", stay whole.
const shortNameOf = (name: string) =>
  name
    .replace(/^(United States )?(House |Senate )/, "")
    .replace(/^(Joint )?(Permanent )?(Select |Special )?Committee (of Congress )?on (the )?/, "");

// The source mixes Chair, Chairman and Chairwoman, so they share one label
const cleanTitle = (title?: string): string | null => {
  if (!title) return null;
  if (/^vice chair/i.test(title)) return "Vice Chair";
  if (/^co-?chair/i.test(title)) return "Co-Chair";
  if (/^chair/i.test(title)) return "Chair";
  return title;
};

// Chair, then the minority's leader, then each party by rank. Some committees
// call the minority's leader the Vice Chair instead of the Ranking Member.
const orderGroup = ({ title, side }: CommitteeMember) => {
  if (title === "Chair" || title === "Co-Chair") return 0;
  if (title === "Ranking Member" || (title === "Vice Chair" && side === "minority")) return 1;
  return side === "majority" ? 2 : 3;
};

const SIDE_ORDER: Record<Side, number> = { majority: 0, minority: 1 };
const CHAMBER_ORDER = { House: 0, Senate: 1, Joint: 2 };

export const orderMembers = (members: CommitteeMember[]): CommitteeMember[] =>
  [...members].sort(
    (a, b) =>
      orderGroup(a) - orderGroup(b) ||
      SIDE_ORDER[a.side] - SIDE_ORDER[b.side] ||
      a.rank - b.rank,
  );

export const buildCommittees = (committees: any[], membership: Record<string, any[]>): Committee[] =>
  committees
    .filter((committee) => !HIDDEN.has(committee.thomas_id))
    .map((committee) => ({
      id: committee.thomas_id as string,
      name: committee.name as string,
      shortName: SHORT_NAMES[committee.thomas_id] ?? shortNameOf(committee.name),
      chamber: CHAMBERS[committee.type as keyof typeof CHAMBERS],
      members: orderMembers(
        (membership[committee.thomas_id] ?? []).map((member) => ({
          bioguideId: member.bioguide,
          side: member.party,
          rank: member.rank,
          title: cleanTitle(member.title),
        })),
      ),
    }))
    .filter((committee) => committee.members.length > 0)
    .sort(
      (a, b) =>
        CHAMBER_ORDER[a.chamber] - CHAMBER_ORDER[b.chamber] ||
        a.shortName.localeCompare(b.shortName),
    );

const download = async (file: string) => {
  const { data } = await axios.get(`${SOURCE}/${file}`, { responseType: "text", timeout: 30000 });
  return yaml.load(data);
};

const saved = (): { data: string; fetched_at: number } | undefined =>
  db.prepare(`SELECT data, fetched_at FROM committee_roster WHERE id = 1`).get() as any;

let refreshing = false;

export const refreshCommittees = async (): Promise<void> => {
  if (refreshing) return;
  refreshing = true;
  try {
    const committees = buildCommittees(
      (await download("committees-current.yaml")) as any[],
      (await download("committee-membership-current.yaml")) as Record<string, any[]>,
    );
    const seats = committees.reduce((total, committee) => total + committee.members.length, 0);
    if (committees.length < MIN_COMMITTEES || seats < MIN_SEATS) {
      throw new Error(`only ${committees.length} committees and ${seats} seats`);
    }
    db.prepare(
      `INSERT INTO committee_roster (id, data, fetched_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
    ).run(JSON.stringify(committees), Date.now());
    console.log(`Committees: ${committees.length} committees, ${seats} seats`);
  } catch (error: any) {
    console.error("Committee refresh failed:", error.message);
  } finally {
    refreshing = false;
  }
};

// The saved JSON as text, so the route doesn't parse and re-encode it each time
export const committeesJson = (): string | null => {
  const row = saved();
  return row ? `{"committees":${row.data},"updatedAt":${row.fetched_at}}` : null;
};

// Also runs at startup, so a deploy that changes how the list is built applies
// right away instead of at the next daily refresh
export const startCommitteeRefresh = () => {
  refreshCommittees();
  cron.schedule("0 9 * * *", refreshCommittees);
};
