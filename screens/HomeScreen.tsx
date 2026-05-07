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
const TOPIC_CARD_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - spacing.sm * 3) / 2.95

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
    context: 'Transfer of power controversies in Bengal elections sparked a fresh wave of debate.',
    debating: 6100, forVotes: 3800, againstVotes: 2300,
    agreeCount: 2100, disagreeCount: 1400, unsureCount: 600,
  },
  {
    id: 'c2', category: 'lit',
    motion: 'Do we glorify violence in cinema too much?',
    context: 'Back-to-back blockbusters this season pushed graphic content to new extremes.',
    debating: 4300, forVotes: 2800, againstVotes: 1500, isNew: true,
    agreeCount: 1800, disagreeCount: 900, unsureCount: 340,
  },
  {
    id: 'c3', category: 'sports',
    motion: 'Should athletes be political role models?',
    context: "Several cricketers backed opposing parties ahead of IPL, dividing fans and pundits.",
    debating: 3800, forVotes: 1600, againstVotes: 2200, endsIn: '3h',
    agreeCount: 980, disagreeCount: 1600, unsureCount: 520,
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
      <Text variant="titleMd">Explore Topics</Text>
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
              isNew={d.isNew}
              endsIn={d.endsIn}
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
    navigation.navigate('Debate', {
      debateId: id,
      categoryId: debate.category,
      motion: debate.motion,
      debating: debate.debating,
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
