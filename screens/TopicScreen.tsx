import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ChevronLeftIcon } from '../components/Icons'
import { ChipDropdown, type ChipOption } from '../components/ChipDropdown'
import { DebateHeroCard } from '../components/DebateHeroCard'
import { DebateHeadline } from '../components/DebateHeadline'

type CategoryId = 'politics' | 'sports' | 'lit' | 'philosophy'

type Category = {
  id: CategoryId
  name: string
  icon: any
  emoji: string
  accent: string
  debatesLive: number
}

type DebateItem = {
  id: string
  emoji: string
  motion: string
  context: string
  debating: number
  forVotes: number
  againstVotes: number
  categoryTag: string
  isNew?: boolean
  endsIn?: string
  xpReward: number
  whyDebate: string
  proTitle: string
  proBody: string
  conTitle: string
  conBody: string
}

// ─── DATA ─────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'politics',
    name: 'Politics',
    icon: require('../assets/politics_icon.png'),
    emoji: '🏛️',
    accent: colors.streak,
    debatesLive: 43,
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: require('../assets/sports_icon.png'),
    emoji: '🏆',
    accent: '#38BDF8',
    debatesLive: 67,
  },
  {
    id: 'lit',
    name: 'Culture',
    icon: require('../assets/art_icon.png'),
    emoji: '🎭',
    accent: colors.purple2,
    debatesLive: 28,
  },
]

const DEBATES: Record<string, DebateItem[]> = {
  politics: [
    {
      id: 'p1', emoji: '🏛️', motion: 'Should India remove religion-based laws?',
      context: 'Personal laws still differ by religion for marriage and inheritance, and the Uniform Civil Code debate resurfaces every election cycle.',
      debating: 12400, forVotes: 7632, againstVotes: 5412, categoryTag: 'Governance', xpReward: 120,
      whyDebate: 'Citizens live under different personal-law regimes, raising the question of equality before the law versus the protection of religious freedoms.',
      proTitle: 'One nation, one law', proBody: 'A single civil code puts every citizen under the same marriage, divorce, and inheritance rules, reinforcing equality and removing structural unfairness.',
      conTitle: 'Pluralism is a feature', conBody: "India's strength lies in accommodating different communities. A forced uniform code risks erasing minority traditions and inflaming communal tension.",
    },
    {
      id: 'p2', emoji: '🗳️', motion: 'Is NOTA a meaningful political statement?',
      context: 'NOTA lets voters formally reject every candidate, but with no binding effect critics call it a symbolic protest at best.',
      debating: 4200, forVotes: 2100, againstVotes: 2100, categoryTag: 'Democracy', isNew: true, xpReward: 55,
      whyDebate: 'NOTA gives voice to dissatisfaction, but without consequences for the winners many ask whether it changes anything at all.',
      proTitle: 'Dissent deserves a ballot', proBody: 'NOTA records formal disapproval, pressures parties to field better candidates, and gives disillusioned voters a reason to still show up.',
      conTitle: 'A vote that does nothing', conBody: 'With no re-election trigger, NOTA is purely symbolic — it splits the protest vote and lets the same candidates win anyway.',
    },
    {
      id: 'p3', emoji: '📋', motion: 'Should voting be mandatory in India?',
      context: 'Turnout swings outcomes, and some argue compulsory voting would make mandates fairer — others see plain coercion.',
      debating: 6800, forVotes: 4200, againstVotes: 2600, categoryTag: 'Civics', xpReward: 80,
      whyDebate: 'Low and uneven turnout can hand power to motivated minorities, prompting the question of whether participation should be a duty, not a choice.',
      proTitle: 'Fuller mandates, fairer results', proBody: 'Compulsory voting produces governments that reflect the whole electorate, not just the most organised or angry slice of it.',
      conTitle: 'Freedom includes abstaining', conBody: 'Forcing the indifferent to vote adds noise, not legitimacy, and the right not to participate is itself a democratic freedom.',
    },
    {
      id: 'p4', emoji: '📱', motion: 'Can democracy survive social media?',
      context: 'Algorithmic feeds, misinformation, and micro-targeting are reshaping how citizens form political opinions.',
      debating: 3900, forVotes: 1800, againstVotes: 2100, categoryTag: 'Tech & Pol', endsIn: '2h', xpReward: 45,
      whyDebate: 'Platforms now mediate political reality for billions, raising fears that engagement-driven feeds reward outrage over truth.',
      proTitle: 'A new public square', proBody: 'Social media lowers the barrier to organise, hold power to account, and give unheard communities a direct megaphone.',
      conTitle: 'Engineered for outrage', conBody: 'Algorithms optimise for division, misinformation spreads faster than corrections, and micro-targeting quietly distorts the vote.',
    },
    {
      id: 'p5', emoji: '⚖️', motion: 'Should India adopt a uniform civil code?',
      context: 'One common code for marriage, divorce, and inheritance across all communities — equality, or cultural erasure?',
      debating: 9100, forVotes: 5200, againstVotes: 3900, categoryTag: 'Law', xpReward: 95,
      whyDebate: 'A UCC promises legal equality across communities, but opponents see it as flattening the diversity the Constitution protects.',
      proTitle: 'Equal rules for all', proBody: 'A uniform code ends gendered and community-based disparities in family law and treats every citizen identically.',
      conTitle: 'Diversity is constitutional', conBody: 'Personal laws reflect lived traditions; a top-down code risks majoritarian overreach and erodes minority protections.',
    },
  ],
  sports: [
    {
      id: 's1', emoji: '🏏', motion: 'Should cricket be added to the Olympics?',
      context: 'With LA 2028 opening the door to a short-format event, boards and broadcasters are weighing whether cricket should accept.',
      debating: 8247, forVotes: 5910, againstVotes: 2290, categoryTag: 'Cricket', xpReward: 85,
      whyDebate: 'Cricket commands billions of fans but the Olympics has long resisted formats it sees as logistically heavy, reopening old questions of prestige and scheduling.',
      proTitle: 'A global stage', proBody: 'Olympic inclusion pushes cricket into new markets and unlocks funding, infrastructure, and visibility for smaller cricketing nations.',
      conTitle: 'Wrong format, wrong moment', conBody: 'Calendars are overcrowded, boards will not pause their leagues, and a rushed T20 event risks watering down both Olympic and cricketing prestige.',
    },
    {
      id: 's2', emoji: '📺', motion: 'Should social media algorithms be regulated?',
      context: 'Recommendation engines shape what billions see daily, reigniting calls for oversight and transparency.',
      debating: 12100, forVotes: 6600, againstVotes: 5500, categoryTag: 'Tech & Society', xpReward: 65,
      whyDebate: 'A handful of opaque ranking systems decide what the world reads and watches, raising the question of who should answer for their effects.',
      proTitle: 'Accountability for reach', proBody: 'Mandated transparency and audits would curb amplified harm, dark patterns, and the unchecked spread of misinformation.',
      conTitle: 'Regulation chills speech', conBody: 'Government control of ranking invites censorship, entrenches incumbents, and rarely keeps pace with how the tech actually works.',
    },
    {
      id: 's3', emoji: '🎨', motion: 'Is AI art real art?',
      context: 'Generative tools can produce gallery-grade images in seconds, forcing a rethink of authorship and craft.',
      debating: 8300, forVotes: 3320, againstVotes: 4980, categoryTag: 'Culture & Tech', xpReward: 75,
      whyDebate: 'When a prompt yields a finished image, it challenges what we mean by skill, intent, and authorship in art.',
      proTitle: 'A new brush', proBody: 'Tools have always extended artists; the vision, curation, and intent behind a generated piece are still human creative acts.',
      conTitle: 'Craft cannot be skipped', conBody: 'Art is inseparable from the labour and choices of making it — outsourcing that to a model produces output, not expression.',
    },
    {
      id: 's4', emoji: '🏏', motion: 'Should cricket adopt a 40-over format?',
      context: 'A proposed middle format sits between the patience of ODIs and the chaos of T20 — purists are split.',
      debating: 15200, forVotes: 9880, againstVotes: 5320, categoryTag: 'Sports', xpReward: 50,
      whyDebate: 'As attention spans shrink and T20 dominates, boards weigh whether a 40-over game can revive the middle ground.',
      proTitle: 'The best of both', proBody: 'Forty overs keeps strategic depth while trimming the dead middle of an ODI, fitting a tighter broadcast window.',
      conTitle: 'Another gimmick format', conBody: 'A new format fragments the calendar and dilutes records without solving anything the existing formats do better.',
    },
    {
      id: 's5', emoji: '💰', motion: 'Is money ruining the spirit of sport?',
      context: 'Franchise leagues and record auctions pour cash into the game, but some say its soul is being sold off.',
      debating: 4900, forVotes: 2700, againstVotes: 2200, categoryTag: 'Sports', isNew: true, xpReward: 60,
      whyDebate: 'Unprecedented money has professionalised sport but also reshaped loyalties, schedules, and what winning means.',
      proTitle: 'Investment lifts the game', proBody: 'Money funds grassroots, pays athletes fairly, and raises the standard of competition and broadcast for fans everywhere.',
      conTitle: 'Loyalty for sale', conBody: 'When franchises and auctions decide everything, clubs, traditions, and fan ties become tradable assets rather than identities.',
    },
  ],
  lit: [
    {
      id: 'l1', emoji: '📖', motion: 'Are translations betraying the originals?',
      context: 'As translated film and literature go mainstream, the faithful-vs-localised argument has flared up again.',
      debating: 4100, forVotes: 1820, againstVotes: 2280, categoryTag: 'Literature', xpReward: 60,
      whyDebate: 'Translation has become a mass-market product, reviving the old question of how much of an original survives the move to a new language.',
      proTitle: 'Reinvention, not theft', proBody: 'A skilled translator carries voice, rhythm, and context across; without them, world literature would reach only a tiny elite.',
      conTitle: 'Something is always lost', conBody: 'Metaphor, dialect, and rhyme rarely survive intact, and many translations smooth over difficulty in ways that flatten intent.',
    },
    {
      id: 'l2', emoji: '📽️', motion: 'Is literary fiction becoming irrelevant?',
      context: 'Streaming and short-form attention spans have publishers asking whether serious fiction still finds readers.',
      debating: 2800, forVotes: 1400, againstVotes: 1400, categoryTag: 'Culture', isNew: true, xpReward: 40,
      whyDebate: 'As screens compete for every spare minute, the cultural weight once held by the novel is openly in question.',
      proTitle: 'Depth still matters', proBody: 'Literary fiction does what feeds cannot — sustained attention, moral complexity, and language that rewards rereading.',
      conTitle: 'The form has faded', conBody: 'Audiences have moved to film, games, and serialised stories; clinging to the novel mistakes nostalgia for relevance.',
    },
    {
      id: 'l3', emoji: '🎬', motion: 'Do we glorify violence in cinema too much?',
      context: 'Back-to-back blockbusters pushed graphic content to new extremes, and censor boards are flagging more scenes.',
      debating: 4300, forVotes: 2600, againstVotes: 1700, categoryTag: 'Cinema', xpReward: 55,
      whyDebate: 'Audiences flock to violent films even as researchers and parents worry about desensitisation, especially among younger viewers.',
      proTitle: 'Art reflects a violent world', proBody: 'Sanitising violence strips stories of truth and stakes; audiences can distinguish fiction from a call to action.',
      conTitle: 'Screens shape behaviour', conBody: 'Repeated exposure normalises brutality and offers a template for aggression, particularly for still-developing minds.',
    },
    {
      id: 'l4', emoji: '🤖', motion: 'Should AI-generated art be shown in galleries?',
      context: 'Curators are split on whether machine-made pieces belong alongside human work on gallery walls.',
      debating: 5100, forVotes: 2200, againstVotes: 2900, categoryTag: 'AI & Art', endsIn: '6h', xpReward: 70,
      whyDebate: 'Galleries confer legitimacy; admitting generated work forces a decision about what counts as art worth exhibiting.',
      proTitle: 'Galleries should evolve', proBody: 'New media have always entered galleries late; exhibiting AI work documents a real and important shift in culture.',
      conTitle: 'Wall space is a verdict', conBody: 'Showing generated images as equals devalues the labour of human artists and rewards prompting over practice.',
    },
  ],
  philosophy: [
    {
      id: 'ph1', emoji: '🤖', motion: 'Will AI make humans irrelevant?',
      context: 'As models match humans on more tasks, the question of lasting human purpose grows louder.',
      debating: 8700, forVotes: 4500, againstVotes: 4200, categoryTag: 'Tech & Phil', xpReward: 90,
      whyDebate: 'Each capability AI absorbs reopens the question of what, if anything, remains distinctly and necessarily human.',
      proTitle: 'Automation hollows us out', proBody: 'As machines outperform us economically and creatively, human labour and judgement risk becoming optional.',
      conTitle: 'Tools amplify, not replace', conBody: 'Every technology has shifted human work upward; meaning, care, and choice remain ours to define.',
    },
    {
      id: 'ph2', emoji: '🧠', motion: 'Is free will an illusion?',
      context: 'Neuroscience keeps chipping away at the idea that our choices are truly our own.',
      debating: 6200, forVotes: 3100, againstVotes: 3100, categoryTag: 'Philosophy', isNew: true, xpReward: 70,
      whyDebate: 'If brain states precede conscious decisions, the everyday sense of authorship over our actions comes under strain.',
      proTitle: 'Choice is real', proBody: 'Deliberation, responsibility, and changing our minds are lived facts no lab result has actually explained away.',
      conTitle: 'Determined all the way down', conBody: 'Our decisions are the product of prior causes we did not choose; the feeling of freedom is just the story we tell after.',
    },
    {
      id: 'ph3', emoji: '🙏', motion: 'Can morality exist without religion?',
      context: 'Secular societies test whether shared ethics can hold without a divine anchor.',
      debating: 5400, forVotes: 2900, againstVotes: 2500, categoryTag: 'Ethics', xpReward: 65,
      whyDebate: 'As belief declines in many societies, the source and stability of shared moral norms is openly contested.',
      proTitle: 'Ethics stands on its own', proBody: 'Empathy, reason, and social cooperation ground morality without needing a deity to enforce it.',
      conTitle: 'Values need a foundation', conBody: 'Without a transcendent anchor, critics argue, moral claims drift into preference and lose their binding force.',
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

const forPctOf = (d: DebateItem): number => {
  const total = d.forVotes + d.againstVotes
  return total > 0 ? Math.round((d.forVotes / total) * 100) : 50
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

type Props = {
  navigation: any
  route: any
}

export default function TopicScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets()
  const initial: CategoryId = route.params?.category ?? 'sports'

  const chipOptions: ChipOption[] = CATEGORIES.map(c => ({
    id: c.id,
    label: c.name,
    emoji: c.emoji,
    accent: c.accent,
  }))

  const [selectedChip, setSelectedChip] = React.useState<ChipOption>(
    chipOptions.find(o => o.id === initial) ?? chipOptions[0]
  )

  const activeCategoryId = selectedChip.id as CategoryId
  const cat = CATEGORIES.find(c => c.id === activeCategoryId) ?? CATEGORIES[0]
  const debates = DEBATES[activeCategoryId] ?? []
  const [featured, ...rest] = debates

  const openDebate = (id: string) => {
    const d = debates.find(x => x.id === id)
    if (!d) return
    navigation.navigate('DebateDetail', {
      debateId: d.id,
      categoryId: activeCategoryId,
      categoryName: cat.name,
      categoryAccent: cat.accent,
      motion: d.motion,
      context: d.context,
      agreeCount: d.forVotes,
      disagreeCount: d.againstVotes,
      unsureCount: Math.round((d.forVotes + d.againstVotes) * 0.1),
      whyDebate: d.whyDebate,
      proTitle: d.proTitle,
      proBody: d.proBody,
      conTitle: d.conTitle,
      conBody: d.conBody,
    })
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header: back + category switcher ── */}
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          accent={colors.text}
          onPress={() => navigation.goBack()}
        />
        <ChipDropdown
          selected={selectedChip}
          options={chipOptions}
          onSelect={setSelectedChip}
          accent={cat.accent}
        />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <View style={s.titleBlock}>
          <Text style={s.title}>{cat.name}</Text>
        </View>

        {/* ── Debate of the Day ── */}
        {featured && (
          <View style={s.heroSection}>
            <DebateHeroCard
              motion={featured.motion}
              categoryName={featured.categoryTag}
              categoryAccent={cat.accent}
              height={272}
              motionSize={26}
              onPress={() => openDebate(featured.id)}
              footer={
                <Text style={s.heroMeta}>
                  {formatCount(featured.debating)} debating · {forPctOf(featured)}% for
                </Text>
              }
            />
          </View>
        )}

        {/* ── Popular list ── */}
        {rest.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Popular Today</Text>
            {rest.map((d, i) => (
              <View key={d.id}>
                <DebateHeadline
                  motion={d.motion}
                  context={d.context}
                  categoryName={cat.name}
                  categoryAccent={cat.accent}
                  categoryIcon={cat.icon}
                  headlineSize={17}
                  onPress={() => openDebate(d.id)}
                  footer={
                    <Text style={s.headlineMeta}>
                      {formatCount(d.forVotes)} for · {formatCount(d.againstVotes)} against
                      {d.isNew ? '  ·  NEW' : ''}
                      {d.endsIn ? `  ·  ends in ${d.endsIn}` : ''}
                    </Text>
                  }
                />
                {i < rest.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Fixed bottom CTA ── */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label={`Find a ${cat.name} opponent`}
          variant="steel"
          size="md"
          onPress={() => navigation.navigate('JoinDebate', { categoryAccent: cat.accent })}
          style={s.cta}
        />
      </View>
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 110,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    zIndex: 20,
  },

  // ── Title ──
  titleBlock: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display.black,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.8,
  },

  // ── Sections ──
  heroSection: {
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 13,
    color: colors.text,
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  heroMeta: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // ── Popular list (SearchScreen-style stacked headlines) ──
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  headlineMeta: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textMuted,
  },

  // ── Fixed bottom CTA ──
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
    backgroundColor: colors.black,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cta: {
    width: '100%',
  },
})
