import React, { useEffect, useMemo, useState } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
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
import { fetchTopics, mediaUrl, type CategoryGroup, type Topic, ApiError } from '../services/api'
import { categoryConfig, CATEGORY_ORDER } from '../constants/categories'

// ─── TYPES ────────────────────────────────────────────────────────

type DebateItem = {
  id: number
  emoji: string
  motion: string
  context: string
  proContext: string | null
  conContext: string | null
  categoryTag: string
  isTrending: boolean
  backgroundImage: string | null
  icon: any
}

// ─── HELPERS ──────────────────────────────────────────────────────

function topicToDebateItem(topic: Topic, categoryName: string): DebateItem {
  const iconUri = mediaUrl(topic.icon)
  return {
    id: topic.id,
    emoji: categoryConfig(categoryName).emoji,
    motion: topic.title,
    context: topic.description ?? '',
    proContext: topic.pro_context ?? null,
    conContext: topic.con_context ?? null,
    categoryTag: categoryName,
    isTrending: topic.is_trending ?? false,
    backgroundImage: mediaUrl(topic.background_image),
    icon: iconUri ? { uri: iconUri } : null,
  }
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────

type Props = {
  navigation: any
  route: any
}

export default function TopicScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets()

  const [groups, setGroups] = useState<Record<string, CategoryGroup> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActive] = useState<string>(route.params?.category ?? '')

  useEffect(() => {
    let cancelled = false
    fetchTopics()
      .then(data => {
        if (cancelled) return
        setGroups(data)
        if (!activeCategoryId) {
          const first = Object.keys(data)[0]
          if (first) setActive(first)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load topics')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { chipOptions, selectedChip, catAccent, catIcon, catPoster } = useMemo(() => {
    if (!groups) {
      return { chipOptions: [] as ChipOption[], selectedChip: null as ChipOption | null, catAccent: colors.streak, catIcon: null, catPoster: null }
    }
    const names = CATEGORY_ORDER.filter(n => n in groups)
    const chips: ChipOption[] = names.map(name => {
      const cfg = categoryConfig(name)
      return { id: name, label: name, emoji: cfg.emoji, accent: cfg.accent }
    })
    const chip = chips.find(c => c.id === activeCategoryId) ?? chips[0] ?? null
    const cfg = categoryConfig(chip?.id ?? '')
    return { chipOptions: chips, selectedChip: chip, catAccent: cfg.accent, catIcon: cfg.icon, catPoster: cfg.poster }
  }, [groups, activeCategoryId])

  const debates: DebateItem[] = useMemo(() => {
    if (!groups || !activeCategoryId) return []
    return (groups[activeCategoryId]?.topics ?? []).map(t => topicToDebateItem(t, activeCategoryId))
  }, [groups, activeCategoryId])

  const openDebate = (id: number) => {
    const d = debates.find(x => x.id === id)
    if (!d) return
    navigation.navigate('DebateDetail', {
      debateId: String(d.id),
      categoryId: activeCategoryId,
      categoryName: displayLabel,
      categoryAccent: catAccent,
      motion: d.motion,
      context: d.context,
      agreeCount: 0,
      disagreeCount: 0,
      unsureCount: 0,
      proBody: d.proContext ?? undefined,
      conBody: d.conContext ?? undefined,
      imageUri: d.backgroundImage ?? undefined,
    })
  }

  // Trending topic surfaces at the top; remaining topics below
  const trendingDebate = debates.find(d => d.isTrending) ?? debates[0] ?? null
  const restDebates = debates.filter(d => d !== trendingDebate)
  const displayLabel = selectedChip?.label ?? activeCategoryId

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header: always visible ── */}
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          accent={colors.text}
          onPress={() => navigation.goBack()}
        />
        {selectedChip && (
          <ChipDropdown
            selected={selectedChip}
            options={chipOptions}
            onSelect={(chip) => setActive(chip.id)}
            accent={catAccent}
          />
        )}
      </View>

      {loading ? (
        <>
          <View style={s.titleBlock}>
            <Text style={s.title}>{displayLabel}</Text>
          </View>
          <View style={s.center}>
            <ActivityIndicator color={colors.lime} />
          </View>
        </>
      ) : error || !selectedChip ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error ?? 'No topics available'}</Text>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Title ── */}
          <View style={s.titleBlock}>
            <Text style={s.title}>{displayLabel}</Text>
          </View>

          {/* ── Trending Debate ── */}
          {trendingDebate && (
            <View style={s.heroSection}>
              <DebateHeroCard
                headerLeft={
                  <View style={s.trendingBadgeRow}>
                    <Text style={s.trendingBadge}>Trending</Text>
                  </View>
                }
                motion={trendingDebate.motion}
                categoryName={trendingDebate.categoryTag}
                categoryAccent={catAccent}
                image={trendingDebate.backgroundImage ? { uri: trendingDebate.backgroundImage } : catPoster}
                height={272}
                motionSize={26}
                onPress={() => openDebate(trendingDebate.id)}
                footer={
                  <Text style={s.heroMeta}>
                    Tap to debate
                  </Text>
                }
              />
            </View>
          )}

          {/* ── All topics list ── */}
          {restDebates.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>All Topics</Text>
              {restDebates.map((d, i) => (
                <View key={d.id}>
                  <DebateHeadline
                    motion={d.motion}
                    context={d.context}
                    categoryName={displayLabel}
                    categoryAccent={catAccent}
                    categoryIcon={catIcon}
                    headlineSize={17}
                    onPress={() => openDebate(d.id)}
                  />
                  {i < restDebates.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Fixed bottom CTA ── */}
      {!loading && selectedChip && (
        <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.lg) }]}>
          <Button
            label={`Find a ${displayLabel} opponent`}
            variant="steel"
            size="md"
            onPress={() => navigation.navigate('JoinDebate', { categoryId: activeCategoryId, categoryAccent: catAccent })}
            style={s.cta}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 110,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SCREEN_PADDING },
  errorText: { textAlign: 'center', color: colors.textMuted },

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
    paddingHorizontal: SCREEN_PADDING,
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
    paddingHorizontal: SCREEN_PADDING,
  },
  trendingBadgeRow: {
    flexDirection: 'row',
  },
  trendingBadge: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    backgroundColor: colors.lime + '40', // Bluish container, increased opacity slightly for white text contrast
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: SCREEN_PADDING,
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

  // ── Topics list ──
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
