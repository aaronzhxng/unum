# Photo library

Photos we're free to use anywhere: newsletter covers, social posts and
videos. Each one is listed in `photos.json` with its alt text, the credit to
show (or `null` when none is needed), where it came from, and topic tags. The
tags include the app's policy areas, like "Energy" or "Health", so a script
can pick a photo that fits a bill.

Most are by Carol M. Highsmith, who gave her work to the Library of Congress
without copyright, so it's in the public domain. Credit her anyway, as
"Carol M. Highsmith, Library of Congress". The rest are U.S. government works
(public domain) or CC0. Photos of artworks, like statues or murals, can still
be under the artist's copyright, so stick to buildings, places and people at
work.

Sizes: the shorter side is about 1,920 pixels, enough for a vertical video
frame or a sharp web image.

## Using a photo

- **Newsletter cover:** `node scripts/newsletter/cover.mjs <issue> <photo>`
  (run it with no photo to list them all).
- **Videos and social posts:** use the file directly, and put the credit in
  the post caption.

## Adding a photo

1. Find it on the Library of Congress (search "Highsmith" plus a subject at
   loc.gov/photos) or Wikimedia Commons, and check it's public domain or CC0.
2. Save a copy with the shorter side about 1,920 pixels, as a JPEG, named
   for what it shows (`capitol-dusk.jpg`).
3. Add it to `photos.json`: a short title, alt text that describes what's in
   it, the credit, the page it came from, and its tags.
