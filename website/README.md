# unuminitiative.com

The Unum Initiative company website, built with [Astro](https://astro.build). It is
separate from the app: it has its own `package.json`, and nothing here is part of
the Expo app or its EAS builds (`website/` is listed in `.easignore`).

## Run locally

```bash
cd website
npm install
npm run dev       # http://localhost:4321, reloads as you edit
npm run build     # production build into website/dist
npm run preview   # serve the production build
```

Requires Node 20 (Astro 5).

## Where things live

| What | Where |
|---|---|
| Pages | `src/pages/` — each file is a URL (`about.astro` → `/about`) |
| Header and footer | `src/layouts/Layout.astro` |
| Store links, social links, contact email, disclaimer | `src/site.mjs` |
| Colors, fonts, spacing | `src/styles/global.css` |
| Screenshots and team photos | `src/assets/` |

Images are resized and converted to WebP automatically at build time.

`/privacy` is linked from the App Store and Google Play listings — keep that URL.

## Deploy (Cloudflare Pages)

Connect the GitHub repo in Cloudflare Pages with:

- **Root directory:** `website`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `NODE_VERSION` = `20`

Every push to the production branch redeploys the site.
