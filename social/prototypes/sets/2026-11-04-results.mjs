// 2026 midterm results, pulled once by hand on Nov 4, 2026 (about 12:30 p.m.
// ET) from NBC News's results pages, which follow the networks' race calls,
// and checked against Wikipedia's results tables and CBS and CNBC coverage.
// Update a race here when it is called, then rebuild the set.
//
// Percentages are the share of the vote counted at the time of the pull.

export const AS_OF = "Nov 4, 12:30 p.m. ET";

// Shown on every post
export const SOURCE_LINE = "NBC News race projections";

export const SOURCES = [
  "https://www.nbcnews.com/politics/2026-elections/senate-results",
  "https://www.nbcnews.com/politics/2026-elections/house-results",
  "https://www.nbcnews.com/politics/2026-elections/governor-results",
  "https://en.wikipedia.org/wiki/2026_United_States_Senate_elections",
  "https://www.cbsnews.com/live-updates/senate-election-results-2026/",
  "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections",
];

// Photos in 2026-11-04-photos/, cropped to each face. Members of Congress are
// their official portraits (Bioguide, via the public-domain @unitedstates
// collection). Newcomers are from Wikimedia Commons, as shown on their
// Wikipedia pages: Hamilton, Flanagan, Stratton and Alme are public domain,
// Jackson is CC0, and Turek is free use from the Iowa General Assembly. These
// three licenses require crediting the photographer on the post:
export const PHOTO_CREDITS = {
  talarico: "James Talarico by Antonioaesparza (CC BY-SA 4.0)",
  cooper: "Roy Cooper by NetwonsBucket (CC BY-SA 4.0)",
  andrews: "Annie Andrews by York County Democratic Party (CC BY 4.0)",
  elsayed: "Abdul El-Sayed by Conlan Houston (CC BY-SA 4.0)",
};

export const senate = {
  // Seats in the next Senate, counting the seats not up this year;
  // Democrats include the independents who caucus with them
  seats: { D: 54, R: 44, uncalled: 2 },
  before: { D: 47, R: 53 },
  majority: 51,
  uncalled: [
    { state: "Mississippi", d: ["Scott Colom", 48.9], r: ["Cindy Hyde-Smith", 48.9], incumbent: "R" },
    { state: "Alaska", d: ["Mary Peltola", 48.2], r: ["Dan Sullivan", 47.9], incumbent: "R" },
  ],
  // Every flip went from Republican to Democrat
  flips: [
    { state: "Texas", winner: ["James Talarico", 55.1], photo: "talarico", loser: ["Ken Paxton", 43.0] },
    { state: "North Carolina", winner: ["Roy Cooper", 58.7], photo: "cooper", loser: ["Michael Whatley", 39.1] },
    { state: "Maine", winner: ["Troy Jackson", 53.7], photo: "jackson", loser: ["Susan Collins", 46.2], beatIncumbent: true },
    { state: "South Carolina", winner: ["Annie Andrews", 51.1], photo: "andrews", loser: ["Darline Graham", 46.7], beatIncumbent: true, special: true },
    { state: "Kansas", winner: ["Adam Hamilton", 50.9], photo: "hamilton", loser: ["Roger Marshall", 46.1], beatIncumbent: true },
    { state: "Ohio", winner: ["Sherrod Brown", 50.0], photo: "brown", loser: ["Jon Husted", 45.2], beatIncumbent: true, special: true },
    { state: "Iowa", winner: ["Josh Turek", 50.5], photo: "turek", loser: ["Ashley Hinson", 46.4] },
  ],
  // Winners who have never served in the Senate. now: their current office
  newcomers: [
    { name: "James Talarico", party: "D", photo: "talarico", state: "TX", now: "Texas state representative" },
    { name: "Roy Cooper", party: "D", photo: "cooper", state: "NC", now: "Former governor" },
    { name: "Troy Jackson", party: "D", photo: "jackson", state: "ME", now: "Former state Senate president" },
    { name: "Annie Andrews", party: "D", photo: "andrews", state: "SC", now: "Pediatrician" },
    { name: "Adam Hamilton", party: "D", photo: "hamilton", state: "KS", now: "" },
    { name: "Josh Turek", party: "D", photo: "turek", state: "IA", now: "Iowa state representative" },
    { name: "Abdul El-Sayed", party: "D", photo: "elsayed", state: "MI", now: "Former Detroit health director" },
    { name: "Peggy Flanagan", party: "D", photo: "flanagan", state: "MN", now: "Lieutenant governor" },
    { name: "Juliana Stratton", party: "D", photo: "stratton", state: "IL", now: "Lieutenant governor" },
    { name: "Chris Pappas", party: "D", photo: "pappas", state: "NH", now: "U.S. representative" },
    { name: "Barry Moore", party: "R", photo: "moore", state: "AL", now: "U.S. representative" },
    { name: "Andy Barr", party: "R", photo: "barr", state: "KY", now: "U.S. representative" },
    { name: "Julia Letlow", party: "R", photo: "letlow", state: "LA", now: "U.S. representative" },
    { name: "Kurt Alme", party: "R", photo: "alme", state: "MT", now: "Former U.S. attorney" },
    { name: "Kevin Hern", party: "R", photo: "hern", state: "OK", now: "U.S. representative" },
    { name: "Harriet Hageman", party: "R", photo: "hageman", state: "WY", now: "U.S. representative" },
  ],
  // Sherrod Brown served 2007-2025, so he returns rather than arrives
  returning: [{ name: "Sherrod Brown", party: "D", photo: "brown", state: "OH" }],
};

export const house = {
  seats: { D: 236, R: 146, uncalled: 53 },
  majority: 218,
  netGainD: 31,
  // NBC News Decision Desk's estimate of the final count
  projected: { D: 258, R: 177 },
  // Republican incumbents who lost, among the battleground races NBC has
  // called. Last names, as the results pages give them
  incumbentsLost: [
    { district: "CA-22", loser: ["Valadao", 33.6], winner: ["Villegas", 66.4] },
    { district: "CO-8", loser: ["Evans", 40.8], winner: ["Rutinel", 55.5] },
    { district: "IA-1", loser: ["Miller-Meeks", 43.6], winner: ["Bohannan", 52.8] },
    { district: "IA-3", loser: ["Nunn", 46.3], winner: ["Trone Garriott", 53.7] },
    { district: "NJ-7", loser: ["Kean", 41.4], winner: ["Bennett", 57.1] },
    { district: "OH-7", loser: ["Miller", 45.1], winner: ["Poindexter", 54.9] },
    { district: "PA-1", loser: ["Fitzpatrick", 47.3], winner: ["Harvie", 52.7] },
    { district: "PA-7", loser: ["Mackenzie", 43.9], winner: ["Brooks", 56.1] },
    { district: "PA-8", loser: ["Bresnahan", 45.6], winner: ["Cognetti", 54.4] },
    { district: "PA-10", loser: ["Perry", 45.0], winner: ["Stelson", 55.0] },
    { district: "VA-1", loser: ["Wittman", 48.7], winner: ["Taylor", 51.0] },
    { district: "VA-2", loser: ["Kiggans", 44.6], winner: ["Luria", 53.1] },
    { district: "WI-3", loser: ["Van Orden", 45.8], winner: ["Cooke", 52.4] },
  ],
  // The seat from our Nov 2 district spotlight
  nc1: { winner: ["Don Davis", 50.1], loser: ["Buckhout", 46.8] },
  // No Democratic incumbent had lost to a Republican, and no Democratic seat
  // had flipped, in NBC's calls or Wikipedia's list of defeated incumbents.
  // These are the closest Democratic holds NBC has called
  democratsLostToR: 0,
  closestDemHolds: [
    { district: "NC-1", winner: ["Don Davis", 50.1], loser: ["Buckhout", 46.8] },
    { district: "FL-25", winner: ["Jared Moskowitz", 51.3], loser: ["Singer", 46.6] },
    { district: "OH-9", winner: ["Marcy Kaptur", 52.7], loser: ["Merrin", 47.3] },
    { district: "WA-3", winner: ["Marie Gluesenkamp Perez", 55.0], loser: ["Braun", 44.2] },
    { district: "TX-34", winner: ["Vicente Gonzalez", 55.6], loser: ["Flores", 39.8] },
    { district: "TX-28", winner: ["Henry Cuellar", 65.8], loser: ["Tijerina", 29.6] },
  ],
  // A Democratic-held open seat still tied when pulled
  demSeatTossUp: { district: "ME-2", d: ["Dunlap", 50], r: ["LePage", 50] },
};

export const governors = {
  races: 36,
  uncalled: [
    { state: "Kansas", d: ["Holscher", 50.3], r: ["Masterson", 49.7] },
    { state: "Alaska", d: ["Kreiss-Tomkins", 49.2], r: ["Wilson", 29.2] },
  ],
  // Every flip went from Republican to Democrat
  flips: [
    { state: "Texas", winner: ["Gina Hinojosa", 52.8], loser: ["Greg Abbott", 45.7], beatIncumbent: true },
    { state: "Georgia", winner: ["Keisha Lance Bottoms", 54.3], loser: ["Jackson", 45.7] },
    { state: "Ohio", winner: ["Amy Acton", 52.3], loser: ["Vivek Ramaswamy", 44.4] },
    { state: "Iowa", winner: ["Rob Sand", 55.5], loser: ["Lahn", 44.5] },
    { state: "Nevada", winner: ["Aaron Ford", 51.7], loser: ["Joe Lombardo", 44.2], beatIncumbent: true },
  ],
};
