export type EducationSection =
  | { type: "text"; heading?: string; content: string }
  | { type: "image"; source: any; caption?: string; transparent?: boolean }
  | { type: "links"; heading?: string; items: { label: string; url: string }[] }
  /** Highlighted callout block — use sparingly (1–2 per article) for key facts. */
  | { type: "callout"; heading?: string; content: string }
  /** Blue-bar bold list — each item renders as a bold line with a blue left accent. */
  | { type: "list"; items: string[] };

export type EducationSubtopic = {
  id: string;
  icon?: any;
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
  // ════════════════════════════════════════════════════════════════════════════
  // HOW GOVERNMENT WORKS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "how-government-works",
    title: "How Government Works",
    subtitle: "The 3 branches, checks & balances, federalism, and more.",
    icon: require("../../assets/education_icons/how_gov_works.png"),
    subtopics: [
      // ── Page 1: What is the U.S. Government? ────────────────────────────────
      {
        id: "what-is-us-government",
        icon: require("../../assets/education_icons/govworksicon1.png"),
        title: "What is the U.S. Government?",
        summary: "Federalism and the many layers of American government.",
        body: [
          {
            type: "text",
            content:
              'The United States has many governments, not just one. The decisions these governments make affect your life in countless ways. Most of us are ruled by at least four different governmental authorities: the government of the United States, the government of a state, the government of a county, and the government of a village, town, or city.\n\nWhen people talk about "the U.S. government" or the "federal government," they mean the government run from Washington, D.C. That does not mean that the other governments are unimportant. In fact, in the United States, there are rules that say there are some things a state government can do that the federal government cannot stop. This idea is called federalism. State and local governments deal with everything from fixing roads to paying the police to rezoning a vacant lot. Few people have to deal directly with the U.S. government more than a couple times per year.',
          },
          {
            type: "image",
            source: require("../../assets/education_images/whatisusgov.png"),
            caption:
              "The U.S. passport is issued to citizens by the federal government. Its front page tells people in other countries that the U.S. Secretary of State, and the department which he/she runs, will protect the holder of the passport.",
          },
          {
            type: "text",
            content:
              "Still, it is likely you rely on federal services every day.",
          },
          {
            type: "callout",
            content:
              "Most services that cover multiple states are run on the federal level.",
          },
          {
            type: "text",
            content:
              'For example, all letters are delivered by the U.S. Postal Service. All foreign trade is regulated by the Department of Commerce. And all passports, trademarks, and dollar bills are issued by the U.S. government. These activities are done by teams of non-political government employees, called civil servants. They work for Departments that are led by Secretaries, who are appointed by and advise the President. Together, they form the "Executive."',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Learn more about the U.S. government and its 'branches'",
                url: "https://www.usa.gov/branches-of-government",
              },
              {
                label: "Checks and balances in the U.S. government",
                url: "https://www.ebsco.com/research-starters/political-science/checks-and-balances-us-government",
              },
            ],
          },
        ],
      },

      // ── Page 2: What Does the Executive Do? ──────────────────────────────
      {
        id: "what-does-executive-do",
        icon: require("../../assets/education_icons/govworksicon2.png"),
        title: "What does the Executive do?",
        summary: "Executive Orders, the Cabinet, and Congress making law.",
        body: [
          {
            type: "text",
            content:
              "Decisions made at the federal level affect the most Americans at once. Sometimes, the President will issue an Executive Order that changes something about how the Executive works.",
          },
          {
            type: "text",
            heading: "Congress",
            content:
              "The federal government also passes many important laws every year. Laws are not made by the President or his chosen Cabinet of Secretaries, but rather the elected Legislature, called Congress. The laws they can pass include going to war and making peace, raising and lowering the main rate of income tax, and controlling how many immigrants can enter the country each year.",
          },
          {
            type: "callout",
            content:
              "Unlike the President's Cabinet of Secretaries, everyone in Congress is elected, either to the House of Representatives or the Senate.",
          },
          {
            type: "text",
            content:
              "Members of Congress come from all fifty states. This makes sure that new laws are consistent with what voting citizens want across the country. There are also five delegates who represent American Samoa, Guam, the U.S. Virgin Islands, the Northern Mariana Islands, and Washington, D.C., and one resident commissioner from Puerto Rico. These persons sit in the House of Representatives and are not allowed to vote.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Learn more about the U.S. government and its 'branches'",
                url: "https://www.usa.gov/branches-of-government",
              },
              {
                label: "Checks and balances in the U.S. government",
                url: "https://www.ebsco.com/research-starters/political-science/checks-and-balances-us-government",
              },
            ],
          },
        ],
      },

      // ── Page 3: What is the Basis for American Law? ──────────────────────
      {
        id: "basis-for-american-law",
        icon: require("../../assets/education_icons/govworksicon3.png"),
        title: "What is the basis for American law?",
        summary:
          "The Constitution, democracy, and the three branches as a tree.",
        body: [
          {
            type: "text",
            heading: "The Constitution",
            content:
              "The basic law of the United States is called the Constitution. It sets out what the U.S. government should essentially look like, and protects certain rights and freedoms for all people in the United States, like the right to criticize the government and the freedom to practice any or no religion. No law or Executive Order, however important, can go against what the Constitution says.",
          },
          {
            type: "text",
            content:
              "If the top court in the United States, the Supreme Court, finds that a law violates the Constitution, it goes immediately out of effect. If the Supreme Court finds that someone was unfairly punished under an unconstitutional law, the punishment is undone.",
          },
          {
            type: "text",
            content:
              "It is very important to know how the U.S. government works so that you know who to contact if you have a question about or an issue with the way the government is working. The United States is a democracy, meaning that citizens vote for the members of Congress and the President. Compared with non-democratic countries, each U.S. citizen has a lot of power in influencing how laws and Executive decisions are made.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/whatisbasisforamericanlaw.png"),
            caption:
              "A diagram of the three branches of the U.S. federal government. The Constitution and its amendments act as the roots of the tree, providing the foundation for all three branches.",
          },
          {
            type: "text",
            content:
              "A popular way to understand the federal government is to view it like a tree. This tree has three branches: the Executive, the Legislative, and the Judicial (legal).",
          },
          {
            type: "callout",
            content:
              'All of them are powerful, but none can run the government by itself. Instead, they do the work of "checking and balancing" the activities of each other.',
          },
          {
            type: "text",
            content:
              "What supports the tree are its roots — the Constitution and its 27 amendments made since 1789. And what feeds the tree and keeps it healthy are the votes, petitions, and active participation by educated citizens.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Learn more about the U.S. government and its 'branches'",
                url: "https://www.usa.gov/branches-of-government",
              },
              {
                label: "Checks and balances in the U.S. government",
                url: "https://www.ebsco.com/research-starters/political-science/checks-and-balances-us-government",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THE CONSTITUTION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "the-constitution",
    title: "The Constitution",
    subtitle: "The Bill of Rights, civil liberties, Supreme Court basics.",
    icon: require("../../assets/education_icons/constitution.png"),
    subtopics: [
      // ── Page 1: What is the Constitution? ────────────────────────────────
      {
        id: "what-is-the-constitution",
        icon: require("../../assets/education_icons/constitutionicon1.png"),
        title: "What is the Constitution?",
        summary:
          "The rules the government must follow and how the federal government is structured.",
        body: [
          {
            type: "text",
            content:
              'A constitution contains the rules that a government must follow. Every U.S. state has a constitution, and so does the national government.\n\nFirstly, it outlines how the federal government looks. It sets up the three-"branch" structure of Congress, the Executive, and the Supreme Court, explains how members are elected or appointed to each, and divides up the responsibilities of government between them. The Constitution also reserves many powers for state governments. In this way, the United States is guaranteed to be a country that is federal, democratic, and republican.',
          },
          {
            type: "callout",
            content:
              "A state also cannot pass a law that goes against what the Constitution says.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/constitution1.png"),
            caption:
              'The U.S. Constitution is originally four pages long. You can see it in the National Archives building in Washington, D.C. Its opening paragraph is called the "Preamble", and it includes some of the most famous words in the United States. It says the U.S. government was designed to ensure justice, defense, liberty, and prosperity for all people.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label:
                  "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },

      // ── Page 2: How Has the Constitution Been Changed? ────────────────────
      {
        id: "how-constitution-changed",
        icon: require("../../assets/education_icons/constitutionicon2.png"),
        title: "How has the Constitution been changed?",
        summary: "The amendment process and the Bill of Rights.",
        body: [
          {
            type: "callout",
            content:
              "The Constitution is very difficult to change, or amend. It has been amended fewer than 30 times in 250 years.",
          },
          {
            type: "text",
            content:
              "The only way amendments to the Constitution have been passed before was that:\n\n1. At least two-thirds of Congress voted for it, and then\n2. The governments or the citizens in at least three-thirds of the states also voted for it.",
          },
          {
            type: "text",
            content:
              "It is also possible that there could be a big meeting of all the states (called a Constitutional Convention) specifically for proposing amendments. This will happen if two-thirds of the states ask for one. However, they never have.",
          },
          {
            type: "text",
            content:
              "The Constitution became law in 1789, after the first and only Constitutional Convention took place soon after the U.S. became independent. Since then, the Constitution has only been amended in 27 places. Some of these have been additions, while others are deletions or substitutions.",
          },
          {
            type: "callout",
            content:
              "Many amendments list the important civil rights and legal rights that all persons in the United States have.",
          },
          {
            type: "text",
            content:
              'Because the first ten amendments deal with guaranteeing individual rights, they are called the "Bill of Rights." No action by the Executive or by Congress can violate a constitutionally guaranteed right.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label:
                  "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },

      // ── Page 3: How Can We Read the Constitution? ────────────────────────
      {
        id: "how-to-read-constitution",
        icon: require("../../assets/education_icons/constitutionicon4.png"),
        title: "How can we read the Constitution?",
        summary:
          "How the Supreme Court interprets the Constitution's language.",
        body: [
          {
            type: "text",
            content:
              'The Constitution is one of the shortest and oldest in the world. Because of this, a lot of the language can seem vague or outdated. A large part of the Supreme Court\'s job is determining whether a law or an executive action is "constitutional," and therefore can be carried out. If a majority of the Supreme Court rules that it is not constitutional, then the law itself is invalid.\n\nThe Supreme Court also has the job of determining how far civil and legal rights practically extend. For example, in 1963, the Supreme Court ruled that part of due process included the right to have a lawyer, so anyone who is too poor to pay for one can be assigned one by the government.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label:
                  "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HOUSE OF REPRESENTATIVES
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "house-of-representatives",
    title: "What is the House of Representatives?",
    subtitle:
      "Districts, redistricting, leadership, and the House's special powers.",
    icon: require("../../assets/education_icons/house.png"),
    subtopics: [
      // ── Page 1: How does the House look? ─────────────────────────────────
      {
        id: "how-does-the-house-look",
        icon: require("../../assets/education_icons/houseicon1.png"),
        title: "How does the House look?",
        summary:
          "How representation is distributed across states by population.",
        body: [
          {
            type: "text",
            content:
              'The House of Representatives, also called the House, is the "lower" of the two houses of Congress. This is because the House was designed to represent the population on a smaller scale than the Senate. Its members, Representatives, are elected every two years to districts, rather than states.',
          },
          {
            type: "callout",
            content:
              "The number of representatives each state gets depends on its population. Currently, California has 52 representatives, while five states have just 1 district covering their whole area.",
          },
          {
            type: "text",
            content:
              "In 1929, Congress locked the size of the House at 435 seats. Since then, states have gained and lost seats between each other, but the total remains the same. This process of gaining and losing representatives, called reapportionment, takes place every ten years after the national census.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/house1.png"),
            caption:
              "This map shows the number of representatives each state has as of 2023. Source: commons.wikimedia.org/wiki/File:2020_census_reapportionment.svg",
          },
          {
            type: "text",
            content:
              'Because of the mathematics involved in making sure each state has at least one representative, some states are statistically overrepresented compared to others. For example, at the 2020 census, Delaware had just fewer than 1 million residents, while Montana had just over 1 million. However, Montana now has two representatives — so, about one per 500,000 people — while Delaware still has just one. The average U.S. House District includes between 750,000 and 800,000 residents ("constituents.")',
          },
          {
            type: "text",
            content:
              "In addition to the 435 voting members, there are 6 representatives who cannot vote. These men and women represent the U.S.'s territories — Puerto Rico, Guam, the U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands — as well as Washington, D.C.",
          },
        ],
      },

      // ── Page 2: How are districts redrawn? ───────────────────────────────
      {
        id: "how-are-districts-redrawn",
        icon: require("../../assets/education_icons/houseicon2.png"),
        title: "How are districts redrawn?",
        summary:
          "Redistricting, gerrymandering, and how states draw congressional boundaries.",
        body: [
          {
            type: "text",
            content:
              "The census tells states how many districts they must have, but it is the states that decide just how these districts look. Sometimes, after the census, a state gets more or fewer seats and so has to draw a new map. Other times, the state does not need to, but chooses to anyway. This process is called redistricting.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/house2.jpg"),
            caption:
              "Iowa's congressional districts after the census of 2000. Source: commons.wikimedia.org/wiki/File:IA-districts-108.JPG",
          },
          {
            type: "image",
            source: require("../../assets/education_images/house3.png"),
            caption:
              "Iowa's congressional districts after the census of 2010. Source: commons.wikimedia.org/wiki/File:Blank_Iowa_Congressional_Districts_with_Counties,_2012-2022.svg",
          },
          {
            type: "text",
            content:
              "Just who draws the map depends on the state. Some states use a panel of experts or a mix of both parties. Others let the state legislature do it, and maybe the governor.",
          },
          {
            type: "callout",
            content:
              "A consequence of allowing partisan map drawing is that, sometimes, the party in charge will redistrict the state based on voting patterns to help itself win more seats in the future.",
          },
          {
            type: "text",
            content:
              'This process is called "gerrymandering." The term gerrymander comes from 1812 when the Governor of Massachusetts, Elbridge Gerry proposed such a map. Many of its districts took weird and unnatural shapes, some of which looked like a salamander, just to let his party win more seats. It can be obvious to tell when a district is gerrymandered, because it has a very strange shape that does not seem to make a lot of sense.',
          },
          {
            type: "text",
            content:
              'In fact, party politicians have two main strategies to make sure gerrymandering works. First, they can divide large populations that vote against them into several districts so that their vote can be outnumbered. This is called "cracking." Alternatively, they can take voters they don\'t like and pack them into one district, so that other districts are less competitive. A combination of these strategies can be seen in the example below.',
          },
          {
            type: "image",
            source: require("../../assets/education_images/house4.png"),
          },
          {
            type: "text",
            content:
              "Recently, states have become more open about redistricting for political reasons. Gerrymandering is one of the most-often criticized parts about American democracy.",
          },
        ],
      },

      // ── Page 3: Who can become a representative? ─────────────────────────
      {
        id: "who-can-become-a-representative",
        icon: require("../../assets/education_icons/houseicon3.png"),
        title: "Who can become a representative?",
        summary:
          "The constitutional requirements to serve in the House of Representatives.",
        body: [
          {
            type: "text",
            content:
              "Between Congress and the Presidency, it is easiest to become a representative. One simply has to be at least 25 years of age, a resident of the state for which he or she is running, and a citizen for at least seven years. Of course, in reality, most representatives have prior connections in politics or society. They almost always belong to a political party and may be prominent lawyers, businesspeople, or activists.",
          },
        ],
      },

      // ── Page 4: How are districts numbered? ──────────────────────────────
      {
        id: "how-are-districts-numbered",
        icon: require("../../assets/education_icons/houseicon4.png"),
        title: "How are districts numbered?",
        summary:
          "How representatives and their districts are labeled and identified.",
        body: [
          {
            type: "image",
            source: require("../../assets/education_images/house5.png"),
            caption:
              "Congressional districts of Arizona (118th Congress). Author: Twotwofourtysix. Source: en.wikipedia.org/wiki/",
          },
          {
            type: "text",
            content:
              "Representatives and their districts are often noted as XX-##, with their state's two-letter postal abbreviation being followed by their assigned district number. Therefore, in the above map, the district covering much of Arizona's border with Mexico would be labeled AZ-7, and its representative would be referred to as, for example, John Smith (AZ-7). The district's number is usually determined based on location or on what it has historically been called.",
          },
        ],
      },

      // ── Page 5: House Leadership ──────────────────────────────────────────
      {
        id: "house-leadership",
        icon: require("../../assets/education_icons/houseicon5.png"),
        title: "House Leadership",
        summary: "The Speaker, Majority and Minority Leaders, and Whips.",
        body: [
          {
            type: "text",
            content:
              "Speaker of the House: The person who sets the agenda, presides over debates, and is second in line to the presidency. They are chosen by a majority vote either at the beginning of a new session of Congress or after the previous Speaker is no longer in office.",
          },
          {
            type: "text",
            content:
              "Majority and Minority Leader: The majority and minority party's main representative in negotiations and help set priorities.",
          },
          {
            type: "text",
            content:
              "Whips: The people who count their party's votes and push their members to vote the way leaders want.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Current House leadership",
                url: "https://www.house.gov/leadership",
              },
            ],
          },
        ],
      },

      // ── Page 6: What can the House of Representatives do? ────────────────
      {
        id: "what-can-the-house-do",
        icon: require("../../assets/education_icons/houseicon6.png"),
        title: "What can the House do?",
        summary:
          "The House's special powers: tax bills, impeachment, and electoral contingencies.",
        body: [
          {
            type: "text",
            content:
              "The House's biggest special power is starting tax bills. Any bill that raises money must begin in the House. The Founders wanted the chamber closest to the voters to be the one who decides to tax them.",
          },
          {
            type: "text",
            content:
              "Additionally, the House can charge the President and other federal officials — like cabinet members, judges, and ambassadors — with a serious offense. This is called impeachment. If the House impeaches this individual, the Senate has the chance to vote to remove them. Three presidents have been impeached in history: Andrew Johnson, Bill Clinton, and Donald Trump (who was impeached twice). Richard Nixon was not impeached because he resigned before the impeachment vote could occur.",
          },
          {
            type: "text",
            content:
              "Finally, if no candidate for President wins a majority of the Electoral Votes, the House can select one from the top three best-performing candidates. If this happens, each state delegation would get one vote, rather than each member, and a candidate would need votes from 26 of the 50 states to win. This has happened twice in U.S. history, in 1800 and in 1824.",
          },
          {
            type: "text",
            content:
              "Of course, the House is also one of the two houses of Congress, and shares in its responsibilities such as passing legislation, holding hearings, organizing committees, and more. You can learn more about these steps in the What can the Senate do section.",
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // U.S. SENATE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "us-senate",
    title: "What is the Senate?",
    subtitle:
      "Senators, classes, leadership, special powers, and the filibuster.",
    icon: require("../../assets/education_icons/senate.png"),
    subtopics: [
      // ── Page 1: How does the Senate look? ────────────────────────────────
      {
        id: "how-does-the-senate-look",
        icon: require("../../assets/education_icons/senateicon1.png"),
        title: "How does the Senate look?",
        summary:
          "Why the Senate exists and how its structure differs from the House.",
        body: [
          {
            type: "text",
            content:
              "The Senate is the upper of the two houses of Congress. It is smaller, with just one hundred members.",
          },
          {
            type: "callout",
            content:
              "Senators have a term of six years instead of two, and the Senate is considered more prestigious as a result. The Founders made it because they were worried that if there was only the House — which gives larger states more representation — nobody would speak up for the smaller states' interests.",
          },
          {
            type: "text",
            content:
              "Therefore, in the Senate, each state gets two members, making for 100 senators in total. Because senators represent the whole state, they usually hear from a wide array of voters. And because they can serve for six years before thinking about re-election, senators are more likely to think long term and strike compromises. This leads to the Senate being slower and more methodical at adopting legislation.",
          },
        ],
      },

      // ── Page 2: Who can become a senator? ────────────────────────────────
      {
        id: "who-can-become-a-senator",
        icon: require("../../assets/education_icons/senateicon2.png"),
        title: "Who can become a senator?",
        summary: "The constitutional requirements to serve in the Senate.",
        body: [
          {
            type: "text",
            content:
              "It is slightly harder to become a senator than a representative. A senator has to be at least 30 years of age, have been a citizen for nine years, and a resident of the state that he or she represents. Of course, in reality, most senators have prior experience in politics. They almost always belong to a political party and may be prominent lawyers, businesspeople, activists, or even former representatives.",
          },
        ],
      },

      // ── Page 3: How are senators classified? ─────────────────────────────
      {
        id: "how-are-senators-classified",
        icon: require("../../assets/education_icons/senateicon3.png"),
        title: "How are senators classified?",
        summary:
          "Senate classes, staggered election cycles, and how senators are identified.",
        body: [
          {
            type: "text",
            content:
              "Senators are identified with the two-letter postal abbreviation of their state: so, it might be Mrs. Joan Smith (AK). When journalists need to differentiate between the two senators from the same state, the more recently elected person is called the junior senator, while the other is the senior senator.",
          },
          {
            type: "text",
            content:
              "Senators are also divided into \"classes.\" This is because while senators' terms last for six years, they were not all elected in the same year. In 2018, 33 Class I Senate seats went up for election. This means that in that November's election, people who lived in 33 states had to re-elect one of their two senators, or elect somebody new. However, those in the remaining states still kept both their senators. Then, in 2020, it was time to re-elect 33 Class II Senate seats. And in 2022, the remaining 34 Class III Senate seats went up for election.",
          },
          {
            type: "text",
            content:
              "Finally, senators were directly elected from only 1913 onwards.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/senate1.png"),
            caption:
              "Map shows the classes in each U.S. state. Green = Classes 1 and 2; Magenta = Classes 1 and 3; Cyan = Classes 2 and 3. Source: commons.wikimedia.org/wiki/File:US_Senate_Classes.svg",
          },
        ],
      },

      // ── Page 4: Senate Leadership ─────────────────────────────────────────
      {
        id: "senate-leadership",
        icon: require("../../assets/education_icons/senateicon4.png"),
        title: "Senate Leadership",
        summary:
          "The Vice President, President Pro-tempore, Majority and Minority Leaders, and Whips.",
        body: [
          {
            type: "text",
            content:
              "Vice President: Officially acts as the leader of the Senate and breaks tie votes.",
          },
          {
            type: "text",
            content:
              "President Pro-tempore: Leads the Senate when the VP isn't there. Usually the longest-serving member of the largest party.",
          },
          {
            type: "text",
            content:
              "Majority and Minority Leader: The majority and minority party's main representative in negotiations and help set priorities.",
          },
          {
            type: "text",
            content:
              "Whips: The people who count their party's votes and push their members to vote the way leaders want.",
          },
        ],
      },

      // ── Page 5: What can the Senate do? ──────────────────────────────────
      {
        id: "what-can-the-senate-do",
        icon: require("../../assets/education_icons/senateicon5.png"),
        title: "What can the Senate do?",
        summary:
          "Confirmations, treaties, removal of officials, and electoral contingency powers.",
        body: [
          {
            type: "text",
            content:
              "Normally, the most important special power of the Senate is interviewing, debating, and confirming federal appointments that the President makes, with a majority vote. These include ambassadors, judges, justices to the Supreme Court, and the President's Cabinet. The Senate alone also approves the U.S. joining an international treaty with a two-thirds vote.",
          },
          {
            type: "text",
            content:
              "The Senate can also remove the President and other officials before their term ends if they are first impeached in the House. This has never happened to a president in U.S. history. However, this has happened with lesser officials, including judges.",
          },
          {
            type: "text",
            content:
              "Finally, if no candidate for Vice President gets a majority of electoral votes after an election, the Senate can choose a winner from the top two candidates. This happened after the 1836 election. This is even more significant if the House is busy debating who the President should be: in that case, the Vice President the Senate chooses acts as president until the House makes up its mind.",
          },
          {
            type: "text",
            content:
              "Of course, the Senate is one of the two houses of Congress, and shares in its responsibilities such as passing legislation, holding hearings, organizing committees, and more. You can learn more about these steps in the What can the House do section.",
          },
        ],
      },

      // ── Page 6: The Filibuster ────────────────────────────────────────────
      {
        id: "the-filibuster",
        icon: require("../../assets/education_icons/senateicon6.png"),
        title: "The Filibuster",
        summary:
          "How unlimited debate in the Senate can delay or block legislation.",
        body: [
          {
            type: "text",
            content:
              'The Senate is a place where legislation can be considered more carefully than it can in the House. This is mainly because there are fewer senators, and thus less pressure on everyone\'s time. Unlike in the House, where the Speaker sets and enforces strict time limits on debate, the Senate allows its members to speak for as long as they want. Usually, the debate comes to a natural end, and a vote can begin. However, sometimes a senator will want to delay the bill from passing and purposely talks on and on without end. Or, a senator can just signal that he or she means to block the bill. Either method stops the bill from moving forward, and is called a "filibuster."',
          },
          {
            type: "text",
            content:
              'During these times, other members will try to stop the filibuster. However, unless three-fifths or more senators present vote for "cloture," which forcefully ends the debate, the filibuster can continue. In the past, this has led to talking filibusters taking up multiple hours, and even days — until the speaker is exhausted. Silent filibusters, also called "holds," can take even longer to remove.',
          },
          {
            type: "callout",
            content:
              "Senators can filibuster most bills, but not all. The most important bills that cannot be filibustered are those that deal with routine parts of the budget: mandatory spending, revenue, and the debt limit.",
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // Responsibilities of Congress
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "congress-legislation",
    title: "Responsibilities of Congress",
    subtitle: "How a bill becomes law, committees, floor votes, and more.",
    icon: require("../../assets/education_icons/congress.png"),
    subtopics: [
      // ── Page 1: What does Congress do? ───────────────────────────────────
      {
        id: "what-does-congress-do",
        icon: require("../../assets/education_icons/congressicon1.png"),
        title: "What does Congress do?",
        summary:
          "The legislative role of Congress: passing laws, controlling spending, and checking the Executive.",
        body: [
          {
            type: "text",
            content:
              "Congress is the legislative branch of the U.S. government. In this capacity, Congress passes laws, controls spending, and checks the work of the Executive.\n\nThe most important job of Congress is legislating, or passing new laws.",
          },
          {
            type: "callout",
            content:
              "The Constitution allows Congress to pass laws on almost anything that affects multiple states or the entire country at once.",
          },
          {
            type: "text",
            content:
              'These include immigration, major taxes, declaring war and making peace, the national debt, international treaties, and trade with foreign countries.\n\nNew laws need to be made from time to time to keep them up to date. It could be that an old law needs to be updated, replaced, or repealed without replacement. There could also be a situation that requires entirely new laws.\n\nThe following sections will discuss how a law is passed in all its stages. In practice, however, Congress has many ways of skipping past a step, or taking a different approach: for example, by calling a "voice vote" instead of a "roll-call vote." It is impossible to describe all of them here; however, Unum defines many of these actions when they have taken place for specific bills.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 2: Who introduces a law? ─────────────────────────────────────
      {
        id: "who-introduces-a-law",
        icon: require("../../assets/education_icons/congressicon2.png"),
        title: "Who introduces a law?",
        summary:
          "How bills are drafted, introduced, and assigned to committees.",
        body: [
          {
            type: "text",
            content:
              'A draft law is called a bill or a resolution: they are basically the same.\n\nAny member of Congress can introduce a bill: the first person to do so becomes its "sponsor", and those who follow are called "co-sponsors". Once it is introduced, the bill gets the letters H.R. or S (standing for House of Representatives or Senate), or H.J.Res. or S.J.Res. (if it is a joint resolution), followed by a number.\n\nThe bill is then referred to one or more committees with just a few special members of the House or the Senate, who will research and debate the details of the bill and make any necessary changes.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 3: What are committees? ──────────────────────────────────────
      {
        id: "what-are-committees",
        icon: require("../../assets/education_icons/congressicon3.png"),
        title: "What are committees?",
        summary:
          "How congressional committees research, debate, and shape legislation.",
        body: [
          {
            type: "text",
            content:
              'At any time, the House and Senate have, put together, about fifty committees and 150 subcommittees. Each body specializes in a specific area. The most important committees include the House Ways and Means Committee, which debates bills related to taxation, and the Senate Committee on Foreign Relations.\n\nIn order to know more about the subject of the bill, each committee or subcommittee will usually hold one or more hearings, or public meetings. The members will call up non-politician experts in the area and ask them questions about whether the bill will help or hurt them or if it is necessary. Usually, the people who are being asked to speak (testify) have different backgrounds from each other. For instance, while considering a bill to do with telecommunications, Congress might hold a hearing with television executives, college professors, and small video creators.\n\nCommittees can also sometimes hold hearings about topics that they expect a bill to be written about soon. And, the Senate Committee on Foreign Relations holds hearings when they need to decide whether the Senate should ratify an international agreement (or "treaty") that the President has signed. The Constitution says that two-thirds of the Senate must vote for a treaty before its terms become law in the United States.\n\nCommittees have members belonging to both parties. However, the chair position and the majority of members always belong to the party with the majority of seats in the House or Senate. The chair is very important, because he or she sets the schedule for what bills get considered and what bills are ignored, or "tabled."',
          },
          {
            type: "callout",
            content:
              "Most bills fail in committee and do not even get a hearing.",
          },
          {
            type: "text",
            content:
              'The leader of the minority group in each committee is called the "ranking member."',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 4: What happens after a committee approves a bill? ───────────
      {
        id: "what-happens-after-committee",
        icon: require("../../assets/education_icons/congressicon4.png"),
        title: "What happens after a committee approves a bill?",
        summary:
          "Floor debate, chamber votes, conference committee, and the presidential decision.",
        body: [
          {
            type: "text",
            content:
              'If the committee approves a bill, it returns to the chamber where it is debated, changed ("amended"), and voted on. You can watch debates live on the C-SPAN television channels or on the Internet. At least half of the chamber\'s members must vote in favor of the bill: usually, that means no fewer than 218 of 435 representatives, or 51 of 100 senators. If they do, the bill moves to the second chamber, where it goes through the same process again.\n\nAt the end, a conference committee is formed with members of both chambers to work out any differences that came up during the amendment process. Once their work is done, the bill goes to the President to sign or reject ("veto").',
          },
          {
            type: "callout",
            content:
              "The President only has ten days, not counting Sunday, to make a decision, or it will automatically become law.",
          },
          {
            type: "text",
            content:
              "If the President vetoes a bill, both chambers of Congress need to vote with a two-thirds majority to make the bill into law anyways.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 5: Example bills becoming law ────────────────────────────────
      {
        id: "example-bills-becoming-law",
        icon: require("../../assets/education_icons/congressicon5.png"),
        title: "Example bills becoming law",
        summary:
          "A real example showing every stage a bill passes through on Congress.gov.",
        body: [
          {
            type: "text",
            content:
              "Let us see an example. You can track the progress of a bill using Unum or Congress.gov.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress1.png"),
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress2.png"),
          },
          {
            type: "text",
            content:
              "As you can see, on March 13, 2007, Democratic member of the House of Representatives James L. Oberstar (representing Minnesota's eighth congressional district) introduced the \"Water Resources Development Act of 2007,\" numbered H.R. 1495. It was co-sponsored by three of Mr. Oberstar's colleagues: one Democrat and two Republicans.\n\nThe bill went through the House of Representatives' Transportation and Infrastructure Committee who published a report. It then went through the Senate, and, finally, the conference committee, who also published a report. The bill was all set to be given to the President, George W. Bush.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress3.png"),
          },
          {
            type: "text",
            content:
              "Mr. Bush received the bill on October 23, but he vetoed it ten days later, on November 2. He issued a statement explaining his decision, but the House and Senate voted with two-thirds majorities to pass the bill anyways. The next day, it became an effective law.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 6: Using Unum to track a bill ────────────────────────────────
      {
        id: "using-unum-to-track-a-bill",
        icon: require("../../assets/education_icons/congressicon6.png"),
        title: "Using Unum to track a bill",
        summary:
          "A step-by-step walkthrough of tracking a real bill through Unum.",
        body: [
          {
            type: "text",
            content:
              "Unum was created to help regular people keep track of bills as they move through the legislative process. Try turning on notifications for a bill or a member of Congress! Let us see one bill that also became a law: the Epstein Files Transparency Act, which directed the Department of Justice to publish certain files relating to two notorious criminals.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress4.jpg"),
            caption:
              "First, you can see the bill was introduced on July 15, 2025, by Ro Khanna, a Democratic representative for California's 17th district.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress5.jpg"),
            caption:
              "Afterward, the House Committee on the Judiciary considered the bill for a few months. On November 18, the committee’s chairman, Mr. Jim Jordan (R-OH4) took the bill out.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress6.jpg"),
            caption:
              "The House debated the bill for forty minutes, and then voted for it, 427–1.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress7.jpg"),
            caption:
              "As you can see, Unum provides bar graphs for recorded votes based on members' parties. It also highlights how the selected local representative, Mr. Goldman, voted for the bill.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress8.jpg"),
            caption:
              'Finally, the Senate received the bill. As earlier discussed, sometimes Congress takes special measures to speed up passing a bill. This time, the Senate did not debate or record a vote through a complex procedure called "Unanimous Consent." You can search up what this and other procedures mean. Because of this quick action, President Trump received the bill on the same day, November 19, and signed it into law.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 7: What about other resolutions? ─────────────────────────────
      {
        id: "what-about-other-resolutions",
        icon: require("../../assets/education_icons/congressicon7.png"),
        title: "What about other resolutions?",
        summary:
          "Simple and concurrent resolutions that change how Congress operates but never become law.",
        body: [
          {
            type: "text",
            content:
              "Interestingly, there are two more types of resolution, but they never become law. Simple resolutions (numbered H.Res. or S.Res.) are passed by one house of Congress to change how they operate. Concurrent resolutions (H.Con.Res. or S.Con.Res.) are passed by both houses of Congress to change how both operate. Usually, all that happens is that they are introduced, and a vote happens.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "C-SPAN: watch congressional debates live",
                url: "https://www.c-span.org/",
              },
              {
                label:
                  "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 8: Making money ───────────────────────────────────────────────
      {
        id: "making-money",
        icon: require("../../assets/education_icons/congressicon8.png"),
        title: "Making money",
        summary:
          "How the federal government raises revenue through taxes and tariffs.",
        body: [
          {
            type: "text",
            content:
              'One of the most important responsibilities a government has is controlling how money is raised from the public (as "income") and where that money is spent (as "expenditures" or "outlays"). In a federal country like the United States, these powers are shared between the national government, the state government, and smaller local governments.\n\nThe federal government raises money in several ways. The largest part of government revenue comes from taxes on individual incomes. There are also taxes taken off an employee\'s payroll, taxes on company earnings, taxes on harmful goods like gasoline and tobacco, and taxes on items bought from other countries (these taxes are called tariffs). Tariffs are collected by the Customs and Border Protection agency, while taxes are managed by the Internal Revenue System (IRS). The Constitution says that all bills that relate to raising money must start in the House of Representatives.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
              },
              {
                label: "Where federal spending goes",
                url: "https://www.usaspending.gov/",
              },
              {
                label: "How the government budget process works",
                url: "https://usafacts.org/articles/how-does-the-government-budget-process-work/",
              },
              {
                label: "Timetable of budget actions",
                url: "https://budget.house.gov/about/budget-framework/time-table-budget-process/",
              },
            ],
          },
        ],
      },

      // ── Page 9: Spending money ─────────────────────────────────────────────
      {
        id: "spending-money",
        icon: require("../../assets/education_icons/congressicon9.png"),
        title: "Spending money",
        summary:
          "Mandatory versus discretionary spending and how the federal budget is divided.",
        body: [
          {
            type: "text",
            content:
              "The money that is raised is spent on a wide number of things. First are responsibilities any national government has, such as paying for the military and for national security. Additionally, the United States funds many programs to improve the lives of its citizens and businesses.",
          },
          {
            type: "callout",
            content:
              "The U.S. government buys 20% of all the country's goods and services (called the G.D.P., or gross domestic product).",
          },
          {
            type: "text",
            content:
              'For example, the United States government takes a cut out of all employees\' payrolls to pay for Social Security, a welfare program that gives retired workers a few thousand dollars a month. Another payroll tax goes to funding Medicare, which is government health insurance for Americans over 65.\n\nIn the past, Congress decided that these programs, and a few others, are so important that they must be funded every year no matter what. Therefore, economists call this "mandatory spending." Mandatory spending accounts for about 60% of total spending. Another 10% of total spending goes to paying off the national debt. For a long time, the United States has spent much more than it earns in revenue (this practice is called "deficit spending"), increasing the amount of money it owes to its citizens, banks, and foreign countries. It is important that the U.S. keeps up these regular interest payments so that the overall economy does well.\n\nThe remaining part of government outlays is decided (or "appropriated") each year by Congress. Congress does this by passing twelve bills that together form the budget. The budget bills appropriate all non-mandatory spending for the next fiscal year, which, for the U.S. government, lasts from October 1 to September 30. Unlike mandatory spending, legislators can easily change where and how much to spend from one budget to the next as they see fit, or at their discretion. Therefore, the measures are called "discretionary spending."',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
              },
              {
                label: "Where federal spending goes",
                url: "https://www.usaspending.gov/",
              },
              {
                label: "How the government budget process works",
                url: "https://usafacts.org/articles/how-does-the-government-budget-process-work/",
              },
              {
                label: "Timetable of budget actions",
                url: "https://budget.house.gov/about/budget-framework/time-table-budget-process/",
              },
            ],
          },
        ],
      },

      // ── Page 10: How the budget is made ───────────────────────────────────
      {
        id: "how-the-budget-is-made",
        icon: require("../../assets/education_icons/congressicon10.png"),
        title: "How the budget is made",
        summary:
          "The step-by-step process Congress uses to write the federal budget each year.",
        body: [
          {
            type: "image",
            source: require("../../assets/education_images/congress9.png"),
            caption:
              "The U.S. government produces informational diagrams like this one to help explain the budget. In 2024, the U.S. earned $4,900,000,000,000 and spent $6,800,000,000,000, leaving a deficit of about $1,900,000,000,000.",
          },
          {
            type: "text",
            content:
              "The government starts thinking about next year's budget as soon as the current year's budget is passed. First, all executive agencies tell the Office of Management and Budget how much money they expect to spend in the next year. The Office then works with the President to write a formal budget request. Meanwhile, both the House and Senate write their own \"resolutions\" which say broadly how much they are willing to spend. Congress also has offices to help them with this job, including the Congressional Budget Office. These steps are optional, but they help set expectations for what the budget will end up looking like.\n\nWith these outlines done, both the House and Senate cut up the budget into twelve policy areas and assign one specialized subcommittee to each. For example, one subcommittee just looks at energy and water development, while another looks at defense spending. Each subcommittee does research to understand how much money each federal program really needs, and whether it is spending the money it already has well. With this information, each subcommittee writes one detailed bill that actually appropriates the money. They pass that bill to whatever chamber they belong to, and the chamber votes on it.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress10.png"),
            caption:
              "All subcommittees hold hearings during the budget process. For example, in this image, Representative Andy Harris (Republican for Maryland's 1st district) was asking a New York City grocer about how his customers spend their money. On May 22, 2024, Dr. Harris was chairman of the agriculture subcommittee, responsible for deciding how much money should be given to help poor families buy food. All of these hearings are recorded and can be watched online.",
          },
          {
            type: "text",
            content:
              "Whatever differences exist between the House and Senate versions of each appropriation bill are worked out line by line by a committee of both chambers. Finally, both the House and Senate vote on the whole budget, which includes all twelve bills. Once they approve the budget, it goes to the President for him or her to approve as well.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
              },
              {
                label: "Where federal spending goes",
                url: "https://www.usaspending.gov/",
              },
              {
                label: "How the government budget process works",
                url: "https://usafacts.org/articles/how-does-the-government-budget-process-work/",
              },
              {
                label: "Timetable of budget actions",
                url: "https://budget.house.gov/about/budget-framework/time-table-budget-process/",
              },
            ],
          },
        ],
      },

      // ── Page 11: What if there's a problem? ───────────────────────────────
      {
        id: "what-if-theres-a-problem",
        icon: require("../../assets/education_icons/congressicon11.png"),
        title: "What if there's a problem?",
        summary:
          "Government shutdowns, continuing resolutions, and supplemental appropriations.",
        body: [
          {
            type: "text",
            content:
              'If the process goes smoothly, the next fiscal year\'s budget is passed before the old one is up, and government money never stops going to the people who need it. However, during the past thirty years, it has become more common for a budget to stall. When this happens, Congress and the President must renew last year\'s budget for a while (in a so-called "continuing resolution") to give themselves more time. If a continuing resolution also cannot be passed, then the government is said to have "shut down," either partially or entirely.',
          },
          {
            type: "callout",
            content:
              "During a total government shutdown, only mandatory spending continues. During a partial shutdown, only those agencies with approved appropriations stay working.",
          },
          {
            type: "text",
            content:
              "The shutdown continues unless a continuing resolution is passed. The crisis only totally ends when a new budget is passed.\n\nOn the other hand, sometimes one budget per year is not enough. For example, in 2020, the government passed four additional appropriations bills because the Covid-19 pandemic was seriously affecting the nation's economy. These are called supplemental appropriations because they supplement (help) the budget.\n\nMany have complained about the difficulty with passing the budget well and on time. But even beyond the budget, politicians disagree about whether taxes should be raised or lowered, if the nation is in too much debt, and what additional appropriations should be passed to follow the outlines given in the budget resolution. Following all of this in the news can be difficult, but also revealing. Debates over government finance tell a lot about what political parties and politicians think the role that government should play in the lives of ordinary people.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
              },
              {
                label: "Where federal spending goes",
                url: "https://www.usaspending.gov/",
              },
              {
                label: "How the government budget process works",
                url: "https://usafacts.org/articles/how-does-the-government-budget-process-work/",
              },
              {
                label: "Timetable of budget actions",
                url: "https://budget.house.gov/about/budget-framework/time-table-budget-process/",
              },
            ],
          },
        ],
      },

      // ── Page 12: Checking the work of the Executive ───────────────────────
      {
        id: "checking-the-work-of-the-executive",
        icon: require("../../assets/education_icons/congressicon12.png"),
        title: "Checking the work of the Executive",
        summary:
          "Congressional oversight, Senate confirmations, and how Congress investigates wrongdoing.",
        body: [
          {
            type: "text",
            content:
              "Another important responsibility of Congress is making sure that the Executive Branch is working properly. This is called oversight and is part of the federal government's checks and balances. Congress holds regular hearings that are usually public to determine if Executive agencies are doing their jobs well and according to law. These also give committees the chance to ask questions to all Cabinet secretaries (who lead an Executive Department).\n\nThe President is never called up for a hearing. However, Congress still has some powers to examine and challenge his or her work. For one, when a position opens up (becomes vacant) that the President wants to fill, the Senate holds hearings before voting on whether to approve the President's choice. This goes for ambassadors, Cabinet members, judges, and justices of the Supreme Court.",
          },
          {
            type: "callout",
            content:
              "In recent years, some of these hearings have become very political, especially when Congress rejects a nominee.",
          },
          {
            type: "text",
            content:
              "Additionally, Congress can hold hearings to investigate whether people within or outside of government have acted illegally. If it is a company or a private individual, this could drive Congress to pass a law punishing them. And if a federal official (including the President and Vice President) or Supreme Court justice did wrong, Congress can charge them with a crime (impeachment) and then hold a trial to remove them from office early.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Types of congressional hearings (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/98-317",
              },
              {
                label: "How impeachment works",
                url: "https://www.usa.gov/impeachment",
              },
            ],
          },
        ],
      },

      // ── Page 13: What is impeachment? ─────────────────────────────────────
      {
        id: "what-is-impeachment",
        icon: require("../../assets/education_icons/congressicon13.png"),
        title: "What is impeachment?",
        summary:
          "The constitutional process for charging and removing a federal official from office.",
        body: [
          {
            type: "text",
            content:
              "Federal officials can only be impeached if they have committed one of the following three offenses described in the Constitution:\n\n1. Treason (helping the U.S.'s enemies during wartime, trying to overthrow the U.S. government, or blocking U.S. laws from being enforced)\n2. Bribery (doing people favors in exchange for money or another gift)\n3. High crimes and misdemeanors (an old law term that is generally understood to mean working against the public interest in some very serious way). This is the most common charge.",
          },
          {
            type: "text",
            content:
              'The impeachment process involves both houses of Congress. First, a majority of the House of Representatives must vote to pass charges, in so-called "articles of impeachment." This document describes what the federal official is said to have done wrong.\n\nThen, the Senate acts like a courtroom, hearing evidence and legal arguments. Two-thirds of all the senators must vote that the charged official is guilty. If they do, the official is removed from office. If they do not, the official is said to be "acquitted."\n\nThe Supreme Court has effectively no role in the whole process just described. In fact, Supreme Court justices can be impeached and removed, too.',
          },
          {
            type: "callout",
            content:
              "This means that, in theory, the votes to impeach and remove are entirely political.",
          },
          {
            type: "text",
            content:
              "However, members of Congress are trusted to treat their job with the serious consideration it deserves. The House only rarely succeeds in passing articles of impeachment. Famously, three presidents have been impeached: Andrew Johnson (1868), Bill Clinton (1998), and Donald Trump (2019 & 2021). One Supreme Court justice has also been impeached: Samuel Chase, in 1804. None were removed from office.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Types of congressional hearings (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/98-317",
              },
              {
                label: "How impeachment works",
                url: "https://www.usa.gov/impeachment",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ELECTIONS & VOTING
  // ════════════════════════════════════════════════════════════════════════════
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
            content: "Primaries and caucuses help select each party's nominee.",
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

  // ════════════════════════════════════════════════════════════════════════════
  // THE U.S. JUDICIAL SYSTEM
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "us-judicial-system",
    title: "The U.S. Judicial System",
    subtitle: "Federal courts, judges, the Supreme Court, and the rule of law.",
    icon: require("../../assets/education_icons/judiciary.png"),
    subtopics: [
      // ── Page 1: What are the basic principles of U.S. law? ──────────────────
      {
        id: "what-are-basic-principles-of-us-law",
        icon: require("../../assets/education_icons/judiciaryicon1.png"),
        title: "What are the basic principles of U.S. law?",
        summary: "The role of the Constitution and common law in American justice.",
        body: [
          {
            type: "text",
            content:
              "As a country colonized by Great Britain, the U.S. legal system is based on the English traditions of fairness and equality.",
          },
          {
            type: "text",
            heading: "The Constitution",
            content:
              "This shows up in two ways. First, the Constitution and its amendments set out certain legal rights all Americans have, including the right to know what someone is accusing you of having done and the right to receive a trial by a fair jury. No law, treaty, regulation, or act by any part of government can go against these founding documents.",
          },
          {
            type: "text",
            heading: "Common law",
            content:
              "Second, the U.S. operates on English common law, which believes in the existence of natural rights. This means that instead of defining big legal ideas on paper, they should come from precedents (also called stare decisis): that is, the conclusions reached from previous cases.",
          },
          {
            type: "text",
            content:
              "For example, a judge deciding whether somebody today did not fulfill his part of a contract will look at how judges in the past dealt with similar situations. The current judge then trusts that these historic decisions were decided based on the principles of natural rights, like individual freedom and personal responsibility. But if the judge checks and finds they were not, she can say so and establish a new, fairer precedent by overruling, or overturning, the previous decision.",
          },
          {
            type: "callout",
            content:
              "In this way, common law creates a legal culture that is both flexible and suspicious of bad rulers.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/judiciary1.png"),
            caption:
              "Judges consult a wide variety of English and American legal and even philosophical texts in order to determine what to do in unclear situations. For example, the Magna Carta, a document against the English king from 1215, is used to say that government power should be limited. Other important documents include the 1689 English Bill of Rights and Sir William Blackstone's Commentaries on the Laws of England (1765).",
          },
          {
            type: "image",
            source: require("../../assets/education_images/judiciary2.png"),
            caption:
              "All public federal laws are included in the United States Code, and all regulations in the Code of Federal Regulations (above). Both are huge, multi-volume books, but there are regularly updated versions online, too.",
          },
          {
            type: "text",
            content:
              "That said, the majority of criminal cases are less uncertain: usually, somebody directly broke the law of an Act of Congress (called a statute) or an administrative law introduced by an executive agency (called a regulation). It's just that, if someone argues that the law or act itself goes against natural or constitutional rights, he or she might succeed in getting it overturned at the state or federal level.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Search all laws passed by Congress",
                url: "https://www.congress.gov/",
              },
              {
                label: "Search the U.S. Code",
                url: "https://uscode.house.gov/",
              },
              {
                label: "Search the Code of Federal Regulations",
                url: "https://www.ecfr.gov/",
              },
            ],
          },
        ],
      },

      // ── Page 2: What do U.S. courts look like? ──────────────────────────────
      {
        id: "what-do-us-courts-look-like",
        icon: require("../../assets/education_icons/judiciaryicon2.png"),
        title: "What do U.S. courts look like?",
        summary: "From local trials to federal appeals, how American courts work.",
        body: [
          {
            type: "text",
            content:
              "The U.S. has courts at the local, state, and federal level. Almost all cases go to the state or local level, because the federalist system of government means that most matters are not handled by the government in Washington.",
          },
          {
            type: "text",
            heading: "State courts",
            content:
              "Matters handled at the state level include divorce, inheritance, property, assault, theft, and—usually—murder. Depending on the area, county or city (municipal) courts may deal with smaller offenses still, like speeding or drunk driving.",
          },
          {
            type: "text",
            heading: "Federal courts",
            content:
              "Federal courts, meanwhile, deal with matters like bankruptcy, immigration, smuggling, violations of federal laws, and cases where a higher level of government is needed, like if one state sues another, or a U.S. citizen is sued by someone of another country.",
          },
          {
            type: "text",
            heading: "Parties",
            content:
              "Proceedings emerge when one or more parties accuse others of wrongdoing. The accuser, either an individual, individuals, or the government, is called the plaintiff or petitioner. Their lawyer is called a prosecutor. The person, persons, or institutions being accused is called a defendant or respondent. Their lawyer is called a defense attorney.",
          },
          {
            type: "text",
            heading: "Pre-trial",
            content:
              "First, the two sides get together and see if a deal can be made between them. For example, if the sides are suing over a disagreement, they might agree to get a government-appointed mediator who helps them solve their problem out of court. Alternatively, if a defendant is accused of breaking the law, he or she might agree to plead guilty and accept a lesser punishment. This is called a plea bargain.",
          },
          {
            type: "text",
            heading: "Trial",
            content:
              "If they cannot come to an agreement, then a trial begins. The two sides' attorneys argue back and forth and call up witnesses to testify as to what happened and how this proves or does not prove that the charges are just. At the end, either a jury of twelve randomly selected citizens or a judge (in very minor offenses) will rule for one side or another.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/judiciary3.png"),
            caption:
              "Courts have very strict rules against photographs and videos, so courtroom drawings have become popular for big cases. In this case from 1986, members of an international drug-smuggling group are on trial in a federal court. Unlike in other countries, in the U.S., attorneys have no special dress and simply wear professional clothes, while judges have just a special black robe.",
          },
          {
            type: "text",
            heading: "Appeals",
            content:
              "If one side disagrees with the results of a trial, they can try to appeal it to a higher-level state or federal court, theoretically up to the state or federal Supreme Court or equivalent. If it gets up there, then the issue is almost always no longer that the trial proceeded incorrectly, but that the law itself violated the state or national constitution, and should be repealed.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Learn more about the federal court system",
                url: "https://www.uscourts.gov/about-federal-courts/court-role-and-structure",
              },
              {
                label: "Search how each state's court system works",
                url: "https://www.ncsc.org/resources-courts/understanding-state-court-jurisdictions",
              },
            ],
          },
        ],
      },

      // ── Page 3: Who are judges in the U.S.? ─────────────────────────────────
      {
        id: "who-are-judges-in-the-us",
        icon: require("../../assets/education_icons/judiciaryicon3.png"),
        title: "Who are judges in the U.S.?",
        summary: "How federal and state judges are chosen and how long they serve.",
        body: [
          {
            type: "text",
            heading: "Federal judges",
            content:
              "All U.S. federal judges are appointed by the President and confirmed by the Senate. Most serve for life or until they resign.",
          },
          {
            type: "text",
            heading: "State judges",
            content:
              "Meanwhile, state judges are chosen in a variety of different ways. Some are elected, others chosen by a government commission, and still others simply by the governor. Some states give judges term limits, and most require that they retire at age 70 or 75.",
          },
          {
            type: "text",
            content:
              "Because there are so many judges even at the federal level, very few nominations ever make the news. When a low-level vacancy opens up, the president will be advised by that state's members of Congress to choose some long-serving, qualified lawyer to make a judge. That judge will go before the Senate's Judiciary Committee, respond to some questions, and eventually be confirmed.",
          },
          {
            type: "text",
            content:
              "However, judgeships can be controversial, especially for the justices in the U.S. Supreme Court.",
          },
        ],
      },

      // ── Page 4: What is the Supreme Court? ──────────────────────────────────
      {
        id: "what-is-the-supreme-court",
        icon: require("../../assets/education_icons/judiciaryicon4.png"),
        title: "What is the Supreme Court?",
        summary: "The highest court in the land and its landmark rulings.",
        body: [
          {
            type: "text",
            content:
              "The national Supreme Court is the very highest court in the U.S., often called the \"court of last resort.\" This is because, apart from a few very technical matters that the Constitution requires it to decide, the Supreme Court only considers (\"grants certiorari to\") appeals in cases where the question concerns what the law even means, or whether it goes against the Constitution. This includes even decisions by state supreme courts.",
          },
          {
            type: "callout",
            content:
              "So, the rulings the Supreme Court issues can dramatically change how a law is understood or interpreted, or simply invalidate the law and all similar laws altogether, federal and state.",
          },
          {
            type: "text",
            content:
              "The Supreme Court is, therefore, very powerful, and is considered one of the three branches of government all by itself. Although in the past the Supreme Court was mostly unpolitical and even obscure, in the last century it has dealt with many controversial issues that split social liberals and social conservatives. Some of these cases include:",
          },
          {
            type: "list",
            items: [
              "Brown v. Board of Education (1954), that found state laws allowing schools to be segregated by race violates the Fourteenth Amendment.",
              "Roe v. Wade (1973), that found state laws banning abortion up to an extent violated the Fourteenth Amendment.",
              "Obergefell v. Hodges (2015), that found state laws banning gay marriage violated the Fourteenth Amendment.",
              "Dobbs v. Jackson Women's Health Organization (2022), that reversed Roe v. Wade.",
            ],
          },
          {
            type: "text",
            content:
              "As the example of Roe v. Wade shows, many Supreme Court rulings have also ended up being overturned in part or in full.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "See the website for the Supreme Court",
                url: "https://www.supremecourt.gov/",
              },
              {
                label:
                  "See some more significant, \"landmark\" Supreme Court cases that significantly changed how people understood the Constitution",
                url: "https://www.uscourts.gov/about-federal-courts/educational-resources/supreme-court-landmarks",
              },
            ],
          },
        ],
      },

      // ── Page 5: Who are the justices on the Supreme Court? ──────────────────
      {
        id: "who-are-the-justices-on-the-supreme-court",
        icon: require("../../assets/education_icons/judiciaryicon5.png"),
        title: "Who are the justices on the Supreme Court?",
        summary: "How Supreme Court justices are appointed and who serves today.",
        body: [
          {
            type: "text",
            content:
              "There are nine justices on the Supreme Court: one chief justice, who leads discussions, and eight associate justices. All their votes count the same and a majority must vote to issue a ruling that goes against what a lower court found. Then, each justice chooses if they want to write an opinion, explaining why they voted as they did.",
          },
          {
            type: "text",
            heading: "Appointment",
            content:
              "The nine justices are appointed by the president and must be approved by the Senate. They serve until they die or voluntarily retire, and there is no election or term limit.",
          },
          {
            type: "text",
            heading: "Diversity",
            content:
              "Usually, presidents try to balance the number of Supreme Court justices from each region of the country. Since 1967, there has also always been at least one African-American justice (there are now two), and since 1981, at least one woman justice (there are now four).",
          },
          {
            type: "text",
            heading: "Qualifications",
            content:
              "Presidents also consider qualifications. Usually, Supreme Court justices have a long history as lawyers and judges, although they do not have to. And, they consider personal character.",
          },
          {
            type: "callout",
            content:
              "As discussed in the last section, the Supreme Court has become more political in the last century as they take on more social issues. These days, there are even two major ways of reading the Constitution, one of which is more popular among liberals, and the other among conservatives.",
          },
          {
            type: "text",
            content:
              "Therefore, the media and Congress have increased how much attention they give to Supreme Court nominees and their prior record. After all, because justices serve for so long, they can reflect a political reality that has long gone from the other parts of government. Right now, the majority of Supreme Court justices are considered conservative. Even if the Democrats win the presidency and Congress in a while, this Supreme Court majority will probably last for at least twenty more years.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/judiciary4.png"),
            caption:
              "Clarence Thomas, dressed in a judge's robe. After Mr. Thomas was nominated to be an associate justice in 1990, Congress questioned both his character and strong conservatism. In particular, one woman, Anita Hill, alleged that he had sexually harassed her. Since he was approved by a very narrow margin over three decades ago, Mr. Thomas has been considered the Court's most conservative justice.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "See current and past Supreme Court justices, their biographies, and something about their beliefs",
                url: "https://www.oyez.org/justices",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THE EXECUTIVE BRANCH
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "executive-branch",
    title: "The Executive Branch",
    subtitle: "The President, Vice President, Cabinet, and how the executive works.",
    icon: require("../../assets/education_icons/executive.png"),
    subtopics: [
      // ── Page 1: What is the Executive Branch? ───────────────────────────────
      {
        id: "what-is-the-executive-branch",
        icon: require("../../assets/education_icons/executiveicon1.png"),
        title: "What is the Executive Branch?",
        summary: "The branch that carries out laws, led by the President and the civil service.",
        body: [
          {
            type: "text",
            content:
              "In the balance of powers of the federal government, the legislature (Congress) writes laws and the judiciary (Supreme Court) makes sure all laws follow the Constitution.",
          },
          {
            type: "text",
            content:
              "But it is the executive that works to make sure these laws are actually carried out, whether a new regulation that needs to be enforced or a new tax that has to be collected.",
          },
          {
            type: "callout",
            content:
              "Therefore, the executive includes a large bureaucracy, also called the civil service, and the entire national military.",
          },
          {
            type: "text",
            content:
              "The head of the executive branch is the President. He or she is head of the civil service and commander-in-chief of the military. The President is also head of state, meaning he or she represents the U.S. in foreign countries.",
          },
          {
            type: "text",
            content:
              "The jobs of the civil service and military are largely organized into departments. Although individual civil servants and soldiers are not meant to be political, and serve whomever is President, every department is led by a secretary that the President appoints. The most important of these secretaries make up the President's Cabinet.",
          },
          {
            type: "text",
            content:
              "The President is the most important single person in the U.S. government and knowing how he or she thinks and even behaves is necessary to understand and predict the nation's future. The President is also very famous, and the election every four years to elect or re-elect the President is usually the one that most people care about.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "The official website of the Executive Branch",
                url: "https://www.whitehouse.gov/",
              },
              {
                label: "The official X (formerly Twitter) account of President Trump",
                url: "https://x.com/POTUS",
              },
            ],
          },
        ],
      },

      // ── Page 2: Who can become U.S. President? ──────────────────────────────
      {
        id: "who-can-become-us-president",
        icon: require("../../assets/education_icons/executiveicon2.png"),
        title: "Who can become U.S. President?",
        summary: "The Constitutional requirements and typical profile of U.S. presidents.",
        body: [
          {
            type: "text",
            content: "The Constitution requires that the President must:",
          },
          {
            type: "list",
            items: [
              "Be at least 35 years old,",
              "Have lived in the U.S. for at least 14 years, and",
              "Be a \"natural-born citizen\" (either born in the U.S., or born outside the U.S. to at least one citizen parent).",
            ],
          },
          {
            type: "text",
            content:
              "The same basic requirements apply to the Vice President, except that while no president can serve more than two full terms of office, a vice president has no term limit.",
          },
          {
            type: "text",
            content:
              "In practice, presidents are usually quite accomplished politicians, businessmen, and/or lawyers who were already well known nationally before being elected.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive1.png"),
            caption:
              "Two recent presidents had very different levels of experience. Donald Trump (left, 2017–2021; 2025–present) never worked for the government before he became president. Meanwhile, Joe Biden (2021–2025) was senator for 36 years and vice president for 8 years.",
          },
          {
            type: "text",
            content:
              "Of the five men who have been president since the start of the 21st century, two were state governors (Bill Clinton and George W. Bush) and two were senators (Barack Obama and Joe Biden). Before he took office for the first time in 2017, the current President, Donald Trump, had never worked for any government before, but was a well-known billionaire businessman and television show host.",
          },
          {
            type: "text",
            content:
              "Finally, every president for the past 200 years has belonged to a political party. In fact, because the President is so famous, he or she usually ends up speaking on behalf of the party, influencing its official positions and platform.",
          },
          {
            type: "callout",
            content:
              "45 men have been U.S. president, although we say there have been 47 presidents, because two of them served more than once. So, Mr. Trump is both the 45th and 47th president.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive2.png"),
            caption:
              "Like congresspeople and vice presidents, the President gets an inauguration ceremony, where the Chief Justice asks him or her to swear an oath. The presidential inauguration, which takes place on the January 20th after the election, has many ceremonies, including an inaugural (first) speech and a ball, where the President and First Lady have a dance.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Essays and reflections on all presidents, past and present",
                url: "https://millercenter.org/president",
              },
            ],
          },
        ],
      },

      // ── Page 3: How is the U.S. President elected? ──────────────────────────
      {
        id: "how-is-the-us-president-elected",
        icon: require("../../assets/education_icons/executiveicon3.png"),
        title: "How is the U.S. President elected?",
        summary: "The Electoral College and how Americans choose their president.",
        body: [
          {
            type: "text",
            content:
              "Every four years in November, in addition to electing every member of the House of Representatives and one-third of the Senate, people across the U.S. vote for a president and vice president.",
          },
          {
            type: "text",
            content:
              "However, they do this in a unique way called the Electoral College. Essentially, even though a ballot paper lists the name of a presidential and vice-presidential candidate, voters are really only voting for obscure local party members called electors. But these electors promise to vote for the candidate on the voter's behalf, and whoever wins the most votes among these electors (or electoral votes) actually becomes President and Vice President.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive3.png"),
            caption:
              "For example, on the ballot given to voters in Vermont on November 5, 2024, only the names of the presidential and vice-presidential candidates were listed.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive4.png"),
            caption:
              "In the end, more Vermont voters wanted Democratic candidates Kamala Harris and Tim Walz to be president and vice president, respectively, than anybody else. So, they elected three electors: Stephen Amos, Timothy Jerman, and Mary Sullivan.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive5.png"),
            caption:
              "Then, when Mr. Amos, Mr. Jerman, and Ms. Sullivan met on December 17, 2024, they all voted for Kamala Harris and Tim Walz, as the voters instructed.",
          },
          {
            type: "callout",
            content:
              "Although this process is indirect, it does not actually affect the results. When electors meet a month after the presidential election in November, they nearly always vote for whomever the voters in their state asked them to.",
          },
          {
            type: "text",
            content:
              "If they rebel, however, and vote for somebody other than the person the voters wanted them to, then they are called \"faithless electors.\" In many states, faithless electors are illegal. The last time faithless electors affected an election in any significant way was in 1836.",
          },
        ],
      },

      // ── Page 4: How are electors chosen? ────────────────────────────────────
      {
        id: "how-are-electors-chosen",
        icon: require("../../assets/education_icons/executiveicon4.png"),
        title: "How are electors chosen?",
        summary: "How electoral votes are distributed and why swing states matter.",
        body: [
          {
            type: "text",
            content:
              "Each state is assigned a number of electors based on the number of seats it has in the House plus the number of senators it has (two). This means that each state has at least three electoral votes, although the exact number changes after every census, as that is when the House seat count changes, too.",
          },
          {
            type: "text",
            content:
              "Additionally, even though Washington, D.C. cannot elect its own voting members to Congress, it gets three electoral votes. However, the U.S. territories still have no electoral votes.",
          },
          {
            type: "text",
            content:
              "As you may remember, the U.S. purposely gives two senators to each state so that all states have an equal say. What this means is that voters in less-populated states generally have more of a say in determining who becomes President.",
          },
          {
            type: "text",
            content:
              "Further, in all but two states—Nebraska and Maine—electors are given in a \"winner-take-all\" way. What this means is that the candidate who wins more votes than anyone else in the state gets all that state's electoral votes.",
          },
          {
            type: "text",
            content:
              "One instance where this made a big difference was in 2000, when George W. Bush was running for President against Al Gore. The race was very close, and it all came down to Florida. There, Mr. Bush received 2,912,790 votes, but Mr. Gore won 2,912,253 votes. Considering votes for neither candidate, Mr. Bush only had the support of 48.847% of Floridians. However, because he had more than anyone else, all 25 of Florida's electoral votes went to him, and he became President.",
          },
          {
            type: "callout",
            content:
              "For these two reasons, the persons that become President and Vice President might not have received the largest number of votes nationwide. This was the case in 1824, 1876, 1888, 2000, and 2016. Usually, this is because the losing candidate is very popular, but only in a few states. So, they win more electoral votes, but not more votes in total.",
          },
          {
            type: "text",
            content:
              "Because it does not matter how many votes you get in one state, so long as it is more than anybody else, candidates usually spend lots of time in states where they are winning or losing by just a hair. These are called \"swing states.\" For example, in the 2016 election, 68 percent of campaign events took place in just 6 states.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive6.png"),
            caption:
              "In 2016, Donald Trump won 304 electoral votes and therefore the presidency. However, he won only 62,984,828 votes, or 46.09% of all votes. Meanwhile, Hillary Clinton won 65,853,514 votes, or 48.18% of all votes, but only 227 electoral votes. This is because Mr. Trump was popular in the swing states and in states with fewer people per electoral vote. 2016 was also a strange election because seven electors voted faithlessly.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "See how many electoral votes each state gets",
                url: "https://www.archives.gov/electoral-college/allocation",
              },
            ],
          },
        ],
      },

      // ── Page 5: What can the President do? ──────────────────────────────────
      {
        id: "what-can-the-president-do",
        icon: require("../../assets/education_icons/executiveicon5.png"),
        title: "What can the President do?",
        summary: "The President's enumerated and implied powers under the Constitution.",
        body: [
          {
            type: "image",
            source: require("../../assets/education_images/executive7.png"),
            caption:
              "President Ronald Reagan at work in 1988 in the Oval Office of the president's official home, the White House, located at 1600 Pennsylvania Ave., Washington, D.C. — one of the most famous addresses on Earth.",
          },
          {
            type: "text",
            content:
              "The U.S. President is the most powerful single person in the country, and has both enumerated and implied powers.",
          },
          {
            type: "text",
            heading: "Enumerated powers",
            content:
              "The Constitution gives the President enumerated powers. These include the power to negotiate treaties, lead the military, veto bills, pardon criminals or grant them clemency, and work out how the vast Executive Branch should work in order to make sure the laws that Congress passes actually go into effect.",
          },
          {
            type: "text",
            content:
              "For the last of these responsibilities, the President nominates a huge assortment of government officials, including judges, heads of the military, and a Cabinet of secretaries.",
          },
          {
            type: "text",
            heading: "Implied powers",
            content:
              "But the President also has many implied powers. These are things that presidents have, throughout the centuries, just gradually started doing.",
          },
          {
            type: "text",
            content:
              "The next articles discuss how the President's enumerated and implied powers work in practice.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "See the President's public schedule",
                url: "https://rollcall.com/factbase/trump/topic/calendar/",
              },
            ],
          },
        ],
      },

      // ── Page 6: How does the President influence lawmaking? ─────────────────
      {
        id: "how-does-president-influence-lawmaking",
        icon: require("../../assets/education_icons/executiveicon6.png"),
        title: "How does the President influence lawmaking?",
        summary: "Vetoes, party leadership, the State of the Union, and the budget.",
        body: [
          {
            type: "text",
            content:
              "Under the balance of powers, Congress holds the power to make laws, and the Supreme Court rules if that law follows the Constitution.",
          },
          {
            type: "text",
            heading: "Veto",
            content:
              "The President has a few powers to influence this process. First, the President signs a bill to make it law. If he or she refuses, a larger number of congresspeople must approve the bill or it does not become law. The President can also summon Congress to an emergency session at any time, although no president has done this since 1948.",
          },
          {
            type: "text",
            content:
              "Unlike countries that have prime ministers, the President does not have direct control over members of Congress and is not the formal leader of the party. However, the President is so well-known to voters that he or she will often speak on behalf of the party anyway.",
          },
          {
            type: "callout",
            content:
              "The strong party discipline in the United States Congress means that for key bills, Congress almost always votes how the President wants. For example, a news report from 2025 showed that almost every Republican member of Congress voted the way President Trump wanted them to vote at least 93 percent of the time.",
          },
          {
            type: "text",
            heading: "State of the Union",
            content:
              "Each year, the President is responsible for telling Congress what he or she wants them to be focusing on. For over one hundred years, presidents have chosen to give televised speeches called a \"State of the Union\" to both chambers of Congress.",
          },
          {
            type: "text",
            heading: "Budget",
            content:
              "Finally, the Executive Branch takes the first step in outlining how much money should be taxed, spent, and borrowed. Congress therefore begins the budget process with proposals that reflect the president's priorities.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "Learn more about the State of the Union address and read some past examples",
                url: "https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/annual-messages-congress-the-state-the-union",
              },
            ],
          },
        ],
      },

      // ── Page 7: What is the bureaucracy? ────────────────────────────────────
      {
        id: "what-is-the-bureaucracy",
        icon: require("../../assets/education_icons/executiveicon7.png"),
        title: "What is the bureaucracy?",
        summary: "The two million civil servants who carry out federal laws day to day.",
        body: [
          {
            type: "text",
            content:
              "A \"bureaucracy\" just means the part of government that is run by hired employees rather than politicians. Over two million bureaucrats, or civil servants, are employed by the federal government, from postal clerks to health inspectors to soldiers and sailors. They work to make sure the laws Congress writes actually show up in day-to-day life.",
          },
          {
            type: "text",
            content:
              "As head of the civil service, the President nominates a huge assortment of government officials, including ambassadors, the secretaries of all the Cabinet departments, federal attorneys and judges (including the Supreme Court justices), the heads and generals of the military, and the head of the central bank (the Federal Reserve).",
          },
          {
            type: "text",
            content:
              "These top officials have to be approved by the Senate. Usually, these go through without a problem, but sometimes, especially if the person the President wants to nominate is very politically extreme or has had personal scandals in the past, the Senate will vigorously question and sometimes reject the nominee. Additionally, Cabinet secretaries can be impeached and removed from office just like the President can.",
          },
          {
            type: "text",
            content:
              "The President appoints middle-tier civil servants without the Senate. And, of course, the vast majority of people who work for the federal government, including the military, are hired and fired based on their merit just like any other job without the President's involvement.",
          },
        ],
      },

      // ── Page 8: How does the President lead the bureaucracy? ────────────────
      {
        id: "how-does-president-lead-bureaucracy",
        icon: require("../../assets/education_icons/executiveicon8.png"),
        title: "How does the President lead the bureaucracy?",
        summary: "Executive orders, memoranda, and command of the military.",
        body: [
          {
            type: "text",
            content:
              "Although the Executive Branch must follow all laws Congress writes, the President can direct the civil service in several key ways.",
          },
          {
            type: "text",
            heading: "Executive orders",
            content:
              "First, the President can tell them to change how they operate by writing memoranda or executive orders. These can have big consequences: for example, in 1948, President Harry S. Truman passed an executive order to stop segregation in the military. Executive orders can also shift authority between agencies, create and destroy agencies (within limits), and direct them to prioritize certain goals.",
          },
          {
            type: "text",
            heading: "Commander in chief",
            content:
              "Additionally, the President acts as the nation's commander in chief. He or she receives top military and spy information almost no-one else gets to see. During times of war or other national emergencies, the President closely works with military leaders to direct overall strategy, where soldiers should be deployed, and other high-level decisions, like air-strikes or naval blockades. Only the President can decide whether to drop an atomic bomb.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive8.png"),
            caption:
              "This is a very famous photograph from 2011, when the U.S. was hunting down Osama bin Laden, the terrorist responsible for the September 11, 2001, attacks. In addition to top military and intelligence people, President Barack Obama (second from left) and several of his top civilian advisers (the Vice President, Secretary of State, Secretary of Defense, and Chief of Staff) are working to make sure the operation succeeds.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Learn more about executive orders",
                url: "https://www.ebsco.com/research-starters/law/executive-orders",
              },
            ],
          },
        ],
      },

      // ── Page 9: What is the President's cabinet? ────────────────────────────
      {
        id: "what-is-the-presidents-cabinet",
        icon: require("../../assets/education_icons/executiveicon9.png"),
        title: "What is the President's cabinet?",
        summary: "The secretaries and advisers who help the President run the government.",
        body: [
          {
            type: "text",
            content:
              "To help make sure the government is working as he or she would like it to, the President appoints secretaries to lead the fifteen executive departments. Most government authority lies within the boundaries of one of these departments. Therefore, these secretaries are greatly influential in themselves.",
          },
          {
            type: "text",
            content:
              "These secretaries, together with the Vice President and a number of advisers and agency heads, form the President's cabinet. The Cabinet, which meets about once per month, influences the President's decisions.",
          },
          {
            type: "callout",
            content:
              "The most important members of the President's cabinet are the Vice President, the Secretary of State (responsible for foreign relations), the Secretary of the Treasury (responsible for finance), the Secretary of Defense (responsible for military administration), and the attorney general (head of the Department of Justice who gives legal advice to the President).",
          },
          {
            type: "text",
            content:
              "The President also appoints a number of staffers who have earned the President's loyalty and trust, including a Chief of Staff, Press Secretary, and other advisers.",
          },
          {
            type: "text",
            content:
              "Secretaries are sometimes individuals in private life with a lot of experience in their area. More often, they are politicians or influential fundraisers. Presidents will try to choose people whose qualifications overlap. For example, in 2006, President George W. Bush made Henry Paulson his Secretary of the Treasury: Mr. Paulson was previously CEO of Goldman Sachs, one of the largest U.S. investment banks, and helped raise $100,000 for Mr. Bush's re-election in 2004.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive9.png"),
            caption:
              "Because cabinet secretaries are public representatives for their departments, some Presidents make a point to appoint diverse people, such as people of color, women, and religious minorities. Joe Biden's cabinet had a historically large number of non-white and female members.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Members of the U.S. Cabinet",
                url: "https://www.whitehouse.gov/administration/cabinet/",
              },
            ],
          },
        ],
      },

      // ── Page 10: How does the President represent the country? ───────────────
      {
        id: "how-does-president-represent-the-country",
        icon: require("../../assets/education_icons/executiveicon10.png"),
        title: "How does the President represent the country?",
        summary: "Foreign relations, treaties, diplomacy, and ceremonial duties.",
        body: [
          {
            type: "text",
            content:
              "The Executive Branch handles almost all of the country's day-to-day foreign relations. The President appoints ambassadors and consuls, manages war operations, and makes sure the executive agencies working with trade and diplomacy are working well.",
          },
          {
            type: "text",
            content:
              "The President does for the United States what a king or prime minister might do elsewhere, meeting foreign leaders when they come to this country and going abroad to meet them. The President also represents the United States at big meetings of international organizations, like the United Nations, the G7, and NATO.",
          },
          {
            type: "text",
            content:
              "To this end, the President, Secretary of State, and senior diplomats are responsible for negotiating international treaties and trade agreements on behalf of the United States. That said, the Senate must ratify U.S. participation in any treaty with a two-thirds vote, which is not guaranteed.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive10.png"),
            caption:
              "U.S. presidents have great diplomatic power. In the 1970s, President Jimmy Carter (center) took an interest in the war between Israel and Egypt, so he invited the leaders of Egypt (left, Anwar Sadat) and Israel (right, Menachem Begin) to the president's official country home at Camp David. There, Mr. Sadat and Mr. Begin negotiated the start of a peace treaty that they signed the following year at the White House.",
          },
          {
            type: "text",
            content:
              "Finally, the President often performs many symbolic, or \"ceremonial\" duties, like giving weekly addresses to the public or opening big sporting and cultural events. American children are taught to learn and care about the presidents, and most presidents are far more famous than any member of Congress or Supreme Court justice.",
          },
          {
            type: "text",
            content:
              "This popularity even extends to the president's female partner, who is called the \"First Lady.\" While not a government job, a first lady, usually the president's wife, helps with hosting events, goes with the president to foreign countries, and sponsors her own minor initiatives, like child literacy or recycling.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Some famous First Ladies' initiatives in history",
                url: "https://www.gilderlehrman.org/history-resources/essays/first-ladies%E2%80%99-contributions-political-issues-and-national-welfare",
              },
            ],
          },
        ],
      },

      // ── Page 11: What does the Vice President do? ────────────────────────────
      {
        id: "what-does-the-vice-president-do",
        icon: require("../../assets/education_icons/executiveicon11.png"),
        title: "What does the Vice President do?",
        summary: "The VP's limited formal powers and critical role in succession.",
        body: [
          {
            type: "text",
            content:
              "The Vice President has almost no enumerated powers (meaning powers given to him or her by the Constitution). All that it says is that the Vice President is elected alongside the President and serves as president of the Senate. In this job, he or she can cast a vote, but only if the Senate is exactly tied.",
          },
          {
            type: "text",
            content:
              "However, the Vice President can exercise great power and influence as the President's chief adviser. This is because the two work together both while campaigning and in the Cabinet. This can help even out the President's ideas, as the Vice President usually comes from a different part of the country, and may even come from a different wing of the political party, so that more voters would elect the two together.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/executive11.png"),
            caption:
              "In 2008, Barack Obama (left), a liberal, inexperienced Senator from Illinois, and Joe Biden (right), a more centrist, long-time Senator from Delaware, were rivals for the Democratic presidential nomination. When Mr. Obama won, he chose Mr. Biden to be his vice president, and the two developed a famously close bond over eight years in government. Even though Mr. Biden never once cast a tie-breaking vote in Congress, he influenced Mr. Obama and helped get the bills they wanted passed.",
          },
          {
            type: "text",
            content:
              "Additionally, the President sometimes deputizes the Vice President to perform diplomatic or ceremonial duties, or to influence members of the Senate in a way that the President cannot.",
          },
          {
            type: "text",
            heading: "Succession",
            content:
              "Because the Vice President is often a high-level politician, and perhaps even a former rival for the nomination, six vice presidents have gone on to be elected president. But also, if the President dies or resigns in office (throughout history, nine have), the Vice President immediately becomes president to serve out the rest of the term. This is called succession.",
          },
          {
            type: "text",
            content:
              "If the Vice President also could not serve, next in line would be the leaders of the House and Senate, and then Cabinet secretaries. But it has never been necessary to go down further than vice president.\n\nAdditionally, if the President is momentarily disabled, such as during a surgery with anesthetic, the Vice President may be designated acting president.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "See a list of previous vice presidents",
                url: "https://www.britannica.com/topic/vice-president-of-the-United-States-of-America",
              },
              {
                label: "See the full order of presidential succession",
                url: "https://www.usa.gov/presidential-succession",
              },
              {
                label: "Official X (formerly Twitter) account of Vice President Vance",
                url: "https://x.com/VP",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // POLITICAL PARTIES & IDEOLOGY
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "political-parties-ideology",
    title: "Political Parties & Ideology",
    subtitle: "Party history, the spectrum, independents, and third parties.",
    icon: require("../../assets/education_icons/political_parties.png"),
    subtopics: [
      // ── Page 1: How can I learn more? ────────────────────────────────────
      {
        id: "how-can-i-learn-more",
        icon: require("../../assets/education_icons/partiesicon1.png"),
        title: "How can I learn more?",
        summary:
          "Where to find official party information, platforms, and registration data.",
        body: [
          {
            type: "text",
            content:
              "All official parties in the United States are registered with a body called the Federal Elections Commission. By searching on fec.gov, you can see who leads political parties at the national, state, and local level, as well as who gives them money and how much.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties1.png"),
            transparent: true,
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties2.png"),
            caption:
              "The two main political parties use colors and icons to tell each other apart in advertising. The Democratic color is blue and its icon is a D, or a donkey. The Republican color is red and its icon is an R, or an elephant. The Republican Party is also called the Grand Old Party, or the G.O.P.",
            transparent: true,
          },
          {
            type: "text",
            content:
              "Additionally, most political parties write a lot of information about themselves on their website and social media. For example, every county, state, and national party organization has their own constitution, which explains how they are organized. And before a big election, the national political parties will publish a platform, also called a manifesto, which outlines what they will do if they get into office.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties3.png"),
            caption:
              "An excerpt from the 2024 Democratic Party platform on housing policy.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties4.png"),
            caption:
              "In their platforms, parties say how they will respond to a problem. You can compare the platforms for similarities and differences. For example, in response to the high cost of housing, the Democratic Party (top) promised in 2024 to regulate landlords and fund down payments, while the Republican Party (bottom) focused on lowering inflation and giving builders more land. However, both parties promised to cut regulations and create tax breaks for new homebuyers.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Directory of active political parties",
                url: "https://politics1.com/parties.htm",
              },
              {
                label:
                  "Historical platforms of all major political parties from 1840 to 2024",
                url: "https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/party-platforms-and-nominating-conventions-3",
              },
            ],
          },
        ],
      },

      // ── Page 3: Why do politicians join parties? ──────────────────────────
      {
        id: "why-do-politicians-join-parties",
        icon: require("../../assets/education_icons/partiesicon2.png"),
        title: "Why do politicians join parties?",
        summary:
          "The advantages of party membership for candidates, and what it means to run as an independent.",
        body: [
          {
            type: "text",
            content:
              "There are several reasons why a politician will choose to join a political party. Political parties offer help to candidates running for office, including advice, funding, and advertisements on their behalf. And voters will have an easier time learning what a little-known candidate stands for if he or she is identified with a political party. This is because there are many similarities between the national party manifesto and the individual promises that candidates belonging to the party will make.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties5.png"),
            caption:
              "Party leaders will often publicly support party candidates who are running for lesser office. For example, in this social media post, President Donald Trump endorsed Indiana representative Erin Houchin for re-election, saying she has helped advance Republican Party objectives in government.",
          },
          {
            type: "text",
            content:
              'Alternatively, a candidate running for office without the support of either the Democratic or the Republican Party (as an "independent") might be saying he or she disapproves of the way both parties operate or of the views they hold. Depending on how voters feel about both major parties, this can help or hurt the candidate.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Directory of active political parties",
                url: "https://politics1.com/parties.htm",
              },
              {
                label:
                  "Historical platforms of all major political parties from 1840 to 2024",
                url: "https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/party-platforms-and-nominating-conventions-3",
              },
            ],
          },
        ],
      },

      // ── Page 4: What are America's "big two?" ─────────────────────────────
      {
        id: "whats-americas-big-two",
        icon: require("../../assets/education_icons/partiesicon3.png"),
        title: 'What are America\'s "big two?"',
        summary:
          "The two-party system, the Republican and Democratic parties, and what they stand for.",
        body: [
          {
            type: "text",
            content:
              'The United States has a "two-party system." This is because, with few exceptions, only two political parties ever win a national election. They are the Republican Party and the Democratic Party.',
          },
          {
            type: "callout",
            content:
              "For more than 170 years, no other party has ever won the most seats in either house of Congress or elected one of their members to the presidency.",
          },
          {
            type: "text",
            content:
              'The Republican Party is the current party of government. In the 2024 elections for Congress, politicians with the Republican Party won a majority of seats in both the House of Representatives and the Senate. The current President, Vice President, and Cabinet are also all Republicans.\n\nLike Canada, Australia, and most of Europe, journalists say the United States has one big party on the "right wing" — the Republicans — and one big party on the "left wing" — the Democrats. People and politicians whose opinions lie somewhere in the middle are said to be "centrists."\n\nGenerally, the Republicans are conservatives. They want to limit the power of the federal government and maintain the social order. They are likely to support lower taxes, fewer regulations, a strong military, limited immigration, and to preserve the traditional understandings of sex and gender. Famous Republican presidents include Abraham Lincoln (1861–1865), Ronald Reagan (1981–1989), George W. Bush (2001–2009), and Donald Trump (2017–2021, 2025–present). The Republican Party is more popular among older people, white people, men, and people who live outside of cities.\n\nGenerally, the Democrats are liberal. They want a stronger federal government that can pass social reforms. They are likely to support higher taxes in exchange for broadening welfare programs such as Medicare and university student aid. They might also be more supportive of gay rights, immigration, and cooperation with other countries. Famous Democratic presidents include Woodrow Wilson (1913–1921), Franklin D. Roosevelt (1933–1945), Bill Clinton (1993–2001), Barack Obama (2009–2017), and Joe Biden (2021–2025). The Democratic Party is more popular among younger people, non-white people, women, and people who live in cities.',
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties7.png"),
            caption:
              "Throughout U.S. history, the two major parties have stood for very different things. For example, Lyndon Johnson (1963–1969), a Democrat, passed the Civil Rights Act of 1964, which banned discrimination based on race, sex, or religion.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties6.png"),
            caption:
              "By contrast, Andrew Jackson (1829–1837), the first Democratic president, pursued policies that many historians consider deeply racist, including the forced removal of Native American tribes from their lands.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Website of the Republican Party",
                url: "https://gop.com/",
              },
              {
                label: "Website of the Democratic Party",
                url: "https://democrats.org/",
              },
            ],
          },
        ],
      },

      // ── Page 5: What are the other parties? ───────────────────────────────
      {
        id: "what-are-the-other-parties",
        icon: require("../../assets/education_icons/partiesicon4.png"),
        title: "What are the other parties?",
        summary: "Minor parties, ballot-access challenges, and local parties.",
        body: [
          {
            type: "text",
            content:
              'Fewer than 1% of American voters are members of a party other than the Democratic or Republican parties. They can sometimes get a large number of votes, especially in local elections. Nationally, there is the Libertarian Party, whose color is yellow, which believes the government should do much less than it does today by ending many social programs and regulations. There is also the Green Party, which believes the government should do much more to stop climate change and also substantially reduce the size of the army.\n\nMinor parties and independents have a hard time getting their candidates to go on the ballot that voters get on election day. In elections to Congress or the presidency, almost all minor candidates fail to meet the strict "ballot-access requirements."',
          },
          {
            type: "callout",
            content:
              "If a candidate's name does not show up on the ballot, it is much less likely that he or she will win.",
          },
          {
            type: "text",
            content:
              "For this reason, some places have their own parties that fight only local elections. Their members usually vote for either the Democrats or Republicans in national elections. These include the Working Families Party, which mainly exists in Connecticut and New York City, and the Vermont Progressive Party.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Directory of active political parties",
                url: "https://politics1.com/parties.htm",
              },
            ],
          },
        ],
      },

      // ── Page 5: Primaries and caucuses ───────────────────────────────────
      {
        id: "primaries-and-caucuses",
        icon: require("../../assets/education_icons/partiesicon5.png"),
        title: "Primaries and caucuses",
        summary:
          "How parties choose their official candidates before the general election.",
        body: [
          {
            type: "text",
            content:
              'Primary elections work just like the general election, with legal polling stations and ballots. That means that you must be aged eighteen or older and an American citizen to vote in a primary election. However, some states also say you must be a registered member of a political party in order to vote in its primary. These are called "closed primaries." Some states have "open primaries," meaning you can vote for the nominee of any party you like, even if you belong to a different party, or to none at all.\n\nSome parties in a few less-populated states use caucuses instead of primaries to choose their official candidate. Instead of casting their ballot, party members raise their hand, and whoever gets the most votes becomes the nominee.',
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties8.png"),
            caption:
              "This diagram shows how primary elections lead to the general election in a typical congressional district (Iowa's 1st). The Republican primary was between two candidates, while Mrs. Bohannan ran unopposed for the Democratic nominee. In Iowa, like in many other places, candidates want to be the official nominee of either the Republican or Democratic parties, instead of running as an independent or for a minor party, because then the state will guarantee that he or she will show up on the general election ballot.",
          },
          {
            type: "text",
            content:
              "The most famous set of primaries take place every four years, when each party chooses who will be their official candidate for president. The Republican, Democratic, and some smaller parties hold primaries or caucuses across the whole country. The overall winner then becomes the party's nominee for President, and he or she names someone to be the party's nominee for Vice President.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Primary election types in each state",
                url: "https://www.ncsl.org/elections-and-campaigns/state-primary-election-types",
              },
            ],
          },
        ],
      },

      // ── Page 8: Majority governments ──────────────────────────────────────
      {
        id: "majority-governments",
        icon: require("../../assets/education_icons/partiesicon6.png"),
        title: "Majority governments",
        summary:
          "What majority control of Congress means and how supermajorities work.",
        body: [
          {
            type: "text",
            content:
              'The Constitution does not say political parties have to exist. Instead, the present party system naturally emerged because it is an efficient way to get people with similar ideas to vote the same way.\n\nAlmost all politicians in Congress belong to either the Republican or the Democratic party. Sometimes, voters will elect an independent congressperson, but he or she will always work with one of the two main parties (this cooperation is called caucusing). For this reason, we speak of one party or another having "majority control" of Congress, or simply a "majority," while the other party is in the minority.\n\nThe House of Representatives has an odd number of seats (435).',
          },
          {
            type: "callout",
            content:
              'Therefore, if there are 218 or more representatives belonging to one party, that party has a "majority."',
          },
          {
            type: "text",
            content:
              "Because the leader of the House (called the Speaker) is elected by House members, and members of one party will usually vote for one of their own as Speaker, this means that the party that has the majority in the House can also elect its leader.\n\nThe Senate has 100 seats. However, the Vice President (who also always belongs to a political party) can vote in case of a tie.",
          },
          {
            type: "callout",
            content:
              "Therefore, for a majority in that chamber, one party needs either 50 or 51 senators.",
          },
          {
            type: "text",
            content:
              "Of course, the Senate does not elect its leader (the Vice President), but it does elect the people who serve when the Vice President is out of Congress. Therefore, the majority party in the Senate elects that chamber's leader, too.\n\nThere is also a so-called supermajority. In the House, this means two-thirds or more (290+) of the representatives belong to one party. In the Senate, this means three-fifths or more (60+) of the senators. A party with this much control could pass bills much easier. Supermajorities are common in some state legislatures but almost never happen in the federal Congress.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "The history of majority and minority governments",
                url: "https://history.house.gov/Institution/Presidents-Coinciding/Party-Government/",
              },
            ],
          },
        ],
      },

      // ── Page 9: Why do we care about majorities? ──────────────────────────
      {
        id: "why-do-we-care-about-majorities",
        icon: require("../../assets/education_icons/partiesicon7.png"),
        title: "Why do we care about majorities?",
        summary:
          "Party discipline, party leaders, whips, and congressional caucuses.",
        body: [
          {
            type: "text",
            content:
              "Majority control is important because members of Congress who belong to one party are generally expected to vote the same way as their fellow party members. This is called party unity or party discipline.\n\nTo preserve party unity, parties choose one member in each house of Congress to serve as their leader.",
          },
          {
            type: "callout",
            content:
              "The leader speaks on behalf of the whole party, and members are expected to vote as he or she says.",
          },
          {
            type: "text",
            content:
              'For this reason, the Majority and Minority Leaders of the House and Senate are some of the most important and famous members of Congress. Because their work is so important to passing laws, party leaders even get a higher salary than other congresspeople, just like the leaders of the House and Senate do.\n\nParties also choose one member in each house to be their "whip." The whips\' job is to help work behind the scenes to get individual members of Congress to vote as their leader wants them to.',
          },
          {
            type: "image",
            source: require("../../assets/education_images/parties9.png"),
            caption:
              "Kyrsten Sinema was a Senator from Arizona. She was elected as a Democrat in 2018, but held some conservative beliefs and voted with the Republicans on some bills. In 2022, she voluntarily left the Democrats and became an independent, but kept caucusing with the Democratic Party. She left Congress in 2025.",
          },
          {
            type: "text",
            content:
              "In the U.S., party discipline is weaker than it is in other countries. When one party has a very thin majority, just a few rebellious members can stop its bills going through. In general, however, there is party unity. Even when one party has a slim majority, it usually passes most of the bills it likes, and can stop bills it does not support from reaching the President. You can guess that if the President belongs to the same party as the majority in Congress (this is called a unified government, or a trifecta), laws will be passed much quicker than if the parties were different.",
          },
          {
            type: "callout",
            content:
              "Rarely, members of Congress and even the President can get expelled from their own party if they are too disagreeable, or they can quit by themselves.",
          },
          {
            type: "text",
            content:
              "Still, the two big parties allow for some difference in opinion. Within the House and Senate, there are groups called caucuses. These groups can be official or unofficial. They are made up of congresspeople who share similar views and hope to push the party in that direction. For example, the so-called House Liberty Caucus is made up of Republicans who want their party to be more libertarian. The Congressional Progressive Caucus is made up of Democrats in the House and Senate who want their party to be more liberal. And the Problem Solvers Caucus includes representatives from both parties who support working together in general.\n\nNonetheless, most caucuses are non-partisan (not specifically relating to party politics). In these groups, members of Congress from one or both parties meet to discuss passing bills about a topic that is important to them. The most notable of these caucuses include the Congressional Black Caucus and the Congressional Equality Caucus (this one focusing on LGBT issues).",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "List of official Congressional caucuses — Congressional Member Organizations (PDF)",
                url: "https://cha.house.gov/_cache/files/f/a/fac21955-3822-4870-8bc0-345c5eaf3c14/AAEFBDA8AA686059C7E72F741E3C11EA.119th-congress-cmo-list-1-.pdf",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // U.S. HISTORY FOUNDATIONS
  // ════════════════════════════════════════════════════════════════════════════
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
            content: "It also set the stage for later civil rights debates.",
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

  // ════════════════════════════════════════════════════════════════════════════
  // YOUR RIGHTS & CIVIC PARTICIPATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "rights-civic-participation",
    title: "Your Rights & Civic Participation",
    subtitle: "Voting, local government, advocacy, and how to get involved.",
    icon: require("../../assets/education_icons/your_rights.png"),
    subtopics: [
      // ── Page 1: Voter Registration ──────────────────────────────────────────
      {
        id: "voter-registration",
        icon: require("../../assets/education_icons/elections_voting.png"),
        title: "Voter registration",
        summary:
          "How to register, check your registration, and prepare to vote.",
        body: [
          {
            type: "text",
            content:
              "The bills and officials you track on Unum are shaped by elections.",
          },
          {
            type: "callout",
            content:
              "Almost every United States citizen aged eighteen or older has the right and the responsibility to vote.",
          },
          {
            type: "callout",
            content:
              "You can vote by mail, early, or on the day, so long as you are registered.",
          },
          {
            type: "links",
            heading: "Get started",
            items: [
              {
                label: "Check or update your registration",
                url: "https://vote.gov",
              },
              {
                label: "Register to vote",
                url: "https://vote.org/register-to-vote/",
              },
              {
                label: "Check registration deadlines by state",
                url: "https://vote.org/voter-registration-deadlines/",
              },
            ],
          },
          {
            type: "text",
            content:
              "Registration deadlines and rules vary by state, but the links above will walk you through everything based on where you live.\n\nMake sure you get your information about registering to vote from trustworthy sources, such as vote.gov, usa.gov/voting-and-elections, or the website of your state's board of elections.",
          },
          {
            type: "text",
            heading: "Before you vote",
            content:
              "Before you go to actually vote, you should know all of the following:\n\n1. How, when, and where to vote.\n\n2. What documents, if any, you need to bring to the polling booth.\n\n3. Who is up for election. Elections to Congress take place every two years. Presidential elections take place every four years. A ballot can include many races for different offices.\n\n4. How to mark a ballot. Before an election, you can find voter guides and example ballots online, and you can bring notes with you into the polling place.\n\n5. Who you want to vote for. The decision you make could impact the lives of yourself and millions of others.\n\n6. If you need any help. If you have problems with vision, if English is not your first language, or if you have any other concerns, call your local board of elections to see what assistance is available.",
          },
        ],
      },

      // ── Page 2: What Are My Rights? (moved from The Constitution) ─────────
      {
        id: "what-are-my-rights",
        icon: require("../../assets/education_icons/yourrights1.png"),
        title: "What are my rights?",
        summary:
          "The constitutional rights guaranteed to everyone in the United States.",
        body: [
          {
            type: "text",
            content:
              "The following are some of the constitutional rights guaranteed to everyone in the United States. Beside each right is the number of the amendment that established it.",
          },
          {
            type: "list",
            items: [
              "The right to free speech [1]",
              "The right to publish [1]",
              "The right to practice any religion, or no religion, as you like [1]",
              "The right to organize and participate in peaceful protest [1]",
              "The right to own a gun to defend yourself [2]",
              "The right not to have yourself or your property searched by police, unless a judge orders the police to do so [4]",
              "The right to a speedy and public trial by a fair jury [6]",
              "The right for your trial to be done properly and fairly (this is called due process) [5 & 14]",
              "The right to be treated fairly by the law, no matter who you are (equal protection under the law) [14]",
              "The right to vote, regardless of race [15] or sex [19]",
            ],
          },
          {
            type: "image",
            source: require("../../assets/education_images/constitution2.png"),
            caption:
              "Until the 1860s, many states did not have laws that banned slavery. As a result, millions of African-Americans were treated like property and forced to work for no pay. The 13th Amendment, passed after the U.S. Civil War (1861–65), made this kind of forced unpaid labor illegal everywhere in the United States, except for prisons.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label:
                  "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label:
                  "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },

      // ── Page 2: Why Should I Care? (moved from The Constitution) ─────────
      {
        id: "why-care-constitution",
        icon: require("../../assets/education_icons/yourrights2.png"),
        title: "Why should I care?",
        summary:
          "Why understanding the Constitution matters for everyday life.",
        body: [
          {
            type: "text",
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
                label:
                  "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
              },
              {
                label:
                  "See an annotated version (with notes) of the Constitution and all its amendments (PDF)",
                url: "https://www.govinfo.gov/content/pkg/CDOC-110hdoc50/pdf/CDOC-110hdoc50.pdf",
              },
              {
                label: "Learn more about the Constitution",
                url: "https://constitutioncenter.org/the-constitution",
              },
              {
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
          },
        ],
      },

      // ── Page 3: Why should I care about political parties? (moved from Parties) ─
      {
        id: "why-should-i-care-about-political-parties",
        icon: require("../../assets/education_icons/yourrights3.png"),
        title: "Why should I care about political parties?",
        summary:
          "Why understanding political parties helps you follow politics, elections, and lawmaking.",
        body: [
          {
            type: "text",
            content:
              'A political party (often shortened to "party") is an organization with a name, label, and set of beliefs. Almost all politicians in the U.S. belong to a political party, as do about 70% of voters. Understanding the major political parties helps you to know what politicians believe in.\n\nAdditionally, because parties are also organizations, they help select candidates, raise money, and run advertisements. Knowing how parties operate means you know more about the process of elections.\n\nFinally, the way Congress works basically forces members to organize into groups. Therefore, understanding how political parties interact will help you know how laws get passed.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Directory of active political parties",
                url: "https://politics1.com/parties.htm",
              },
              {
                label:
                  "Historical platforms of all major political parties from 1840 to 2024",
                url: "https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/party-platforms-and-nominating-conventions-3",
              },
            ],
          },
        ],
      },

      // ── Page 4: Joining a party (moved from Parties) ─────────────────────
      {
        id: "joining-a-party",
        icon: require("../../assets/education_icons/yourrights4.png"),
        title: "Joining a party",
        summary:
          "How to register with a party and what membership means for voting.",
        body: [
          {
            type: "text",
            content:
              'In some states, you can register to join a political party when you register to vote. This is free. You can also donate, volunteer, and work with political parties as you like.\n\nThese decisions are completely optional. You can always vote for whomever you like, whether you do or do not belong to a political party. For example, if you registered as a member of the Republican Party, but you like the Democratic candidate for senator, you can vote for her instead of the Republican candidate.\n\nHowever, if you join a political party, you get a small say in how it is run. During some elections, like those for governor, Congress, and president, there will be many candidates who all want to call themselves the "official nominee" of the party to run against the official nominees from the other parties. To decide who this person should be, political parties hold primary elections a few months before the general election (that is, the one with all candidates from all political parties).',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Joining a political party",
                url: "https://www.usa.gov/change-voter-registration",
              },
            ],
          },
        ],
      },

      // ── Page 5: How to Contact Your Representative ───────────────────────
      {
        id: "how-to-contact-your-representative",
        icon: require("../../assets/education_icons/yourrights5.png"),
        title: "How to contact your Representative",
        summary:
          "How to make your voice heard directly with your elected officials.",
        body: [
          {
            type: "text",
            content:
              "Contacting your representatives is one of the most direct ways to make your voice heard — and congressional offices do track constituent contacts on legislation.",
          },
          {
            type: "text",
            heading: "Phone calls",
            content:
              "Phone calls are the most effective. Call the Capitol Switchboard (202-224-3121) and ask to be connected to your senator's or representative's office. Staff members who answer are specifically tasked with logging constituent opinions.",
          },
          {
            type: "text",
            heading: "Letters and emails",
            content:
              "Written letters and emails carry more weight than form messages. A short, specific note explaining how a bill affects you personally is more effective than a templated petition.",
          },
          {
            type: "text",
            heading: "Town halls",
            content:
              "Town halls are held periodically when members are in their home districts (especially during congressional recesses). These are opportunities to ask questions directly.",
          },
          {
            type: "text",
            heading: "Using Unum",
            content:
              "In Unum, you can tap the website or contact button on any official's profile page to go directly to their official contact page. Some offices also list upcoming town hall events there.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Find your representative",
                url: "https://www.house.gov/representatives/find-your-representative",
              },
              {
                label: "Find your senators",
                url: "https://www.senate.gov/senators/senators-contact.htm",
              },
            ],
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
