// ─── Types ───────────────────────────────────────────────────────────────────

export type GlossarySegment =
  | { type: 'plain'; text: string }
  | { type: 'glossary'; text: string; slug: string }
  | { type: 'topic'; text: string; topicId: string };

export interface GlossaryEntry {
  term: string;
  slug: string;
  /** Lowercase strings (besides term itself) that also resolve to this entry */
  aliases?: string[];
  definition: GlossarySegment[];
}

// ─── Segment shorthands ──────────────────────────────────────────────────────

const p = (text: string): GlossarySegment => ({ type: 'plain', text });
const g = (text: string, slug: string): GlossarySegment => ({ type: 'glossary', text, slug });
const t = (text: string, topicId: string): GlossarySegment => ({ type: 'topic', text, topicId });

// ─── Glossary entries (alphabetical) ─────────────────────────────────────────

export const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'American Indians',
    slug: 'american-indians',
    definition: [
      p('also called “Native Americans,” “indigenous Americans,” “First Nations peoples,” or just “Indians,” these are the people who lived in the United States before European settlers arrived. Throughout history, American Indians fought many wars with white settlers and faced intense '),
      g('discrimination', 'discrimination'),
      p('. Many Indians today live on reservations, which are areas of land that have their own special form of government but are still under the federal government’s authority.'),
    ],
  },
  {
    term: 'Bill',
    slug: 'bill',
    definition: [
      p('the draft stage of a law. A bill that starts in the '),
      t('House of Representatives', 'congress-legislation'),
      p(' begins with the letters H.R., while one that starts in the '),
      t('Senate', 'congress-legislation'),
      p(' begins with S.'),
    ],
  },
  {
    term: 'Bureaucracy',
    slug: 'bureaucracy',
    definition: [
      p('the part of the government that manages day-to-day activities. Bureaucrats, also called civil servants, are non-political and unelected, getting the job through application and possibly examination.'),
    ],
  },
  {
    term: 'Centrism',
    slug: 'centrism',
    definition: [
      p('a political philosophy that believes in some parts of '),
      g('liberalism', 'liberalism'),
      p(' and some parts of '),
      g('conservatism', 'conservatism'),
      p(' and wants both '),
      t('political parties', 'political-parties-ideology'),
      p(' to compromise more.'),
    ],
  },
  {
    term: 'Conservatism',
    slug: 'conservatism',
    aliases: ['conservatives', 'conservative', 'fiscal conservatives', 'fiscal conservative'],
    definition: [
      p('a political philosophy that supports a free-market, capitalist economy (such as exists in the U.S.), low taxes, small government, and traditional moral values. Supporters are called conservatives and generally support the '),
      g('Republican Party', 'republican-party'),
      p('. The opposite, broadly speaking, is '),
      g('liberalism', 'liberalism'),
      p('.'),
    ],
  },
  {
    term: 'Democracy',
    slug: 'democracy',
    definition: [
      p('a government that is truly elected by the people. Because the President and Congress are fairly elected by qualified citizens, the United States is considered a democracy. It is also a '),
      g('republic', 'republic'),
      p('.'),
    ],
  },
  {
    term: 'Democratic Party',
    slug: 'democratic-party',
    definition: [
      p('one of the two largest '),
      t('political parties', 'political-parties-ideology'),
      p(' in the United States (along with the '),
      g('Republican Party', 'republican-party'),
      p(') and the current '),
      g('opposition', 'opposition'),
      p(' party in Congress. Most members are '),
      g('liberals', 'liberalism'),
      p(' and '),
      g('left-wing', 'left-wing'),
      p('. Identified with the color blue and the donkey.'),
    ],
  },
  {
    term: 'Discrimination',
    slug: 'discrimination',
    definition: [
      p('the unfair treatment of some people compared to others because of characteristics like race, sex, religion, disability, or country of birth. Throughout history, many groups have faced discrimination both from individuals and groups as well as by the U.S., state, and local governments. Today, it is illegal for a government, school, housing provider, or employer to discriminate, except under very specific circumstances.'),
    ],
  },
  {
    term: 'Divided government',
    slug: 'divided-government',
    definition: [
      p('the situation in which the party of the President and of at least one house of Congress is different. This usually makes passing laws harder and slower.'),
    ],
  },
  {
    term: 'Due process',
    slug: 'due-process',
    definition: [
      p('the exact course of the law. In order for either federal or state authorities to punish somebody, the government must tell that person many things, including what crimes he or she is being accused of and what evidence the government has against them. Then, the government must allow the defendant to get a lawyer, to testify, call others to testify, and so on. The right to due process is guaranteed by the Fifth and the Fourteenth Amendments to the '),
      t('Constitution', 'the-constitution'),
      p('. If a trial takes place where due process was not followed, then even if it said that a defendant was guilty, he or she is allowed to go free.'),
    ],
  },
  {
    term: 'Executive Order',
    slug: 'executive-order',
    definition: [
      p('an order issued by the '),
      t('President', 'how-government-works'),
      p(', directing the Executive to change something. It must only deal with the Executive or '),
      g('bureaucracy', 'bureaucracy'),
      p('. It cannot be voted on by '),
      t('Congress', 'congress-legislation'),
      p(' or changed by anybody except a President.'),
    ],
  },
  {
    term: 'Federalism',
    slug: 'federalism',
    definition: [
      p('the idea, established in the '),
      t('U.S. Constitution', 'the-constitution'),
      p(', that the powers of government are divided between the state and the nation. There are some things a state’s government can do which the national, or federal, government cannot change or alter.'),
    ],
  },
  {
    term: 'Government',
    slug: 'government',
    definition: [
      p('the persons who are allowed to make rules for and decisions about a particular area, such as a city, state, or nation.'),
    ],
  },
  {
    term: 'Green politics',
    slug: 'green-politics',
    definition: [
      p('a political philosophy that demands much stronger government action against climate change, as well as more public services and a smaller military. There is a small Green Party in the United States, but most “green” supporters will vote for the '),
      g('Democratic Party', 'democratic-party'),
      p('.'),
    ],
  },
  {
    term: 'Independent',
    slug: 'independent',
    definition: [
      p('someone who does not belong to any '),
      t('political party', 'political-parties-ideology'),
      p('.'),
    ],
  },
  {
    term: 'Left wing or left-wing',
    slug: 'left-wing',
    aliases: ['left wing', 'left-wing'],
    definition: [
      p('political views that are '),
      g('liberal', 'liberalism'),
      p(' or '),
      g('social democratic', 'social-democracy'),
      p('.'),
    ],
  },
  {
    term: 'Liberalism',
    slug: 'liberalism',
    aliases: ['liberals', 'liberal', 'social liberals', 'social liberal'],
    definition: [
      p('a political philosophy that supports more regulations in a capitalist economy and a government that is well-funded, provides many public services, and steps in to promote fairness and equality. Supporters are called liberals and generally support the '),
      g('Democratic Party', 'democratic-party'),
      p('. The opposite, broadly speaking, is '),
      g('conservatism', 'conservatism'),
      p('. Before the 1950s or so, “liberal” often meant something closer to what is now called '),
      g('libertarianism', 'libertarianism'),
      p('.'),
    ],
  },
  {
    term: 'Libertarianism',
    slug: 'libertarianism',
    aliases: ['libertarian', 'libertarians'],
    definition: [
      p('a political philosophy that strongly supports business and individual freedom and opposes most government-provided public services and regulations. Supporters are called libertarians and are '),
      g('social liberals', 'liberalism'),
      p(' but '),
      g('fiscal conservatives', 'conservatism'),
      p('. There is a small Libertarian Party in the United States, but most libertarians will vote for the '),
      g('Republican Party', 'republican-party'),
      p('.'),
    ],
  },
  {
    term: 'Majority party',
    slug: 'majority-party',
    aliases: ['majority'],
    definition: [
      p('the party that controls the most seats in one or both houses of Congress. In a two-party system, this means 218 or more of the seats in the '),
      t('House of Representatives', 'congress-legislation'),
      p(' and 50 or 51 seats in the '),
      t('Senate', 'congress-legislation'),
      p(' (depending on if it is the party of the Vice President). If there is no majority party, then there is a split Congress.'),
    ],
  },
  {
    term: 'Manifesto',
    slug: 'manifesto',
    definition: [
      p('see '),
      g('Platform', 'platform'),
      p('.'),
    ],
  },
  {
    term: 'Medicaid',
    slug: 'medicaid',
    definition: [
      p('a national health insurance scheme that primarily covers people with lower incomes. Along with '),
      g('Medicare', 'medicare'),
      p(', it is the main source for mandatory spending in the '),
      t('budget', 'congress-legislation'),
      p('.'),
    ],
  },
  {
    term: 'Medicare',
    slug: 'medicare',
    definition: [
      p('a national health insurance scheme that primarily covers people aged 65 or older. Along with '),
      g('Medicaid', 'medicaid'),
      p(', it is the main source for mandatory spending in the '),
      t('budget', 'congress-legislation'),
      p('.'),
    ],
  },
  {
    term: 'Opposition',
    slug: 'opposition',
    definition: [
      p('all members of '),
      t('Congress', 'congress-legislation'),
      p(' beside those in the majority '),
      t('party', 'political-parties-ideology'),
      p('.'),
    ],
  },
  {
    term: 'Platform',
    slug: 'platform',
    definition: [
      p('a document that each '),
      g('political party', 'political-party'),
      p(' publishes before each major election publicly declaring what its candidates believe and would like to do if they were elected to power.'),
    ],
  },
  {
    term: 'Political party',
    slug: 'political-party',
    aliases: ['political parties'],
    definition: [
      p('a group organized by people with similar views to run candidates and coordinate action in government. The main political parties in the United States are the '),
      g('Republican Party', 'republican-party'),
      p(' (or the G.O.P.) and the '),
      g('Democratic Party', 'democratic-party'),
      p('. Learn more about '),
      t('political parties', 'political-parties-ideology'),
      p('.'),
    ],
  },
  {
    term: 'Republic',
    slug: 'republic',
    definition: [
      p('a government that has representatives but no monarch (a king or queen, for example). The United States is a republic. It is also a '),
      g('democracy', 'democracy'),
      p('.'),
    ],
  },
  {
    term: 'Republican Party',
    slug: 'republican-party',
    definition: [
      p('one of the two largest '),
      t('political parties', 'political-parties-ideology'),
      p(' in the United States (along with the '),
      g('Democratic Party', 'democratic-party'),
      p(') and the party currently in control of Congress and the Presidency. Most members are '),
      g('conservatives', 'conservatism'),
      p(' and '),
      g('right-wing', 'right-wing'),
      p('. Also called the Grand Old Party (or G.O.P.) and identified with the color red and the elephant.'),
    ],
  },
  {
    term: 'Right wing or right-wing',
    slug: 'right-wing',
    aliases: ['right wing', 'right-wing'],
    definition: [
      p('political views that are '),
      g('conservative', 'conservatism'),
      p(' or '),
      g('libertarian', 'libertarianism'),
      p('.'),
    ],
  },
  {
    term: 'Salary',
    slug: 'salary',
    definition: [
      p('the compensation received by members of government, including non-voting delegates from the U.S. territories and Washington D.C., and the resident commissioner from Puerto Rico.\n\nFor members of Congress, this amount has been steady since 2009 at $174,000 per year. The salary is higher for the President pro tempore of the Senate, and the Majority and Minority Leaders in the House of Representatives and the Senate ($193,400). It is highest for the Speaker of the House ($223,500).\n\nAs of 2026, the salary for Associate Justices of the Supreme Court is $306,600 per year. It is $320,700 per year for the Chief Justice.\n\nAs of 2026, the President’s salary is $400,000 per year. The Vice President’s effective salary is $235,1500 per year.'),
    ],
  },
  {
    term: 'Social conservative',
    slug: 'social-conservative',
    definition: [
      p('someone who holds traditional, usually religiously inspired, beliefs on certain issues like abortion, homosexuality, transgender rights, and the role of Christianity in public life.'),
    ],
  },
  {
    term: 'Social democracy',
    slug: 'social-democracy',
    aliases: ['social democrats', 'social democrat', 'social democratic'],
    definition: [
      p('a political philosophy that supports moderate '),
      g('socialism', 'socialism'),
      p('. Supporters are called social democrats and belong to the '),
      g('left wing', 'left-wing'),
      p(' of the '),
      g('Democratic Party', 'democratic-party'),
      p('.'),
    ],
  },
  {
    term: 'Socialism',
    slug: 'socialism',
    definition: [
      p('a political philosophy that is skeptical of the free-market, capitalist economy of the United States. Socialists want a much stronger government that provides very many public services and regularly guides the economy to be more fair. Moderate believers in socialism are called '),
      g('social democrats', 'social-democracy'),
      p('.'),
    ],
  },
  {
    term: 'Trifecta',
    slug: 'trifecta',
    definition: [
      p('the situation in which the President belongs to the same '),
      t('political party', 'political-parties-ideology'),
      p(' that holds a '),
      g('majority', 'majority-party'),
      p(' in both houses of '),
      t('Congress', 'congress-legislation'),
      p('. This usually makes passing laws faster and compromise less likely.'),
    ],
  },
];

// ─── Quick slug lookup ────────────────────────────────────────────────────────

export const glossaryBySlug: Record<string, GlossaryEntry> = {};
for (const entry of glossaryEntries) {
  glossaryBySlug[entry.slug] = entry;
}

// ─── parseRichText — for article body text ───────────────────────────────────
//
// Scans a plain string for glossary terms (→ red popup) and topic-link words
// (→ bold topic navigation), returning an array of GlossarySegments.
// Topic links take priority over glossary links for overlapping terms.
//
// The regex and map are built lazily on first call and cached.

type TermInfo =
  | { type: 'glossary'; slug: string }
  | { type: 'topic'; topicId: string };

/**
 * Bold words from the glossary that navigate to an education topic page.
 * Longer entries must come first so the alternation prefers them.
 */
const TOPIC_LINK_WORDS: { text: string; topicId: string }[] = [
  { text: 'House of Representatives', topicId: 'congress-legislation' },
  { text: 'U.S. Constitution',        topicId: 'the-constitution' },
  { text: 'political parties',        topicId: 'political-parties-ideology' },
  { text: 'political party',          topicId: 'political-parties-ideology' },
  { text: 'Constitution',             topicId: 'the-constitution' },
  { text: 'Congress',                 topicId: 'congress-legislation' },
  { text: 'Senate',                   topicId: 'congress-legislation' },
  { text: 'President',                topicId: 'how-government-works' },
  { text: 'budget',                   topicId: 'congress-legislation' },
  { text: 'party',                    topicId: 'political-parties-ideology' },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let _termMap: Map<string, TermInfo> | null = null;
let _termPatternSource: string | null = null;

function buildTermData() {
  const termMap = new Map<string, TermInfo>();
  const termStrings: string[] = [];

  const addGlossary = (text: string, slug: string) => {
    const key = text.toLowerCase();
    if (!termMap.has(key)) {
      termMap.set(key, { type: 'glossary', slug });
      termStrings.push(text);
    }
  };

  for (const entry of glossaryEntries) {
    addGlossary(entry.term, entry.slug);
    for (const alias of entry.aliases ?? []) {
      addGlossary(alias, entry.slug);
    }
  }

  // Topic links override glossary links for the same text
  for (const { text, topicId } of TOPIC_LINK_WORDS) {
    const key = text.toLowerCase();
    termMap.set(key, { type: 'topic', topicId });
    if (!termStrings.some((s) => s.toLowerCase() === key)) {
      termStrings.push(text);
    }
  }

  // Longest first → alternation prefers longer matches
  termStrings.sort((a, b) => b.length - a.length);
  _termPatternSource = `\\b(${termStrings.map(escapeRegex).join('|')})\\b`;
  _termMap = termMap;
}

/**
 * Parse a plain text string into GlossarySegments for inline rendering.
 *
 * @param text      The plain text to scan.
 * @param skipSlug  If set, skip glossary links whose slug equals this value
 *                  (used to avoid a term linking to its own definition page).
 */
export function parseRichText(text: string, skipSlug?: string): GlossarySegment[] {
  if (!_termMap || !_termPatternSource) buildTermData();
  const termMap = _termMap!;
  // Create a fresh RegExp each call so lastIndex starts at 0
  const pattern = new RegExp(_termPatternSource!, 'gi');

  const segments: GlossarySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: text.slice(lastIndex, match.index) });
    }

    const matched = match[0];
    const info = termMap.get(matched.toLowerCase());

    if (info) {
      if (info.type === 'glossary' && info.slug !== skipSlug) {
        segments.push({ type: 'glossary', text: matched, slug: info.slug });
      } else if (info.type === 'topic') {
        segments.push({ type: 'topic', text: matched, topicId: info.topicId });
      } else {
        // skipSlug matched — render as plain
        segments.push({ type: 'plain', text: matched });
      }
    } else {
      segments.push({ type: 'plain', text: matched });
    }

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'plain', text: text.slice(lastIndex) });
  }

  return segments;
}
