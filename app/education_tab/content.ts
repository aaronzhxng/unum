import { resolveImage, resolveSubtopicIcon, resolveTopicIcon } from "./content-assets";

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

// ── Hardcoded fallback content (used when a topic has no .md files yet) ─────
const hardcodedTopics: EducationTopic[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // MIDTERMS 2026
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "midterms-2026",
    title: "Midterms 2026",
    subtitle: "What happened on Election Day, and what comes next for Congress.",
    icon: require("../../assets/education_icons/midtermsicon.png"),
    subtopics: [
      {
        id: "what-happened-on-election-day-2026",
        icon: require("../../assets/education_icons/midterms1icon.png"),
        title: "What happened on Election Day 2026?",
        summary: "The results of the November 3 midterms, and when the new Congress takes office.",
        body: [
          {
            type: "text",
            content: "Every two years, the whole U.S. holds elections at the same time in order to re-elect the whole [[House of Representatives]] and one-third of the [[Senate]]. When the president is also up for election, this event is called a “general election.” But because the president serves for a term of four years, the congressional elections in between are called “midterm elections.” So, the U.S. held midterm elections on November 3, 2026.\n\nThe most important news was that many candidates belonging to the Democratic Party were elected over [[Republicans|republican-party]]. While we will not know exactly how many members of [[Congress]] belong to each party for some weeks, because in multiple places the votes were so close that they need to be recounted or a second election held in that area, it was clear early on election night that the Democrats will hold a majority in both the Senate and the House. This means many areas were “flipped,” as they last voted for Republican candidates but this time voted for Democrats.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms1.jpg"),
            caption: "Even after Election Night, surprises came in. On November 3, the difference between Mississippi Senator Cindy Hyde-Smith, a Republican running for re-election, and Democrat Scott Colom, was only 900 votes. It took another week for Mr. Colom (above) to be projected the winner by a majority of only 4,000 out of one million votes. Mr. Colom will be the first Democrat senator for Mississippi since 1982.\n\nCredit: District Attorney’s Office, Sixteenth District Court of Mississippi.",
          },
          {
            type: "text",
            content: "This does not mean the federal government is any different yet. The [[Constitution]], as changed by the 20th Amendment (1933), says that the term for new members of Congress begins on January 3 after the election. This means that an app like Unum, which reflects what the government looks like right now, will stay like it is until January 3.",
          },
          {
            type: "callout",
            heading: "As of November 12, 2026",
            content: "There is a Republican majority of five representatives and six senators. However, [[Vice President]] J.D. Vance, a Republican, serves as President of the Senate and can vote to break a tie.",
          },
          {
            type: "text",
            content: "On that date, or before, you should check if your members of Congress remain the same, and if they are different, whether or not they belong to the same party. This could directly affect what bills they introduce, what laws they support, and which organizations they work with in your local area and nationwide.\n\nAdditionally, your state and local representatives might have changed. 36 states and three territories also elected their governor. Many states also voted for judges or amendments to their constitution (called ballot measures, or referenda). Although these officials are not the focus of Unum, you should still check reputable news sources to see who will serve in these positions, what they stand for, and what you may expect to see change or stay the same.",
          },
          {
            type: "links",
            heading: "Check the results",
            items: [{"label": "Who your next representative, senator, and governor will be, as verified by the Associated Press", "url": "https://apnews.com/projects/elections-2026/"}, {"label": "All results, including ballot measures and state officials (MultiState)", "url": "https://www.multistate.us/elections/"}],
          },
          {
            type: "text",
            content: "For smaller races, including city council, mayor, or minor budget measures, check the website of your local newspaper of record.",
          },
        ],
      },
      {
        id: "congress-before-january-3",
        icon: require("../../assets/education_icons/midterms2icon.png"),
        title: "What will happen in Congress before January 3?",
        summary: "The lame-duck period, and why many laws pass before a new Congress begins.",
        body: [
          {
            type: "text",
            content: "Probably a lot. There is over a month left of the current Congress (the 119th), which has a Republican majority. In this time, funding for federal agencies, for farmers, and for the military must be agreed on. Because President Donald Trump is also a Republican, this means there will continue to be a unified government. Usually, more laws get passed during a unified government than a divided government. This is because the party leaders in the House and Senate need to work together and with the President to make sure laws get passed.",
          },
          {
            type: "text",
            content: "Because the President and Congress anticipate that their working relationship will soon change, a lot of laws get passed during the period between an election and the new congressional term (called the “lame-duck period”). For example, after the 2024 elections, the Presidency and Senate majority were going to change from Democratic to Republican. So, 61 percent of the public laws passed by the 118th Congress were pushed through during that lame-duck period before January 2025. Does this mean bills will be passed about Medicare, highway construction, and permitting reform? Keep following Unum so you don’t miss a thing!",
          },
        ],
      },
      {
        id: "what-a-democratic-majority-means",
        icon: require("../../assets/education_icons/midterms3icon.png"),
        title: "What will a Democratic majority in Congress mean?",
        summary: "Three possible outcomes of a Democratic Congress and a Republican President.",
        body: [
          {
            type: "text",
            content: "This is a difficult question to answer. However, here are three possible outcomes. Please remember that Unum is not a news app and does not identify with either party.",
          },
          {
            type: "text",
            heading: "1. More laws might be stalled.",
            content: "Both Congress and the President need to agree for [[a bill to become a law|bill]]. If the President chooses to veto a bill, at least two-thirds of each house of Congress needs to vote to override the veto and pass it anyway. Additionally, the Senate has a rule called the [[filibuster]]. With this rule, any one senator can delay passing a law indefinitely unless 60 others vote to continue. The Democratic majority in Congress is not big enough to pass a law if the President and Republicans unite against it.\n\nAdditionally, the United States does not have complete [[party discipline]]. Some members of Congress are very conservative or liberal compared with others in their own party. Some newly elected Democrats are even socialist. If even a few members challenge the party leadership or major bills, the party’s majority could effectively shrink.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms2.jpg"),
            caption: "In 2021, the Democrats controlled 50 seats of the Senate. However, Sen. Joe Manchin (WV; left) felt an economic reform bill increased the debt by too much, even though the party leadership as well as President Joe Biden (right) supported it. He voted with the Republicans to block it. It took a lot of negotiation with Mr. Manchin to get him to support a smaller bill, the Inflation Reduction Act, which passed in 2022.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms3.png"),
            caption: "Many more new members of Congress will be serving for the first time than in previous years. The new majority and minority [[leaders|party-leaders]] will have to figure out what all their new members stand for in order to keep them loyal.",
          },
          {
            type: "text",
            heading: "2. Congress might be presented with different kinds of bills.",
            content: "The majority party effectively decides how Congress debates. After bills are presented, they go to a committee for review and amendment. If a committee does not like a bill, it can let it “die,” meaning it will never be debated in the whole house. Most members of each committee, including its chair, belong to the majority party.\n\nAdditionally, the party leaders—the Speaker of the House of Representatives, and the Majority Leader in the Senate—have an important role in deciding what bills are discussed, and in what order. They could even let a bill skip the committee stage altogether. All this means a bill that is unpopular with Democratic party leadership may not pass through committee, or be seriously debated. But a bill the leadership considers very important could be hurried through for a floor vote.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms4.png"),
            caption: "A major priority shared by the President and the Republican leaders was to pass immigration reform as soon as possible. As soon as the 119th Congress met on January 3, the Laken Riley Act was referred to the House Committee on the Judiciary. The committee quickly approved it. Then, the House leadership specified the bill would need only one hour’s debate before a vote. Therefore, the whole bill passed the House in just four days.",
          },
          {
            type: "text",
            content: "Most likely, the new Congress’s majority leaders will be the current minority leaders. This means Rep. Hakeem Jeffries (NY-8) will be the next Speaker of the House of Representatives, and Sen. Chuck Schumer (NY) will be the next Senate Majority Leader. However, going back to the earlier point about internal party divisions, it is possible that a few members who think Mr. Jeffries and Mr. Schumer are not liberal enough will try to block their election. This could block laws from passing for a while and change the dynamic in Congress directly.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms5.jpg"),
            caption: "In January 2023, Republican representatives who believed their party leader, Kevin McCarthy, was not conservative enough, blocked him from being elected Speaker of the House. Mr. McCarthy had to try very hard to gain their support. And after he was finally elected, just nine months later, the conservatives again joined together to force him out.",
          },
          {
            type: "text",
            heading: "3. The President might get more assertive, raising tensions.",
            content: "If the Democratic Congress keeps passing bills that the Republican President disagrees with, it is likely that he will use more vetoes to prevent them from becoming laws. As head of the Executive Branch, the President could also use executive orders to direct Cabinet secretaries and civil servants to execute laws in more narrow or wide-ranging ways than Congress may have intended.\n\nOf course, presidents have a number of powers that Congress cannot touch, including over foreign affairs and pardons. However, we do not know how far many powers extend. The past few years have seen debate emerge over the President’s ability to fire senior bureaucrats, bomb foreign countries, and introduce tariffs (taxes on trade) without Congressional approval. If this tension continues, the [[Supreme Court]] could get busy clarifying more details about the balance of power between the Executive and Legislature.\n\nIn response, it is very likely a Democratic-controlled Congress would exercise its [[oversight powers]] more aggressively by investigating the Executive, demanding reports be published, and holding public hearings. The Senate may additionally block the President’s appointments to major posts—like Supreme Court justice, Cabinet secretary, general, and ambassador—or refuse to ratify a treaty that the Executive negotiated. Finally, it remains possible that the President, Vice President, another member of the Cabinet, or another federal official, could be [[impeached]] by the House and removed from office by the Senate.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/midterms6.jpg"),
            caption: "In 2021, President Joe Biden appointed Alejandro Mayorkas to be Secretary of Homeland Security, which includes border control. Republicans thought he would be too weak on immigration and tried to block his confirmation. In 2023, the Republican-majority House impeached Mr. Mayorkas for apparently failing to enforce immigration laws properly. The Democratic-majority Senate, however, voted against removing him from office.",
          },
        ],
      },
    ],
  },

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

      // ── Page 3: What Is the Basis for American Law? ──────────────────────
      {
        id: "basis-for-american-law",
        icon: require("../../assets/education_icons/govworksicon3.png"),
        title: "What is the basis for American law?",
        summary: "The Constitution, democracy, and the three branches as a tree.",
        body: [
          {
            type: "text",
            heading: "The Constitution",
            content:
              'The basic law of the United States is called the Constitution. It sets out what the U.S. government should essentially look like, and protects certain rights and freedoms for all people in the United States, like the right to criticize the government and the freedom to practice any or no religion. No law or Executive Order, however important, can go against what the Constitution says.',
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
              'A diagram of the three branches of the U.S. federal government. The Constitution and its amendments act as the roots of the tree, providing the foundation for all three branches.',
          },
          {
            type: "text",
            content:
              'A popular way to understand the federal government is to view it like a tree. This tree has three branches: the Executive, the Legislative, and the Judicial (legal).',
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
      // ── Page 1: What is the Constitution? ──────────────────────────────────
      {
        id: "what-is-the-constitution",
        icon: require("../../assets/education_icons/constitutionicon1.png"),
        title: "What is the Constitution?",
        summary: "The rules the government must follow and how the federal government is structured.",
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
<<<<<<< HEAD
                label: "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
=======
                label:
                  "See the full text of the Constitution and all its amendments",
                url: "https://www.archives.gov/founding-docs/constitution-transcript",
>>>>>>> origin/master
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
<<<<<<< HEAD
                label: "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
=======
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://www.oyez.org/cases",
>>>>>>> origin/master
              },
              {
                label: "Learn about important rights that all Americans have (PDF)",
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
<<<<<<< HEAD
                label: "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
=======
                label:
                  "See the full text of the Constitution and all its amendments",
                url: "https://www.archives.gov/founding-docs/constitution-transcript",
>>>>>>> origin/master
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
<<<<<<< HEAD
                label: "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
=======
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://www.oyez.org/cases",
>>>>>>> origin/master
              },
              {
                label: "Learn about important rights that all Americans have (PDF)",
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
        summary: "How the Supreme Court interprets the Constitution's language.",
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
<<<<<<< HEAD
                label: "See the full text of the Constitution and all its amendments (PDF)",
                url: "https://constitution.congress.gov/constitution/",
=======
                label:
                  "See the full text of the Constitution and all its amendments",
                url: "https://www.archives.gov/founding-docs/constitution-transcript",
>>>>>>> origin/master
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
<<<<<<< HEAD
                label: "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://constitution.congress.gov/",
=======
                label:
                  "Learn about how the Supreme Court has understood the Constitution throughout history",
                url: "https://www.oyez.org/cases",
>>>>>>> origin/master
              },
              {
                label: "Learn about important rights that all Americans have (PDF)",
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
    subtitle: "Districts, redistricting, leadership, and the House's special powers.",
    icon: require("../../assets/education_icons/house.png"),
    subtopics: [
      // ── Page 1: How Does the House Look? ───────────────────────────────────
      {
        id: "how-does-the-house-look",
        icon: require("../../assets/education_icons/houseicon1.png"),
        title: "How does the House look?",
        summary: "How representation is distributed across states by population.",
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
              "Because of the mathematics involved in making sure each state has at least one representative, some states are statistically overrepresented compared to others. For example, at the 2020 census, Delaware had just fewer than 1 million residents, while Montana had just over 1 million. However, Montana now has two representatives — so, about one per 500,000 people — while Delaware still has just one. The average U.S. House District includes between 750,000 and 800,000 residents (\"constituents.\")",
          },
          {
            type: "text",
            content:
              "In addition to the 435 voting members, there are 6 representatives who cannot vote. These men and women represent the U.S.'s territories — Puerto Rico, Guam, the U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands — as well as Washington, D.C.",
          },
        ],
      },

      // ── Page 2: How Are Districts Redrawn? ─────────────────────────────────
      {
        id: "how-are-districts-redrawn",
        icon: require("../../assets/education_icons/houseicon2.png"),
        title: "How are districts redrawn?",
        summary: "Redistricting, gerrymandering, and how states draw congressional boundaries.",
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

      // ── Page 3: Who Can Become a Representative? ──────────────────────────
      {
        id: "who-can-become-a-representative",
        icon: require("../../assets/education_icons/houseicon3.png"),
        title: "Who can become a representative?",
        summary: "The constitutional requirements to serve in the House of Representatives.",
        body: [
          {
            type: "text",
            content:
              "Between Congress and the Presidency, it is easiest to become a representative. One simply has to be at least 25 years of age, a resident of the state for which he or she is running, and a citizen for at least seven years. Of course, in reality, most representatives have prior connections in politics or society. They almost always belong to a political party and may be prominent lawyers, businesspeople, or activists.",
          },
        ],
      },

      // ── Page 4: How Are Districts Numbered? ────────────────────────────────
      {
        id: "how-are-districts-numbered",
        icon: require("../../assets/education_icons/houseicon4.png"),
        title: "How are districts numbered?",
        summary: "How representatives and their districts are labeled and identified.",
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
              'Representatives and their districts are often noted as XX-##, with their state\'s two-letter postal abbreviation being followed by their assigned district number. Therefore, in the above map, the district covering much of Arizona\'s border with Mexico would be labeled AZ-7, and its representative would be referred to as, for example, John Smith (AZ-7). The district\'s number is usually determined based on location or on what it has historically been called.',
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

      // ── Page 6: What Can the House Do? ────────────────────────────────────
      {
        id: "what-can-the-house-do",
        icon: require("../../assets/education_icons/houseicon6.png"),
        title: "What can the House do?",
        summary: "The House's special powers: tax bills, impeachment, and electoral contingencies.",
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
  // US SENATE
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "us-senate",
    title: "What is the Senate?",
    subtitle: "Senators, classes, leadership, special powers, and the filibuster.",
    icon: require("../../assets/education_icons/senate.png"),
    subtopics: [
      {
        id: "how-does-the-senate-look",
        icon: require("../../assets/education_icons/senateicon1.png"),
        title: "How does the Senate look?",
        summary: "Why the Senate exists and how its structure differs from the House.",
        body: [
          {
            type: "text",
            content:
              'The Senate is the upper of the two houses of Congress. It is smaller, with just one hundred members.',
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
      {
        id: "how-are-senators-classified",
        icon: require("../../assets/education_icons/senateicon3.png"),
        title: "How are senators classified?",
        summary: "Senate classes, staggered election cycles, and how senators are identified.",
        body: [
          {
            type: "text",
            content:
              'Senators are identified with the two-letter postal abbreviation of their state: so, it might be Mrs. Joan Smith (AK). When journalists need to differentiate between the two senators from the same state, the more recently elected person is called the junior senator, while the other is the senior senator.',
          },
          {
            type: "text",
            content:
              'Senators are also divided into "classes." This is because while senators\' terms last for six years, they were not all elected in the same year. In 2018, 33 Class I Senate seats went up for election. This means that in that November\'s election, people who lived in 33 states had to re-elect one of their two senators, or elect somebody new. However, those in the remaining states still kept both their senators. Then, in 2020, it was time to re-elect 33 Class II Senate seats. And in 2022, the remaining 34 Class III Senate seats went up for election.',
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
      {
        id: "senate-leadership",
        icon: require("../../assets/education_icons/senateicon4.png"),
        title: "Senate Leadership",
        summary: "The Vice President, President Pro-tempore, Majority and Minority Leaders, and Whips.",
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
      {
        id: "what-can-the-senate-do",
        icon: require("../../assets/education_icons/senateicon5.png"),
        title: "What can the Senate do?",
        summary: "Confirmations, treaties, removal of officials, and electoral contingency powers.",
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
      {
        id: "the-filibuster",
        icon: require("../../assets/education_icons/senateicon6.png"),
        title: "The Filibuster",
        summary: "How unlimited debate in the Senate can delay or block legislation.",
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
  // CONGRESS LEGISLATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "congress-legislation",
    title: "Responsibilities of Congress",
    subtitle: "How a bill becomes law, committees, floor votes, and more.",
    icon: require("../../assets/education_icons/congress.png"),
    subtopics: [
      {
        id: "what-does-congress-do",
        icon: require("../../assets/education_icons/congressicon1.png"),
        title: "What does Congress do?",
        summary: "The legislative role of Congress: passing laws, controlling spending, and checking the Executive.",
        body: [
          {
            type: "text",
            content:
              'Congress is the legislative branch of the U.S. government. In this capacity, Congress passes laws, controls spending, and checks the work of the Executive.\n\nThe most important job of Congress is legislating, or passing new laws.',
          },
          {
            type: "callout",
            content:
              "The Constitution allows Congress to pass laws on almost anything that affects multiple states or the entire country at once.",
          },
          {
            type: "text",
            content:
              "These include immigration, major taxes, declaring war and making peace, the national debt, international treaties, and trade with foreign countries.\n\nNew laws need to be made from time to time to keep them up to date. It could be that an old law needs to be updated, replaced, or repealed without replacement. There could also be a situation that requires entirely new laws.\n\nThe following sections will discuss how a law is passed in all its stages. In practice, however, Congress has many ways of skipping past a step, or taking a different approach: for example, by calling a \"voice vote\" instead of a \"roll-call vote.\" It is impossible to describe all of them here; however, Unum defines many of these actions when they have taken place for specific bills.",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "who-introduces-a-law",
        icon: require("../../assets/education_icons/congressicon2.png"),
        title: "Who introduces a law?",
        summary: "How bills are drafted, introduced, and assigned to committees.",
        body: [
          {
            type: "text",
            content:
              "A draft law is called a bill or a resolution: they are basically the same.\n\nAny member of Congress can introduce a bill: the first person to do so becomes its \"sponsor\", and those who follow are called \"co-sponsors\". Once it is introduced, the bill gets the letters H.R. or S (standing for House of Representatives or Senate), or H.J.Res. or S.J.Res. (if it is a joint resolution), followed by a number.\n\nThe bill is then referred to one or more committees with just a few special members of the House or the Senate, who will research and debate the details of the bill and make any necessary changes.",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "what-are-committees",
        icon: require("../../assets/education_icons/congressicon3.png"),
        title: "What are committees?",
        summary: "How congressional committees research, debate, and shape legislation.",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "what-happens-after-committee",
        icon: require("../../assets/education_icons/congressicon4.png"),
        title: "What happens after a committee approves a bill?",
        summary: "Floor debate, chamber votes, conference committee, and the presidential decision.",
        body: [
          {
            type: "text",
            content:
              "If the committee approves a bill, it returns to the chamber where it is debated, changed (\"amended\"), and voted on. You can watch debates live on the C-SPAN television channels or on the Internet. At least half of the chamber's members must vote in favor of the bill: usually, that means no fewer than 218 of 435 representatives, or 51 of 100 senators. If they do, the bill moves to the second chamber, where it goes through the same process again.\n\nAt the end, a conference committee is formed with members of both chambers to work out any differences that came up during the amendment process. Once their work is done, the bill goes to the President to sign or reject (\"veto\").",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "example-bills-becoming-law",
        icon: require("../../assets/education_icons/congressicon5.png"),
        title: "Example bills becoming law",
        summary: "A real example showing every stage a bill passes through on Congress.gov.",
        body: [
          {
            type: "text",
            content:
              "Let us see an example. You can track the progress of a bill using Unum or Congress.gov.",
          },
          { type: "image", source: require("../../assets/education_images/congress1.png") },
          { type: "image", source: require("../../assets/education_images/congress2.png") },
          {
            type: "text",
            content:
              'As you can see, on March 13, 2007, Democratic member of the House of Representatives James L. Oberstar (representing Minnesota\'s eighth congressional district) introduced the "Water Resources Development Act of 2007," numbered H.R. 1495. It was co-sponsored by three of Mr. Oberstar\'s colleagues: one Democrat and two Republicans.\n\nThe bill went through the House of Representatives\' Transportation and Infrastructure Committee who published a report. It then went through the Senate, and, finally, the conference committee, who also published a report. The bill was all set to be given to the President, George W. Bush.',
          },
          { type: "image", source: require("../../assets/education_images/congress3.png") },
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "using-unum-to-track-a-bill",
        icon: require("../../assets/education_icons/congressicon6.png"),
        title: "Using Unum to track a bill",
        summary: "A step-by-step walkthrough of tracking a real bill through Unum.",
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
              "Afterward, the House Committee on the Judiciary considered the bill for a few months. On November 18, the committee's chairman, Mr. Jim Jordan (R-OH4) took the bill out.",
          },
          {
            type: "image",
            source: require("../../assets/education_images/congress6.jpg"),
            caption:
              "The House debated the bill for forty minutes, and then voted for it, 427-1.",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "what-about-other-resolutions",
        icon: require("../../assets/education_icons/congressicon7.png"),
        title: "What about other resolutions?",
        summary: "Simple and concurrent resolutions that change how Congress operates but never become law.",
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
<<<<<<< HEAD
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
=======
                label:
                  "Introduction to the federal legislative process (U.S. House of Representatives)",
                url: "https://www.house.gov/the-house-explained/the-legislative-process",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "making-money",
        icon: require("../../assets/education_icons/congressicon8.png"),
        title: "Making money",
        summary: "How the federal government raises revenue through taxes and tariffs.",
        body: [
          {
            type: "text",
            content:
              "One of the most important responsibilities a government has is controlling how money is raised from the public (as \"income\") and where that money is spent (as \"expenditures\" or \"outlays\"). In a federal country like the United States, these powers are shared between the national government, the state government, and smaller local governments.\n\nThe federal government raises money in several ways. The largest part of government revenue comes from taxes on individual incomes. There are also taxes taken off an employee's payroll, taxes on company earnings, taxes on harmful goods like gasoline and tobacco, and taxes on items bought from other countries (these taxes are called tariffs). Tariffs are collected by the Customs and Border Protection agency, while taxes are managed by the Internal Revenue System (IRS). The Constitution says that all bills that relate to raising money must start in the House of Representatives.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Overview of federal tax policy (U.S. Department of the Treasury)",
                url: "https://home.treasury.gov/policy-issues/tax-policy",
>>>>>>> origin/master
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
      {
        id: "spending-money",
        icon: require("../../assets/education_icons/congressicon9.png"),
        title: "Spending money",
        summary: "Mandatory versus discretionary spending and how the federal budget is divided.",
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
              "However, there is never enough money for everything. The process of deciding how to spend money on the many different activities of government is tough and political. It happens as part of the yearly budget process.  About 60% of federal spending is considered mandatory, meaning that it must be spent because of an existing law. Social Security and Medicare, the government-provided healthcare program for older people, are the best-known categories. The remaining 40% is discretionary, which means Congress has to actively decide to spend it each year through the appropriations process. This category includes everything else, especially national security.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Overview of federal tax policy (U.S. Department of the Treasury)",
                url: "https://home.treasury.gov/policy-issues/tax-policy",
>>>>>>> origin/master
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
      {
        id: "how-budget-is-made",
        icon: require("../../assets/education_icons/congressicon10.png"),
        title: "How the budget is made",
        summary: "The annual budget process: President's proposal, budget resolution, and appropriations.",
        body: [
          {
            type: "text",
            content:
              'The annual budget process begins when the President sends a budget proposal to Congress. This proposal is not binding, but it sets the terms of the debate. Congress then passes a "budget resolution" that sets overall spending limits. Finally, Congress passes a series of appropriations bills that actually authorize the spending.\n\nIf Congress fails to pass a budget, the government can shut down, but temporary funding bills called "continuing resolutions" are often used to avoid this.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Overview of federal tax policy (U.S. Department of the Treasury)",
                url: "https://home.treasury.gov/policy-issues/tax-policy",
>>>>>>> origin/master
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
      {
        id: "what-if-theres-a-problem",
        icon: require("../../assets/education_icons/congressicon11.png"),
        title: "What if there's a problem?",
        summary: "How Congress investigates and oversees the Executive Branch.",
        body: [
          {
            type: "text",
            content:
              "Congress has the power to investigate any part of the Executive, subpoena witnesses, and hold them in contempt if they refuse to cooperate. They can also call in and cross-examine the head of any department or agency. This function is called congressional oversight.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Overview of federal tax policy (U.S. Department of the Treasury)",
                url: "https://home.treasury.gov/policy-issues/tax-policy",
>>>>>>> origin/master
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
      {
        id: "checking-work-of-executive",
        icon: require("../../assets/education_icons/congressicon12.png"),
        title: "Checking the work of the Executive",
        summary: "Congressional oversight, subpoenas, and holding the Executive accountable.",
        body: [
          {
            type: "text",
            content:
              "In addition to passing laws, Congress plays a crucial role in checking the work of the Executive Branch. This is done through hearings, investigations, and the power of the purse. Committees can subpoena documents and witness testimony. The Government Accountability Office (GAO) is Congress's investigative arm.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Types of congressional hearings (GovInfo Congressional Hearings collection)",
                url: "https://www.govinfo.gov/help/chrg",
>>>>>>> origin/master
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
      {
        id: "what-is-impeachment",
        icon: require("../../assets/education_icons/congressicon13.png"),
        title: "What is impeachment?",
        summary: "The process of impeaching and removing federal officials.",
        body: [
          {
            type: "text",
            content:
              "Impeachment is the process by which Congress can remove the President, Vice President, or other federal officials from office. The House votes to impeach (like an indictment), and the Senate holds a trial to decide whether to convict and remove. A two-thirds majority in the Senate is required for conviction.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of federal taxation (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/R48313",
=======
                label:
                  "Types of congressional hearings (GovInfo Congressional Hearings collection)",
                url: "https://www.govinfo.gov/help/chrg",
>>>>>>> origin/master
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
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ELECTIONS & VOTING
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "elections-voting",
    title: "Elections & Voting",
    subtitle: "Electoral College, primaries, and how elections work.",
    icon: require("../../assets/education_icons/elections_voting.png"),
    subtopics: [],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // US HISTORY FOUNDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "us-history-foundations",
    title: "U.S. History Foundations",
    subtitle: "Reconstruction, Civil Rights Era, and the foundations of modern America.",
    icon: require("../../assets/education_icons/us_history.png"),
    subtopics: [],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // US JUDICIAL SYSTEM
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "us-judicial-system",
    title: "The U.S. Judicial System",
    subtitle: "Courts, judges, the Supreme Court, and principles of U.S. law.",
    icon: require("../../assets/education_icons/judiciary.png"),
    subtopics: [
      {
        id: "basic-principles-of-us-law",
        icon: require("../../assets/education_icons/judiciaryicon1.png"),
        title: "What are the basic principles of U.S. law?",
        summary: "Due process, equal protection, and the rule of law.",
        body: [
          {
            type: "text",
            content:
              "The U.S. legal system is based on several key principles. Due process means the government must follow fair procedures before depriving anyone of life, liberty, or property. Equal protection means laws must apply equally to all people. The rule of law means that no one, not even the President, is above the law.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
<<<<<<< HEAD
                label: "Overview of the U.S. legal system",
                url: "https://www.uscourts.gov/about-federal-courts",
=======
                label: "Search all laws passed by Congress",
                url: "https://www.govinfo.gov/app/collection/plaw",
              },
              {
                label: "Search the U.S. Code",
                url: "https://www.govinfo.gov/app/collection/uscode",
              },
              {
                label: "Search the Code of Federal Regulations",
                url: "https://www.ecfr.gov/",
>>>>>>> origin/master
              },
            ],
          },
        ],
      },
      {
        id: "what-do-courts-look-like",
        icon: require("../../assets/education_icons/judiciaryicon2.png"),
        title: "What do U.S. courts look like?",
        summary: "The structure of the federal and state court systems.",
        body: [
          {
            type: "text",
            content:
              "The federal court system has three levels: district courts (trial), circuit courts of appeals, and the Supreme Court. State courts have their own separate systems, usually including trial courts, appellate courts, and a state supreme court.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Overview of the U.S. legal system",
                url: "https://www.uscourts.gov/about-federal-courts",
              },
            ],
          },
        ],
      },
      {
        id: "who-are-judges",
        icon: require("../../assets/education_icons/judiciaryicon3.png"),
        title: "Who are judges in the U.S.?",
        summary: "How federal judges are appointed and their role in the legal system.",
        body: [
          {
            type: "text",
            content:
              "Federal judges are nominated by the President and confirmed by the Senate. They serve lifetime appointments to ensure independence from political pressure. State judges may be elected or appointed depending on the state.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Overview of the U.S. legal system",
                url: "https://www.uscourts.gov/about-federal-courts",
              },
            ],
          },
        ],
      },
      {
        id: "what-is-the-supreme-court",
        icon: require("../../assets/education_icons/judiciaryicon4.png"),
        title: "What is the Supreme Court?",
        summary: "The highest court in the land and its power of judicial review.",
        body: [
          {
            type: "text",
            content:
              "The Supreme Court is the highest court in the United States. It has the power of judicial review — the ability to declare laws unconstitutional. The Court hears cases that have been appealed from lower courts, as well as a few types of cases that start at the Supreme Court.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Overview of the U.S. legal system",
                url: "https://www.uscourts.gov/about-federal-courts",
              },
            ],
          },
        ],
      },
      {
        id: "who-are-the-justices",
        icon: require("../../assets/education_icons/judiciaryicon5.png"),
        title: "Who are the justices on the Supreme Court?",
        summary: "The nine justices and their role in interpreting the Constitution.",
        body: [
          {
            type: "text",
            content:
              "The Supreme Court consists of nine justices: one Chief Justice and eight Associate Justices. They are nominated by the President and confirmed by the Senate. Once confirmed, they serve lifetime appointments.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Overview of the U.S. legal system",
                url: "https://www.uscourts.gov/about-federal-courts",
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // EXECUTIVE BRANCH
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "executive-branch",
    title: "The Executive Branch",
    subtitle: "The Presidency, bureaucracy, Cabinet, and executive power.",
    icon: require("../../assets/education_icons/executive.png"),
    subtopics: [
      {
        id: "what-is-the-executive-branch",
        icon: require("../../assets/education_icons/executiveicon1.png"),
        title: "What is the Executive Branch?",
        summary: "The role and structure of the Executive Branch.",
        body: [
          {
            type: "text",
            content:
              "The Executive Branch is responsible for enforcing and administering the laws passed by Congress. It is headed by the President, who is both the head of state and the head of government.",
          },
        ],
      },
      {
        id: "who-can-become-president",
        icon: require("../../assets/education_icons/executiveicon2.png"),
        title: "Who can become U.S. President?",
        summary: "The constitutional requirements to serve as President.",
        body: [
          {
            type: "text",
            content:
              "To become President, one must be a natural-born citizen, at least 35 years old, and a resident of the United States for at least 14 years.",
          },
        ],
      },
      {
        id: "how-is-president-elected",
        icon: require("../../assets/education_icons/executiveicon3.png"),
        title: "How is the U.S. President elected?",
        summary: "The Electoral College and the presidential election process.",
        body: [
          {
            type: "text",
            content:
              "The President is elected through the Electoral College. Each state gets a number of electors equal to its total number of senators and representatives. A candidate needs 270 electoral votes to win.",
          },
        ],
      },
      {
        id: "how-are-electors-chosen",
        icon: require("../../assets/education_icons/executiveicon4.png"),
        title: "How are electors chosen?",
        summary: "How states select their Electoral College electors.",
        body: [
          {
            type: "text",
            content:
              "Electors are chosen by each state's political parties. They are typically party loyalists, elected officials, or activists. In most states, the candidate who wins the popular vote gets all of that state's electoral votes.",
          },
        ],
      },
      {
        id: "what-can-the-president-do",
        icon: require("../../assets/education_icons/executiveicon5.png"),
        title: "What can the President do?",
        summary: "The President's constitutional powers and responsibilities.",
        body: [
          {
            type: "text",
            content:
              "The President has many powers: commanding the military, granting pardons, making treaties (with Senate approval), appointing federal officials, and issuing executive orders. The President also delivers the State of the Union address and can veto legislation.",
          },
        ],
      },
      {
        id: "how-does-president-influence-lawmaking",
        icon: require("../../assets/education_icons/executiveicon6.png"),
        title: "How does the President influence lawmaking?",
        summary: "Executive orders, vetoes, and the President's legislative agenda.",
        body: [
          {
            type: "text",
            content:
              "The President can influence lawmaking by proposing legislation, threatening vetoes, issuing executive orders, and using the bully pulpit to shape public opinion.",
          },
        ],
      },
      {
        id: "what-is-the-bureaucracy",
        icon: require("../../assets/education_icons/executiveicon7.png"),
        title: "What is the bureaucracy?",
        summary: "The federal agencies and departments that implement policies.",
        body: [
          {
            type: "text",
            content:
              "The federal bureaucracy consists of the departments, agencies, and commissions that implement and administer federal laws. It includes the Cabinet departments, independent agencies, and government corporations.",
          },
        ],
      },
      {
        id: "how-does-president-lead-bureaucracy",
        icon: require("../../assets/education_icons/executiveicon8.png"),
        title: "How does the President lead the bureaucracy?",
        summary: "Presidential control over federal agencies through appointments and executive orders.",
        body: [
          {
            type: "text",
            content:
              "The President leads the bureaucracy by appointing agency heads, issuing executive orders, and proposing budgets. However, many agencies have some independence from direct presidential control.",
          },
        ],
      },
      {
        id: "what-is-presidents-cabinet",
        icon: require("../../assets/education_icons/executiveicon9.png"),
        title: "What is the President's cabinet?",
        summary: "The Secretaries who advise the President and lead federal departments.",
        body: [
          {
            type: "text",
            content:
              "The Cabinet is composed of the Vice President and the heads of the 15 executive departments. These Secretaries are appointed by the President and confirmed by the Senate.",
          },
        ],
      },
      {
        id: "how-does-president-represent-country",
        icon: require("../../assets/education_icons/executiveicon10.png"),
        title: "How does the President represent the country?",
        summary: "The President's role as head of state and chief diplomat.",
        body: [
          {
            type: "text",
            content:
<<<<<<< HEAD
              "As head of state, the President represents the United States in foreign affairs, meets with foreign leaders, and serves as the face of the nation during crises and celebrations.",
=======
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
                url: "https://www.firstladies.org/home/first-ladies",
              },
            ],
>>>>>>> origin/master
          },
        ],
      },
      {
        id: "what-does-vice-president-do",
        icon: require("../../assets/education_icons/executiveicon11.png"),
        title: "What does the Vice President do?",
        summary: "The Vice President's constitutional and modern roles.",
        body: [
          {
            type: "text",
            content:
<<<<<<< HEAD
              "The Vice President's constitutional role is to preside over the Senate and cast tie-breaking votes. In modern times, the VP also advises the President and takes on specific policy portfolios.",
=======
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
                url: "https://www.senate.gov/senators/VicePresidents.htm",
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
>>>>>>> origin/master
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
    subtitle: "The two-party system, primaries, and why parties matter.",
    icon: require("../../assets/education_icons/political_parties.png"),
    subtopics: [
      {
        id: "how-can-i-learn-more-about-politics",
        icon: require("../../assets/education_icons/partiesicon1.png"),
        title: "How can I learn more?",
        summary: "Resources and approaches for understanding political issues.",
        body: [
          {
            type: "text",
            content:
              "Staying informed is essential in a democracy. Follow trusted news sources, read the text of bills on Congress.gov, use Unum to track legislation, and discuss issues with people who have different perspectives.",
          },
        ],
      },
      {
        id: "why-do-politicians-join-parties",
        icon: require("../../assets/education_icons/partiesicon2.png"),
        title: "Why do politicians join parties?",
        summary: "The role of political parties in organizing government.",
        body: [
          {
            type: "text",
            content:
              "Politicians join parties to organize around shared ideologies, pool resources for campaigns, and coordinate legislative strategy. Parties help voters understand what a candidate generally stands for.",
          },
        ],
      },
      {
        id: "what-are-americas-big-two",
        icon: require("../../assets/education_icons/partiesicon3.png"),
        title: "What are America's 'big two'?",
        summary: "The Democratic and Republican parties and their core ideologies.",
        body: [
          {
            type: "text",
            content:
              "The two major parties in the United States are the Democratic Party and the Republican Party. Democrats generally lean left on social and economic issues, while Republicans generally lean right. However, both parties contain a wide range of viewpoints.",
          },
        ],
      },
      {
        id: "what-are-the-other-parties",
        icon: require("../../assets/education_icons/partiesicon4.png"),
        title: "What are the other parties?",
        summary: "Third parties in the U.S. political system.",
        body: [
          {
            type: "text",
            content:
              "Third parties like the Libertarian Party, Green Party, and Constitution Party exist but face significant barriers to winning elections due to the first-past-the-post voting system and ballot access laws.",
          },
        ],
      },
      {
        id: "primaries-and-caucuses",
        icon: require("../../assets/education_icons/partiesicon5.png"),
        title: "Primaries and caucuses",
        summary: "How parties select their candidates for the general election.",
        body: [
          {
            type: "text",
            content:
              "Primaries and caucuses are how political parties choose their candidates for the general election. Primaries are state-run elections where party members vote for their preferred candidate. Caucuses are local meetings where party members discuss and vote on candidates.",
          },
        ],
      },
      {
        id: "majority-governments",
        icon: require("../../assets/education_icons/partiesicon6.png"),
        title: "Majority governments",
        summary: "Why majority control matters in Congress.",
        body: [
          {
            type: "text",
            content:
              "When one party holds a majority in a chamber of Congress, it controls the agenda, committee chairs, and which bills get a vote. The majority party's leaders have significant power over what legislation moves forward.",
          },
        ],
      },
      {
        id: "why-do-we-care-about-majorities",
        icon: require("../../assets/education_icons/partiesicon7.png"),
        title: "Why do we care about majorities?",
        summary: "How majority control affects legislation and governance.",
        body: [
          {
            type: "text",
            content:
              "Majority control determines whether a party can pass its agenda. A party that controls the White House and both chambers of Congress (a 'trifecta') can generally pass legislation without bipartisan support, though the filibuster in the Senate can still block most bills.",
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RIGHTS & CIVIC PARTICIPATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "rights-civic-participation",
    title: "Your Rights & Civic Participation",
    subtitle: "Voting, contacting representatives, and why your voice matters.",
    icon: require("../../assets/education_icons/your_rights.png"),
    subtopics: [
      {
        id: "voter-registration",
        icon: require("../../assets/education_icons/yourrights1.png"),
        title: "Voter registration",
        summary: "How to register to vote and participate in elections.",
        body: [
          {
            type: "text",
            content:
              "Voter registration is the first step to participating in elections. Requirements vary by state, but you generally need to be a U.S. citizen, at least 18 years old by election day, and a resident of the state where you're registering.",
          },
        ],
      },
      {
        id: "what-are-my-rights",
<<<<<<< HEAD
=======
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
                  "See the full text of the Constitution and all its amendments",
                url: "https://www.archives.gov/founding-docs/constitution-transcript",
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
                url: "https://www.oyez.org/cases",
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
>>>>>>> origin/master
        icon: require("../../assets/education_icons/yourrights2.png"),
        title: "What are my rights?",
        summary: "Constitutional rights every American should know.",
        body: [
          {
            type: "text",
            content:
<<<<<<< HEAD
              "The Constitution and Bill of Rights guarantee fundamental rights including freedom of speech, religion, and assembly; the right to bear arms; protection against unreasonable searches; the right to a fair trial; and protection against cruel and unusual punishment.",
=======
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
                  "See the full text of the Constitution and all its amendments",
                url: "https://www.archives.gov/founding-docs/constitution-transcript",
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
                url: "https://www.oyez.org/cases",
              },
              {
                label:
                  "Learn about important rights that all Americans have (PDF)",
                url: "https://www.justice.gov/sites/default/files/usao-mn/legacy/2011/09/16/MN%20Civil%20Rights%20FINAL.pdf",
              },
            ],
>>>>>>> origin/master
          },
        ],
      },
      {
        id: "why-should-i-care",
        icon: require("../../assets/education_icons/yourrights3.png"),
        title: "Why should I care?",
        summary: "Why civic participation matters in a democracy.",
        body: [
          {
            type: "text",
            content:
              "Civic participation is essential to a healthy democracy. When citizens vote, contact their representatives, and stay informed, the government is more responsive to their needs. Democracy works best when citizens are engaged.",
          },
        ],
      },
      {
        id: "why-care-about-political-parties",
        icon: require("../../assets/education_icons/yourrights4.png"),
        title: "Why should I care about political parties?",
        summary: "How parties connect citizens to the political process.",
        body: [
          {
            type: "text",
            content:
              "Political parties provide a way for citizens to get involved in politics beyond just voting. Joining a party allows you to participate in primaries, attend local meetings, and help shape the party's direction.",
          },
        ],
      },
      {
        id: "how-to-contact-your-representative",
        icon: require("../../assets/education_icons/yourrights5.png"),
        title: "How to contact your Representative",
        summary: "How to make your voice heard directly with your elected officials.",
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

<<<<<<< HEAD
// ── Load Markdown-based content (where available) ─────────────────────────
let mdContent: { topics: any[] } = { topics: [] };
try {
  mdContent = require("../../content/generated/education-content.json");
} catch (_) {}

const hydrateMd = (topics: any[]) =>
  topics.map((t: any) => ({
    ...t,
    icon: resolveTopicIcon(t.id),
    subtopics: (t.subtopics || []).map((s: any) => ({
      ...s,
      icon: resolveSubtopicIcon(s.id) || resolveTopicIcon(t.id),
      body: (s.body || []).map((sec: any) =>
        sec.type === "image"
          ? { ...sec, source: resolveImage(sec.source) ?? sec.source }
          : sec,
      ),
    })),
  }));

const mdTopics = hydrateMd(mdContent.topics);

// ── Merge: prefer Markdown content, fall back to hardcoded ───────────────
const mergedTopics = hardcodedTopics.map((hc) => {
  const md = mdTopics.find((t) => t.id === hc.id);
  if (md && md.subtopics.length > 0) return md;
  return hc;
});
// Append any topics from .md that don't exist in hardcoded
mdTopics.forEach((md) => {
  if (!mergedTopics.some((t) => t.id === md.id) && md.subtopics.length > 0) {
    mergedTopics.push(md);
  }
});
export const educationTopics: EducationTopic[] = mergedTopics;
=======
// Topics still being written, kept off the Education tab and out of search
const HIDDEN_TOPICS = new Set(["elections-voting", "us-history-foundations"]);

// The topics readers can browse, in the Education tab's order
export const visibleEducationTopics = educationTopics.filter(
  (topic) => !HIDDEN_TOPICS.has(topic.id),
);
>>>>>>> origin/master

export const getEducationTopic = (topicId: string) =>
  educationTopics.find((topic) => topic.id === topicId) ?? null;

export const getEducationSubtopic = (topicId: string, subtopicId: string) => {
  const topic = getEducationTopic(topicId);
  return (
    topic?.subtopics.find((subtopic) => subtopic.id === subtopicId) ?? null
  );
};
