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
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { colors } from '../../constants/colors'
import { categoryConfig } from '../../constants/categories'
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
  proContext: string | null
  conContext: string | null
  backgroundImage: string | null
}

type PillView = {
  id: string
  label: string
  emoji: string
  color: string
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
                backgroundColor: active ? undefined : colors.surface2,
                borderColor: active ? '#A0A7B6' : colors.border,
                borderBottomColor: active ? '#7A8193' : colors.border,
                overflow: 'hidden',
              },
            ]}
            onPress={() => onSelect(p.id)}
            activeOpacity={0.8}
          >
            {active && (
              <LinearGradient
                colors={['#F4F6FA', '#CFD4DF', '#A0A7B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <Text style={[s.pillLabel, { color: active ? '#1A1F2C' : colors.text }]}>
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
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
      { id: EXPLORE_ID, label: 'All', emoji: '🧭', color: colors.text },
    ]

    names.forEach((name) => {
      const cfg = categoryConfig(name)
      const iconUri = mediaUrl(groups[name].icon)
      byId[name] = {
        id: name,
        name,
        accent: cfg.accent,
        iconSource: iconUri ? { uri: iconUri } : null,
      }
      pillList.push({
        id: name,
        label: name,
        emoji: cfg.emoji,
        color: cfg.accent,
      })
    })

    const debates: DebateView[] = names.flatMap(name =>
      groups[name].topics.map(t => ({
        id: t.id,
        categoryId: name,
        motion: t.title,
        context: t.description,
        proContext: t.pro_context ?? null,
        conContext: t.con_context ?? null,
        backgroundImage: mediaUrl(t.background_image),
      })),
    )

    return { pills: pillList, categoriesById: byId, allDebates: debates }
  }, [groups])

  const handleDebatePress = (d: DebateView) => {
    const cat = categoriesById[d.categoryId]
    navigation.navigate('DebateDetail', {
      debateId:       String(d.id),
      categoryId:     d.categoryId,
      categoryName:   cat?.name ?? d.categoryId,
      categoryAccent: cat?.accent ?? colors.text,
      motion:         d.motion,
      context:        d.context,
      agreeCount:     0,
      disagreeCount:  0,
      unsureCount:    0,
      proBody:        d.proContext ?? undefined,
      conBody:        d.conContext ?? undefined,
      imageUri:       d.backgroundImage ?? undefined,
    })
  }

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
            tintColor={colors.textMuted}
            colors={[colors.textMuted]}
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
                  headlineSize={17}
                  onPress={() => handleDebatePress(d)}
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

  searchWrap: {
    paddingHorizontal: SCREEN_PADDING,
    marginTop: spacing.sm,
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
