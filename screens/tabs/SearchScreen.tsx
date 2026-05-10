import React, { useState, useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { DebateHeadline } from '../../components/DebateHeadline'

// ─── SHARED DATA (same categories / debates as HomeScreen) ─────────

type CategoryId = 'politics' | 'sports' | 'culture'

const CATEGORIES = [
  { id: 'politics' as CategoryId, name: 'Politics', icon: require('../../assets/politics_icon.png'), accent: colors.streak  },
  { id: 'sports'   as CategoryId, name: 'Sports',   icon: require('../../assets/sports_icon.png'),   accent: colors.sky     },
  { id: 'culture'  as CategoryId, name: 'Culture',  icon: require('../../assets/art_icon.png'),      accent: colors.purple2 },
]

type Debate = {
  id: string
  category: CategoryId
  motion: string
  context?: string
  agreeCount: number
  disagreeCount: number
  unsureCount: number
  isNew?: boolean
  endsIn?: string
}

const ALL_DEBATES: Debate[] = [
  {
    id: 'd1', category: 'politics',
    motion: 'Is democracy the best form of government?',
    context: 'Transfer of power controversies in Bengal elections sparked fresh debate.',
    agreeCount: 2100, disagreeCount: 1400, unsureCount: 600,
  },
  {
    id: 'd2', category: 'politics',
    motion: 'Should India remove religion-based laws?',
    context: 'A debate that resurfaces every election cycle with increasing intensity.',
    agreeCount: 3800, disagreeCount: 2600, unsureCount: 900,
  },
  {
    id: 'd3', category: 'sports',
    motion: 'Should cricket be added to the Olympics?',
    context: 'The ICC has been lobbying the IOC for two decades.',
    agreeCount: 5900, disagreeCount: 2300, unsureCount: 700, isNew: true,
  },
  {
    id: 'd4', category: 'sports',
    motion: 'Should athletes be political role models?',
    context: 'Several cricketers backed opposing parties ahead of IPL, dividing fans.',
    agreeCount: 980, disagreeCount: 1600, unsureCount: 520, endsIn: '3h',
  },
  {
    id: 'd5', category: 'culture',
    motion: 'Do we glorify violence in cinema too much?',
    context: 'Back-to-back blockbusters this season pushed graphic content to new extremes.',
    agreeCount: 1800, disagreeCount: 900, unsureCount: 340, isNew: true,
  },
  {
    id: 'd6', category: 'culture',
    motion: 'Are translations betraying the originals?',
    context: 'With global streaming boom, dubbing vs subtitling debate has reignited.',
    agreeCount: 1200, disagreeCount: 1800, unsureCount: 400,
  },
]

// ─── PILLS ─────────────────────────────────────────────────────────

type PillId = 'explore' | CategoryId

const PILLS: { id: PillId; label: string; emoji?: string; color: string }[] = [
  { id: 'explore',  label: 'Explore',  color: colors.textMuted },
  { id: 'politics', label: 'Politics', emoji: '🏛️', color: colors.streak  },
  { id: 'sports',   label: 'Sports',   emoji: '🏆', color: colors.sky     },
  { id: 'culture',  label: 'Culture',  emoji: '🎭', color: colors.purple2 },
]

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
  selected,
  onSelect,
}: {
  selected: PillId
  onSelect: (id: PillId) => void
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.pillScroll}
      contentContainerStyle={s.pillRow}
    >
      {PILLS.map(p => {
        const active = p.id === selected
        return (
          <TouchableOpacity
            key={p.id}
            style={[
              s.pill,
              {
                backgroundColor:  active ? p.color + '33' : p.color + '18',
                borderColor:      p.color + '50',
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
  const [selectedPill, setSelectedPill] = useState<PillId>('explore')
  const [query, setQuery] = useState('')

  const findCategory = (id: CategoryId) => CATEGORIES.find(c => c.id === id)!

  const visibleDebates = useMemo(() => {
    let list: Debate[]
    if (selectedPill === 'explore') {
      list = ALL_DEBATES
    } else {
      list = ALL_DEBATES.filter(d => d.category === selectedPill)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(d =>
        d.motion.toLowerCase().includes(q) ||
        (d.context ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [selectedPill, query])

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
      <PillRow selected={selectedPill} onSelect={setSelectedPill} />

      {/* Debate list */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {visibleDebates.length === 0 ? (
          <View style={s.empty}>
            <Text variant="bodyMd" tone="muted">No debates found.</Text>
          </View>
        ) : (
          visibleDebates.map((d, i) => {
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
    borderBottomWidth: 3,
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
