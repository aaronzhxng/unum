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
  // ════════════════════════════════════════════════════════════════════════════
  // HOW GOVERNMENT WORKS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "how-government-works",
    title: "How Government Works",
    subtitle: "The 3 branches, checks & balances, federalism, and more.",
    icon: require("../../assets/education_icons/how_gov_works.png"),
    subtopics: [
      // ── Page 1: What is the U.S. Government? (intro + Executive + Congress) ─
      {
        id: "what-is-us-government",
        title: "What is the U.S. Government?",
        summary: "Federalism, the Executive Branch, and how Congress makes law.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            content:
              'The United States has many governments, not just one. The decisions these governments make affect your life in countless ways. Most of us are ruled by at least four different governmental authorities: the government of the United States, the government of a state, the government of a county, and the government of a village, town, or city.\n\nWhen people talk about "the U.S. government" or the "federal government," they mean the government run from Washington, D.C. That does not mean that the other governments are unimportant. In fact, in the United States, there are rules that say there are some things a state government can do that the federal government cannot stop. This idea is called federalism. State and local governments deal with everything from fixing roads to paying the police to rezoning a vacant lot. Few people have to deal directly with the U.S. government more than a couple times per year.',
          },
          {
            type: "image",
            source: null,
            caption:
              "The U.S. passport is issued to citizens by the federal government. Its front page tells people in other countries that the U.S. Secretary of State, and the department which he/she runs, will protect the holder of the passport.",
          },
          {
            type: "text",
            heading: "The Executive",
            content:
              'Still, it is likely you rely on federal services every day. Most services that cover multiple states are run on the federal level. For example, all letters are delivered by the U.S. Postal Service. All foreign trade is regulated by the Department of Commerce. And all passports, trademarks, and dollar bills are issued by the U.S. government. These activities are done by teams of non-political government employees, called civil servants. They work for Departments that are led by Secretaries, who are appointed by and advise the President. Together, they form the "Executive."\n\nDecisions made at the federal level affect the most Americans at once. Sometimes, the President will issue an Executive Order that changes something about how the Executive works.',
          },
          {
            type: "text",
            heading: "Congress",
            content:
              "The federal government also passes many important laws every year. Laws are not made by the President or his chosen Cabinet of Secretaries, but rather the elected Legislature, called Congress. The laws they can pass include going to war and making peace, raising and lowering the main rate of income tax, and controlling how many immigrants can enter the country each year. Unlike the President's Cabinet of Secretaries, everyone in Congress is elected, either to the House of Representatives or the Senate. Members of Congress come from all fifty states. This makes sure that new laws are consistent with what voting citizens want across the country. There are also five delegates who represent American Samoa, Guam, the U.S. Virgin Islands, the Northern Mariana Islands, and Washington, D.C., and one resident commissioner from Puerto Rico. These persons sit in the House of Representatives and are not allowed to vote.",
          },
        ],
      },

      // ── Page 2: The Constitution and Democracy ────────────────────────────
      {
        id: "constitution-and-democracy",
        title: "The Constitution and Democracy",
        summary: "How the Constitution protects rights and why civic knowledge matters.",
        body: [
          {
            type: "text",
            heading: "The Constitution",
            content:
              "The basic law of the United States is called the Constitution. It sets out what the U.S. government should essentially look like, and protects certain rights and freedoms for all people in the United States, like the right to criticize the government and the freedom to practice any or no religion. The Constitution is very difficult to change, or amend. It has been amended fewer than 30 times in 250 years. No law or Executive Order, however important, can go against what the Constitution says. If the top court in the United States, the Supreme Court, finds that one does, then it goes immediately out of effect. If the Supreme Court finds that someone was unfairly punished under an unconstitutional law, the punishment is undone.",
          },
          {
            type: "text",
            heading: "Why It Matters",
            content:
              'It is very important to know how the U.S. government works so that you know who to contact if you have a question about or an issue with the way the government is working. It is also important because the United States is a democracy, meaning that citizens vote for the members of Congress and the President. Compared with non-democratic countries, each U.S. citizen has a lot of power in influencing how laws and Executive decisions are made.\n\nA popular way to understand the federal government is to view it like a tree. This tree has three branches: the Executive, the Legislative, and the Judicial (legal). All of them are powerful, but none can run the government by itself. Instead, they do the work of "checking and balancing" the activities of each other. What supports the tree are its roots, and these are the Constitution and its 27 amendments made since 1789. And what feeds the tree and keeps it healthy are the votes, petitions, and active participation by educated citizens.',
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Learn more about the U.S. government and its branches",
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

      // ── Stubs ─────────────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════════════════════════
  // THE CONSTITUTION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "the-constitution",
    title: "The Constitution",
    subtitle: "The Bill of Rights, civil liberties, Supreme Court basics.",
    icon: require("../../assets/education_icons/constitution.png"),
    subtopics: [
      // ── Page 1: What is the Constitution? (intro + physical + amending) ───
      {
        id: "what-is-the-constitution",
        title: "What is the Constitution?",
        summary: "What the Constitution is and how it can be amended.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
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
        ],
      },

      // ── Page 2: Constitutional Rights (history + rights + image) ─────────
      {
        id: "constitutional-rights",
        title: "Constitutional Rights",
        summary: "The Bill of Rights and the specific freedoms it guarantees.",
        body: [
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
        ],
      },

      // ── Page 3: The Constitution Today (13th + federal/state + SCOTUS + why)
      {
        id: "the-constitution-today",
        title: "The Constitution Today",
        summary: "The 13th Amendment, federal vs. state power, and the Supreme Court's role.",
        body: [
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
              "The Constitution is one of the shortest and oldest in the world. Because of this, a lot of the language can seem vague or outdated. A large part of the Supreme Court's job is determining whether a law or an executive action is \"constitutional,\" and therefore can be carried out. If a majority of the Supreme Court rules that it is not constitutional, then the law itself is invalid.\n\nThe Supreme Court also has the job of determining how far civil and legal rights practically extend. For example, in 1963, the Supreme Court ruled that part of due process included the right to have a lawyer, so anyone who is too poor to pay for one can be assigned one by the government.",
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

      // ── Stubs ─────────────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════════════════════════
  // CONGRESS & LEGISLATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "congress-legislation",
    title: "Congress & Legislation",
    subtitle: "How a bill becomes law, committees, floor votes, and more.",
    icon: require("../../assets/education_icons/congress.png"),
    subtopics: [
      // ── Page 1: Passing Laws ──────────────────────────────────────────────
      {
        id: "passing-laws",
        title: "Passing Laws",
        summary: "How bills are introduced, debated, and signed into law.",
        body: [
          {
            type: "text",
            heading: "What Does Congress Do?",
            content:
              "Congress is the legislative branch of the U.S. government. In this capacity, Congress passes laws, controls spending, and checks the work of the Executive.",
          },
          {
            type: "text",
            // heading removed — matches page title
            content:
              "The most important job of Congress is legislating, or passing new laws. The Constitution allows Congress to pass laws on almost anything that affects multiple states or the entire country at once. These include immigration, major taxes, declaring war and making peace, the national debt, international treaties, and trade with foreign countries.\n\nNew laws need to be made from time to time to keep them up to date. It could be that an old law needs to be updated, replaced, or repealed without replacement. There could also be a situation that requires entirely new laws. A draft law is called a bill or a joint resolution: they are basically the same.\n\nAny member of Congress can introduce a bill: the first person to do so becomes its \"sponsor\", and those who follow are called \"co-sponsors\". Once it is introduced, the bill gets the letters H.R. or S (standing for House of Representatives or Senate), or H.J.Res. or S.J.Res. (if it is a joint resolution), followed by a number.\n\nThe bill is then referred to one or more committees with just a few special members of the House or the Senate, who will research and debate the details of the bill and make any necessary changes. At any time, the House and Senate have, put together, about fifty committees and 150 subcommittees. Each body specializes in a specific area. The most important committees include the House Ways and Means Committee, which debates bills related to taxation, and the Senate Committee on Foreign Relations.",
          },
          {
            type: "text",
            content:
              "In order to know more about the subject of the bill, each committee or subcommittee will usually hold one or more hearings, or public meetings. The members will call up non-politician experts in the area and ask them questions about whether the bill will help or hurt them or if it is necessary. Usually, the people who are being asked to speak (testify) have different backgrounds from each other. For instance, while considering a bill to do with telecommunications, Congress might hold a hearing with television executives, college professors, and small video creators.\n\nCommittees can also sometimes hold hearings about topics that they expect a bill to be written about soon. And, the Senate Committee on Foreign Relations holds hearings when they need to decide whether the Senate should ratify an international agreement (or \"treaty\") that the President has signed. The Constitution says that two-thirds of the Senate must vote for a treaty before its terms become law in the United States.",
          },
          {
            type: "text",
            content:
              "Committees have members belonging to both parties. However, the chair position and the majority of members always belong to the party with the majority of seats in the House or Senate. The chair is very important, because he or she sets the schedule for what bills get considered and what bills are ignored, or \"tabled.\" Most bills fail in committee and do not even get a hearing. The leader of the minority group in each committee is called the \"ranking member.\"\n\nIf the committee approves a bill, it returns to the chamber where it is debated, changed (\"amended\"), and voted on. You can watch debates live on the C-SPAN television channels or on the Internet. At least half of the chamber's members must vote in favor of the bill: usually, that means no fewer than 218 of 435 representatives, or 51 of 100 senators. If they do, the bill moves to the second chamber, where it goes through the same process again.\n\nAt the end, a conference committee is formed with members of both chambers to work out any differences that came up during the amendment process. Once their work is done, the bill goes to the President to sign or reject (\"veto\"). The President only has ten days, not counting Sunday, to make a decision, or it will automatically become law. If the President vetoes a bill, both chambers of Congress need to vote with a two-thirds majority to make the bill into law anyways.",
          },
          {
            type: "text",
            content:
              "Let us see an example. You can track the progress of a bill using Unum or Congress.gov.",
          },
          {
            type: "image",
            source: null,
            caption: undefined,
          },
          {
            type: "text",
            content:
              "As you can see, on March 13, 2007, Democratic member of the House of Representatives James L. Oberstar (representing Minnesota's eighth congressional district) introduced the \"Water Resources Development Act of 2007,\" numbered H.R. 1495. It was co-sponsored by three of Mr. Oberstar's colleagues: one Democrat and two Republicans.\n\nThe bill went through the House of Representatives' Transportation and Infrastructure Committee who published a report. It then went through the Senate, and, finally, the conference committee, who also published a report. The bill was all set to be given to the President, George W. Bush.",
          },
          {
            type: "image",
            source: null,
            caption: undefined,
          },
          {
            type: "text",
            content:
              "Mr. Bush received the bill on October 23, but he vetoed it ten days later, on November 2. He issued a statement explaining his decision, but the House and Senate voted with two-thirds majorities to pass the bill anyways. The next day, it became an effective law.\n\nUnum was created to help regular people keep track of bills as they move through the legislative process. Try turning on notifications for a bill or a member of Congress!",
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
                label: "Introduction to the federal legislative process (Congressional Research Service)",
                url: "https://www.congress.gov/crs-product/IG10005",
              },
            ],
          },
        ],
      },

      // ── Page 2: Taxing and Spending ───────────────────────────────────────
      {
        id: "taxing-and-spending",
        title: "Taxing and Spending",
        summary: "How the federal government raises revenue and decides where to spend it.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            content:
              "One of the most important responsibilities a government has is controlling how money is raised from the public (as \"income\") and where that money is spent (as \"expenditures\" or \"outlays\"). In a federal country like the United States, these powers are shared between the national government, the state government, and smaller local governments.\n\nThe federal government raises money in several ways. The largest part of government revenue comes from taxes on individual incomes. There are also taxes taken off an employee's payroll, taxes on company earnings, taxes on harmful goods like gasoline and tobacco, and taxes on items bought from other countries (these taxes are called tariffs). Tariffs are collected by the Customs and Border Protection agency, while taxes are managed by the Internal Revenue System (IRS). The Constitution says that all bills that relate to raising money must start in the House of Representatives.",
          },
          {
            type: "text",
            content:
              "The money that is raised is spent on a wide number of things. First are responsibilities any national government has, such as paying for the military and for national security. Additionally, the United States funds many programs to improve the lives of its citizens and businesses. The U.S. government buys 20% of all the country's goods and services (called the G.D.P., or gross domestic product).\n\nFor example, the United States government takes a cut out of all employees' payrolls to pay for Social Security, a welfare program that gives retired workers a few thousand dollars a month. Another payroll tax goes to funding Medicare, which is government health insurance for Americans over 65.",
          },
          {
            type: "text",
            content:
              "In the past, Congress decided that these programs, and a few others, are so important that they must be funded every year no matter what. Therefore, economists call this \"mandatory spending.\" Mandatory spending accounts for about 60% of total spending. Another 10% of total spending goes to paying off the national debt. For a long time, the United States has spent much more than it earns in revenue (this practice is called \"deficit spending\"), increasing the amount of money it owes to its citizens, banks, and foreign countries. It is important that the U.S. keeps up these regular interest payments so that the overall economy does well.\n\nThe remaining part of government outlays is decided (or \"appropriated\") each year by Congress. Congress does this by passing twelve bills that together form the budget. The budget bills appropriate all non-mandatory spending for the next fiscal year, which, for the U.S. government, lasts from October 1 to September 30. Unlike mandatory spending, legislators can easily change where and how much to spend from one budget to the next as they see fit, or at their discretion. Therefore, the measures are called \"discretionary spending.\"",
          },
          {
            type: "image",
            source: null,
            caption:
              "The U.S. government produces informational diagrams like this one to help explain the budget. In 2024, the U.S. earned $4,900,000,000,000 and spent $6,800,000,000,000 trillion, leaving a deficit of about $1,900,000,000,000.",
          },
          {
            type: "text",
            content:
              "The government starts thinking about next year's budget as soon as the current year's budget is passed. First, all executive agencies tell the Office of Management and Budget how much money they expect to spend in the next year. The Office then works with the President to write a formal budget request. Meanwhile, both the House and Senate write their own \"resolutions\" which say broadly how much they are willing to spend. Congress also has offices to help them with this job, including the Congressional Budget Office. These steps are optional, but they help set expectations for what the budget will end up looking like.\n\nWith these outlines done, both the House and Senate cut up the budget into twelve policy areas and assign one specialized subcommittee to each. For example, one subcommittee just looks at energy and water development, while another looks at defense spending. Each subcommittee does research to understand how much money each federal program really needs, and whether it is spending the money it already has well. With this information, each subcommittee writes one detailed bill that actually appropriates the money. They pass that bill to whatever chamber they belong to, and the chamber votes on it.",
          },
          {
            type: "image",
            source: null,
            caption:
              "All subcommittees hold hearings during the budget process. For example, in this image, Representative Andy Harris (Republican for Maryland's 1st district) was asking a New York City grocer about how his customers spend their money. On May 22, 2024, Dr. Harris was chairman of the agriculture subcommittee, responsible for deciding how much money should be given to help poor families buy food. All of these hearings are recorded and can be watched online.",
          },
          {
            type: "text",
            content:
              "Whatever differences exist between the House and Senate versions of each appropriation bill are worked out line by line by a committee of both chambers. Finally, both the House and Senate vote on the whole budget, which includes all twelve bills. Once they approve the budget, it goes to the President for him or her to approve as well.\n\nIf the process goes smoothly, the next fiscal year's budget is passed before the old one is up, and government money never stops going to the people who need it. However, during the past thirty years, it has become more common for a budget to stall. When this happens, Congress and the President must renew last year's budget for a while (in a so-called \"continuing resolution\") to give themselves more time. If a continuing resolution also cannot be passed, then the government is said to have \"shut down,\" either partially or entirely. During a total government shutdown, only mandatory spending continues. During a partial shutdown, only those agencies with approved appropriations stay working. The shutdown continues unless a continuing resolution is passed. The crisis only totally ends when a new budget is passed.\n\nOn the other hand, sometimes one budget per year is not enough. For example, in 2020, the government passed four additional appropriations bills because the Covid-19 pandemic was seriously affecting the nation's economy. These are called supplemental appropriations because they supplement (help) the budget.",
          },
          {
            type: "text",
            content:
              "Many have complained about the difficulty with passing the budget well and on time. But even beyond the budget, politicians disagree about whether taxes should be raised or lowered, if the nation is in too much debt, and what additional appropriations should be passed to follow the outlines given in the budget resolution. Following all of this in the news can be difficult, but also revealing. Debates over government finance tell a lot about what political parties and politicians think the role that government should play in the lives of ordinary people.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Overview of federal taxation (Congressional Research Service)",
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

      // ── Page 3: Checking the Executive Branch ─────────────────────────────
      {
        id: "checking-the-executive",
        title: "Checking the Executive Branch",
        summary: "How Congress oversees the Executive Branch and can remove federal officials.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            // transition fixed: "Another important responsibility" → standalone opener
            content:
              "Congress has the power to make sure that the Executive Branch is working properly — a role called oversight, and a core part of the federal government's checks and balances. Congress holds regular hearings that are usually public to determine if Executive agencies are doing their jobs well and according to law. These also give committees the chance to ask questions to all Cabinet secretaries (who lead an Executive Department).\n\nThe President is never called up for a hearing. However, Congress still has some powers to examine and challenge his or her work. For one, when a position opens up (becomes vacant) that the President wants to fill, the Senate holds hearings before voting on whether to approve the President's choice. This goes for ambassadors, Cabinet members, judges, and justices of the Supreme Court. In recent years, some of these hearings have become very political, especially when Congress rejects a nominee.",
          },
          {
            type: "text",
            content:
              "Additionally, Congress can hold hearings to investigate whether people within or outside of government have acted illegally. If it is a company or a private individual, this could drive Congress to pass a law punishing them. And if a federal official (including the President and Vice President) or Supreme Court justice did wrong, Congress can charge them with a crime (impeachment) and then hold a trial to remove them from office early.\n\nFederal officials can only be impeached if they have committed one of the following three offenses described in the Constitution:\n\n• Treason (helping the U.S.'s enemies during wartime, trying to overthrow the U.S. government, or blocking U.S. laws from being enforced)\n• Bribery (doing people favors in exchange for money or another gift)\n• High crimes and misdemeanors (an old law term that is generally understood to mean working against the public interest in some very serious way). This is the most common charge.",
          },
          {
            type: "text",
            content:
              "The impeachment process involves both houses of Congress. First, a majority of the House of Representatives must vote to pass charges, in so-called \"articles of impeachment.\" This document describes what the federal official is said to have done wrong.\n\nThen, the Senate acts like a courtroom, hearing evidence and legal arguments. Two-thirds of all the senators must vote that the charged official is guilty. If they do, the official is removed from office. If they do not, the official is said to be \"acquitted.\"\n\nThe Supreme Court has effectively no role in the whole process just described. In fact, Supreme Court justices can be impeached and removed, too. This means that, in theory, the votes to impeach and remove are entirely political. However, members of Congress are trusted to treat their job with the serious consideration it deserves. The House only rarely succeeds in passing articles of impeachment. Famously, three presidents have been impeached: Andrew Johnson (1868), Bill Clinton (1998), and Donald Trump (2019 & 2021). One Supreme Court justice has also been impeached: Samuel Chase, in 1804. None were removed from office.",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "Types of congressional hearings (Congressional Research Service)",
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

      // ── Stubs ─────────────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════════════════════════
  // POLITICAL PARTIES & IDEOLOGY
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "political-parties-ideology",
    title: "Political Parties & Ideology",
    subtitle: "Party history, the spectrum, independents, and third parties.",
    icon: require("../../assets/education_icons/political_parties.png"),
    subtopics: [
      // ── Page 1: What are Political Parties? (intro + knowing the parties) ─
      {
        id: "what-are-political-parties",
        title: "What are Political Parties?",
        summary: "What parties are, how they differ, and how the two-party system works.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            content:
              "A political party (often shortened to \"party\") is an organization with a name, label, and set of beliefs. Almost all politicians in the U.S. belong to a political party, as do about 70% of voters. Understanding the major political parties helps you to know what politicians believe in.\n\nAdditionally, because parties are also organizations, they help select candidates, raise money, and run advertisements. Knowing how parties operate means you know more about the process of elections.\n\nFinally, the way Congress works basically forces members to organize into groups. Therefore, understanding how political parties interact will help you know how laws get passed.",
          },
          {
            type: "text",
            heading: "Knowing the Parties",
            content:
              "All official parties in the United States are registered with a body called the Federal Elections Commission. By searching on fec.gov, you can see who leads political parties at the national, state, and local level, as well as who gives them money and how much.",
          },
          {
            type: "image",
            source: null,
            caption:
              "The two main political parties use colors and icons to tell each other apart in advertising. The Democratic color is blue and its icon is a D, or a donkey. The Republican color is red and its icon is an R, or an elephant. The Republican Party is also called the Grand Old Party, or the G.O.P.",
          },
          {
            type: "text",
            content:
              "Additionally, most political parties write a lot of information about themselves on their website and social media. For example, every county, state, and national party organization has their own constitution, which explains how they are organized. And before a big election, the national political parties will publish a platform, also called a manifesto, which outlines what they will do if they get into office.",
          },
          {
            type: "image",
            source: null,
            caption:
              "In their platforms, parties say how they will respond to a problem. You can compare the platforms for similarities and differences. For example, in response to the high cost of housing, the Democratic Party (top) promised in 2024 to regulate landlords and fund down payments, while the Republican Party (bottom) focused on lowering inflation and giving builders more land. However, both parties promised to cut regulations and create tax breaks for new homebuyers.",
          },
          {
            type: "text",
            content:
              "The United States has a \"two-party system.\" This is because, with few exceptions, only two political parties ever win a national election. They are the Republican Party and the Democratic Party. For more than 170 years, no other party has ever won the most seats in either house of Congress or elected one of their members to the presidency.\n\nThere are several reasons why a politician will choose to join a political party. Political parties offer help to candidates running for office, including advice, funding, and advertisements on their behalf. And voters will have an easier time learning what a little-known candidate stands for if he or she is identified with a political party. This is because there are many similarities between the national party manifesto and the individual promises that candidates belonging to the party will make.\n\nAlternatively, a candidate running for office without the support of either the Democratic or the Republican Party (as an \"independent\") might be saying he or she disapproves of the way both parties operate or of the views they hold. Depending on how voters feel about both major parties, this can help or hurt the candidate.\n\nThe Republican Party is the current party of government. In the 2024 elections for Congress, politicians with the Republican Party won a majority of seats in both the House of Representatives and the Senate. The current President, Vice President, and Cabinet are also all Republicans.\n\nLike Canada, Australia, and most of Europe, journalists say the United States has one big party on the \"right wing\" — the Republicans — and one big party on the \"left wing\" — the Democrats. People and politicians whose opinions lie somewhere in the middle are said to be \"centrists.\"",
          },
          {
            type: "text",
            heading: "The Republican Party",
            content:
              "Generally, the Republicans are conservatives. They want to limit the power of the federal government and maintain the social order. They are likely to support lower taxes, fewer regulations, a strong military, limited immigration, and to preserve the traditional understandings of sex and gender. Famous Republican presidents include Abraham Lincoln (1861–1865), Ronald Reagan (1981–1989), George W. Bush (2001–2009), and Donald Trump (2017–2021, 2025–present). The Republican Party is more popular among older people, white people, men, and people who live outside of cities.",
          },
          {
            type: "text",
            heading: "The Democratic Party",
            content:
              "Generally, the Democrats are liberal. They want a stronger federal government that can pass social reforms. They are likely to support higher taxes in exchange for broadening welfare programs such as Medicare and university student aid. They might also be more supportive of gay rights, immigration, and cooperation with other countries. Famous Democratic presidents include Woodrow Wilson (1913–1921), Franklin D. Roosevelt (1933–1945), Bill Clinton (1993–2001), Barack Obama (2009–2017), and Joe Biden (2021–2025). The Democratic Party is more popular among younger people, non-white people, women, and people who live in cities.",
          },
          {
            type: "text",
            content:
              "Fewer than 1% of American voters are members of a party other than the Democratic or Republican parties. They can sometimes get a large number of votes, especially in local elections. Nationally, there is the Libertarian Party, whose color is yellow, which believes the government should do much less than it does today by ending many social programs and regulations. There is also the Green Party, which believes the government should do much more to stop climate change and also substantially reduce the size of the army.\n\nMinor parties and independents have a hard time getting their candidates to go on the ballot that voters get on election day. In elections to Congress or the presidency, almost all minor candidates fail to meet the strict \"ballot-access requirements.\" If a candidate's name does not show up on the ballot, it is much less likely that he or she will win.\n\nFor this reason, some places have their own parties that fight only local elections. Their members usually vote for either the Democrats or Republicans in national elections. These include the Working Families Party, which mainly exists in Connecticut and New York City, and the Vermont Progressive Party.",
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
                label: "Historical platforms of all major political parties from 1840 to 2024",
                url: "https://www.presidency.ucsb.edu/documents/presidential-documents-archive-guidebook/party-platforms-and-nominating-conventions-3",
              },
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

      // ── Page 2: Joining a Party ───────────────────────────────────────────
      {
        id: "joining-a-party",
        title: "Joining a Party",
        summary: "Registering with a party and how primary elections work.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            content:
              "In some states, you can register to join a political party when you register to vote. This is free. You can also donate, volunteer, and work with political parties as you like.\n\nThese decisions are completely optional. You can always vote for whomever you like, whether you do or do not belong to a political party. For example, if you registered as a member of the Republican Party, but you like the Democratic candidate for senator, you can vote for her instead of the Republican candidate.\n\nHowever, if you join a political party, you get a small say in how it is run. During some elections, like those for governor, Congress, and president, there will be many candidates who all want to call themselves the \"official nominee\" of the party to run against the official nominees from the other parties. To decide who this person should be, political parties hold primary elections a few months before the general election (that is, the one with all candidates from all political parties).",
          },
          {
            type: "text",
            content:
              "Primary elections work just like the general election, with legal polling stations and ballots. That means that you must be aged eighteen or older and an American citizen to vote in a primary election. However, some states also say you must be a registered member of a political party in order to vote in its primary. These are called \"closed primaries.\" Some states have \"open primaries,\" meaning you can vote for the nominee of any party you like, even if you belong to a different party, or to none at all.\n\nSome parties in a few less-populated states use caucuses instead of primaries to choose their official candidate. Instead of casting their ballot, party members raise their hand, and whoever gets the most votes becomes the nominee.",
          },
          {
            type: "image",
            source: null,
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
                label: "Joining a political party",
                url: "https://www.usa.gov/change-voter-registration",
              },
              {
                label: "Primary election types in each state",
                url: "https://www.ncsl.org/elections-and-campaigns/state-primary-election-types",
              },
            ],
          },
        ],
      },

      // ── Page 3: Parties and Government ───────────────────────────────────
      {
        id: "parties-and-government",
        title: "Parties and Government",
        summary: "How majority control, party discipline, and caucuses shape Congress.",
        body: [
          {
            type: "text",
            // heading removed — matches page title
            content:
              "The Constitution does not say political parties have to exist. Instead, the present party system naturally emerged because it is an efficient way to get people with similar ideas to vote the same way.\n\nAlmost all politicians in Congress belong to either the Republican or the Democratic party. Sometimes, voters will elect an independent congressperson, but he or she will always work with one of the two main parties (this cooperation is called caucusing). For this reason, we speak of one party or another having \"majority control\" of Congress, or simply a \"majority,\" while the other party is in the minority.",
          },
          {
            type: "text",
            content:
              "The House of Representatives has an odd number of seats (435). Therefore, if there are 218 or more representatives belonging to one party, that party has a \"majority.\" Because the leader of the House (called the Speaker) is elected by House members, and members of one party will usually vote for one of their own as Speaker, this means that the party that has the majority in the House can also elect its leader.\n\nThe Senate has 100 seats. However, the Vice President (who also always belongs to a political party) can vote in case of a tie. Therefore, for a majority in that chamber, one party needs either 50 or 51 senators. Of course, the Senate does not elect its leader (the Vice President), but it does elect the people who serve when the Vice President is out of Congress. Therefore, the majority party in the Senate elects that chamber's leader, too.\n\nThere is also a so-called supermajority. In the House, this means two-thirds or more (290+) of the representatives belong to one party. In the Senate, this means three-fifths or more (60+) of the senators. A party with this much control could pass bills much easier. Supermajorities are common in some state legislatures but almost never happen in the federal Congress.",
          },
          {
            type: "text",
            content:
              "Majority control is important because members of Congress who belong to one party are generally expected to vote the same way as their fellow party members. This is called party unity or party discipline.\n\nTo preserve party unity, parties choose one member in each house of Congress to serve as their leader. The leader speaks on behalf of the whole party, and members are expected to vote as he or she says. For this reason, the Majority and Minority Leaders of the House and Senate are some of the most important and famous members of Congress. Because their work is so important to passing laws, party leaders even get a higher salary than other congresspeople, just like the leaders of the House and Senate do.\n\nParties also choose one member in each house to be their \"whip.\" The whips' job is to help work behind the scenes to get individual members of Congress to vote as their leader wants them to.",
          },
          {
            type: "image",
            source: null,
            caption:
              "Kyrsten Sinema was a Senator from Arizona. She was elected as a Democrat in 2018, but held some conservative beliefs and voted with the Republicans on some bills. In 2022, she voluntarily left the Democrats and became an independent, but kept caucusing with the Democratic Party. She left Congress in 2025.",
          },
          {
            type: "text",
            content:
              "In the U.S., party discipline is weaker than it is in other countries. When one party has a very thin majority, just a few rebellious members can stop its bills going through. In general, however, there is party unity. Even when one party has a slim majority, it usually passes most of the bills it likes, and can stop bills it does not support from reaching the President. You can guess that if the President belongs to the same party as the majority in Congress (this is called a unified government, or a trifecta), laws will be passed much quicker than if the parties were different.\n\nRarely, members of Congress and even the President can get expelled from their own party if they are too disagreeable, or they can quit by themselves. Still, the two big parties allow for some difference in opinion. Within the House and Senate, there are groups called caucuses. These groups can be official or unofficial. They are made up of congresspeople who share similar views and hope to push the party in that direction. For example, the so-called House Liberty Caucus is made up of Republicans who want their party to be more libertarian. The Congressional Progressive Caucus is made up of Democrats in the House and Senate who want their party to be more liberal. And the Problem Solvers Caucus includes representatives from both parties who support working together in general.\n\nNonetheless, most caucuses are non-partisan (not specifically relating to party politics). In these groups, members of Congress from one or both parties meet to discuss passing bills about a topic that is important to them. The most notable of these caucuses include the Congressional Black Caucus and the Congressional Equality Caucus (this one focusing on LGBT issues).",
          },
          {
            type: "links",
            heading: "Learn More",
            items: [
              {
                label: "The history of majority and minority governments",
                url: "https://history.house.gov/Institution/Presidents-Coinciding/Party-Government/",
              },
              {
                label: "List of official Congressional caucuses — Congressional Member Organizations (PDF)",
                url: "https://cha.house.gov/_cache/files/f/a/fac21955-3822-4870-8bc0-345c5eaf3c14/AAEFBDA8AA686059C7E72F741E3C11EA.119th-congress-cmo-list-1-.pdf",
              },
            ],
          },
        ],
      },

      // ── Stubs ─────────────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════════════════════════
  // YOUR RIGHTS & CIVIC PARTICIPATION
  // ════════════════════════════════════════════════════════════════════════════
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
