import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'

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
}

// ─── DATA ─────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'politics', name: 'Politics',     icon: require('../assets/politics_icon.png'), accent: colors.streak },
  { id: 'sports',   name: 'Sports',       icon: require('../assets/sports_icon.png'),   accent: '#A855F7' },
  { id: 'lit',      name: 'Lit & Beyond', icon: require('../assets/art_icon.png'),      accent: colors.purple2 },
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
  { id: 'c1', category: 'politics', motion: 'Is democracy the best form of government?', debating: 6100 },
  { id: 'c2', category: 'lit',      motion: 'Do we glorify violence in cinema too much?', debating: 4300 },
  { id: 'c3', category: 'sports',   motion: 'Should athletes be political role models?',  debating: 3800 },
]

// ─── HELPERS ──────────────────────────────────────────────────────

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

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

// ─── TRENDING DEBATE CARD ────────────────────────────────────────

function TrendingCard({
  debate,
  onJoin,
}: {
  debate: TrendingDebate
  onJoin: (id: string) => void
}) {
  const total = debate.forVotes + debate.againstVotes
  const forPct = (debate.forVotes / total) * 100
  const againstPct = (debate.againstVotes / total) * 100
  const forStronger = debate.forVotes > debate.againstVotes
  const diff = Math.abs(debate.forVotes - debate.againstVotes)
  const diffPct = Math.round((diff / total) * 100)

  return (
    <View style={s.trendingCard}>
      <View style={s.hotLabelRow}>
        <Text style={s.hotIcon}>🔥</Text>
        <Text style={s.hotLabel} tone="danger">Hot Debate</Text>
      </View>

      <Text variant="titleLg" style={{ marginBottom: spacing.md }} numberOfLines={2}>
        {debate.motion}
      </Text>

      <View style={s.debatingRow}>
        <View style={s.avatarStack}>
          <View style={[s.stackAvatar, { backgroundColor: colors.streak, left: 0 }]} />
          <View style={[s.stackAvatar, { backgroundColor: '#A855F7',     left: 14 }]} />
          <View style={[s.stackAvatar, { backgroundColor: colors.red,    left: 28 }]} />
        </View>
        <Text style={s.debatingText} tone="muted">{formatCount(debate.debating)} debating</Text>
      </View>

      <View style={s.voteRow}>
        <View style={[s.voteBox, s.voteBoxFor]}>
          <Text style={s.voteLabel} tone="accent">For</Text>
          <Text style={s.voteCount}>{debate.forVotes.toLocaleString()}</Text>
          <Text style={s.voteHint} tone="accent">
            {forStronger ? `Stronger by ${diffPct}%` : `Needs ${diff.toLocaleString()} to catch up`}
          </Text>
          <View style={s.voteBarTrack}>
            <View style={[s.voteBarFill, { width: `${forPct}%`, backgroundColor: colors.lime }]} />
          </View>
        </View>

        <View style={s.vsBubble}>
          <Text style={s.vsBubbleText} tone="muted">vs</Text>
        </View>

        <View style={[s.voteBox, s.voteBoxAgainst]}>
          <Text style={s.voteLabel} tone="danger">Against</Text>
          <Text style={s.voteCount}>{debate.againstVotes.toLocaleString()}</Text>
          <Text style={s.voteHint} tone="danger">
            {!forStronger ? `Stronger by ${diffPct}%` : `Needs ${diff.toLocaleString()} to catch up`}
          </Text>
          <View style={s.voteBarTrack}>
            <View style={[s.voteBarFill, { width: `${againstPct}%`, backgroundColor: colors.red }]} />
          </View>
        </View>
      </View>
    </View>
  )
}

const AUTOSCROLL_INTERVAL = 4500
const AUTOSCROLL_RESUME_AFTER = 6000

function TrendingSection({
  debates,
  onJoin,
}: {
  debates: TrendingDebate[]
  onJoin: (id: string) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const indexRef = useRef(0)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stride = TRENDING_CARD_WIDTH + spacing.sm

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return
      const next = (indexRef.current + 1) % debates.length
      indexRef.current = next
      setActiveIndex(next)
      scrollRef.current?.scrollTo({ x: next * stride, animated: true })
    }, AUTOSCROLL_INTERVAL)
    return () => {
      clearInterval(interval)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [debates.length, stride])

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x
    const index = Math.round(offset / stride)
    if (index !== indexRef.current) {
      indexRef.current = index
      setActiveIndex(index)
    }
  }

  const onTouchStart = () => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }
  const onScrollEndDrag = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false
    }, AUTOSCROLL_RESUME_AFTER)
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
          {debates.map(d => (
            <TrendingCard key={d.id} debate={d} onJoin={onJoin} />
          ))}
        </ScrollView>
        <View pointerEvents="none" style={s.pagerOverlay}>
          {debates.map((_, i) => (
            <View
              key={i}
              style={[s.pagerDot, i === activeIndex && s.pagerDotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

// ─── EXPLORE TOPICS ──────────────────────────────────────────────

function TopicCard({
  category,
  onPress,
  delay,
}: {
  category: Category
  onPress: (id: CategoryId) => void
  delay: number
}) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    )
    const t = setTimeout(() => pulseLoop.start(), delay)
    return () => {
      clearTimeout(t)
      pulseLoop.stop()
    }
  }, [pulse, delay])

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.3] })
  const innerScale  = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] })

  return (
    <TouchableOpacity
      style={[s.topicCard, { backgroundColor: category.accent + '22' }]}
      onPress={() => onPress(category.id)}
      activeOpacity={0.85}
    >
      {/* Hemisphere bloom — circle clipped by overflow:hidden so only top half shows */}
      <Animated.View
        style={[
          s.topicHemisphere,
          {
            backgroundColor: category.accent,
            opacity: glowOpacity,
            transform: [{ scale: innerScale }],
          },
        ]}
      />
      <View style={[s.sparkle, s.sparkleTopRight]} />
      <View style={[s.sparkle, s.sparkleSm, s.sparkleTopLeft]} />

      <View style={s.topicIconWrap} pointerEvents="none">
        <Image source={category.icon} style={s.topicIcon} resizeMode="contain" />
      </View>

      <Text style={s.topicName} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  )
}

function ExploreTopics({ onPress }: { onPress: (id: CategoryId) => void }) {
  return (
    <View style={s.exploreSection}>
      <Text variant="titleMd">Explore Topics</Text>
      <View style={s.topicsRow}>
        {CATEGORIES.map((c, i) => (
          <TopicCard key={c.id} category={c} onPress={onPress} delay={i * 250} />
        ))}
      </View>
    </View>
  )
}

// ─── FOR YOU ─────────────────────────────────────────────────────

function CuratedRow({
  debate,
  onPress,
}: {
  debate: CuratedDebate
  onPress: (id: string) => void
}) {
  const cat = findCategory(debate.category)
  return (
    <TouchableOpacity
      style={s.curatedRow}
      onPress={() => onPress(debate.id)}
      activeOpacity={0.7}
    >
      <View style={[s.curatedIconWrap, { backgroundColor: cat.accent + '22' }]}>
        <Image source={cat.icon} style={s.curatedIcon} resizeMode="contain" />
      </View>
      <View style={s.curatedBody}>
        <Text style={s.curatedMotion} numberOfLines={2}>
          {debate.motion}
        </Text>
        <Text variant="caption" tone="subtle">{formatCount(debate.debating)} debating</Text>
      </View>
      <TouchableOpacity style={s.bookmarkBtn} activeOpacity={0.6}>
        <Text style={s.bookmarkIcon}>🔖</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

function ForYouSection({
  debates,
  onPress,
}: {
  debates: CuratedDebate[]
  onPress: (id: string) => void
}) {
  return (
    <View style={s.forYouSection}>
      <Text variant="titleMd">For you</Text>
      <Text variant="bodySm" tone="muted" style={{ marginTop: 4, marginBottom: spacing.md }}>
        Curated debates based on your interests
      </Text>
      <View style={s.curatedList}>
        {debates.map((d, i) => (
          <View key={d.id}>
            <CuratedRow debate={d} onPress={onPress} />
            {i < debates.length - 1 && <View style={s.curatedDivider} />}
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

type Props = {
  navigation: any
}

export default function HomeScreen({ navigation }: Props) {
  const handleJoin = (id: string) => {
    navigation.navigate('Debate', { debateId: id })
  }

  const handleCategoryPress = (id: CategoryId) => {
    navigation.navigate('Debate', { category: id })
  }

  const handleCuratedPress = (id: string) => {
    navigation.navigate('Debate', { debateId: id })
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
  bellBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  trendingSection: {
    marginBottom: spacing.xl,
  },
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
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pagerDotActive: {
    backgroundColor: colors.red,
    width: 24,
  },
  trendingScrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
  },
  trendingCard: {
    width: TRENDING_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    paddingBottom: spacing.lg + 14, // room for pager dots overlaid at bottom
  },
  hotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  hotIcon:  { fontSize: 14 },
  hotLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
  },
  debatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarStack: {
    width: 56,
    height: 22,
    marginRight: spacing.sm,
    position: 'relative',
  },
  stackAvatar: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  debatingText: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13,
  },

  voteRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.lg,
  },
  voteBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  voteBoxFor:     { borderColor: colors.lime + '66' },
  voteBoxAgainst: { borderColor: colors.red  + '66' },
  voteLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    marginBottom: 4,
  },
  voteCount: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  voteHint: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  voteBarTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  vsBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: -8,
    zIndex: 2,
  },
  vsBubbleText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
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
  topicCard: {
    width: TOPIC_CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 2,
    paddingBottom: spacing.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // Circle clipped by overflow:hidden — only top half shows, reads as a colored
  // glow rising from behind the icon.
  topicHemisphere: {
    position: 'absolute',
    top: '55%',
    alignSelf: 'center',
    width: '140%',
    aspectRatio: 1.1,
    borderRadius: 999,
  },
  topicIconWrap: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: '95%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIcon: {
    width: '180%',
    height: '180%',
  },
  topicName: {
    fontFamily: fonts.display.bold,
    fontSize: 10,
    opacity: 0.8,
    color: colors.text,
    letterSpacing: -0.1,
    textAlign: 'left',
    lineHeight: 14,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  sparkleSm: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.55,
  },
  sparkleTopRight: { top: 12, right: 10 },
  sparkleTopLeft:  { top: 22, left: 8 },

  // ── For you ──
  forYouSection: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  curatedList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  curatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  curatedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  curatedIcon: {
    width: 32,
    height: 32,
  },
  curatedBody: {
    flex: 1,
    gap: 3,
  },
  curatedMotion: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.text,
    letterSpacing: -0.2,
  },
  bookmarkBtn:  { padding: 4 },
  bookmarkIcon: { fontSize: 16, opacity: 0.5 },
  curatedDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
})
