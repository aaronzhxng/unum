// POST /api/send: sends an issue, from the private page at /newsletter/send.
// Needs the SEND_SECRET password. Fields: secret, issue (its file name),
// mode, and for tests, to.
//   mode=count  how many subscribers would get it, and whether it was sent
//   mode=test   one copy to the address in "to"
//   mode=all    every active subscriber, once per issue, from the live site
//               only, and only once MAILING_ADDRESS is set
import { db, now, SITE, REPLY_TO, fromLine, sendEmail } from "../../server/newsletter.js";

const BATCH = 100; // Resend's most emails per batch call

// Compares without leaking how much of the password matched
function same(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const fail = (status, error) => Response.json({ error }, { status });

export async function onRequestPost({ request, env }) {
  if (!env.SEND_SECRET) return fail(503, "SEND_SECRET is not set up in Cloudflare.");
  const form = await request.formData();
  if (!same(form.get("secret"), env.SEND_SECRET)) return fail(401, "Wrong send password.");
  const issue = String(form.get("issue") || "");
  if (!/^[a-z0-9-]+$/.test(issue)) return fail(400, "Pick an issue.");
  const mode = form.get("mode");
  const origin = new URL(request.url).origin;

  // The email version is a static page built alongside the issue
  const page = await env.ASSETS.fetch(new Request(`${origin}/newsletter/${issue}/email.html`));
  if (!page.ok) return fail(404, "That issue has no email version on this site.");
  const template = await page.text();
  const subject = template.match(/<title>([^<]*)<\/title>/)?.[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') ?? "Congress Weekly";
  const fill = (unsubscribe) =>
    template
      .replaceAll("{{origin}}", origin)
      .replaceAll("{{unsubscribe_url}}", unsubscribe)
      .replaceAll("{{mailing_address}}", env.MAILING_ADDRESS || "[mailing address]");
  const text = (unsubscribe) =>
    `${subject}\n\nRead this week's issue: ${origin}/newsletter/${issue}\n\nUnsubscribe: ${unsubscribe}\nUnum Initiative Inc. · ${env.MAILING_ADDRESS || ""}`;

  const DB = await db(env);
  await DB.prepare("CREATE TABLE IF NOT EXISTS sends (issue TEXT PRIMARY KEY, started_at TEXT NOT NULL, recipients INTEGER, finished_at TEXT)").run();
  const sent = await DB.prepare("SELECT started_at, recipients FROM sends WHERE issue = ?").bind(issue).first();
  const { n } = await DB.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE status = 'active'").first();

  if (mode === "count") return Response.json({ subject, subscribers: n, alreadySent: sent });

  if (mode === "test") {
    const to = String(form.get("to") || "").trim();
    if (!to.includes("@")) return fail(400, "Enter an address for the test.");
    const unsubscribe = `${origin}/newsletter/unsubscribe`;
    await sendEmail(env, { to, subject: `[Test] ${subject}`, html: fill(unsubscribe), text: text(unsubscribe) });
    return Response.json({ sent: 1, to });
  }

  if (mode !== "all") return fail(400, "Unknown mode.");
  if (origin !== SITE) return fail(403, "Send to subscribers from unuminitiative.com, not a preview link, so the images and links in the email last.");
  if (!env.MAILING_ADDRESS) return fail(503, "Add MAILING_ADDRESS in Cloudflare first. The law requires a postal address in every newsletter.");
  if (sent) return fail(409, `This issue was already sent on ${sent.started_at.slice(0, 10)} to ${sent.recipients ?? "some"} subscribers.`);

  // Claim the issue before sending, so a second click cannot send it twice
  await DB.prepare("INSERT INTO sends (issue, started_at) VALUES (?, ?)").bind(issue, now()).run();
  const { results } = await DB.prepare("SELECT email, token FROM subscribers WHERE status = 'active'").all();
  let count = 0;
  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH).map(({ email, token }) => {
      const unsubscribe = `${SITE}/api/unsubscribe?token=${token}`;
      return {
        from: fromLine(env),
        reply_to: REPLY_TO,
        to: [email],
        subject,
        html: fill(unsubscribe),
        text: text(unsubscribe),
        // Lets Gmail and Apple Mail show their own one-click Unsubscribe
        headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      };
    });
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      await DB.prepare("UPDATE sends SET recipients = ? WHERE issue = ?").bind(count, issue).run();
      return fail(502, `Resend stopped the send after ${count} emails: ${await res.text()}`);
    }
    count += batch.length;
    // Stays under Resend's default limit of 2 requests a second
    if (i + BATCH < results.length) await new Promise((r) => setTimeout(r, 600));
  }
  await DB.prepare("UPDATE sends SET recipients = ?, finished_at = ? WHERE issue = ?").bind(count, now(), issue).run();
  return Response.json({ sent: count });
}
