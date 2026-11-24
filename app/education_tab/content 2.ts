export type EducationSubtopic = {
  id: string;
  title: string;
  summary: string;
  body: string[];
};

export type EducationTopic = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  subtopics: EducationSubtopic[];
};

export const educationTopics: EducationTopic[] = [
  {
    id: "how-government-works",
    title: "How Government Works",
    subtitle: "The 3 branches, checks & balances, federalism, and more.",
    icon: require("../../assets/education_icons/how_gov_works.png"),
    subtopics: [
      {
        id: "three-branches",
        title: "The Three Branches",
        summary: "How legislative, executive, and judicial power is split.",
        body: [
          "The U.S. system divides power so no single branch controls everything.",
          "Congress makes laws, the president enforces them, and courts interpret them.",
        ],
      },
      {
        id: "checks-balances",
        title: "Checks and Balances",
        summary: "Why each branch can limit the others.",
        body: [
          "Checks and balances are meant to prevent abuse of power.",
          "Each branch has tools that can slow or block the others in limited ways.",
        ],
      },
    ],
  },
  {
    id: "the-constitution",
    title: "The Constitution",
    subtitle: "The Bill of Rights, civil liberties, Supreme Court basics.",
    icon: require("../../assets/education_icons/constitution.png"),
    subtopics: [
      {
        id: "bill-of-rights",
        title: "The Bill of Rights",
        summary: "The first 10 amendments and what they protect.",
        body: [
          "The Bill of Rights protects core civil liberties like speech, religion, and due process.",
          "These amendments are central to modern constitutional law.",
        ],
      },
      {
        id: "supreme-court",
        title: "The Supreme Court",
        summary: "How the Court interprets the Constitution.",
        body: [
          "The Supreme Court is the highest federal court in the United States.",
          "Its decisions can shape how constitutional rights apply in practice.",
        ],
      },
    ],
  },
  {
    id: "congress-legislation",
    title: "Congress & Legislation",
    subtitle: "How a bill becomes law, committees, floor votes, and more.",
    icon: require("../../assets/education_icons/congress.png"),
    subtopics: [
      {
        id: "how-a-bill-becomes-law",
        title: "How a Bill Becomes Law",
        summary: "The path from introduction to president.",
        body: [
          "A bill usually goes through introduction, committee review, floor votes, and then presidential action.",
          "Most bills do not become law, so each step matters.",
        ],
      },
      {
        id: "committees",
        title: "Committees",
        summary: "Why most legislative work happens before floor debate.",
        body: [
          "Committees review bills in detail and decide whether to advance them.",
          "This is often where a bill is amended, delayed, or stopped.",
        ],
      },
    ],
  },
  {
    id: "elections-voting",
    title: "Elections & Voting",
    subtitle: "Electoral College, primaries, redistricting, and voting basics.",
    icon: require("../../assets/education_icons/elections_voting.png"),
    subtopics: [
      {
        id: "electoral-college",
        title: "Electoral College",
        summary: "How presidents are actually elected.",
        body: [
          "The Electoral College determines presidential elections, not the national popular vote alone.",
          "States award electoral votes based on election results, with a few exceptions.",
        ],
      },
      {
        id: "primaries",
        title: "Primaries",
        summary: "How parties choose candidates.",
        body: [
          "Primaries and caucuses help select each party's nominee.",
          "Different states use different systems, which can change turnout and outcomes.",
        ],
      },
    ],
  },
  {
    id: "political-parties-ideology",
    title: "Political Parties & Ideology",
    subtitle: "Party history, the spectrum, independents, and third parties.",
    icon: require("../../assets/education_icons/political_parties.png"),
    subtopics: [
      {
        id: "history-of-us-parties",
        title: "History of U.S. Parties",
        summary: "How the modern party system formed.",
        body: [
          "The U.S. party system has changed many times since the founding era.",
          "Modern Democrats and Republicans emerged through long historical shifts.",
        ],
      },
      {
        id: "political-spectrum",
        title: "The Political Spectrum",
        summary: "How left, center, and right are usually described.",
        body: [
          "The political spectrum is a simplified way to describe ideology.",
          "People and parties often mix positions across different issues.",
        ],
      },
      {
        id: "independents",
        title: "Independents",
        summary: "What it means to be unaffiliated with a major party.",
        body: [
          "Independent voters and politicians do not formally align with a major party.",
          "That can mean more flexibility, but also less institutional support.",
        ],
      },
      {
        id: "third-parties",
        title: "Third Parties",
        summary: "Smaller parties and why they matter.",
        body: [
          "Third parties often influence debates even when they do not win many offices.",
          "They can push major parties to adopt or respond to certain ideas.",
        ],
      },
    ],
  },
  {
    id: "us-history-foundations",
    title: "U.S. History Foundations",
    subtitle:
      "Enlightenment, Reconstruction, Civil Rights, U.S. presidents, and more.",
    icon: require("../../assets/education_icons/us_history.png"),
    subtopics: [
      {
        id: "reconstruction",
        title: "Reconstruction",
        summary: "The post-Civil War rebuilding era.",
        body: [
          "Reconstruction reshaped the Constitution and the federal-state relationship.",
          "It also set the stage for later civil rights debates.",
        ],
      },
      {
        id: "civil-rights-era",
        title: "Civil Rights Era",
        summary: "Major 20th-century rights movements and laws.",
        body: [
          "The Civil Rights Era brought major legal and social changes.",
          "Federal law and court decisions expanded protections for many Americans.",
        ],
      },
    ],
  },
  {
    id: "rights-civic-participation",
    title: "Your Rights & Civic Participation",
    subtitle: "Voting, local government, advocacy, and how to get involved.",
    icon: require("../../assets/education_icons/your_rights.png"),
    subtopics: [
      {
        id: "voting-rights",
        title: "Voting Rights",
        summary: "Who can vote and how access is protected.",
        body: [
          "Voting rights shape who can participate in democracy and how easily they can do it.",
          "Laws about registration, access, and districting all affect participation.",
        ],
      },
      {
        id: "advocacy",
        title: "Advocacy",
        summary: "How to contact officials and influence policy.",
        body: [
          "Civic participation includes contacting representatives, organizing, and public comment.",
          "Small actions can still matter when they are consistent and targeted.",
        ],
      },
    ],
  },
];

export const getEducationTopic = (topicId: string) =>
  educationTopics.find((topic) => topic.id === topicId) ?? null;

export const getEducationSubtopic = (topicId: string, subtopicId: string) => {
  const topic = getEducationTopic(topicId);
  return (
    topic?.subtopics.find((subtopic) => subtopic.id === subtopicId) ?? null
  );
};
