// Last week in Congress: the November 9–13 issue of Congress Weekly in
// 30 seconds. See 2026-11-16-common-cents.mjs for the beat fields.

export default {
  series: "Last week in Congress",
  caption:
    "Last week in Congress (November 9–13): four bills became law, a bill ending the penny went to the President, the House passed a run of nuclear energy bills, and the week's big vote on retirement plans for schools and charities.\n\nThe full breakdown is in Congress Weekly, free at unuminitiative.com/newsletter.\n\n#congress #politics #civics #news",
  beats: [
    {
      say: "Here's what Congress did last week, in thirty seconds.",
      head: "Last week in *Congress*",
      sub: "November 9–13",
      photo: "loc-04492.jpg",
    },
    {
      say: "Four bills became law, including new Medicare billing codes for lightweight wheelchairs.",
      head: "*4 bills* became law",
      photo: "loc-13962.jpg",
      card: {
        type: "list",
        items: [
          "Landmark status for the Churchill Museum",
          "Bankruptcy debt limits restored",
          "Medicare codes for light wheelchairs",
          "The Taxpayer Advocate gets its own lawyers",
        ],
      },
    },
    {
      say: "A bill ending the penny is headed to the President.",
      head: "The penny is on its *way out*",
      photo: "pennies-pile-1.jpg",
      card: { type: "coin", photo: "penny-2025.jpg" },
    },
    {
      say: "The House passed a run of nuclear energy bills, including one letting a uranium enrichment plant start construction before it's licensed.",
      head: "A *nuclear* push in the House",
      photo: "loc-16167.jpg",
      card: { type: "vote", label: "House vote · Nov 9", yea: 394, nay: 3, bill: "American Enrichment Deployment Act" },
    },
    {
      say: "And in the week's big vote, the House voted 295 to 128 to let school and charity retirement plans invest in pooled funds.",
      head: "The big vote: *retirement plans*",
      photo: "loc-12568.jpg",
      card: {
        type: "vote",
        label: "House vote · Nov 11",
        yea: 295,
        nay: 128,
        bill: "Retirement Fairness for Charities and Educational Institutions Act",
      },
    },
    {
      outro: true,
      say: "The full breakdown is in Congress Weekly, free at unum initiative dot com.",
      head: "Congress Weekly",
      sub: "Every bill that moved, in plain English. Free, every Monday.",
    },
  ],
};
