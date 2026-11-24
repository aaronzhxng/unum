// Sponsor details for the newsletter's bill entries, shared by the web and
// email versions. Photos are saved by scripts/newsletter/memberPhotos.mjs.
import fs from "node:fs";
import path from "node:path";

export const PARTY_COLORS = { D: "#008cff", R: "#d45252", I: "#b59f00" };

// The photo's address, or null when there is none (the entry then shows the
// sponsor's initials). Checked at build time, which runs in website/.
export function memberPhoto(id) {
  return id && fs.existsSync(path.join(process.cwd(), "public", "newsletter", "members", `${id}.jpg`))
    ? `/newsletter/members/${id}.jpg`
    : null;
}

// "Rep. Bryan Steil (R-WI-1)" gives party "R" and initials "BS"
export function sponsorParts(sponsor) {
  const party = sponsor.match(/\(([DRI])-/)?.[1];
  const words = sponsor.replace(/\(.*\)/, "").replace(/^(Rep|Sen|Del)\.\s+/, "").trim().split(/\s+/);
  const initials = (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
  return { party, initials, color: PARTY_COLORS[party] ?? "#7b7c81" };
}
