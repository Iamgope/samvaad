import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { DebateHeadline } from '../../components/DebateHeadline'
import {
  fetchTopics,
  mediaUrl,
  ApiError,
  type CategoryGroup,
} from '../../services/api'

// ─── INTERNAL TYPES ────────────────────────────────────────────────

const EXPLORE_ID = '__explore__'

type CategoryView = {
  id: string
  name: string
  accent: string
  iconSource: { uri: string } | null
}

type DebateView = {
  id: number
  categoryId: string
  motion: string
  context: string
  agreeCount: number
  disagreeCount: number
  unsureCount: number
}

type PillView = {
  id: string
  label: string
  emoji: string
  color: string
}

// ─── PALETTES & MOCKS ──────────────────────────────────────────────

const ACCENT_PALETTE = [colors.streak, colors.sky, colors.purple2, colors.lime, '#F472B6', '#FB923C']
const EMOJI_PALETTE  = ['🏛️', '🏆', '🎭', '🤖', '📚', '🎨', '⚖️', '🌍']

const PILLS: { id: PillId; label: string; emoji?: string; color: string }[] = [
  { id: 'explore',  label: 'Explore', emoji: '', color: colors.text },
  { id: 'politics', label: 'Politics', emoji: '🏛️', color: colors.streak  },
  { id: 'sports',   label: 'Sports',   emoji: '🏆', color: colors.sky     },
  { id: 'culture',  label: 'Culture',  emoji: '🎭', color: colors.purple2 },
]
function mockCounts(id: number) {
  const agreeCount    = ((id * 137) % 6000) + 500
  const disagreeCount = ((id * 91)  % 5000) + 400
  const unsureCount   = ((id * 53)  % 1200) + 200
  return { agreeCount, disagreeCount, unsureCount }
}

// ─── SEARCH BAR ────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View style={s.searchBar}>
      <Svg width={18} height={18} viewBox="0 0 28 28" fill="none">
        <Circle cx="12" cy="12" r="7.5" stroke={colors.textSubtle} strokeWidth={2.2} />
        <Path d="M18 18L24 24" stroke={colors.textSubtle} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
      <TextInput
        style={s.searchInput}
        placeholder="Search debates…"
        placeholderTextColor={colors.textSubtle}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Line x1="6" y1="6" x2="18" y2="18" stroke={colors.textSubtle} strokeWidth={2} strokeLinecap="round" />
            <Line x1="18" y1="6" x2="6" y2="18" stroke={colors.textSubtle} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── PILL ROW ──────────────────────────────────────────────────────

function PillRow({
  pills,
  selected,
  onSelect,
}: {
  pills: PillView[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.pillScroll}
      contentContainerStyle={s.pillRow}
    >
      {pills.map(p => {
        const active = p.id === selected
        return (
          <TouchableOpacity
            key={p.id}
            style={[
              s.pill,
              {
                backgroundColor:   active ? p.color + '33' : p.color + '18',
                borderColor:       p.color + '50',
                borderBottomColor: active ? p.color : p.color + 'AA',
              },
            ]}
            onPress={() => onSelect(p.id)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillLabel, { color: active ? p.color : p.color + 'BB' }]}>
              {p.emoji ? `${p.emoji}  ` : ''}{p.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

// ─── MAIN SCREEN ───────────────────────────────────────────────────

export default function SearchScreen() {
  const [groups, setGroups] = useState<Record<string, CategoryGroup> | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPill, setSelectedPill] = useState<string>(EXPLORE_ID)
  const [query, setQuery] = useState('')

  const loadTopics = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTopics()
      setGroups(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load topics')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadTopics().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadTopics])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadTopics()
    setRefreshing(false)
  }, [loadTopics])

  const { pills, categoriesById, allDebates } = useMemo(() => {
    if (!groups) {
      return {
        pills: [] as PillView[],
        categoriesById: {} as Record<string, CategoryView>,
        allDebates: [] as DebateView[],
      }
    }

    const names = Object.keys(groups)

    const byId: Record<string, CategoryView> = {}
    const pillList: PillView[] = [
      { id: EXPLORE_ID, label: 'Explore', emoji: '🧭', color: colors.text },
    ]

    names.forEach((name, i) => {
      const accent = ACCENT_PALETTE[i % ACCENT_PALETTE.length]
      const iconUri = mediaUrl(groups[name].icon)
      byId[name] = {
        id: name,
        name,
        accent,
        iconSource: iconUri ? { uri: iconUri } : null,
      }
      pillList.push({
        id: name,
        label: name,
        emoji: EMOJI_PALETTE[i % EMOJI_PALETTE.length],
        color: accent,
      })
    })

    const debates: DebateView[] = names.flatMap(name =>
      groups[name].topics.map(t => ({
        id: t.id,
        categoryId: name,
        motion: t.title,
        context: t.description,
        ...mockCounts(t.id),
      })),
    )

    return { pills: pillList, categoriesById: byId, allDebates: debates }
  }, [groups])

  const visibleDebates = useMemo(() => {
    let list =
      selectedPill === EXPLORE_ID
        ? allDebates
        : allDebates.filter(d => d.categoryId === selectedPill)

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(d =>
        d.motion.toLowerCase().includes(q) ||
        d.context.toLowerCase().includes(q),
      )
    }
    return list
  }, [allDebates, selectedPill, query])

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Search</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <SearchBar value={query} onChange={setQuery} />
      </View>

      {/* Pills */}
      {pills.length > 0 && (
        <PillRow pills={pills} selected={selectedPill} onSelect={setSelectedPill} />
      )}

      {/* Debate list */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lime}
            colors={[colors.lime]}
          />
        }
      >
        {loading ? (
          <View style={s.empty}>
            <ActivityIndicator color={colors.lime} />
          </View>
        ) : error ? (
          <View style={s.empty}>
            <Text variant="bodyMd" tone="danger">{error}</Text>
          </View>
        ) : visibleDebates.length === 0 ? (
          <View style={s.empty}>
            <Text variant="bodyMd" tone="muted">No debates found.</Text>
          </View>
        ) : (
          visibleDebates.map((d, i) => {
            const cat = categoriesById[d.categoryId]
            return (
              <View key={d.id}>
                <DebateHeadline
                  motion={d.motion}
                  context={d.context}
                  categoryName={cat?.name ?? d.categoryId}
                  categoryAccent={cat?.accent ?? colors.text}
                  categoryIcon={cat?.iconSource ?? undefined}
                  agreeCount={d.agreeCount}
                  disagreeCount={d.disagreeCount}
                  unsureCount={d.unsureCount}
                  headlineSize={17}
                />
                {i < visibleDebates.length - 1 && <View style={s.divider} />}
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── STYLES ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 32,
  },

  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display.black,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.8,
  },

  searchWrap: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.jakarta.regular,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },

  pillScroll: {
    flexGrow: 0,
  },
  pillRow: {
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  pillLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    letterSpacing: 0.1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  empty: {
    paddingTop: 48,
    alignItems: 'center',
  },
})
