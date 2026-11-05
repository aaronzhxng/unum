// Keeps a bubble only as wide as its text. Once text wraps by itself, browsers
// and email apps leave the bubble at full width, with empty space after the
// shorter line. So a long label gets its own line break, switched on just
// below the screen width where it would otherwise wrap.

// Screen widths with a rule that switches a break on, in steps of 20px
export const FIT_WIDTHS = [340, 360, 380, 400, 420, 440, 460, 480, 500];
const fitsEverywhere = 320; // the narrowest phone we design for

// charWidth slightly overestimates the text, since a break a little early still
// fits snugly; chrome is everything else across the screen: page margins,
// the bubble's padding and border, and its icon
export function fitLabel(text, { charWidth, chrome }) {
  const needed = text.length * charWidth + chrome;
  const breakBelow = FIT_WIDTHS.find((w) => w >= needed);
  const words = text.split(" ");
  if (needed <= fitsEverywhere || !breakBelow || words.length < 2) return { first: text };
  // The split with the most even lines
  let best = 1;
  const longest = (i) => Math.max(words.slice(0, i).join(" ").length, words.slice(i).join(" ").length);
  for (let i = 2; i < words.length; i++) if (longest(i) < longest(best)) best = i;
  return { first: words.slice(0, best).join(" "), second: words.slice(best).join(" "), breakClass: `fit-${breakBelow}` };
}
