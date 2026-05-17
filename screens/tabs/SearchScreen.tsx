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
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
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
  whyDebate: string
  proTitle: string
  proBody: string
  conTitle: string
  conBody: string
}

const ALL_DEBATES: Debate[] = [
  {
    id: 'd1', category: 'politics',
    motion: 'Is democracy the best form of government?',
    context: 'Transfer of power controversies in recent Bengal elections sparked a fresh wave of debate across the country. Allegations of booth capture, lopsided media coverage, and last-minute defections have left even long-time supporters questioning whether the process still works as advertised.',
    agreeCount: 2100, disagreeCount: 1400, unsureCount: 600,
    whyDebate: 'Democracy is widely treated as the global default, yet outcomes — gridlock, populist capture, sliding voter trust — keep raising the question of whether the model still delivers fair representation.',
    proTitle: 'Power belongs to the people',
    proBody: 'Democracy is the only system that holds leaders accountable through elections, enshrines individual rights, and adapts peacefully to change.',
    conTitle: 'Mob rule over merit',
    conBody: 'Elected majorities can suppress minorities, short voting cycles discourage long-term policy, and money often controls outcomes more than public will.',
  },
  {
    id: 'd2', category: 'politics',
    motion: 'Should India remove religion-based laws?',
    context: 'Personal laws in India still differ across religions for marriage, inheritance, and adoption. The Uniform Civil Code conversation has resurfaced in every election cycle with rising intensity, splitting both legal scholars and the political class.',
    agreeCount: 3800, disagreeCount: 2600, unsureCount: 900,
    whyDebate: 'Different communities live under different personal-law regimes, which raises the question of equality before the law versus the protection of religious freedoms — a fault line at the heart of recent political battles.',
    proTitle: 'One nation, one law',
    proBody: 'A uniform civil code would put every citizen under the same family, marriage, and inheritance rules, reinforcing equality and removing structural unfairness.',
    conTitle: 'Pluralism is a feature, not a bug',
    conBody: "India's strength lies in accommodating different communities. Forcing a single code risks erasing minority traditions and inflaming fresh communal tensions.",
  },
  {
    id: 'd3', category: 'sports',
    motion: 'Should cricket be added to the Olympics?',
    context: 'The ICC has been lobbying the IOC for two decades. With Los Angeles 2028 opening the door to a short-format cricket event, boards, broadcasters, and players are weighing in on whether the sport should accept.',
    agreeCount: 5900, disagreeCount: 2300, unsureCount: 700, isNew: true,
    whyDebate: 'Cricket commands billion-strong audiences but the Olympics has long resisted formats it sees as logistically heavy. Reopening the door reignites old questions about scheduling, prestige, and who benefits.',
    proTitle: 'A global stage for a global sport',
    proBody: 'Olympic inclusion would push cricket into non-Commonwealth markets and unlock funding, infrastructure, and visibility for second-tier cricketing nations.',
    conTitle: 'Wrong format, wrong moment',
    conBody: "Calendars are already overcrowded, boards won't pause their domestic leagues, and a hurried T20 tournament risks watering down both Olympic and cricketing prestige.",
  },
  {
    id: 'd4', category: 'sports',
    motion: 'Should athletes be political role models?',
    context: 'Several cricketers backed opposing parties ahead of the IPL, dividing fans and pundits. Sponsors quietly distanced themselves, franchise owners scrambled, and players associations are now drafting fresh guidelines on political speech.',
    agreeCount: 980, disagreeCount: 1600, unsureCount: 520, endsIn: '3h',
    whyDebate: 'Athletes command massive audiences and cultural influence. Whether that platform comes with civic responsibilities — or whether mixing sport with politics alienates fans and endangers players — is hotly contested.',
    proTitle: 'Platform equals responsibility',
    proBody: 'Athletes who speak out have historically moved public opinion on civil rights, equality, and justice. Staying silent is itself a political choice that props up the status quo.',
    conTitle: 'Stick to sport',
    conBody: 'Fans come to sport for shared joy, not political division. Athletes risk their safety and livelihoods, and their influence rarely translates into meaningful policy change.',
  },
  {
    id: 'd5', category: 'culture',
    motion: 'Do we glorify violence in cinema too much?',
    context: "Back-to-back blockbusters this season pushed graphic content to new extremes, and streaming algorithms keep surfacing the bloodiest cuts to the top of every watch-next rail. State censor boards have flagged scenes that would have been cut outright a decade ago.",
    agreeCount: 1800, disagreeCount: 900, unsureCount: 340, isNew: true,
    whyDebate: 'Box-office data shows audiences flock to violent films, yet researchers and parents worry about desensitisation, especially as streaming puts this content in front of younger viewers with no friction.',
    proTitle: 'Art imitates a violent world',
    proBody: 'Cinema reflects reality. Sanitising violence strips stories of truth, stakes, and empathy — audiences are capable of distinguishing fiction from a call to action.',
    conTitle: 'Screen violence shapes behaviour',
    conBody: 'Repeated exposure normalises brutality, reduces empathy, and provides a template for real-world aggression — especially in adolescents still developing moral frameworks.',
  },
  {
    id: 'd6', category: 'culture',
    motion: 'Are translations betraying the originals?',
    context: 'With the global streaming boom and a surge in translated literature, the dubbing-vs-subtitling and faithful-vs-localised arguments have reignited across both film and publishing circles.',
    agreeCount: 1200, disagreeCount: 1800, unsureCount: 400,
    whyDebate: 'Translation has turned into a mass-market product, reigniting the old argument: how much of an "original" survives the move to a new language, audience, and cultural context?',
    proTitle: 'Translation is reinvention, not theft',
    proBody: 'A skilled translator carries voice, rhythm, and cultural context across. Without them, world cinema and literature would simply not exist beyond a tiny elite.',
    conTitle: 'Something is always lost',
    conBody: "Subtleties of metaphor, dialect, and rhyme rarely survive intact. Many translations smooth over difficulty in ways that flatten the writer's original intent.",
  },
]

// ─── PILLS ─────────────────────────────────────────────────────────

type PillId = 'explore' | CategoryId

const PILLS: { id: PillId; label: string; emoji?: string; color: string }[] = [
  { id: 'explore',  label: 'Explore', emoji: '', color: colors.text },
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [selectedPill, setSelectedPill] = useState<PillId>('explore')
  const [query, setQuery] = useState('')

  const findCategory = (id: CategoryId) => CATEGORIES.find(c => c.id === id)!

  const handleDebatePress = (d: Debate) => {
    const cat = findCategory(d.category)
    navigation.navigate('DebateDetail', {
      debateId: d.id,
      categoryId: d.category,
      categoryName: cat.name,
      categoryAccent: cat.accent,
      motion: d.motion,
      context: d.context,
      agreeCount: d.agreeCount,
      disagreeCount: d.disagreeCount,
      unsureCount: d.unsureCount,
      whyDebate: d.whyDebate,
      proTitle: d.proTitle,
      proBody: d.proBody,
      conTitle: d.conTitle,
      conBody: d.conBody,
    })
  }

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
