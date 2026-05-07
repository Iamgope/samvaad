import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { DebateListRow } from '../components/DebateListRow'

type CategoryId = 'politics' | 'sports' | 'lit' | 'philosophy'

type Category = {
  id: CategoryId
  name: string
  icon: any
  accent: string
  bannerColor: string
  debatesLive: number
}

type DebateItem = {
  id: string
  emoji: string
  motion: string
  debating: number
  forVotes: number
  againstVotes: number
  categoryTag: string
  isNew?: boolean
  endsIn?: string
  xpReward: number
}

// ─── DATA ─────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'politics',
    name: 'Politics',
    icon: require('../assets/politics_icon.png'),
    accent: colors.streak,
    bannerColor: '#8B2500',
    debatesLive: 43,
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: require('../assets/sports_icon.png'),
    accent: '#38BDF8',
    bannerColor: '#062233',
    debatesLive: 67,
  },
  {
    id: 'lit',
    name: 'Culture',
    icon: require('../assets/art_icon.png'),
    accent: colors.purple2,
    bannerColor: '#1E1060',
    debatesLive: 28,
  },
]

const DEBATES: Record<string, DebateItem[]> = {
  politics: [
    { id: 'p1', emoji: '🏛️', motion: 'Should India remove religion-based laws?',      debating: 12400, forVotes: 7632, againstVotes: 5412, categoryTag: 'Governance',  xpReward: 120 },
    { id: 'p2', emoji: '🗳️', motion: 'Is NOTA a meaningful political statement?',       debating: 4200,  forVotes: 2100, againstVotes: 2100, categoryTag: 'Democracy',   isNew: true, xpReward: 55 },
    { id: 'p3', emoji: '📋', motion: 'Should voting be mandatory in India?',            debating: 6800,  forVotes: 4200, againstVotes: 2600, categoryTag: 'Civics',      xpReward: 80 },
    { id: 'p4', emoji: '📱', motion: 'Can democracy survive social media?',             debating: 3900,  forVotes: 1800, againstVotes: 2100, categoryTag: 'Tech & Pol',  endsIn: '2h', xpReward: 45 },
    { id: 'p5', emoji: '⚖️', motion: 'Should India adopt a uniform civil code?',        debating: 9100,  forVotes: 5200, againstVotes: 3900, categoryTag: 'Law',         xpReward: 95 },
  ],
  sports: [
    { id: 's1', emoji: '🏏', motion: 'Should cricket be added to the Olympics?',        debating: 8247,  forVotes: 5910, againstVotes: 2290, categoryTag: 'Cricket',     xpReward: 85 },
    { id: 's2', emoji: '📺', motion: 'Should social media algorithms be regulated?',    debating: 12100, forVotes: 6600, againstVotes: 5500, categoryTag: 'Tech & Society', xpReward: 65 },
    { id: 's3', emoji: '🎨', motion: 'Is AI art real art?',                             debating: 8300,  forVotes: 3320, againstVotes: 4980, categoryTag: 'Culture & Tech', xpReward: 75 },
    { id: 's4', emoji: '🏏', motion: 'Introduce a 40-over format in…',                  debating: 15200, forVotes: 9880, againstVotes: 5320, categoryTag: 'Sports',      xpReward: 50 },
    { id: 's5', emoji: '💰', motion: 'Is money ruining the spirit of sport?',           debating: 4900,  forVotes: 2700, againstVotes: 2200, categoryTag: 'Sports',      isNew: true, xpReward: 60 },
  ],
  lit: [
    { id: 'l1', emoji: '📖', motion: 'Are translations betraying the originals?',       debating: 4100,  forVotes: 1820, againstVotes: 2280, categoryTag: 'Literature',  xpReward: 60 },
    { id: 'l2', emoji: '📽️', motion: 'Is literary fiction becoming irrelevant?',        debating: 2800,  forVotes: 1400, againstVotes: 1400, categoryTag: 'Culture',     isNew: true, xpReward: 40 },
    { id: 'l3', emoji: '🎬', motion: 'Do we glorify violence in cinema too much?',      debating: 4300,  forVotes: 2600, againstVotes: 1700, categoryTag: 'Cinema',      xpReward: 55 },
    { id: 'l4', emoji: '🤖', motion: 'Should AI-generated art be shown in galleries?',  debating: 5100,  forVotes: 2200, againstVotes: 2900, categoryTag: 'AI & Art',    endsIn: '6h', xpReward: 70 },
  ],
  philosophy: [
    { id: 'ph1', emoji: '🤖', motion: 'Will AI make humans irrelevant?',               debating: 8700,  forVotes: 4500, againstVotes: 4200, categoryTag: 'Tech & Phil', xpReward: 90 },
    { id: 'ph2', emoji: '🧠', motion: 'Is free will an illusion?',                     debating: 6200,  forVotes: 3100, againstVotes: 3100, categoryTag: 'Philosophy',  isNew: true, xpReward: 70 },
    { id: 'ph3', emoji: '🙏', motion: 'Can morality exist without religion?',          debating: 5400,  forVotes: 2900, againstVotes: 2500, categoryTag: 'Ethics',      xpReward: 65 },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

// ─── LIVE BADGE ───────────────────────────────────────────────────

function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 550, useNativeDriver: true }),
      ])
    ).start()
  }, [pulse])
  return (
    <View style={s.liveBadge}>
      <Animated.View style={[s.liveDot, { transform: [{ scale: pulse }] }]} />
      <Text style={s.liveText}>LIVE</Text>
    </View>
  )
}

// ─── BANNER HEADER ────────────────────────────────────────────────

function BannerHeader({
  cat,
  activeCategoryId,
  onBack,
  onCategoryChange,
}: {
  cat: Category
  activeCategoryId: CategoryId
  onBack: () => void
  onCategoryChange: (id: CategoryId) => void
}) {
  return (
    <View style={[s.banner, { backgroundColor: cat.bannerColor }]}>
      {/* Subtle inner glow at bottom of banner */}
      <View style={[s.bannerGlow, { backgroundColor: cat.accent }]} />

      {/* Top row: back + live */}
      <View style={s.bannerTopRow}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <LiveBadge />
      </View>

      {/* Title + icon row */}
      <View style={s.bannerTitleRow}>
        <View style={s.bannerTitleBlock}>
          <Text style={s.bannerTitle}>{cat.name}</Text>
          <Text style={s.bannerSubtitle}>{cat.debatesLive} debates happening now</Text>
        </View>
        <Image source={cat.icon} style={s.bannerIcon} resizeMode="contain" />
      </View>

      {/* Category switcher pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillsRow}
      >
        {CATEGORIES.map(c => {
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
  onJoin: (id: string) => void
}) {
  const total      = debate.forVotes + debate.againstVotes
  const forPct     = (debate.forVotes / total) * 100
  const againstPct = 100 - forPct
  const forStronger = debate.forVotes > debate.againstVotes
  const diff       = Math.abs(debate.forVotes - debate.againstVotes)

  return (
    <View style={[s.featuredCard, { borderColor: accent + '55', shadowColor: accent }]}>
      {/* Top row */}
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

      {/* Motion */}
      <Text style={s.featuredMotion} numberOfLines={3}>{debate.motion}</Text>

      {/* Vote boxes */}
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

      {/* Debating row */}
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

      {/* CTA */}
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
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>(
    route.params?.category ?? 'sports'
  )

  const cat    = CATEGORIES.find(c => c.id === activeCategoryId) ?? CATEGORIES[0]
  const debates = DEBATES[activeCategoryId] ?? []
  const [featured, ...rest] = debates

  const handleJoin = (id: string) => {
    const debate = debates.find(d => d.id === id)
    if (!debate) return
    navigation.navigate('Debate', {
      debateId: id,
      categoryId: activeCategoryId,
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
        <BannerHeader
          cat={cat}
          activeCategoryId={activeCategoryId}
          onBack={() => navigation.goBack()}
          onCategoryChange={setActiveCategoryId}
        />

        {/* Featured debate */}
        {featured && (
          <FeaturedCard debate={featured} accent={cat.accent} onJoin={handleJoin} />
        )}

        {/* Debate list */}
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
                  accent={cat.accent}
                  onJoin={() => handleJoin(d.id)}
                />
                {i < rest.length - 1 && <View style={s.listDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <TouchableOpacity style={s.randomBtn} activeOpacity={0.85}>
          <Text style={s.randomBtnText}>Find Random Opponent in {cat.name} →</Text>
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

  // ── Banner ──
  banner: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: SCREEN_PADDING,
    overflow: 'hidden',
    position: 'relative',
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

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },
  liveText: { fontFamily: fonts.jakarta.extraBold, fontSize: 11, color: '#fff', letterSpacing: 1 },

  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  bannerTitleBlock: { flex: 1 },
  bannerTitle: {
    fontFamily: fonts.display.black,
    fontSize: 42,
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 46,
  },
  bannerSubtitle: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  bannerIcon: {
    width: 90,
    height: 90,
    marginLeft: spacing.md,
    opacity: 0.95,
  },

  // Category switcher pills
  pillsRow: { gap: spacing.sm, paddingVertical: 2 },
  pill: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillText:         { fontFamily: fonts.jakarta.semiBold, fontSize: 13 },
  pillTextActive:   { color: colors.black },
  pillTextInactive: { color: 'rgba(255,255,255,0.75)' },

  // ── Featured card ──
  featuredCard: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  vsLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  vsLineDash: { width: 24, height: 1, backgroundColor: colors.border },
  vsText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.5,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  trendingIcon: { fontSize: 11 },
  trendingText: { fontFamily: fonts.jakarta.extraBold, fontSize: 10, letterSpacing: 0.8 },

  featuredMotion: {
    fontFamily: fonts.display.black,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: spacing.lg,
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
  voteBoxAgainst: { borderColor: colors.borderStrong },
  voteLabel: { fontFamily: fonts.jakarta.semiBold, fontSize: 12, marginBottom: 4 },
  voteCount: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  voteHint:     { fontFamily: fonts.jakarta.medium, fontSize: 11, marginBottom: spacing.sm },
  voteBarTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  voteBarFill:  { height: '100%', borderRadius: 2 },

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
  vsBubbleText: { fontFamily: fonts.jakarta.semiBold, fontSize: 11 },

  debatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatarStack:  { width: 56, height: 22, marginRight: spacing.sm, position: 'relative' },
  stackAvatar:  {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  debatingText: { fontFamily: fonts.jakarta.medium, fontSize: 13 },

  joinBtn: {
    backgroundColor: colors.lime,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: fonts.display.black,
    fontSize: 15,
    color: colors.black,
    letterSpacing: 0.2,
  },

  // ── Debate list ──
  listSection: { paddingHorizontal: SCREEN_PADDING, marginBottom: spacing.xl },
  listSectionLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
  },
  listDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  // ── Bottom CTA ──
  randomBtn: {
    marginHorizontal: SCREEN_PADDING,
    backgroundColor: colors.lime,
    borderRadius: 14,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  randomBtnText: {
    fontFamily: fonts.display.black,
    fontSize: 15,
    color: colors.black,
    letterSpacing: 0.2,
  },
})
