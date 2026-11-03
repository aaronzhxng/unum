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
OUT=out-test node social/prototypes/build.mjs  # render to another folder
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

## Reels

After a build, `reel.mjs` turns it into vertical 1080 × 1920 videos for
Instagram Reels, TikTok and YouTube Shorts:

```bash
OUT=2026-11-02 node social/prototypes/reel.mjs          # reel-recap.mp4: the day's posts
OUT=2026-11-02 node social/prototypes/reel.mjs 4-week   # reel-4-week-in-congress.mp4
```

- **Daily recap** (no argument): a hook screen, each post swiping in for
  about 2.8 seconds, and a follow screen, around 20 seconds in all. A set can
  export `recap = { hook, label, outro }` to word the first and last screens.
- **Animated post** (with a slug filter): one post builds itself in, with
  cards, rows, bars and dots, numbers counting up, then the headline, and
  holds for reading. Keep these for big bills that are already trending, not
  every post. A template can set `hook` to add a line above the post.

The videos are silent, so a trending sound can be added in each app. Needs
ffmpeg (`winget install Gyan.FFmpeg` or `brew install ffmpeg`, or set
`FFMPEG_PATH`).

## Sizes

Every post is 1000 × 1250 (4:5), exported at 2× (2000 × 2500), which all four
platforms accept. Platform-specific crops (e.g. 16:9 for X) come later.
