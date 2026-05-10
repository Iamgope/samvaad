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
  { id: 'all',      label: 'All',      emoji: '🌏', accent: colors.lime    },
  { id: 'politics', label: 'Politics', emoji: '🏛️',  accent: colors.streak  },
  { id: 'sports',   label: 'Sports',   emoji: '🏆', accent: colors.sky     },
  { id: 'culture',  label: 'Culture',  emoji: '🎨', accent: colors.purple2 },
]

const STANCES = [
  { id: 'surprise', label: 'Surprise Me', emoji: '🎲', accent: colors.lime   },
  { id: 'for',      label: 'Defend',      emoji: '🛡️',  accent: colors.sky    },
  { id: 'against',  label: 'Attack',      emoji: '⚔️',  accent: colors.streak },
]

const RULES = [
  'Keep arguments relevant to the motion — tangents are forfeit.',
  'Debate ideas, not people. Personal attacks end the match.',
]

// ─── CHIP DROPDOWN ────────────────────────────────────────────────

type Option = { id: string; label: string; emoji: string; accent?: string }

function ChipDropdown<T extends Option>({
  selected,
  options,
  onSelect,
  accent,
  zIndex,
}: {
  selected: T
  options: T[]
  onSelect: (o: T) => void
  accent: string
  zIndex?: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <View style={[cd.wrap, { zIndex: open ? 50 : (zIndex ?? 1) }]}>
      <TouchableOpacity
        style={[cd.chip, open && { borderColor: accent, backgroundColor: accent + '14' }]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={cd.emoji}>{selected.emoji}</Text>
        <Text style={[cd.label, open && { color: accent }]}>{selected.label}</Text>
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

      {open && (
        <View style={cd.menu}>
          {options.map((o, i) => {
            const active    = o.id === selected.id
            const itemAccent = o.accent ?? accent
            return (
              <TouchableOpacity
                key={o.id}
                style={[cd.option, i < options.length - 1 && cd.optionDivider]}
                onPress={() => { onSelect(o); setOpen(false) }}
                activeOpacity={0.7}
              >
                <Text style={cd.optionEmoji}>{o.emoji}</Text>
                <Text style={[cd.optionLabel, active && { color: itemAccent }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </View>
  )
}

const cd = StyleSheet.create({
  wrap: { position: 'relative' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },
  emoji: { fontSize: 14 },
  label: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 150,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  optionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionEmoji: { fontSize: 15 },
  optionLabel: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 14,
    color: colors.textMuted,
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
  const [searching, setSearching] = useState(false)

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
            {/* Hero title */}
            <Text style={s.titleSmall}>THE ARENA</Text>
            <Text style={s.titleLarge}>AWAITS.</Text>
            <Text style={s.subtitle}>PICK A SIDE. MAKE IT COUNT.</Text>

            {/* Dropdowns */}
            <View style={s.filterRow}>
              <ChipDropdown
                selected={topic}
                options={TOPICS}
                onSelect={setTopic}
                accent={topic.accent}
                zIndex={20}
              />
              <Text style={s.filterSep}>·</Text>
              <ChipDropdown
                selected={selectedStance}
                options={STANCES}
                onSelect={setSelectedStance}
                accent={selectedStance.accent}
                zIndex={10}
              />
            </View>

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
              label="STEP INTO THE RING"
              onPress={() => setSearching(true)}
              variant="primary"
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

  // Hero — two-line staggered: small word then large punch word
  titleSmall: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: colors.textSubtle,
    letterSpacing: 2,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  titleLarge: {
    fontFamily: fonts.display.black,
    fontSize: 64,
    lineHeight: 64,
    color: colors.text,
    letterSpacing: -3,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11,
    color: colors.textSubtle,
    letterSpacing: 1.4,
    marginBottom: spacing.xxl,
  },

  // Dropdowns
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl + spacing.xl,
  },
  filterSep: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.textFaint,
  },

  // Rules
  rulesSection: { gap: spacing.sm },
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
