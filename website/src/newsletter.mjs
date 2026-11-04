// Every newsletter issue, newest first. Issues marked draft (as
// scripts/newsletter/draftIssue.mjs writes them) show in local builds and
// on preview links, but never on the live site, which Cloudflare builds
// from master.
import { getCollection } from "astro:content";

const LIVE = process.env.CF_PAGES_BRANCH === "master";

export async function getIssues() {
  const issues = await getCollection("newsletter", ({ data }) => !(LIVE && data.draft));
  return issues.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
