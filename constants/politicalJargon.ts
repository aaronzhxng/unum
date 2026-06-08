// constants/politicalJargon.ts
// Plain-English definitions for legal/legislative jargon
// Used in bill detail screen (id.tsx) to annotate Recent Action and Summary text.

export interface JargonEntry {
  term: string;
  definition: string;
}

// Keys are lowercase for case-insensitive matching
export const POLITICAL_JARGON: Record<string, string> = {
  // --- CLOTURE & DEBATE ---
  cloture:
    "A Senate procedure to end debate and force a vote on a bill. Requires 60 votes to pass.",
  filibuster:
    "A tactic where a senator delays or blocks a vote by speaking at length or using procedural moves.",
  "unanimous consent":
    "An agreement by all members to bypass normal rules and proceed quickly. One objection kills it.",
  quorum:
    "The minimum number of members required to be present for Congress to conduct official business.",
  "quorum call":
    "A roll call to determine whether enough members are present to conduct business.",
  "voice vote":
    "A vote where members call out 'aye' or 'nay' and the presiding officer judges which side is louder.",
  "roll call vote":
    "A recorded vote where each member's individual vote (yes/no/abstain) is logged by name.",
  "division vote":
    "A vote where members physically stand or raise hands to be counted, but names are not recorded.",
  "previous question":
    "A motion to stop debate and force an immediate vote. Used in the House, not the Senate.",
  "point of order":
    "An objection raised by a member claiming a rule is being violated during floor proceedings.",
  "unanimous consent agreement":
    "A negotiated deal in the Senate setting the terms and time limits for debating a bill.",

  // --- MOTIONS ---
  "motion to table":
    "A procedural vote to immediately shelve a bill or amendment, effectively killing it without further debate.",
  "motion to proceed":
    "A Senate vote to officially begin consideration of a bill or nomination.",
  "motion to recommit":
    "A motion to send a bill back to committee, often used by the minority party to delay or amend it.",
  "motion to reconsider":
    "A request to vote on a measure again, usually filed immediately after passage to preserve the option.",
  "motion to adjourn":
    "A formal request to end the current legislative session for the day.",
  "tabling motion":
    "See 'motion to table' — a procedural tool to kill a measure without a direct up-or-down vote.",
  "motion to discharge":
    "A petition to force a bill out of committee when the committee refuses to act. Requires 218 House signatures.",
  "motion to rise":
    "A motion to end a session of the Committee of the Whole and return to regular House proceedings.",
  "motion to strike":
    "A motion to remove a specific word, phrase, or section from a bill during floor debate.",

  // --- AMENDMENTS ---
  // amendment:
  //   "A formal change proposed to a bill's text before it is passed into law.",
  "amendment in the nature of a substitute":
    "An amendment that replaces the entire text of a bill with new language.",
  "en bloc":
    "Considering or voting on multiple amendments or items together as a single package.",
  germane:
    "Directly related to the subject of the bill being debated. Non-germane amendments can be ruled out of order.",
  rider:
    "An unrelated provision attached to a bill, often to pass something that couldn't stand on its own.",
  "strike the last word":
    "A procedural phrase House members use to get five minutes of floor speaking time.",

  // --- COMMITTEE PROCESS ---
  markup:
    "The committee session where members review, amend, and vote on a bill before sending it to the full chamber.",
  "reported out":
    "When a committee finishes its work and sends a bill to the full House or Senate for consideration.",
  "tabled in committee":
    "A bill set aside by committee with no further action, effectively killing it for the session.",
  "referred to committee":
    "Assigned to a specific committee for review after introduction. Most bills die here.",
  "discharged from committee":
    "Removed from committee and sent to the full floor without a committee vote — rare.",
  discharged:
    "Removed from committee and sent to the full floor without the normal committee process.",
  jurisdiction:
    "The subject-matter authority a specific committee has over certain types of legislation.",
  subcommittee:
    "A smaller working group within a committee that handles specific issues or drafts legislation.",
  "conference committee":
    "A temporary joint committee formed to reconcile differences between House and Senate versions of a bill.",
  "conference report":
    "The final compromise version of a bill produced by a conference committee, voted on by both chambers.",
  "hearing":
    "A formal committee session where members gather testimony from witnesses on a bill or issue.",
  "markup calendar":
    "The committee's schedule of bills lined up for review and amendment sessions.",
  "sequential referral":
    "When a bill is sent to multiple committees in sequence, each reviewing it before the next.",
  "concurrent referral":
    "When a bill is sent to multiple committees simultaneously for review.",
  "discharge petition":
    "The formal document House members sign to force a bill out of committee. Requires 218 signatures.",
  "ordered to be reported":
    "A committee vote to approve a bill and send it to the full chamber for consideration.",

  // --- FLOOR PROCEDURE ---
  engrossed:
    "The official final version of a bill as passed by one chamber, prepared for transmission to the other.",
  enrolled:
    "The final version of a bill passed by both chambers, prepared for the President's signature.",
  "laid on the table": "Temporarily or permanently set aside without a vote.",
  // referred: "Sent to a committee for review.",
  // passed: "Approved by a majority vote in one or both chambers.",
  // failed: "Did not receive enough votes to advance.",
  // vetoed: "Rejected by the President after passage by Congress.",
  "pocket veto":
    "When the President neither signs nor vetoes a bill within 10 days while Congress is adjourned, killing it.",
  "veto override":
    "A vote by Congress to enact a bill into law despite a presidential veto. Requires two-thirds majority in both chambers.",
  "signed into law": "Approved by the President, making the bill official law.",
  introduced: "Formally submitted to Congress by a sponsor for consideration.",
  reading:
    "A formal step in the legislative process. Bills typically receive three readings before a final vote.",
  "first reading":
    "The initial introduction of a bill, usually just its title and number.",
  "second reading":
    "The stage when a bill is debated and amended on the floor.",
  "third reading":
    "The final reading before a vote, typically just the bill's title after all amendments are settled.",
  "suspension of the rules":
    "A House procedure to fast-track non-controversial bills, requiring a two-thirds vote to pass.",
  rule: "In the House, a special resolution from the Rules Committee that sets the terms for debating a specific bill.",
  "call of the house":
  "A roll call to compel absent House members to appear on the floor, used to establish a quorum.",
  "order of business":
    "The official sequence in which items are taken up during a legislative session.",
  "yielding":
    "When a member temporarily gives up their speaking time to allow another member to speak.",
  "yield back":
    "When a member formally returns unused speaking time to the presiding officer.",
  "pair":
    "An informal agreement between two opposing members to both abstain from a vote, canceling each other out.",
  "closed rule": "Prohibits any floor amendments to a bill during debate.",
  "open rule":
    "Allows any germane amendments to be offered during floor debate.",
  "structured rule": "Limits floor amendments to a pre-approved list.",
  "special order":
    "A House procedure allowing members to speak for extended time, usually after official business ends.",
  hotline:
    "Informal Senate process to pass non-controversial bills quickly by notifying all senators for objections.",

  // --- RECONCILIATION & BUDGET ---
  reconciliation:
    "A fast-track budget process allowing certain fiscal bills to pass the Senate with only 51 votes, bypassing filibuster.",
  "continuing resolution":
    "A temporary spending bill that keeps the government funded when a full budget hasn't been passed.",
  omnibus:
    "A large bill that combines many smaller bills or funding items into one package.",
  authorization:
    "A law that establishes a government program and sets a spending ceiling, but doesn't actually spend money.",
  appropriation:
    "A law that provides actual funding for government programs and agencies.",
  sequestration:
    "Automatic, across-the-board spending cuts triggered when Congress fails to meet deficit reduction targets.",
  "pay-as-you-go":
    "A rule requiring that new spending or tax cuts be offset by cuts or revenue increases elsewhere.",
  "byrd rule":
    "A Senate rule blocking non-budgetary provisions from being included in reconciliation bills.",
  "debt ceiling":
    "The legal limit on how much money the federal government can borrow.",
  baseline:
    "The projected future spending level used as a starting point for budget negotiations.",

  // --- NOMINATIONS & TREATIES ---
  "advise and consent":
    "The Senate's constitutional role to approve presidential nominations and ratify treaties.",
  confirmation:
    "Senate approval of a presidential nominee for a cabinet, judicial, or other federal position.",
  ratification: "Senate approval of a treaty, requiring a two-thirds vote.",
  "recess appointment":
    "A presidential appointment made while the Senate is in recess, bypassing the confirmation process.",
  "cloture on nomination":
    "A Senate vote to end debate on a presidential nominee, requiring a simple majority since the 'nuclear option' in 2013/2017.",

  // --- CONSTITUTIONAL / LEGAL ---
  "enumerated powers":
    "Powers explicitly listed in the Constitution as belonging to Congress or the federal government.",
  "commerce clause":
    "Constitutional authority for Congress to regulate trade between states and with foreign nations.",
  "supremacy clause":
    "Establishes that federal law overrides conflicting state laws.",
  preemption:
    "When federal law supersedes or overrides state law on the same subject.",
  standing:
    "The legal right to bring a lawsuit. A party must have a direct stake in the outcome.",
  "judicial review":
    "The power of courts to strike down laws that violate the Constitution.",
  "due process":
    "The constitutional guarantee that the government cannot deprive someone of life, liberty, or property without fair legal procedures.",
  "equal protection":
    "Constitutional requirement that laws treat similarly situated people equally.",
  "ex post facto":
    "A law that retroactively criminalizes an action that was legal when it occurred. Prohibited by the Constitution.",
  "habeas corpus":
    "A legal protection requiring the government to justify holding someone in custody.",
  "sovereign immunity":
    "The principle that the government cannot be sued without its consent.",
  "enabling clause":
    "A provision in a law that grants a government agency the authority to write regulations enforcing it.",
  "sunset provision":
    "A clause that causes a law to automatically expire on a set date unless renewed.",
  severability:
    "A provision stating that if one part of a law is struck down, the rest remains in effect.",

  // --- SENATE-SPECIFIC ---
  holds:
    "A senator's informal request to delay a vote on a bill or nomination, often used as leverage.",
  "nuclear option":
    "Changing Senate rules by a simple majority vote to eliminate the filibuster for certain matters.",
  "unanimous consent calendar":
    "A list of non-controversial bills that can pass quickly without debate if no one objects.",
  "executive calendar":
    "The Senate's agenda for nominations and treaties (as opposed to legislation).",
  "legislative calendar":
    "The Senate's schedule for considering bills and resolutions.",
  "president pro tempore":
    "The senator who presides over the Senate in the absence of the Vice President, typically the most senior majority senator.",
  whip: "The party official responsible for counting votes and making sure members vote along party lines.",
  "floor leader":
    "The Senate Majority or Minority Leader, who manages their party's legislative agenda on the floor.",

  // --- HOUSE-SPECIFIC ---
  "committee of the whole":
    "A procedural format where the full House operates under looser rules to debate legislation more efficiently.",
  "five-minute rule":
    "House rule limiting each member to five minutes of debate on an amendment.",
  hopper:
    "The box in the House chamber where members submit their bills for introduction.",
  "speaker pro tempore":
    "A member designated to temporarily preside over the House in the Speaker's absence.",
  "magic minute":
    "Informal term for the ability of House party leaders to speak for unlimited time during floor debate.",

  // --- GENERAL LEGISLATIVE ---
  sponsor: "The member of Congress who introduces a bill.",
  cosponsor:
    "A member who formally signs on to support a bill introduced by someone else.",
  "companion bill":
    "An identical or similar bill introduced in the other chamber simultaneously.",
  resolution:
    "A formal expression of the will of a legislative body, which may or may not have the force of law.",
  "simple resolution":
    "A resolution passed by only one chamber, typically addressing internal rules or expressing opinions (H.Res. or S.Res.).",
  "concurrent resolution":
    "A resolution passed by both chambers but not sent to the President — not law (H.Con.Res. or S.Con.Res.).",
  "joint resolution":
    "A legislative measure passed by both chambers that has the force of law when signed by the President (H.J.Res. or S.J.Res.).",
  "clean bill": "A bill with no amendments or unrelated provisions attached.",
  "sense of congress":
    "A non-binding expression of Congress's opinion on an issue, often included in larger bills.",
  "lame duck":
    "A period after an election when officials who lost or are retiring still hold office before successors are sworn in.",
  "adjournment sine die":
    "The formal end of a legislative session with no set date to reconvene — Latin for 'without a day.'",
  "proforma session":
    "A brief, largely ceremonial session held to technically keep Congress in session and prevent recess appointments.",
  "executive session":
    "A closed or private meeting of a legislative body, often used for nominations or sensitive matters.",
  "markup session":
    "See 'markup' — the committee meeting where a bill is reviewed, amended, and voted on.",
  "legislative history":
    "The record of a bill's progress through Congress, including hearings, debates, and reports, used to interpret the law's intent.",
  "enrolled bill":
      "The final version of a bill passed by both chambers, signed by House and Senate leaders before going to the President.",
  pocket:
    "To pocket a bill means the President takes no action on it; if Congress is adjourned, this becomes a pocket veto.",
  "private bill":
    "Legislation that applies to a specific individual or entity rather than the general public.",
  "public law":
    "A bill that has been signed into law and assigned an official public law number (e.g., P.L. 118-1).",
  "slip law":
    "The first official publication of a new law, printed individually before being compiled into the U.S. Code.",
  "engrossment":
    "The official preparation of the final text of a bill as passed by one chamber before being sent to the other.",
  "chaptering":
    "The process of assigning a chapter number to a newly enacted law for inclusion in official statute compilations.",
  };

/**
 * Scans a text string and returns all matching jargon entries found within it.
 * Matching is case-insensitive and checks for whole-word/phrase matches.
 */
export function findJargonInText(text: string): JargonEntry[] {
  if (!text || typeof text !== "string") return [];

  const lowerText = text.toLowerCase();
  const found: JargonEntry[] = [];

  for (const [term, definition] of Object.entries(POLITICAL_JARGON)) {
    // Escape special regex characters in the term
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "i");

    if (regex.test(lowerText)) {
      found.push({ term, definition });
    }
  }

  // Sort by order of appearance
  found.sort((a, b) => lowerText.indexOf(a.term) - lowerText.indexOf(b.term));

  // Deduplicate
  const seen = new Set<string>();
  return found.filter(({ term }) => {
    if (seen.has(term)) return false;
    seen.add(term);
    return true;
  });
}
