// POST /api/subscribe: the newsletter signup form. Subscribes the address right
// away and sends the welcome email, which has an unsubscribe link in case
// someone else entered the address.
import { db, now, newToken, cleanEmail, verifyTurnstile, sendWelcome, reply } from "../../server/newsletter.js";

const DONE = "/newsletter/subscribed";

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  // The hidden "website" field is left empty by people; bots fill it in.
  // They get a normal-looking success and nothing happens.
  if (form.get("website")) return reply(request, true, DONE);

  const email = cleanEmail(form.get("email"));
  if (!email) return reply(request, false, "/newsletter?error=email");
  const human = await verifyTurnstile(env, form.get("cf-turnstile-response"), request.headers.get("CF-Connecting-IP"));
  if (!human) return reply(request, false, "/newsletter?error=check");

  const DB = await db(env);
  const existing = await DB.prepare("SELECT status, token FROM subscribers WHERE email = ?").bind(email).first();
  // Already subscribed: no second welcome email, and the form says so
  if (existing?.status === "active") return reply(request, true, DONE, { already: true });

  const token = existing?.token ?? newToken();
  if (existing) {
    await DB.prepare("UPDATE subscribers SET status = 'active', confirmed_at = ?, unsubscribed_at = NULL WHERE email = ?").bind(now(), email).run();
  } else {
    await DB.prepare("INSERT INTO subscribers (email, status, token, created_at, confirmed_at) VALUES (?, 'active', ?, ?, ?)").bind(email, token, now(), now()).run();
  }
  // They are subscribed either way, so a failed welcome is not a failed signup
  try {
    await sendWelcome(env, { to: email, token, origin: new URL(request.url).origin });
  } catch (error) {
    console.error("Welcome email failed:", error.message);
  }
  return reply(request, true, DONE);
}
