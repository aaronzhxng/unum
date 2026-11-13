// Newsletter issues: one Markdown file per week in src/content/newsletter.
// The file name is the issue's address, e.g. september-21-25-2026.md is
// served at /newsletter/september-21-25-2026. The front matter holds the
// numbers and bills; the Markdown body is the opening note.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const stage = z.object({
  label: z.string(),
  // done: reached; current: where it is now; todo: not yet; failed: stopped here
  status: z.enum(["done", "current", "todo", "failed"]),
});

const vote = z.object({
  chamber: z.enum(["House", "Senate"]),
  date: z.coerce.date(),
  result: z.string(),
  yea: z.number(),
  nay: z.number(),
});

const byChamber = z.union([z.number(), z.object({ house: z.number(), senate: z.number() })]);

const bill = z.object({
  id: z.string().regex(/^[a-z]+\d+$/),
  title: z.string(),
  policyArea: z.string().optional(),
  sponsor: z.string(),
  // Bioguide ID, for the sponsor's photo in public/newsletter/members
  // (scripts/newsletter/memberPhotos.mjs saves them)
  sponsorId: z.string().regex(/^[A-Z]\d{6}$/).optional(),
  // The bill's dated event that week, e.g. "Signed into law" (draftIssue.mjs fills it)
  when: z.object({ label: z.string(), date: z.coerce.date() }).optional(),
  summary: z.string(),
  // Optional background note, written by hand
  context: z.string().optional(),
  // Every committee it has been to, in order, when there is more than one
  // (draftIssue.mjs fills it)
  committees: z
    .array(z.object({ name: z.string(), status: z.enum(["referred", "marked up", "reported", "discharged"]), date: z.coerce.date() }))
    .optional(),
  stages: z.array(stage),
  votes: z.array(vote).optional(),
});

const newsletter = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/newsletter" }),
  schema: z.object({
    // Shown in local builds and on preview links, never on the live site
    draft: z.boolean().optional(),
    // The week covered, e.g. "September 21–25"
    week: z.string(),
    // The Monday it went out
    date: z.coerce.date(),
    headline: z.string(),
    // One-line summary for the archive, search results, and link previews
    description: z.string(),
    stats: z.object({
      signed: z.number(),
      passedBoth: z.number(),
      // A plain number, or split by chamber
      outOfCommittee: byChamber,
      introduced: byChamber,
    }),
    sections: z.array(
      z.object({
        heading: z.string(),
        bills: z.array(bill),
      }),
    ),
    signoff: z.string(),
  }),
});

export const collections = { newsletter };
