import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'

// ─── DATA ─────────────────────────────────────────────────────────

const TOPICS = [
  { id: 'all',      label: 'All',      emoji: '🌏' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'sports',   label: 'Sports',   emoji: '🏆' },
  { id: 'culture',  label: 'Culture',  emoji: '🎨' },
]

// 'surprise' is always first — it's the default and gets special treatment
const STANCES = [
  {
    id:     'surprise',
    label:  'Surprise Me',
    emoji:  '🎲',
    accent: colors.lime,
    desc:   'We assign your side when matched',
  },
  {
    id:     'for',
    label:  'Defend',
    emoji:  '🛡️',
    accent: colors.sky,
    desc:   'Argue in favour\nof the motion',
  },
  {
    id:     'against',
    label:  'Attack',
    emoji:  '⚔️',
    accent: colors.streak,
    desc:   'Argue against\nthe motion',
  },
]

const RULES = [
  'Keep arguments relevant to the motion — tangents are forfeit.',
  'Debate ideas, not people. Personal attacks end the match.',
]

// ─── FILTER CHIP ──────────────────────────────────────────────────
// Compact trigger that shows current selection — tap to expand options inline

function FilterChip({
  emoji, label, accent, open, onPress,
}: {
  emoji: string
  label: string
  accent: string
  open: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[
        fc.chip,
        open && { borderColor: accent, backgroundColor: accent + '14' },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={fc.emoji}>{emoji}</Text>
      <Text style={[fc.label, open && { color: accent }]}>{label}</Text>
      <Svg
        width={10} height={10} viewBox="0 0 10 10" fill="none"
        style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
      >
        <Path
          d="M2 3.5l3 3 3-3"
          stroke={open ? accent : colors.textSubtle}
          strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  )
}

const fc = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  emoji: { fontSize: 14 },
  label: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.text,
  },
})

// ─── TOPIC PILL ───────────────────────────────────────────────────

type TopicOption = typeof TOPICS[number]

function TopicPill({ topic, selected, onPress }: {
  topic: TopicOption; selected: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[
        tp.pill,
        selected && { borderColor: colors.lime, backgroundColor: colors.lime + '14' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={tp.emoji}>{topic.emoji}</Text>
      <Text style={[tp.label, selected && { color: colors.lime }]}>{topic.label}</Text>
    </TouchableOpacity>
  )
}

const tp = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: 100, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  emoji: { fontSize: 14 },
  label: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.textSubtle,
  },
})

// ─── STANCE OPTIONS ───────────────────────────────────────────────
// Surprise Me: full-width horizontal card (default, easiest choice)
// Defend / Attack: side-by-side vertical cards (deliberate selection)

type StanceOption = typeof STANCES[number]

function SurpriseCard({ selected, onPress }: { selected: boolean; onPress: () => void }) {
  const st = STANCES[0]
  return (
    <TouchableOpacity
      style={[
        sm.card,
        selected
          ? { borderColor: st.accent, backgroundColor: st.accent + '14' }
          : { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={sm.emoji}>{st.emoji}</Text>
      <View style={sm.textGroup}>
        <Text style={[sm.label, { color: selected ? st.accent : colors.text }]}>
          {st.label.toUpperCase()}
        </Text>
        <Text style={[sm.desc, { color: selected ? st.accent + 'AA' : colors.textSubtle }]}>
          {st.desc}
        </Text>
      </View>
      {selected && (
        <View style={[sm.check, { backgroundColor: st.accent }]}>
          <Text style={sm.checkMark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const sm = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  emoji: { fontSize: 24 },
  textGroup: { flex: 1, gap: 2 },
  label: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 13, letterSpacing: 0.8,
  },
  desc: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12, color: colors.textSubtle,
  },
  check: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12, color: colors.black,
  },
})

function StanceCard({ stance, selected, onPress }: {
  stance: StanceOption; selected: boolean; onPress: () => void
}) {
  const { accent } = stance
  return (
    <TouchableOpacity
      style={[
        sc.card,
        selected
          ? { borderColor: accent, backgroundColor: accent + '14' }
          : { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={sc.emoji}>{stance.emoji}</Text>
      <Text style={[sc.label, { color: selected ? accent : colors.text }]}>
        {stance.label.toUpperCase()}
      </Text>
      <Text style={[sc.desc, { color: selected ? accent + 'AA' : colors.textSubtle }]}>
        {stance.desc}
      </Text>
    </TouchableOpacity>
  )
}

const sc = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.sm,
    gap: spacing.xs, alignItems: 'center',
    justifyContent: 'center', minHeight: 105,
  },
  emoji: { fontSize: 24, marginBottom: spacing.xs },
  label: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12, letterSpacing: 0.8, textAlign: 'center',
  },
  desc: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11, textAlign: 'center', lineHeight: 15,
  },
})

// ─── RADAR ANIMATION ──────────────────────────────────────────────

const RADAR_SIZE = 240

function RadarScan() {
  const sweep = useRef(new Animated.Value(0)).current
  const p1    = useRef(new Animated.Value(0)).current
  const p2    = useRef(new Animated.Value(0)).current
  const p3    = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweep, {
        toValue: 1, duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1, duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start()

    pulse(p1, 0)
    pulse(p2, 800)
    pulse(p3, 1600)

    return () => {
      sweep.stopAnimation()
      p1.stopAnimation()
      p2.stopAnimation()
      p3.stopAnimation()
    }
  }, [])

  const sweepDeg = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const ringStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: RADAR_SIZE, height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 1, borderColor: colors.lime,
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }) }],
  })

  return (
    <View style={rd.container}>
      {[0.33, 0.62, 1].map((scale, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: RADAR_SIZE * scale, height: RADAR_SIZE * scale,
            borderRadius: (RADAR_SIZE * scale) / 2,
            borderWidth: 1,
            borderColor: colors.lime + ['14', '1A', '22'][i],
          }}
        />
      ))}
      <Animated.View style={ringStyle(p1)} />
      <Animated.View style={ringStyle(p2)} />
      <Animated.View style={ringStyle(p3)} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: 'center', justifyContent: 'center' },
          { transform: [{ rotate: sweepDeg }] },
        ]}
      >
        <View style={rd.sweepLine} />
        <View style={rd.sweepTrail} />
      </Animated.View>
      <View style={rd.centerDot} />
    </View>
  )
}

const rd = StyleSheet.create({
  container: {
    width: RADAR_SIZE, height: RADAR_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  sweepLine: {
    position: 'absolute',
    left: RADAR_SIZE / 2, top: RADAR_SIZE / 2 - 1,
    width: RADAR_SIZE / 2, height: 1.5,
    backgroundColor: colors.lime, opacity: 0.9,
    transformOrigin: 'left center',
  },
  sweepTrail: {
    position: 'absolute',
    left: RADAR_SIZE / 2, top: RADAR_SIZE / 2 - 1,
    width: RADAR_SIZE / 2, height: 3,
    backgroundColor: colors.lime + '30',
    transformOrigin: 'left center',
  },
  centerDot: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.lime,
    shadowColor: colors.lime,
    shadowOpacity: 1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
})

// ─── SCREEN ───────────────────────────────────────────────────────

type RouteParams = { topicId?: string; stanceId?: string }
type Props = { navigation: any; route?: { params?: RouteParams } }

export default function JoinDebateScreen({ navigation, route }: Props) {
  const params = route?.params

  const [topic, setTopic] = useState(
    params?.topicId
      ? (TOPICS.find(t => t.id === params.topicId) ?? TOPICS[0])
      : TOPICS[0]
  )
  const [selectedStance, setSelectedStance] = useState(
    params?.stanceId
      ? (STANCES.find(s => s.id === params.stanceId) ?? STANCES[0])
      : STANCES[0] // default: Surprise Me
  )
  const [searching, setSearching]   = useState(false)
  const [expanded,  setExpanded]    = useState<'topic' | 'stance' | null>(null)

  const toggleExpand = (panel: 'topic' | 'stance') =>
    setExpanded(v => v === panel ? null : panel)

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => { if (searching) setSearching(false); else navigation.goBack() }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7-7M5 12l7 7"
              stroke={colors.text} strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {searching ? (
        /* ── Searching state ── */
        <View style={s.searchingContainer}>
          <RadarScan />
          <Text style={s.searchingTitle}>FINDING{'\n'}YOUR MATCH.</Text>
          <Text style={s.searchingMeta}>
            {topic.emoji}  {topic.label}  ·  {selectedStance.emoji}  {selectedStance.label}
          </Text>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => setSearching(false)}
            activeOpacity={0.7}
          >
            <Text style={s.cancelLabel}>Cancel search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Idle state ── */
        <>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero */}
            <Text style={s.title}>ENTER THE{'\n'}ARENA.</Text>
            <Text style={s.subtitle}>PICK A SIDE. MAKE IT COUNT.</Text>

            {/* Filter chip row — compact, requires deliberate tap to change */}
            <View style={s.chipRow}>
              <FilterChip
                emoji={topic.emoji}
                label={topic.label}
                accent={colors.lime}
                open={expanded === 'topic'}
                onPress={() => toggleExpand('topic')}
              />
              <Text style={s.chipSep}>·</Text>
              <FilterChip
                emoji={selectedStance.emoji}
                label={selectedStance.label}
                accent={selectedStance.accent}
                open={expanded === 'stance'}
                onPress={() => toggleExpand('stance')}
              />
            </View>

            {/* Topic expanded panel */}
            {expanded === 'topic' && (
              <View style={s.expandedPanel}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.pillRow}
                >
                  {TOPICS.map(t => (
                    <TopicPill
                      key={t.id}
                      topic={t}
                      selected={topic.id === t.id}
                      onPress={() => { setTopic(t); setExpanded(null) }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Stance expanded panel */}
            {expanded === 'stance' && (
              <View style={s.expandedPanel}>
                {/* Surprise Me — full-width, default option */}
                <SurpriseCard
                  selected={selectedStance.id === 'surprise'}
                  onPress={() => { setSelectedStance(STANCES[0]); setExpanded(null) }}
                />
                {/* Defend + Attack — deliberate side-by-side */}
                <View style={s.stanceRow}>
                  {STANCES.slice(1).map(st => (
                    <StanceCard
                      key={st.id}
                      stance={st}
                      selected={selectedStance.id === st.id}
                      onPress={() => { setSelectedStance(st); setExpanded(null) }}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Rules */}
            <View style={s.rulesSection}>
              <Text style={s.rulesHeading}>GROUND RULES</Text>
              {RULES.map((rule, i) => (
                <View key={i} style={s.ruleRow}>
                  <Text style={s.ruleDot}>—</Text>
                  <Text style={s.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={s.footer}>
            <Button
              label="ENTER ARENA"
              onPress={() => { setExpanded(null); setSearching(true) }}
              variant="game"
              shadowColor={colors.lime}
            />
          </View>
        </>
      )}

    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.black },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },

  // Hero
  title: {
    fontFamily: fonts.display.black,
    fontSize: 52, lineHeight: 54,
    color: colors.text, letterSpacing: -2,
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11, color: colors.textSubtle,
    letterSpacing: 1.4, marginBottom: spacing.xl,
  },

  // Chip row
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipSep: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14, color: colors.textFaint,
  },

  // Expanded panels
  expandedPanel: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 2,
  },
  stanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  // Rules
  rulesSection: { gap: spacing.sm, marginTop: spacing.xl },
  rulesHeading: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10, color: colors.textFaint,
    letterSpacing: 1.5, marginBottom: spacing.xs,
  },
  ruleRow: { flexDirection: 'row', gap: spacing.sm },
  ruleDot: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13, color: colors.textFaint, lineHeight: 20,
  },
  ruleText: {
    flex: 1,
    fontFamily: fonts.jakarta.regular,
    fontSize: 13, color: colors.textSubtle, lineHeight: 20,
  },

  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  // Searching
  searchingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },
  searchingTitle: {
    fontFamily: fonts.display.black,
    fontSize: 40, lineHeight: 42,
    color: colors.text, letterSpacing: -1.5, textAlign: 'center',
  },
  searchingMeta: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 13, color: colors.textSubtle, letterSpacing: 0.3,
  },
  cancelBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: 6, borderWidth: 1, borderColor: colors.border,
  },
  cancelLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13, color: colors.textMuted,
  },
})
