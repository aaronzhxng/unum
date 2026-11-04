// POST /api/subscribe: the newsletter signup form. Adds the address as
// pending and emails a confirmation link; nobody gets the newsletter until
// they click it.
import { db, now, newToken, cleanEmail, verifyTurnstile, sendEmail, confirmationEmail, reply } from "../../server/newsletter.js";

// Wait this long before sending another confirmation to the same address
const RESEND_AFTER_MS = 10 * 60 * 1000;

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  // The hidden "website" field is left empty by people; bots fill it in.
  // They get a normal-looking success and nothing happens.
  if (form.get("website")) return reply(request, true, "/newsletter/check-email");

  const email = cleanEmail(form.get("email"));
  if (!email) return reply(request, false, "/newsletter?error=email");
  const human = await verifyTurnstile(env, form.get("cf-turnstile-response"), request.headers.get("CF-Connecting-IP"));
  if (!human) return reply(request, false, "/newsletter?error=check");

  const DB = await db(env);
  const existing = await DB.prepare("SELECT status, token, confirm_sent_at FROM subscribers WHERE email = ?").bind(email).first();
  // Already subscribed: say the same thing as for a new address, so the form
  // never reveals who is on the list
  if (existing?.status === "active") return reply(request, true, "/newsletter/check-email");
  if (existing?.confirm_sent_at && Date.now() - Date.parse(existing.confirm_sent_at) < RESEND_AFTER_MS) {
    return reply(request, true, "/newsletter/check-email");
  }

  const token = existing?.token ?? newToken();
  if (existing) {
    await DB.prepare("UPDATE subscribers SET status = 'pending' WHERE email = ?").bind(email).run();
  } else {
    await DB.prepare("INSERT INTO subscribers (email, status, token, created_at) VALUES (?, 'pending', ?, ?)").bind(email, token, now()).run();
  }
  await sendEmail(env, { to: email, ...confirmationEmail(token, new URL(request.url).origin) });
  // Only counts as sent once Resend accepts it, so a failure can be retried
  await DB.prepare("UPDATE subscribers SET confirm_sent_at = ? WHERE email = ?").bind(now(), email).run();
  return reply(request, true, "/newsletter/check-email");
}
