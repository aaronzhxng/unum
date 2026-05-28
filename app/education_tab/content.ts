export type EducationSection =
  | { type: "text"; heading?: string; content: string }
  | { type: "image"; source: any; caption?: string }
  | { type: "links"; heading?: string; items: { label: string; url: string }[] };

export type EducationSubtopic = {
  id: string;
  title: string;
  summary: string;
  body: EducationSection[];
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
          {
            type: "text",
            content:
              "The U.S. system divides power so no single branch controls everything.",
          },
          {
            type: "text",
            content:
              "Congress makes laws, the president enforces them, and courts interpret them.",
          },
        ],
      },
      {
        id: "checks-balances",
        title: "Checks and Balances",
        summary: "Why each branch can limit the others.",
        body: [
          {
            type: "text",
            content:
              "Checks and balances are meant to prevent abuse of power.",
          },
          {
            type: "text",
            content:
              "Each branch has tools that can slow or block the others in limited ways.",
          },
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
        id: "what-is-the-constitution",
        title: "What is the Constitution?",
        summary: "The rules that govern the U.S. government and the rights of all Americans.",
        body: [
          {
            type: "text",
            heading: "What is the Constitution?",
            content:
              'A constitution contains the rules that a government must follow. Every U.S. state has a constitution, and so does the national government.\n\nFirstly, it outlines how the federal government looks. It sets up the three-"branch" structure of Congress, the Executive, and the Supreme Court, explains how members are elected or appointed to each, and divides up the responsibilities of government between them. The Constitution also reserves many powers for state governments. In this way, the United States is guaranteed to be a country that is federal, democratic, and republican.',
          },
          {
            type: "image",
            source: require("../../assets/education_icons/constitution1.png"),
            caption:
              "The U.S. Constitution on display at the National Archives in Washington, D.C.",
          },
          {
            type: "text",
            heading: "The Physical Document",
            content:
              'The U.S. Constitution is originally four pages long. You can see it in the National Archives building in Washington, D.C. Its opening paragraph is called the "Preamble", and it includes some of the most famous words in the United States. It says the U.S. government was designed to ensure justice, defense, liberty, and prosperity for all people.',
          },
          {
            type: "text",
            heading: "Amending the Constitution",
            content:
              "The Constitution was purposely made very difficult to change, or amend, so that its basic structure would always stay the same. The only way amendments to the Constitution have been passed before was that:\n\n• At least two-thirds of Congress voted for it, and then\n• The governments or the citizens in at least three-thirds of the states also voted for it.\n\nIt is also possible that there could be a big meeting of all the states (called a Constitutional Convention) specifically for proposing amendments. This will happen if two-thirds of the states ask for one. However, they never have.",
          },
          {
            type: "text",
            heading: "History",
            content:
              'The Constitution became law in 1789, after the first and only Constitutional Convention took place soon after the U.S. became independent. Since then, the Constitution has only been amended in 27 places. Some of these have been additions, while others are deletions or substitutions. Many amendments list the important civil rights and legal rights that all persons in the United States have. Because the first ten amendments deal with guaranteeing individual rights, they are called the "Bill of Rights." No action by the Executive or by Congress can violate a constitutionally guaranteed right.',
          },
          {
            type: "text",
            heading: "Constitutional Rights",
            content:
              "The following are a list of some constitutional rights. Beside them is the number of the amendment(s) that established those rights.\n\n• The right to free speech [1]\n• The right to publish [1]\n• The right to practice any religion, or no religion, as you like [1]\n• The right to organize and participate in peaceful protest [1]\n• The right to own a gun to defend yourself [2]\n• The right not to have your self or your property searched by police, unless a judge orders the police to do so [4]\n• The right to a speedy and public trial by a fair jury [6]\n• The right for your trial to be done properly and fairly (this is called due process) [5 & 14]\n• The right to be treated fairly by the law, no matter who you are (equal protection under the law) [14]\n• The right to vote, regardless of race [15] or sex [19]",
          },
          {
            type: "image",
            source: require("../../assets/education_icons/constitution2.png"),
            caption: undefined,
          },
          {
            type: "text",
            heading: "The 13th Amendment",
            content:
              "Until the 1860s, many states did not have laws that banned slavery. As a result, millions of African-Americans were treated like property and forced to work for no pay. The 13th Amendment, passed after the U.S. Civil War (1861–65) made this kind of forced unpaid labor illegal everywhere in the United States, except for prisons.",
          },
          {
            type: "text",
            heading: "Federal vs. State Power",
            content:
              "A state also cannot pass a law that goes against what the Constitution says. In the past, the national government has overridden state laws several times by amending the Constitution. For example, amendments were passed to force states to abolish slavery, to allow women and young people to vote, and to introduce a national income tax. However, the 10th amendment guarantees that all rights not given to the national government belong to the states or to the people. Therefore, the federal government is also a limited government.",
          },
          {
            type: "text",
            heading: "The Supreme Court's Role",
            content:
              'The Constitution is one of the shortest and oldest in the world. Because of this, a lot of the language can seem vague or outdated. A large part of the Supreme Court\'s job is determining whether a law or an executive action is "constitutional," and therefore can be carried out. If a majority of the Supreme Court rules that it is not constitutional, then the law itself is invalid.\n\nThe Supreme Court also has the job of determining how far civil and legal rights practically extend. For example, in 1963, the Supreme Court ruled that part of due process included the right to have a lawyer, so anyone who is too poor to pay for one can be assigned one by the government.',
          },
          {
            type: "text",
            heading: "Why It Matters",
            content:
              "Knowing the U.S. Constitution is important for two main reasons. Firstly, it means that you know in a broad way how the federal government is set up and what principles the United States holds dear: federalism, limited government, and democratic republicanism.\n\nSecondly, it helps you know what the government must do, what it may do, and what it absolutely cannot do. This way, you can take advantage of all the freedoms that exist in this country without getting in trouble. It also means you understand what areas are the responsibility of the federal government, and what is the responsibility of the state government.",
          },
          {
            type: "text",
            content:
              "The physical Constitution is located in the National Archives building in Washington, D.C.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label: "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label: "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label: "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },
      {
        id: "bill-of-rights",
        title: "The Bill of Rights",
        summary: "The first 10 amendments and what they protect.",
        body: [
          {
            type: "text",
            content:
              "The Bill of Rights protects core civil liberties like speech, religion, and due process.",
          },
          {
            type: "text",
            content:
              "These amendments are central to modern constitutional law.",
          },
        ],
      },
      {
        id: "supreme-court",
        title: "The Supreme Court",
        summary: "How the Court interprets the Constitution.",
        body: [
          {
            type: "text",
            content:
              "The Supreme Court is the highest federal court in the United States.",
          },
          {
            type: "text",
            content:
              "Its decisions can shape how constitutional rights apply in practice.",
          },
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
          {
            type: "text",
            content:
              "A bill usually goes through introduction, committee review, floor votes, and then presidential action.",
          },
          {
            type: "text",
            content:
              "Most bills do not become law, so each step matters.",
          },
        ],
      },
      {
        id: "committees",
        title: "Committees",
        summary: "Why most legislative work happens before floor debate.",
        body: [
          {
            type: "text",
            content:
              "Committees review bills in detail and decide whether to advance them.",
          },
          {
            type: "text",
            content:
              "This is often where a bill is amended, delayed, or stopped.",
          },
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
          {
            type: "text",
            content:
              "The Electoral College determines presidential elections, not the national popular vote alone.",
          },
          {
            type: "text",
            content:
              "States award electoral votes based on election results, with a few exceptions.",
          },
        ],
      },
      {
        id: "primaries",
        title: "Primaries",
        summary: "How parties choose candidates.",
        body: [
          {
            type: "text",
            content:
              "Primaries and caucuses help select each party's nominee.",
          },
          {
            type: "text",
            content:
              "Different states use different systems, which can change turnout and outcomes.",
          },
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
          {
            type: "text",
            content:
              "The U.S. party system has changed many times since the founding era.",
          },
          {
            type: "text",
            content:
              "Modern Democrats and Republicans emerged through long historical shifts.",
          },
        ],
      },
      {
        id: "political-spectrum",
        title: "The Political Spectrum",
        summary: "How left, center, and right are usually described.",
        body: [
          {
            type: "text",
            content:
              "The political spectrum is a simplified way to describe ideology.",
          },
          {
            type: "text",
            content:
              "People and parties often mix positions across different issues.",
          },
        ],
      },
      {
        id: "independents",
        title: "Independents",
        summary: "What it means to be unaffiliated with a major party.",
        body: [
          {
            type: "text",
            content:
              "Independent voters and politicians do not formally align with a major party.",
          },
          {
            type: "text",
            content:
              "That can mean more flexibility, but also less institutional support.",
          },
        ],
      },
      {
        id: "third-parties",
        title: "Third Parties",
        summary: "Smaller parties and why they matter.",
        body: [
          {
            type: "text",
            content:
              "Third parties often influence debates even when they do not win many offices.",
          },
          {
            type: "text",
            content:
              "They can push major parties to adopt or respond to certain ideas.",
          },
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
          {
            type: "text",
            content:
              "Reconstruction reshaped the Constitution and the federal-state relationship.",
          },
          {
            type: "text",
            content:
              "It also set the stage for later civil rights debates.",
          },
        ],
      },
      {
        id: "civil-rights-era",
        title: "Civil Rights Era",
        summary: "Major 20th-century rights movements and laws.",
        body: [
          {
            type: "text",
            content:
              "The Civil Rights Era brought major legal and social changes.",
          },
          {
            type: "text",
            content:
              "Federal law and court decisions expanded protections for many Americans.",
          },
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
          {
            type: "text",
            content:
              "Voting rights shape who can participate in democracy and how easily they can do it.",
          },
          {
            type: "text",
            content:
              "Laws about registration, access, and districting all affect participation.",
          },
        ],
      },
      {
        id: "advocacy",
        title: "Advocacy",
        summary: "How to contact officials and influence policy.",
        body: [
          {
            type: "text",
            content:
              "Civic participation includes contacting representatives, organizing, and public comment.",
          },
          {
            type: "text",
            content:
              "Small actions can still matter when they are consistent and targeted.",
          },
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
