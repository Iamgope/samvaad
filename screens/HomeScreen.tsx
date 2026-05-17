import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { DebateHeadline } from '../components/DebateHeadline'
import { DebateCard } from '../components/DebateCard'
import { CategoryCard } from '../components/CategoryCard'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TRENDING_CARD_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2
const TOPIC_CARD_WIDTH    = (SCREEN_WIDTH - SCREEN_PADDING * 2 - spacing.sm * 3) / 2.95

type CategoryId = 'politics' | 'sports' | 'lit' | 'philosophy'

type Category = {
  id: CategoryId
  name: string
  icon: any
  accent: string
}

type TrendingDebate = {
  id: string
  category: CategoryId
  motion: string
  debating: number
  forVotes: number
  againstVotes: number
  lastArguer: { name: string; avatar: string }
  lastArgumentTime: string
}

type CuratedDebate = {
  id: string
  category: CategoryId
  motion: string
  debating: number
  forVotes: number
  againstVotes: number
  context?: string
  agreeCount: number
  disagreeCount: number
  unsureCount: number
  isNew?: boolean
  endsIn?: string
  whyDebate: string
  proTitle: string
  proBody: string
  conTitle: string
  conBody: string
}

// ─── DATA ─────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'politics', name: 'Politics', icon: require('../assets/politics_icon.png'), accent: colors.streak },
  { id: 'sports',   name: 'Sports',   icon: require('../assets/sports_icon.png'),   accent: '#38BDF8' },
  { id: 'lit',      name: 'Culture',  icon: require('../assets/art_icon.png'),      accent: colors.purple2 },
]

const TRENDING: TrendingDebate[] = [
  {
    id: 't1',
    category: 'politics',
    motion: 'Should India remove religion-based laws?',
    debating: 12400,
    forVotes: 7632,
    againstVotes: 5412,
    lastArguer: { name: 'Arjun V.', avatar: '🧔' },
    lastArgumentTime: '2h ago',
  },
  {
    id: 't2',
    category: 'sports',
    motion: 'Should cricket be added to the Olympics?',
    debating: 8200,
    forVotes: 5910,
    againstVotes: 2290,
    lastArguer: { name: 'Riya M.', avatar: '👩' },
    lastArgumentTime: '15m ago',
  },
  {
    id: 't3',
    category: 'lit',
    motion: 'Are translations betraying the originals?',
    debating: 4100,
    forVotes: 1820,
    againstVotes: 2280,
    lastArguer: { name: 'Kabir S.', avatar: '🧑' },
    lastArgumentTime: '1h ago',
  },
]

const CURATED: CuratedDebate[] = [
  {
    id: 'c1', category: 'politics',
    motion: 'Is democracy the best form of government?',
    context: 'Transfer of power controversies in the recent Bengal elections sparked a fresh wave of debate across the country. Allegations of booth capture, lopsided media coverage, and last-minute defections have left even long-time supporters questioning whether the process still works. International observers have weighed in on both sides, and a wave of opinion columns has reignited an older question about whether liberal democracy is a destination — or just one stop on a longer journey.',
    debating: 6100, forVotes: 3800, againstVotes: 2300,
    agreeCount: 2100, disagreeCount: 1400, unsureCount: 600,
    whyDebate: 'While democracy is celebrated as the gold standard of governance, critics argue it can be gridlocked, manipulated, or captured by populism — leaving many questioning whether it delivers on its promise of fair representation.',
    proTitle: 'Power belongs to the people',
    proBody: 'Democracy is the only system that holds leaders accountable through elections, enshrines individual rights, and adapts peacefully to change.',
    conTitle: 'Mob rule over merit',
    conBody: 'Elected majorities can suppress minorities, short-term voting cycles discourage long-term policy, and money often controls outcomes more than public will.',
  },
  {
    id: 'c2', category: 'lit',
    motion: 'Do we glorify violence in cinema too much?',
    context: "Back-to-back blockbusters this season pushed graphic content to new extremes, and streaming algorithms keep surfacing the bloodiest cuts to the top of every watch-next rail. Several state censor boards have flagged scenes that would have been cut outright a decade ago, while filmmakers argue the rating system itself has gone soft. Theatre owners report bigger turnouts for action-heavy fare even as parents' groups petition platforms to tighten age-gating. The conversation has spilled out of film criticism and into living rooms.",
    debating: 4300, forVotes: 2800, againstVotes: 1500, isNew: true,
    agreeCount: 1800, disagreeCount: 900, unsureCount: 340,
    whyDebate: 'Box-office data shows audiences flock to violent films, yet researchers and parents worry about desensitisation, especially as streaming puts this content in front of younger viewers with no friction.',
    proTitle: 'Art imitates a violent world',
    proBody: 'Cinema reflects reality. Sanitising violence strips stories of truth, stakes, and empathy — audiences are capable of distinguishing fiction from a call to action.',
    conTitle: 'Screen violence shapes behaviour',
    conBody: 'Repeated exposure normalises brutality, reduces empathy, and provides a template for real-world aggression — especially in adolescents still developing moral frameworks.',
  },
  {
    id: 'c3', category: 'sports',
    motion: 'Should athletes be political role models?',
    context: "Several cricketers backed opposing parties ahead of IPL, dividing fans and pundits.",
    debating: 3800, forVotes: 1600, againstVotes: 2200, endsIn: '3h',
    agreeCount: 980, disagreeCount: 1600, unsureCount: 520,
    whyDebate: "Athletes command massive audiences and cultural influence. Whether that platform comes with civic responsibilities — or whether mixing sport and politics alienates fans and endangers players — is hotly contested.",
    proTitle: 'Platform equals responsibility',
    proBody: 'Athletes who speak out have historically moved public opinion on civil rights, equality, and justice. Staying silent is itself a political choice that props up the status quo.',
    conTitle: 'Stick to sport',
    conBody: 'Fans come to sport for shared joy, not political division. Athletes risk their safety and livelihoods, and their influence rarely translates into meaningful policy change.',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────

const findCategory = (id: CategoryId): Category =>
  CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0]

// ─── HEADER ───────────────────────────────────────────────────────

function Header() {
  return (
    <View style={s.header}>
      <Text style={s.headerTitle}>Home</Text>
      <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
        <Text style={s.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── TRENDING SECTION ─────────────────────────────────────────────

const AUTOSCROLL_INTERVAL    = 4500
const AUTOSCROLL_RESUME_AFTER = 6000

function TrendingSection({
  debates,
  onJoin,
}: {
  debates: TrendingDebate[]
  onJoin: (id: string) => void
}) {
  const looped = [...debates, debates[0]]

  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef  = useRef<ScrollView>(null)
  const indexRef   = useRef(0)
  const pausedRef  = useRef(false)
  const isJumping  = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const jumpTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stride = TRENDING_CARD_WIDTH + spacing.sm

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current || isJumping.current) return
      const next = indexRef.current + 1
      if (next >= looped.length) return

      scrollRef.current?.scrollTo({ x: next * stride, animated: true })
      indexRef.current = next
      setActiveIndex(next % debates.length)

      if (next === looped.length - 1) {
        if (jumpTimer.current) clearTimeout(jumpTimer.current)
        jumpTimer.current = setTimeout(() => {
          isJumping.current = true
          scrollRef.current?.scrollTo({ x: 0, animated: false })
          indexRef.current = 0
          isJumping.current = false
        }, 420)
      }
    }, AUTOSCROLL_INTERVAL)

    return () => {
      clearInterval(interval)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      if (jumpTimer.current)   clearTimeout(jumpTimer.current)
    }
  }, [])

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isJumping.current) return
    const rawIndex = Math.round(e.nativeEvent.contentOffset.x / stride)
    if (rawIndex !== indexRef.current) {
      indexRef.current = rawIndex
      setActiveIndex(rawIndex % debates.length)
    }
  }

  const onTouchStart = () => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  const onScrollEndDrag = () => {
    if (indexRef.current === looped.length - 1) {
      isJumping.current = true
      scrollRef.current?.scrollTo({ x: 0, animated: false })
      indexRef.current = 0
      isJumping.current = false
    }
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { pausedRef.current = false }, AUTOSCROLL_RESUME_AFTER)
  }

  return (
    <View style={s.trendingSection}>
      <View style={s.sectionHeaderRow}>
        <Text variant="titleMd">Trending Debates</Text>
      </View>
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={stride}
          decelerationRate="fast"
          onScroll={onScroll}
          onTouchStart={onTouchStart}
          onScrollEndDrag={onScrollEndDrag}
          scrollEventThrottle={16}
          contentContainerStyle={s.trendingScrollContent}
        >
          {looped.map((d, i) => (
            <DebateCard
              key={`${d.id}-${i}`}
              motion={d.motion}
              debating={d.debating}
              forVotes={d.forVotes}
              againstVotes={d.againstVotes}
              categoryAccent={findCategory(d.category).accent}
              style={{ width: TRENDING_CARD_WIDTH }}
              onPress={() => onJoin(d.id)}
            />
          ))}
        </ScrollView>
        <View pointerEvents="none" style={s.pagerOverlay}>
          {debates.map((d, i) => (
            <View
              key={i}
              style={[s.pagerDot, i === activeIndex && { backgroundColor: findCategory(d.category).accent }]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

// ─── EXPLORE TOPICS ──────────────────────────────────────────────

function ExploreTopics({ onPress }: { onPress: (id: CategoryId) => void }) {
  return (
    <View style={s.exploreSection}>
      <Text style={s.sectionLabel}>Explore topics</Text>
      <View style={s.topicsRow}>
        {CATEGORIES.map((c, i) => (
          <CategoryCard
            key={c.id}
            name={c.name}
            icon={c.icon}
            accent={c.accent}
            delay={i * 250}
            outerStyle={{ width: TOPIC_CARD_WIDTH, aspectRatio: 1 }}
            onPress={() => onPress(c.id)}
          />
        ))}
      </View>
    </View>
  )
}

// ─── ACTION SECTION ──────────────────────────────────────────────

const ACTIONS = [
  {
    key:      'join',
    emoji:    '⚔️',
    title:    'Join a Debate',
    subtitle: 'Enter live public debates',
    accent:   '#38BDF8',
    primary:  true,
  },
  {
    key:      'persona',
    emoji:    '🎭',
    title:    'Debate Personas',
    subtitle: 'Argue the other side',
    accent:   colors.purple2,
    primary:  false,
  },
]

function ActionSection({ onPress }: { onPress: (key: string) => void }) {
  return (
    <View style={s.actionSection}>
      <Text style={s.sectionLabel}>Enter the arena</Text>
      <View style={s.actionRow}>
        {ACTIONS.map(a => (
          <TouchableOpacity
            key={a.key}
            style={[
              s.actionCard,
              {
                borderColor:     a.accent + '60',
                backgroundColor: a.accent + '12',
              },
            ]}
            onPress={() => onPress(a.key)}
            activeOpacity={0.8}
          >
            <View style={s.actionEmojiArea}>
              <Text style={s.actionEmoji}>{a.emoji}</Text>
            </View>
            <View style={s.actionTextArea}>
              <Text style={s.actionTitle}>{a.title}</Text>
              <Text style={s.actionSubtitle}>{a.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// ─── FOR YOU ─────────────────────────────────────────────────────

function ForYouSection({
  debates,
  onPress,
}: {
  debates: CuratedDebate[]
  onPress: (id: string) => void
}) {
  return (
    <View style={s.forYouSection}>
      <View style={s.forYouHeader}>
        <Text variant="titleMd">For you</Text>
        <Text variant="bodySm" tone="muted">Curated picks</Text>
      </View>
      {debates.map((d, i) => {
        const cat = findCategory(d.category)
        return (
          <View key={d.id}>
            <DebateHeadline
              motion={d.motion}
              context={d.context}
              categoryName={cat.name}
              categoryAccent={cat.accent}
              categoryIcon={cat.icon}
              agreeCount={d.agreeCount}
              disagreeCount={d.disagreeCount}
              unsureCount={d.unsureCount}
              headlineSize={20}
              onPress={() => onPress(d.id)}
            />
            {i < debates.length - 1 && <View style={s.headlineDivider} />}
          </View>
        )
      })}
    </View>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

type Props = {
  navigation: any
}

export default function HomeScreen({ navigation }: Props) {
  const handleJoin = (id: string) => {
    const debate = TRENDING.find(d => d.id === id)
    if (!debate) return
    navigation.navigate('Debate', {
      debateId: id,
      categoryId: debate.category,
      motion: debate.motion,
      debating: debate.debating,
    })
  }

  const handleCategoryPress = (id: CategoryId) => {
    navigation.navigate('TopicScreen', { category: id })
  }

  const handleCuratedPress = (id: string) => {
    const debate = CURATED.find(d => d.id === id)
    if (!debate) return
    const cat = findCategory(debate.category)
    navigation.navigate('DebateDetail', {
      debateId: id,
      categoryId: debate.category,
      categoryName: cat.name,
      categoryAccent: cat.accent,
      motion: debate.motion,
      context: debate.context,
      agreeCount: debate.agreeCount,
      disagreeCount: debate.disagreeCount,
      unsureCount: debate.unsureCount,
      whyDebate: debate.whyDebate,
      proTitle: debate.proTitle,
      proBody: debate.proBody,
      conTitle: debate.conTitle,
      conBody: debate.conBody,
    })
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <TrendingSection debates={TRENDING} onJoin={handleJoin} />
        <ExploreTopics onPress={handleCategoryPress} />
        <ActionSection onPress={(key) => { if (key === 'join') navigation.navigate('JoinDebate') }} />
        <ForYouSection debates={CURATED} onPress={handleCuratedPress} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.black },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.display.black,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.8,
  },
  bellBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 18 },

  // ── Section header (shared) ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.md,
  },

  // ── Trending ──
  trendingSection:      { marginBottom: spacing.xl },
  trendingScrollContent: { paddingHorizontal: SCREEN_PADDING, gap: spacing.sm },
  pagerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  pagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // ── Explore topics ──
  exploreSection: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  topicsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  // ── Action section ──
  actionSection: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  actionEmojiArea: {
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionTextArea: {
    alignItems: 'center',
    gap: 3,
  },
  actionTitle: {
    fontFamily: fonts.display.black,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  actionSubtitle: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
  // ── For you ──
  forYouSection: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  headlineDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
})
