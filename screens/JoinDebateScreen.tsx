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
import { TOPICS } from '../constants/topics'
import { TIER_COLOR } from '../constants/tiers'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { ChipDropdown } from '../components/ChipDropdown'
import { Avatar } from '../components/Avatar'

const DEFAULT_AVATAR = require('../assets/defaultprofilepic.png')

// ─── DATA ─────────────────────────────────────────────────────────

const STANCES = [
  { id: 'surprise', label: 'Surprise Me', emoji: '🎲', accent: colors.lime   },
  { id: 'for',      label: 'Defend',      emoji: '🛡️',  accent: colors.sky    },
  { id: 'against',  label: 'Attack',      emoji: '⚔️',  accent: colors.streak },
]

const RULES = [
  'Keep arguments relevant to the motion — tangents are forfeit.',
  'Debate ideas, not people. Personal attacks end the match.',
]

// ─── VS LOCK ANIMATION ────────────────────────────────────────────

const CARD_W = 132
const CARD_H = 182

// Placeholder — swap for real profile context once wired up
const MOCK_USER = { name: 'Aman G.', initials: 'AG', rating: 2047, tier: 'master' as const }

type VsLockProps = { topic: (typeof TOPICS)[0]; stance: (typeof STANCES)[0] }

function VsLock({ topic, stance }: VsLockProps) {
  const slideLeft  = useRef(new Animated.Value(-220)).current
  const slideRight = useRef(new Animated.Value(220)).current
  const vsScale    = useRef(new Animated.Value(0)).current
  const scanLine   = useRef(new Animated.Value(0)).current
  const borderGlow = useRef(new Animated.Value(0.25)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideLeft,  { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.spring(slideRight, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.sequence([
        Animated.delay(260),
        Animated.spring(vsScale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 7 }),
      ]),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(vsScale, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(vsScale, { toValue: 1.00, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start()
    })

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(500),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlow, { toValue: 0.9, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(borderGlow, { toValue: 0.2, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start()

    return () => {
      [slideLeft, slideRight, vsScale, scanLine, borderGlow].forEach(a => a.stopAnimation())
    }
  }, [])

  const scanY     = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, CARD_H] })
  const tierColor = TIER_COLOR[MOCK_USER.tier] ?? colors.text

  return (
    <View style={vl.row}>

      {/* ── Left card — YOU ── */}
      <Animated.View style={[vl.outer, {
        borderColor:       colors.border,
        borderBottomColor: tierColor + '99',
        transform: [{ translateX: slideLeft }],
      }]}>
        <View style={vl.inner}>
          <View style={vl.cardTop}>
            <Text style={vl.eyebrow}>YOU</Text>
            <Avatar size={52} source={DEFAULT_AVATAR} borderColor={colors.borderStrong} offset={3} />
            <View style={vl.nameBlock}>
              <Text style={vl.playerName} numberOfLines={1}>{MOCK_USER.name}</Text>
              <View style={vl.tierChip}>
                <Text style={vl.tierLabel}>{MOCK_USER.tier.toUpperCase()}</Text>
                <Text style={vl.ratingDot}>·</Text>
                <Text style={vl.ratingText}>{MOCK_USER.rating}</Text>
              </View>
            </View>
          </View>
          <View style={vl.footer}>
            <Text style={vl.footerEmoji}>{stance.emoji}</Text>
            <Text style={[vl.footerLabel, { color: stance.accent }]} numberOfLines={1}>
              {stance.label.toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── VS badge ── */}
      <Animated.View style={[vl.vsWrap, { transform: [{ scale: vsScale }] }]}>
        <Text style={vl.vsText}>VS</Text>
      </Animated.View>

      {/* ── Right card — OPPONENT ── */}
      <Animated.View style={[vl.outer, {
        borderColor:       colors.border,
        borderBottomColor: colors.lime + '88',
        transform: [{ translateX: slideRight }],
      }]}>
        <View style={[vl.inner, { overflow: 'hidden' }]}>
          <Animated.View
            style={[StyleSheet.absoluteFill, vl.glowBorder, { borderColor: colors.lime, opacity: borderGlow }]}
            pointerEvents="none"
          />
          <Animated.View
            style={[vl.scanBar, { transform: [{ translateY: scanY }] }]}
            pointerEvents="none"
          />
          <View style={vl.cardTop}>
            <Text style={[vl.eyebrow, { color: colors.textFaint }]}>OPPONENT</Text>
            <Avatar
              size={52}
              initials="?"
              borderColor={colors.borderStrong}
              backgroundColor={colors.surface2}
              textColor={colors.textFaint}
              offset={3}
            />
            <View style={vl.nameBlock}>
              <Text style={[vl.playerName, { color: colors.textFaint }]}>· · ·</Text>
              <View style={vl.tierChip}>
                <Text style={[vl.tierLabel, { color: colors.textFaint }]}>SEARCHING</Text>
              </View>
            </View>
          </View>
          <View style={vl.footer}>
            <Text style={vl.footerEmoji}>{topic.emoji}</Text>
            <Text style={[vl.footerLabel, { color: colors.textSubtle }]} numberOfLines={1}>
              {topic.label.toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

    </View>
  )
}

const vl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // CategoryCard-style outer shell: thick tactile bottom border + drop shadow
  outer: {
    width: CARD_W, height: CARD_H,
    borderRadius: 16,
    borderWidth: 1.5, borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 0,
    elevation: 6,
  },
  inner: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  glowBorder: { borderRadius: 13, borderWidth: 1.5 },

  cardTop: {
    alignItems: 'center',
    paddingTop: 13, paddingHorizontal: 10,
    gap: 7,
  },
  eyebrow: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 8.5, letterSpacing: 2.2,
    color: colors.textSubtle,
  },
  nameBlock: { alignItems: 'center', gap: 5 },
  playerName: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12.5, color: colors.text, letterSpacing: -0.2,
  },
  tierChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: colors.surface2,
  },
  tierLabel: { fontFamily: fonts.jakarta.bold, fontSize: 7.5, letterSpacing: 0.8, color: colors.textMuted },
  ratingDot:  { fontFamily: fonts.jakarta.bold, fontSize: 8, color: colors.textFaint },
  ratingText: { fontFamily: fonts.jakarta.bold, fontSize: 8.5, color: colors.textMuted },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'center',
    paddingVertical: 9, paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerEmoji: { fontSize: 11 },
  footerLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 8, letterSpacing: 0.8, flexShrink: 1,
  },

  vsWrap: { width: 40, alignItems: 'center', justifyContent: 'center' },
  vsText: {
    fontFamily: fonts.display.black,
    fontSize: 28, color: colors.lime, letterSpacing: -1.5,
    textShadowColor: colors.lime, textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },

  scanBar: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: colors.lime, opacity: 0.4,
  },
})

// ─── SCREEN ───────────────────────────────────────────────────────

type RouteParams = { topicId?: string; stanceId?: string; categoryAccent?: string; motion?: string }
type Props = { navigation: any; route?: { params?: RouteParams } }

// Real debate topics (everything except the generic "All" filter).
const CONCRETE_TOPICS = TOPICS.filter(t => t.id !== 'all')

export default function JoinDebateScreen({ navigation, route }: Props) {
  const params = route?.params

  // Preselect from an explicit topicId, else from an incoming category accent
  // (e.g. arriving from a specific debate), else the default.
  const [topic, setTopic] = useState(
    (params?.topicId && TOPICS.find(t => t.id === params.topicId)) ||
    (params?.categoryAccent && TOPICS.find(t => t.accent === params.categoryAccent)) ||
    TOPICS[0]
  )
  const [selectedStance, setSelectedStance] = useState(
    params?.stanceId
      ? (STANCES.find(s => s.id === params.stanceId) ?? STANCES[0])
      : STANCES[0] // default: Surprise Me
  )
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!searching) return
    const resolvedSide = selectedStance.id === 'surprise'
      ? (Math.random() < 0.5 ? 'for' : 'against')
      : selectedStance.id as 'for' | 'against'

    // The topic is revealed once you're matched — so "All" lands on a concrete
    // topic here, and the arena themes off that topic's colour.
    const resolvedTopic = topic.id === 'all'
      ? CONCRETE_TOPICS[Math.floor(Math.random() * CONCRETE_TOPICS.length)]
      : topic

    const t = setTimeout(() => {
      navigation.replace('DebateChat', {
        debateId:      'mock-debate-1',
        motion:        params?.motion ?? resolvedTopic.label,
        userSide:      resolvedSide,
        opponentName:  'Arjun S.',
        categoryAccent: params?.categoryAccent ?? resolvedTopic.accent,
      })
    }, 3000)

    return () => clearTimeout(t)
  }, [searching])

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
          <Text style={s.searchingTitle}>FINDING{'\n'}YOUR MATCH.</Text>
          <VsLock topic={topic} stance={selectedStance} />
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
              variant="steel"
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
