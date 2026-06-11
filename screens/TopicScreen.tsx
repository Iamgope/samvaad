import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { DebateListRow } from '../components/DebateListRow'
import { fetchTopics, mediaUrl, type CategoryGroup, type Topic, ApiError } from '../services/api'

// ─── INTERNAL TYPES ───────────────────────────────────────────────

const EXPLORE_ID = '__explore__'

type CategoryView = {
  id: string                    // category name from API, or EXPLORE_ID
  name: string
  description: string
  iconUri: string | null
  backgroundUri: string | null
  accent: string
  bannerColor: string
  debatesLive: number
}

type DebateItem = {
  id: number
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
  iconUri: string | null
  backgroundUri: string | null
}

// ─── PALETTES & MOCK FIELDS ───────────────────────────────────────

const ACCENT_PALETTE = [colors.streak, '#38BDF8', colors.purple2, colors.lime, '#F472B6', '#FB923C']
const BANNER_PALETTE = ['#8B2500', '#062233', '#1E1060', '#163300', '#4A0E2E', '#3A1A00']
const EMOJI_PALETTE  = ['🏛️', '🗳️', '📋', '📱', '⚖️', '🏏', '📺', '🎨', '💰', '📖', '📽️', '🎬', '🤖', '🧠', '🙏']

// Stable mock data per topic id so the screen doesn't reshuffle on re-render.
function mockFieldsFor(topic: Topic, categoryName: string): DebateItem {
  const id = topic.id
  const forVotes     = ((id * 137) % 8000) + 500
  const againstVotes = ((id * 91)  % 7000) + 500
  const debating     = forVotes + againstVotes + ((id * 53) % 4000)
  const xpReward     = ((id % 5) + 1) * 20
  const isNew        = id % 7 === 0
  const endsIn       = id % 5 === 0 ? `${(id % 8) + 1}h` : undefined
  const emoji        = EMOJI_PALETTE[id % EMOJI_PALETTE.length]

  return {
    id,
    emoji,
    motion: topic.title,
    context: topic.description ?? '',
    debating,
    forVotes,
    againstVotes,
    categoryTag: categoryName,
    isNew,
    endsIn,
    xpReward,
    iconUri: mediaUrl(topic.icon),
    backgroundUri: mediaUrl(topic.background_image),
  }
}

function categoryViewFromApi(
  name: string,
  group: CategoryGroup,
  index: number,
): CategoryView {
  return {
    id: name,
    name,
    description: group.description,
    iconUri: mediaUrl(group.icon),
    backgroundUri: mediaUrl(group.background_image),
    accent: ACCENT_PALETTE[index % ACCENT_PALETTE.length],
    bannerColor: BANNER_PALETTE[index % BANNER_PALETTE.length],
    debatesLive: group.topics.length,
  }
}

function exploreCategory(totalTopics: number): CategoryView {
  return {
    id: EXPLORE_ID,
    name: 'Explore',
    description: 'All debates across every category',
    iconUri: null,
    backgroundUri: null,
    accent: colors.lime,
    bannerColor: '#1A1F1A',
    debatesLive: totalTopics,
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

// ─── BANNER HEADER ────────────────────────────────────────────────

function BannerHeader({
  cat,
  pills,
  activeCategoryId,
  onBack,
  onCategoryChange,
}: {
  cat: CategoryView
  pills: CategoryView[]
  activeCategoryId: string
  onBack: () => void
  onCategoryChange: (id: string) => void
}) {
  const bannerContent = (
    <>
      <View style={[s.bannerGlow, { backgroundColor: cat.accent }]} />

      <View style={s.bannerTopRow}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={s.bannerTitleRow}>
        <View style={s.bannerTitleBlock}>
          <Text style={s.bannerTitle}>{cat.name}</Text>
          <Text style={s.bannerSubtitle}>
            {cat.id === EXPLORE_ID
              ? `${cat.debatesLive} debates across all categories`
              : `${cat.debatesLive} debates happening now`}
          </Text>
        </View>
        {cat.iconUri && (
          <Image source={{ uri: cat.iconUri }} style={s.bannerIcon} resizeMode="contain" />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillsRow}
      >
        {pills.map(c => {
          const active = c.id === activeCategoryId
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                s.pill,
                active
                  ? { backgroundColor: colors.lime }
                  : { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)' },
              ]}
              onPress={() => onCategoryChange(c.id)}
              activeOpacity={0.75}
            >
              <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </>
  )

  if (cat.backgroundUri) {
    return (
      <ImageBackground
        source={{ uri: cat.backgroundUri }}
        style={[s.banner, { backgroundColor: cat.bannerColor }]}
        imageStyle={s.bannerBgImage}
      >
        <View style={s.bannerOverlay} />
        {bannerContent}
      </ImageBackground>
    )
  }

  return (
    <View style={[s.banner, { backgroundColor: cat.bannerColor }]}>
      {bannerContent}
    </View>
  )
}

// ─── FEATURED CARD (vs style) ──────────────────────────────────────

function FeaturedCard({
  debate,
  accent,
  onJoin,
}: {
  debate: DebateItem
  accent: string
  onJoin: (id: number) => void
}) {
  const total      = debate.forVotes + debate.againstVotes
  const forPct     = (debate.forVotes / total) * 100
  const againstPct = 100 - forPct
  const forStronger = debate.forVotes > debate.againstVotes
  const diff       = Math.abs(debate.forVotes - debate.againstVotes)

  return (
    <View style={[s.featuredCard, { borderColor: accent + '55', shadowColor: accent }]}>
      <View style={s.featuredTopRow}>
        <View style={s.vsLine}>
          <View style={s.vsLineDash} />
          <Text style={s.vsText}>vs</Text>
          <View style={s.vsLineDash} />
        </View>
        <View style={[s.trendingBadge, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
          <Text style={s.trendingIcon}>🔥</Text>
          <Text style={[s.trendingText, { color: accent }]}>TRENDING</Text>
        </View>
      </View>

      <Text style={s.featuredMotion} numberOfLines={3}>{debate.motion}</Text>

      <View style={s.voteRow}>
        <View style={[s.voteBox, s.voteBoxFor]}>
          <Text style={s.voteLabel} tone="accent">For</Text>
          <Text style={s.voteCount}>{debate.forVotes.toLocaleString()}</Text>
          <Text style={s.voteHint} tone="accent">
            {forStronger
              ? `Stronger by ${Math.round((diff / total) * 100)}%`
              : `Needs ${diff.toLocaleString()} to catch up`}
          </Text>
          <View style={s.voteBarTrack}>
            <View style={[s.voteBarFill, { width: `${forPct}%`, backgroundColor: colors.lime }]} />
          </View>
        </View>

        <View style={s.vsBubble}>
          <Text style={s.vsBubbleText} tone="muted">vs</Text>
        </View>

        <View style={[s.voteBox, s.voteBoxAgainst]}>
          <Text style={[s.voteLabel, { color: accent }]}>Against</Text>
          <Text style={s.voteCount}>{debate.againstVotes.toLocaleString()}</Text>
          <Text style={[s.voteHint, { color: accent }]}>
            {!forStronger
              ? `Stronger by ${Math.round((diff / total) * 100)}%`
              : `Needs ${diff.toLocaleString()} to catch up`}
          </Text>
          <View style={s.voteBarTrack}>
            <View style={[s.voteBarFill, { width: `${againstPct}%`, backgroundColor: accent }]} />
          </View>
        </View>
      </View>

      <View style={s.debatingRow}>
        <View style={s.avatarStack}>
          <View style={[s.stackAvatar, { backgroundColor: colors.streak,  left: 0  }]} />
          <View style={[s.stackAvatar, { backgroundColor: '#38BDF8',      left: 14 }]} />
          <View style={[s.stackAvatar, { backgroundColor: colors.red,     left: 28 }]} />
        </View>
        <Text style={s.debatingText} tone="muted">
          {formatCount(debate.debating)} debating
        </Text>
      </View>

      <TouchableOpacity style={s.joinBtn} onPress={() => onJoin(debate.id)} activeOpacity={0.85}>
        <Text style={s.joinBtnText}>Join Debate →</Text>
      </TouchableOpacity>
    </View>
  )
}


// ─── MAIN SCREEN ──────────────────────────────────────────────────

type Props = {
  navigation: any
  route: any
}

export default function TopicScreen({ navigation, route }: Props) {
  const [groups, setGroups] = useState<Record<string, CategoryGroup> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    route.params?.category ?? EXPLORE_ID
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTopics()
      .then(data => {
        if (cancelled) return
        setGroups(data)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load topics')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const { pills, activeCategory, debates } = useMemo(() => {
    if (!groups) {
      return { pills: [] as CategoryView[], activeCategory: null as CategoryView | null, debates: [] as DebateItem[] }
    }

    const names = Object.keys(groups)
    const categoryViews = names.map((name, i) => categoryViewFromApi(name, groups[name], i))
    const totalTopics = names.reduce((acc, n) => acc + groups[n].topics.length, 0)
    const explore = exploreCategory(totalTopics)
    const allPills = [explore, ...categoryViews]

    const active = allPills.find(c => c.id === activeCategoryId) ?? explore

    const items: DebateItem[] =
      active.id === EXPLORE_ID
        ? names.flatMap(n => groups[n].topics.map(t => mockFieldsFor(t, n)))
        : (groups[active.name]?.topics ?? []).map(t => mockFieldsFor(t, active.name))

    return { pills: allPills, activeCategory: active, debates: items }
  }, [groups, activeCategoryId])

  const handleJoin = (debateId: number) => {
    const debate = debates.find(d => d.id === debateId)
    if (!debate) return
    navigation.navigate('Debate', {
      debateId,
      categoryId: debate.categoryTag,
      motion: debate.motion,
      debating: debate.debating,
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <ActivityIndicator color={colors.lime} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !activeCategory) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Text style={s.errorText} tone="danger">{error ?? 'No topics available'}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const [featured, ...rest] = debates

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BannerHeader
          cat={activeCategory}
          pills={pills}
          activeCategoryId={activeCategoryId}
          onBack={() => navigation.goBack()}
          onCategoryChange={setActiveCategoryId}
        />

        {featured && (
          <FeaturedCard debate={featured} accent={activeCategory.accent} onJoin={handleJoin} />
        )}

        {rest.length > 0 && (
          <View style={s.listSection}>
            <Text style={s.listSectionLabel}>DEBATE LIST</Text>
            <View style={s.listContainer}>
              {rest.map((d, i) => (
                <React.Fragment key={d.id}>
                  <DebateListRow
                    emoji={d.emoji}
                    motion={d.motion}
                    forVotes={d.forVotes}
                    againstVotes={d.againstVotes}
                    debating={d.debating}
                    categoryTag={d.categoryTag}
                    accent={activeCategory.accent}
                    onJoin={() => handleJoin(d.id)}
                  />
                  {i < rest.length - 1 && <View style={s.listDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={s.randomBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JoinDebate', { categoryId: activeCategory.id })}
        >
          <Text style={s.randomBtnText}>Find Random Opponent in {activeCategory.name} →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.black },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SCREEN_PADDING },
  errorText:     { textAlign: 'center' },

  // ── Banner ──
  banner: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: SCREEN_PADDING,
  },
  bannerBgImage: { opacity: 0.35 },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerGlow: {
    position: 'absolute',
    bottom: -60,
    left: '20%',
    width: '60%',
    height: 120,
    borderRadius: 60,
    opacity: 0.25,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backBtn:   { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontFamily: fonts.display.bold, fontSize: 24, color: '#fff' },

  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  bannerTitleBlock: { flex: 1, marginRight: spacing.sm },
  bannerTitle: {
    fontFamily: fonts.display.black,
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  bannerIcon: { width: 52, height: 52, borderRadius: 8 },

  // ── Category pills ──
  pillsRow: { gap: spacing.xs, paddingBottom: 4 },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  pillText:         { fontFamily: fonts.jakarta.semiBold, fontSize: 13 },
  pillTextActive:   { color: colors.black },
  pillTextInactive: { color: 'rgba(255,255,255,0.75)' },

  // ── Featured card ──
  featuredCard: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vsLine: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  vsLineDash: { flex: 1, height: 1, backgroundColor: colors.border },
  vsText: {
    fontFamily: fonts.display.bold,
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: 6,
    letterSpacing: 1,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendingIcon: { fontSize: 11 },
  trendingText: { fontFamily: fonts.jakarta.bold, fontSize: 10, letterSpacing: 0.5 },

  featuredMotion: {
    fontFamily: fonts.display.black,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
    lineHeight: 26,
  },

  // ── Vote row ──
  voteRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  voteBox: { flex: 1, gap: 4 },
  voteBoxFor: { alignItems: 'flex-start' },
  voteBoxAgainst: { alignItems: 'flex-end' },
  voteLabel: { fontFamily: fonts.jakarta.bold, fontSize: 11, letterSpacing: 0.5 },
  voteCount: { fontFamily: fonts.display.black, fontSize: 22, color: colors.text },
  voteHint:  { fontFamily: fonts.jakarta.medium, fontSize: 11, color: colors.textMuted },
  voteBarTrack: {
    height: 4,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  voteBarFill: { height: '100%', borderRadius: 2 },

  vsBubble: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBubbleText: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.textMuted,
  },

  // ── Debating row ──
  debatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarStack: { flexDirection: 'row', width: 50, height: 24, position: 'relative' },
  stackAvatar: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  debatingText: { fontFamily: fonts.jakarta.medium, fontSize: 13, color: colors.textMuted },

  // ── Join button ──
  joinBtn: {
    backgroundColor: colors.lime,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  joinBtnText: { fontFamily: fonts.jakarta.bold, fontSize: 15, color: colors.black },

  // ── Debate list ──
  listSection: {
    marginTop: spacing.xl,
    marginHorizontal: SCREEN_PADDING,
  },
  listSectionLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  listContainer: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  listDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },

  // ── Random opponent button ──
  randomBtn: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  randomBtnText: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 14,
    color: colors.text,
  },
})
