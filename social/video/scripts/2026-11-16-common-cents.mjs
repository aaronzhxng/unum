// Bill in 30 seconds: the Common Cents Act (H.R. 10167), from the
// November 9–13 issue of Congress Weekly.
//
// Each beat: say (the voiceover, also the captions), head (the bold text;
// *stars* mark the highlighted words), photo, and optionally sub, card, focus
// (which part of the photo to keep, as a CSS position) and speak (a spelling
// for the voice when it mispronounces something; captions still use say).

export default {
  series: "Bill in 30 seconds",
  caption:
    "The penny is on its way out. The Common Cents Act would end making pennies for everyday use, round cash totals to a multiple of five cents, and let the nickel be made from different metals. It's now with the President.\n\nEvery bill that moved this week is in Congress Weekly, free at unuminitiative.com/newsletter.\n\n#congress #penny #politics #civics",
  beats: [
    {
      say: "The penny is on its way out.",
      head: "The penny is on its *way out*",
      photo: "pennies-pile-1.jpg",
    },
    {
      say: "Congress just sent the Common Cents Act to the President.",
      head: "Congress passed the *Common Cents Act*",
      photo: "loc-12503.jpg",
      card: {
        type: "stages",
        label: "H.R. 10167 · Where it stands",
        stages: [
          { label: "Introduced", status: "done" },
          { label: "Passed House", status: "done" },
          { label: "Passed Senate", status: "done" },
          { label: "To President", status: "current" },
        ],
      },
    },
    {
      say: "It would stop making pennies for everyday use.",
      head: "*No more* new pennies",
      photo: "pennies-pile-1.jpg",
      focus: "20% 50%",
      card: { type: "coin", photo: "penny-2025.jpg" },
    },
    {
      say: "Pay in cash, and your total would be rounded to end in a zero or a five.",
      head: "Cash totals get *rounded*",
      photo: "loc-04492.jpg",
      card: { type: "stat", value: 5, label: "Cash totals would round to a multiple of 5¢" },
    },
    {
      say: "And the nickel could be made from different metals.",
      head: "The nickel *could change* too",
      photo: "loc-16167.jpg",
    },
    {
      say: "The bill comes from Representative Lisa McClain, a Republican from Michigan.",
      head: "Sponsored by *Rep. Lisa McClain*",
      photo: "loc-12568.jpg",
      card: { type: "member", id: "M001136", party: "R", name: "Lisa McClain", detail: "R-MI-9 · House" },
    },
    {
      say: "Next stop: the President's desk.",
      head: "Next stop: *the President*",
      sub: "Sent to the President Nov 12",
      photo: "loc-13962.jpg",
    },
    {
      outro: true,
      say: "Every bill that moved this week is in Congress Weekly. It's free at unum initiative dot com.",
      head: "Congress Weekly",
      sub: "Every bill that moved, in plain English. Free, every Monday.",
    },
  ],
};
