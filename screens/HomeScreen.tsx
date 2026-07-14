import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { DebateHeadline } from '../components/DebateHeadline'
import { DebateHeroCard } from '../components/DebateHeroCard'
import { CategoryCard } from '../components/CategoryCard'
import { BellIcon, DiceIcon, LearnIcon } from '../components/Icons'
import { useTopics } from '../hooks/useQueries'
import { mediaUrl, type Topic } from '../services/api'
import { categoryConfig, CATEGORY_ORDER } from '../constants/categories'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TRENDING_CARD_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2
const TOPIC_CARD_WIDTH    = (SCREEN_WIDTH - SCREEN_PADDING * 2 - spacing.sm * 3) / 2.95

// ─── TYPES ────────────────────────────────────────────────────────

type HomeTopic = {
  id: number
  categoryName: string
  motion: string
  context?: string
  image: any
  proContext?: string
  conContext?: string
  isTrending: boolean
  backgroundImage?: string | null
}

// ─── HELPERS ──────────────────────────────────────────────────────

function toHomeTopic(topic: Topic, categoryName: string): HomeTopic {
  const uri = mediaUrl(topic.background_image)
  return {
    id: topic.id,
    categoryName,
    motion: topic.title,
    context: topic.description || undefined,
    image: uri ? { uri } : categoryConfig(categoryName).poster,
    proContext: topic.pro_context ?? undefined,
    conContext: topic.con_context ?? undefined,
    isTrending: topic.is_trending,
    backgroundImage: uri,
  }
}

// Interleaves topics across categories (one from each category in turn, ordered by
// backend priority) so the list isn't dominated by whichever category has the most topics.
function interleaveByCategory(groups: Record<string, Topic[]>, order: string[]): HomeTopic[] {
  const queues = order.map(name =>
    (groups[name] ?? [])
      .filter(t => t.is_active !== false)
      .slice()
      .sort((a, b) => b.priority - a.priority)
  )
  const result: HomeTopic[] = []
  let remaining = queues.some(q => q.length > 0)
  while (remaining) {
    remaining = false
    for (let i = 0; i < order.length; i++) {
      const topic = queues[i].shift()
      if (topic) {
        result.push(toHomeTopic(topic, order[i]))
        remaining = remaining || queues[i].length > 0
      }
    }
  }
  return result
}

// ─── HEADER ───────────────────────────────────────────────────────

function Header({ onBellPress, hasUnread }: { onBellPress: () => void; hasUnread?: boolean }) {
  return (
    <View style={s.header}>
      <Text style={s.wordmark}>Duella<Text style={s.wordmarkDot}>.</Text></Text>
      <TouchableOpacity style={s.bellBtn} activeOpacity={0.7} onPress={onBellPress} hitSlop={8}>
        <BellIcon size={hasUnread?26:22} steel={hasUnread} />
        {hasUnread && <View style={s.bellDot} />}
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
  debates: HomeTopic[]
  onJoin: (id: number) => void
}) {
  const looped = debates.length > 1 ? [...debates, debates[0]] : debates

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
        <Text style={s.sectionLabel}>Trending Debates</Text>
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
          {looped.map((d, i) => {
            const cfg = categoryConfig(d.categoryName)
            return (
              <DebateHeroCard
                key={`${d.id}-${i}`}
                motion={d.motion}
                categoryName={d.categoryName}
                categoryAccent={cfg.accent}
                image={d.image}
                height={268}
                style={{ width: TRENDING_CARD_WIDTH }}
                onPress={() => onJoin(d.id)}
              />
            )
          })}
        </ScrollView>
        <View pointerEvents="none" style={s.pagerOverlay}>
          {debates.map((d, i) => (
            <View
              key={i}
              style={[s.pagerDot, i === activeIndex && { backgroundColor: categoryConfig(d.categoryName).accent }]}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

// ─── EXPLORE TOPICS ──────────────────────────────────────────────

function ExploreTopics({
  categoryNames,
  onPress,
}: {
  categoryNames: string[]
  onPress: (name: string) => void
}) {
  return (
    <View style={s.exploreSection}>
      <Text style={s.sectionLabel}>Explore topics</Text>
      <View style={s.topicsRow}>
        {categoryNames.map((name, i) => {
          const cfg = categoryConfig(name)
          return (
            <CategoryCard
              key={name}
              name={name}
              icon={cfg.icon}
              accent={cfg.accent}
              delay={i * 250}
              outerStyle={{ width: TOPIC_CARD_WIDTH, aspectRatio: 1 }}
              onPress={() => onPress(name)}
            />
          )
        })}
      </View>
    </View>
  )
}

// ─── ACTION SECTION ──────────────────────────────────────────────

type ActionItem = {
  key: string
  icon?: React.ReactNode
  emoji?: string
  title: string
  subtitle: string
  comingSoon?: boolean
}

const ACTIONS: ActionItem[] = [
  {
    key:      'join',
    icon:     <DiceIcon />,
    title:    '',
    subtitle: 'Join a random debate',
  },
  {
    key:      'learn',
    icon:     <LearnIcon />,
    title:    '',
    subtitle: 'Practice Mode',
    comingSoon: true,
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
            style={s.actionCard}
            onPress={() => { if (!a.comingSoon) onPress(a.key) }}
            activeOpacity={a.comingSoon ? 1 : 0.8}
          >
            <View style={[s.actionCardContent, a.comingSoon && s.actionCardDisabled]}>
              <View style={s.actionEmojiArea}>
                {a.icon ?? <Text style={s.actionEmoji}>{a.emoji}</Text>}
              </View>
              <View style={s.actionTextArea}>
                {!!a.title && <Text style={s.actionTitle}>{a.title}</Text>}
                <Text style={s.actionSubtitle}>{a.subtitle}</Text>
              </View>
            </View>
            {a.comingSoon && (
              <View style={s.comingSoonBadge}>
                <Text style={s.comingSoonText}>Coming soon</Text>
              </View>
            )}
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
  debates: HomeTopic[]
  onPress: (id: number) => void
}) {
  return (
    <View style={s.forYouSection}>
      <View style={s.forYouHeader}>
        <Text style={s.sectionLabel}>For you</Text>
        <Text variant="bodySm" tone="muted">Curated picks</Text>
      </View>
      {debates.map((d, i) => {
        const cfg = categoryConfig(d.categoryName)
        return (
          <View key={d.id}>
            <DebateHeadline
              motion={d.motion}
              context={d.context}
              categoryName={d.categoryName}
              categoryAccent={cfg.accent}
              categoryIcon={cfg.icon}
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
  const [hasUnread, setHasUnread] = useState(true)
  const { data: groups, isLoading, isError, isRefetching, refetch } = useTopics()

  const onRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const categoryNames = useMemo(
    () => (groups ? CATEGORY_ORDER.filter(name => name in groups) : [...CATEGORY_ORDER]),
    [groups],
  )

  const allTopics = useMemo(() => {
    if (!groups) return []
    const byCategory: Record<string, Topic[]> = {}
    categoryNames.forEach(name => { byCategory[name] = groups[name]?.topics ?? [] })
    const allRaw = Object.values(byCategory).flat()
    console.log('[DEBUG] total topics:', allRaw.length,
      'with pro_context:', allRaw.filter(t => !!t.pro_context).length,
      'with con_context:', allRaw.filter(t => !!t.con_context).length)
    console.log('[DEBUG] sample keys:', allRaw[0] ? Object.keys(allRaw[0]) : 'none')
    return interleaveByCategory(byCategory, categoryNames)
  }, [groups, categoryNames])

  const trending = allTopics.filter(t => t.isTrending)
  const forYou   = allTopics.filter(t => !t.isTrending)

  const openDebate = (id: number) => {
    const topic = allTopics.find(t => t.id === id)
    if (!topic) return
    const cfg = categoryConfig(topic.categoryName)
    navigation.navigate('DebateDetail', {
      debateId: String(topic.id),
      categoryId: topic.categoryName,
      categoryName: topic.categoryName,
      categoryAccent: cfg.accent,
      motion: topic.motion,
      context: topic.context,
      proBody: topic.proContext,
      conBody: topic.conContext,
      imageUri: topic.backgroundImage ?? undefined,
      agreeCount: 0,
      disagreeCount: 0,
      unsureCount: 0,
    })
  }

  const handleCategoryPress = (name: string) => {
    navigation.navigate('TopicScreen', { category: name })
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
            colors={[colors.textMuted]}
          />
        }
      >
        <Header
          onBellPress={() => { setHasUnread(false); navigation.navigate('Notifications') }}
          hasUnread={hasUnread}
        />
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.lime} />
          </View>
        ) : isError ? (
          <View style={s.center}>
            <Text tone="muted">Couldn't load debates. Pull to retry.</Text>
          </View>
        ) : (
          <>
            {trending.length > 0 && <TrendingSection debates={trending} onJoin={openDebate} />}
            <ExploreTopics categoryNames={categoryNames} onPress={handleCategoryPress} />
            <ActionSection onPress={(key) => {
              if (key === 'join') navigation.navigate('JoinDebate')
              if (key === 'learn') navigation.navigate('LearnScreen')
            }} />
            {forYou.length > 0 && <ForYouSection debates={forYou} onPress={openDebate} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.black },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  center:        { paddingVertical: spacing.xl * 2, alignItems: 'center', justifyContent: 'center' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fonts.display.black,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.6,
  },
  wordmarkDot: {
    color: colors.lime,
  },
  bellBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    borderWidth: 1.5,
    borderColor: colors.black,
  },

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
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  actionCardContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  actionCardDisabled: {
    opacity: 0.45,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  comingSoonText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 8,
    letterSpacing: -0.3,
    color: colors.text,
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
