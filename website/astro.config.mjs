import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.unuminitiative.com",
  // Emit privacy.html instead of privacy/index.html so the App Store and
  // Google Play listings' existing /privacy link keeps working unchanged.
  build: { format: "file" },
  trailingSlash: "never",
});
