# Post ideas

Candidates for automated post templates, to narrow down to about 5–6. The
ones marked **built** have a prototype in `prototypes/templates.mjs`, filled
with real data; render them with `prototypes/build.mjs` and review
`prototypes/out/index.html`.

## Design rules

Taken from the hand-made Bill of the Day posts in `templates/bill-of-the-day/`.

- **Canvas.** 1000 × 1250 on paper `#f4f1eb`. The visual sits in the top 748px;
  the editorial stack fills the bottom 502px.
- **Cards.** `#fafafa`, 24px radius, a 69px blue (`#008cff`) header bar with
  a DM Mono uppercase label, and the two-sided drop shadow.
- **Kicker.** DM Mono 24px: blue label, black ID (`BILL OF THE DAY : S.4668`).
- **Headline.** Fraunces 48px bold. Connecting words gray `#535353`; the key
  phrase black and heavy (900, 52px); member names blue `#1741ff`; passed /
  agreed green `#21954a`; failed / rejected red `#d45252`, vote counts included.
- **Body.** DM Mono 24px gray.
- **Footer.** Black hairlines either side of the logo and "UNUM" (DM Mono 32px,
  3.2px tracking).
- **Party colors only in vote and seat data.** Democratic `#008cff`,
  Republican `#d45252`, Independent `#faea70`. Never decoration.
- **Nonpartisan wording.** Say what happened ("passed 216–212"), never whether
  it was good. Name members by title, party, state, and district.
- **Long text shrinks to fit.** The headline and body scale down together so
  nothing overflows when real data runs long.

## Bills

| Idea | Status | Posts when |
|---|---|---|
| Bill of the Day: new bill + sponsor | built | Daily, from `featuredBills.json` |
| Bill of the Day: passed a chamber | built | A featured bill gets a passage vote |
| Signed Into Law | built | A bill becomes public law |
| New Laws roundup | built | Several laws signed at once |
| Next Stop (where a bill goes next) | built | A bill passes one chamber |
| Bill Tracker (follow-ups) | built | Weekly, for bills posted before |
| Vetoed | not built | A veto (none in the data to prototype with) |
| Most Cosponsored | not built | Weekly |
| Policy Area Spotlight | not built | Weekly, rotating areas |

## Votes

| Idea | Status | Posts when |
|---|---|---|
| Vote breakdown by party | built | Notable votes |
| Closest Vote | built | Weekly |
| Majority, but not enough (two-thirds) | built | A supermajority vote fails with a majority |
| Unanimous Vote | built | A vote with no nays |
| Bipartisan Vote | built | Majorities of both parties agree |
| Crossover Votes | built | Members split from most of their party |

Votes are House only for now: the Clerk's XML has every member's position.
Senate roll calls would need the Senate's own XML feed.

## Weekly and numbers

| Idea | Status | Posts when |
|---|---|---|
| Week in Congress | built | Weekly while in session |
| By the Numbers | built | Every two weeks or on milestones |
| Seats in Congress | built | Monthly, or when a seat changes |
| Busiest Policy Areas | not built | Monthly |

## Members

| Idea | Status | Posts when |
|---|---|---|
| Member Spotlight | built | Weekly, rotating |
| State Delegation | built | Weekly, cycling through states |
| New Members | built | A member is sworn in |
| Most Active Sponsors | not built | Weekly |
| Find Your Representative (promo) | not built | Occasional |

## Election series

From the election ideas: district spotlights, ballot explainers, deadline
countdowns, and post-election explainers. A suggested mix is 3 Bill of the
Day + 2 election-series posts a week.

| Idea | Status | Posts when |
|---|---|---|
| District Spotlight | built | Weekly to Election Day, one notable race |
| What's on Your Ballot | built | Once or twice before Election Day |
| Election Countdown | built | Daily or at milestones |
| Registration Deadline | built, **sample data** | Per state, before its deadline |
| What a Majority Controls | built | After the election |

- **District Spotlight** shows only the incumbent's record (committees, bills,
  positions on a fixed set of high-profile votes, the same set for every
  district) and no commentary on who should win. Which races count as
  "notable" is an editorial pick; nothing in the data ranks competitiveness.
- **Registration Deadline** needs a state-by-state deadline source. The app
  only links to vote.org; nothing in the repo stores deadlines.
- **What's on Your Ballot** uses facts that change each cycle (35 Senate
  seats, 36 governors in 2026). Check them before posting.

## Civics

| Idea | Status | Posts when |
|---|---|---|
| Term of the Week | built | Weekly, tied to the news |
| Bill Types Explained | built | One-off, pinned |
| How a Bill Becomes Law | built | One-off, pinned |
| Civics Quiz (2 slides) | built | Weekly |
| Did You Know | built | Weekly, from the civics guide |
| This Day in Congress | not built | Daily; needs a historical query |
