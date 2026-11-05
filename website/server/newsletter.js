// Shared pieces of the newsletter signup, used by the Pages Functions in
// functions/api/. Subscribers live in the D1 database bound as DB; each has
// one random token that goes in their confirm and unsubscribe links.
//
// Settings, in the Pages project's environment (Production and Preview):
//   DB                 D1 database binding
//   RESEND_API_KEY     secret, a Resend key with sending access
//   TURNSTILE_SECRET   secret; Preview uses Cloudflare's always-pass test
//                      secret 1x0000000000000000000000000000000AA
//   NEWSLETTER_FROM    optional, the From line on emails

export const SITE = "https://unuminitiative.com";
const DEFAULT_FROM = "Congress Weekly <newsletter@send.unuminitiative.com>";
export const REPLY_TO = "contact@unuminitiative.com";
export const fromLine = (env) => env.NEWSLETTER_FROM || DEFAULT_FROM;

// Created on first use, so a new database needs no setup step
const SCHEMA = `CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  confirm_sent_at TEXT,
  confirmed_at TEXT,
  unsubscribed_at TEXT
)`;

export async function db(env) {
  if (!env.DB) throw new Error("The DB binding is not set up");
  await env.DB.prepare(SCHEMA).run();
  return env.DB;
}

export const now = () => new Date().toISOString();

export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Deliberately loose: one @, a dot in the domain, no spaces. The
// confirmation email is the real check.
export function cleanEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) throw new Error("TURNSTILE_SECRET is not set");
  if (!token) return false;
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = await res.json();
  return result.success === true;
}

export async function sendEmail(env, { to, subject, html, text, headers }) {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromLine(env), reply_to: REPLY_TO, to, subject, html, text, headers }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export function confirmationEmail(token, origin = SITE) {
  const link = `${origin}/api/confirm?token=${token}`;
  return {
    subject: "Confirm your subscription to Congress Weekly",
    text: `Thanks for signing up for Congress Weekly, a free weekly email from Unum on what Congress did last week.\n\nConfirm your subscription:\n${link}\n\nIf you did not sign up, ignore this email and you will not hear from us.`,
    html: `<div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.5">
  <p style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#008cff;margin:0 0 12px">Congress Weekly</p>
  <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px">Confirm your subscription</h1>
  <p style="margin:0 0 24px;color:#555">Thanks for signing up for Congress Weekly, a free weekly email from Unum on what Congress did last week, in plain language.</p>
  <p style="margin:0 0 28px"><a href="${link}" style="display:inline-block;background:#008cff;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px">Confirm my subscription</a></p>
  <p style="margin:0;font-size:14px;color:#888">If you did not sign up, ignore this email and you will not hear from us.</p>
</div>`,
  };
}

// Answers fetch() calls from the signup form with JSON, and plain form
// posts (no JavaScript) with a redirect to a page
export function reply(request, ok, page) {
  if ((request.headers.get("Accept") || "").includes("application/json")) {
    return Response.json({ ok }, { status: ok ? 200 : 400 });
  }
  return Response.redirect(new URL(page, request.url).toString(), 303);
}
