// Last week in Congress: the November 16–20 issue of Congress Weekly in
// 30 seconds. See 2026-11-16-common-cents.mjs for the beat fields; photos
// are named by their ID in media/photos/photos.json.

export default {
  series: "Last week in Congress",
  caption:
    "Last week in Congress (November 16–20): the Senate passed a broad energy and permitting package, 62 to 33, a resolution to end U.S. hostilities with Iran failed, 48 to 51, and three bills went to the President, including a cost-of-living raise for veterans' disability benefits.\n\nEvery bill that moved is in Congress Weekly, free at unuminitiative.com/newsletter.\n\n#congress #senate #energy #veterans",
  beats: [
    {
      say: "Last week in Congress, the Senate voted 62 to 33 to speed up energy permits.",
      head: "The Senate votes to *speed up energy permits*",
      sub: "November 16–20",
      photo: "wind-farm-missouri",
      card: {
        type: "vote",
        label: "Senate vote · Nov 19",
        yea: 62,
        nay: 33,
        bill: "Bipartisan American Affordability and Jobs Act",
      },
    },
    {
      say: "The package speeds up environmental reviews and limits lawsuits against approved projects. It now goes back to the House.",
      head: "Faster reviews, *fewer lawsuits*",
      photo: "nuclear-plant",
      card: {
        type: "list",
        items: [
          "Faster federal environmental reviews",
          "Limits on lawsuits against approved projects",
          "Easier approval for power lines and offshore energy",
        ],
      },
    },
    {
      say: "The same day, a resolution to end U.S. hostilities with Iran failed, 48 to 51.",
      head: "Iran war powers resolution *fails*",
      photo: "pentagon",
      card: {
        type: "vote",
        label: "Senate vote · Nov 19",
        yea: 48,
        nay: 51,
        bill: "Directs the President to remove U.S. forces from hostilities with Iran",
      },
    },
    {
      say: "Three Republicans voted for it, and one Democrat voted against it.",
      head: "Votes crossed *party lines*",
      photo: "capitol-dome-night",
      card: {
        type: "list",
        items: [
          "Yes: Sens. Collins, Murkowski and Paul (R)",
          "No: Sen. Fetterman (D)",
        ],
      },
    },
    {
      say: "Three bills went to the President, including a cost-of-living raise for veterans' disability benefits.",
      head: "A raise for *veterans' benefits*",
      photo: "arlington-cemetery",
      card: { type: "stat", value: 3, label: "bills sent to the President" },
    },
    {
      outro: true,
      say: "Thanks for joining us at Congress Weekly. Check out our newsletter at unuminitiative.com.",
      head: "Congress Weekly",
      sub: "Every major bill that moved, in plain English. Free, every Monday.",
    },
  ],
};
