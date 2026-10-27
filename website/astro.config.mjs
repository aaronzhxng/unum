import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://unuminitiative.com",
  // Emit privacy.html instead of privacy/index.html so the App Store and
  // Google Play listings' existing /privacy link keeps working unchanged.
  build: { format: "file" },
  trailingSlash: "never",
  // The dev toolbar overlays the page in local previews
  devToolbar: { enabled: false },
  // Lists every page for search engines at /sitemap-index.xml
  integrations: [sitemap()],
});
