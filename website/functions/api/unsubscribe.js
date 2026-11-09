// /api/unsubscribe?token=...
//   GET: the link in each email. Opens a page with an Unsubscribe button,
//   since email security scanners follow links and would otherwise
//   unsubscribe people who never clicked.
//   POST: that button, and the one-click unsubscribe that Gmail and Apple
//   Mail send from their own Unsubscribe button (RFC 8058).
import { db, now } from "../../server/newsletter.js";

export function onRequestGet({ request }) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return Response.redirect(new URL(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, request.url).toString(), 303);
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const token = url.searchParams.get("token") || form?.get("token");
  const DB = await db(env);
  const row = token && (await DB.prepare("SELECT status FROM subscribers WHERE token = ?").bind(token).first());
  if (row && row.status !== "unsubscribed") {
    await DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE token = ?").bind(now(), token).run();
  }
  // One-click requests come from mail apps, which only need a success code
  if (form?.get("List-Unsubscribe") === "One-Click") return new Response(null, { status: 200 });
  return Response.redirect(new URL(row ? "/newsletter/unsubscribed" : "/newsletter/invalid-link", request.url).toString(), 303);
}
