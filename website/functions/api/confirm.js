// GET /api/confirm?token=...: the link in the confirmation email
import { db, now } from "../../server/newsletter.js";

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get("token");
  const DB = await db(env);
  const row = token && (await DB.prepare("SELECT status FROM subscribers WHERE token = ?").bind(token).first());
  if (!row) return Response.redirect(new URL("/newsletter/invalid-link", request.url).toString(), 303);
  if (row.status !== "active") {
    await DB.prepare("UPDATE subscribers SET status = 'active', confirmed_at = ?, unsubscribed_at = NULL WHERE token = ?").bind(now(), token).run();
  }
  return Response.redirect(new URL("/newsletter/confirmed", request.url).toString(), 303);
}
