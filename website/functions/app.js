// GET /app: the one link for "get the app", which is the GIF in each email.
// Sends Android devices to Google Play, Apple devices to the App Store, and
// everything else to the homepage, where both store buttons are.
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../src/site.mjs";

function storeFor(userAgent = "") {
  if (/Android/i.test(userAgent)) return GOOGLE_PLAY_URL;
  // iPads identify as Macs by default, so Macs go to the App Store as well
  if (/iPhone|iPad|iPod|Macintosh/i.test(userAgent)) return APP_STORE_URL;
  return null;
}

export function onRequestGet({ request }) {
  const target = storeFor(request.headers.get("User-Agent") ?? "") ?? new URL("/", request.url).toString();
  return new Response(null, {
    status: 302,
    // The answer depends on the device, so it must not be saved and reused
    headers: { Location: target, "Cache-Control": "no-store", Vary: "User-Agent" },
  });
}
