# Social posts

Automated social media posts for Instagram, X, Bluesky, and Threads, built
from the same data the app shows. Separate from the app: nothing here is part
of the Expo app or its EAS builds (`social/` is listed in `.easignore`).

Posts are HTML/CSS templates that a script fills with live data and renders
to images, so no post is drawn by hand.

## Prototypes

```bash
node social/prototypes/fetch-data.mjs   # refresh the API snapshots in data/
node social/prototypes/build.mjs        # render every template to out/
node social/prototypes/build.mjs seats  # render only matching templates
OUT=out-inter node social/prototypes/build.mjs  # render to another folder
```

Then open `out/index.html` to review them side by side.
Needs Node 20+, Chrome or Edge, and `CONGRESS_API_KEY` in `backend/.env`.

`data/` and `out/` are generated into `unum-social-output/`, a folder next to
the repo (set `SOCIAL_OUTPUT` to use another), so they never appear in the
project or as changes on any branch.

| What | Where |
|---|---|
| Design system: colors, cards, headline/body/footer, charts | `prototypes/lib.mjs` |
| Data loading: members, roll calls, bills | `prototypes/data.mjs` |
| The templates themselves | `prototypes/templates.mjs` |
| Hand-made designs they follow | `templates/bill-of-the-day/` |
| All ideas, built and not | `IDEAS.md` |

## Sizes

Every post is 1000 × 1250 (4:5), exported at 2× (2000 × 2500), which all four
platforms accept. Platform-specific crops (e.g. 16:9 for X) come later.
