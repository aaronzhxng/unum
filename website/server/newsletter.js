// Shared pieces of the newsletter signup, used by the Pages Functions in
// functions/api/. Subscribers live in the D1 database bound as DB; each has
// one random token that goes in their unsubscribe link.
//
// Settings, in the Pages project's environment (Production and Preview):
//   DB                 D1 database binding
//   RESEND_API_KEY     secret, a Resend key with sending access
//   TURNSTILE_SECRET   secret; Preview uses Cloudflare's always-pass test
//                      secret 1x0000000000000000000000000000000AA
//   NEWSLETTER_FROM    optional, the From line on emails
//   MAILING_ADDRESS    the postal address in the emails' footer

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

// Fills in a built email's {{...}} placeholders
export const fillEmail = (html, { origin, unsubscribe, address }) =>
  html
    .replaceAll("{{origin}}", origin)
    .replaceAll("{{unsubscribe_url}}", unsubscribe)
    .replaceAll("{{mailing_address}}", address);

// Lets Gmail and Apple Mail show their own one-click Unsubscribe
export const unsubscribeHeaders = (url) => ({
  "List-Unsubscribe": `<${url}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

export async function sendWelcome(env, { to, token, origin }) {
  const page = await env.ASSETS.fetch(new Request(`${origin}/newsletter/welcome-email.html`));
  if (!page.ok) throw new Error(`No welcome email on this site (${page.status})`);
  const unsubscribe = `${origin}/api/unsubscribe?token=${token}`;
  const address = env.MAILING_ADDRESS || "";
  await sendEmail(env, {
    to,
    subject: "Welcome to Congress Weekly",
    html: fillEmail(await page.text(), { origin, unsubscribe, address }),
    text: `Welcome to Congress Weekly, a newsletter by Unum.\n\nEvery Monday morning, we recap the last week in Congress in plain English: bills signed, votes cast, and bills moving through committee. See you on Monday for your first issue.\n\nRead past issues: ${origin}/newsletter\nFeedback: ${REPLY_TO}\n\nUnsubscribe: ${unsubscribe}\nUnum Initiative Inc. · ${address}`,
    headers: unsubscribeHeaders(unsubscribe),
  });
}

// Answers fetch() calls from the signup form with JSON, and plain form
// posts (no JavaScript) with a redirect to a page
export function reply(request, ok, page, details = {}) {
  if ((request.headers.get("Accept") || "").includes("application/json")) {
    return Response.json({ ok, ...details }, { status: ok ? 200 : 400 });
  }
  return Response.redirect(new URL(page, request.url).toString(), 303);
}
