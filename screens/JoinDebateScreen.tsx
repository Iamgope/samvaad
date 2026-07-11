import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { TIER_COLOR } from '../constants/tiers'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ChipDropdown } from '../components/ChipDropdown'
import { Avatar } from '../components/Avatar'
import { ChevronLeftIcon } from '../components/Icons'
import { Toast } from '../components/Toast'
import {
  connectWebSocket,
  WebSocketClient,
  ApiError,
  getCurrentUserId,
  debateSession,
  mediaUrl,
  type DebateCategory,
} from '../services/api'
import { useCategories, useUserProfile } from '../hooks/useQueries'
import { getTierInfo } from '../constants/tiers'
import { OpeningOverlay } from './DebateChat/OpeningOverlay'

const DEFAULT_AVATAR = require('../assets/defaultprofilepic.png')

// ─── DATA ─────────────────────────────────────────────────────────

const STANCES = [
  { id: 'surprise', label: 'Surprise Me', emoji: '🎲', accent: colors.lime   },
  { id: 'for',      label: 'Defend',      emoji: '🛡️',  accent: colors.sky    },
  { id: 'against',  label: 'Attack',      emoji: '⚔️',  accent: colors.streak },
]

const ALL_CATEGORY_ID = 'all'
const CATEGORY_ACCENTS = [colors.streak, colors.sky, colors.purple2, colors.lime, '#F472B6', '#FB923C']
const CATEGORY_EMOJIS  = ['🏛️', '🏆', '🎭', '🤖', '📚', '🎨', '⚖️', '🌍']

type CategoryChip = { id: string; label: string; emoji: string; accent: string }

const ALL_CHIP: CategoryChip = {
  id: ALL_CATEGORY_ID,
  label: 'All',
  emoji: '🌏',
  accent: colors.lime,
}

function toCategoryChips(categories: DebateCategory[]): CategoryChip[] {
  return [
    ALL_CHIP,
    ...categories.map((c, i) => ({
      id: String(c.id),
      label: c.name,
      emoji: CATEGORY_EMOJIS[i % CATEGORY_EMOJIS.length],
      accent: CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length],
    })),
  ]
}

const ETIQUETTE = [
  'Attack arguments, not people.',
  'One strong point beats three weak ones.',
  'Concede what you must. It earns more respect.',
]

// ─── VS LOCK ANIMATION ────────────────────────────────────────────

const CARD_W = 132
const CARD_H = 182

type CurrentUser = { name: string; initials: string; rating: number; tier: string; avatarUri: string | null }

type VsLockProps = { category: CategoryChip; stance: (typeof STANCES)[0]; user: CurrentUser }

function VsLock({ category, stance, user }: VsLockProps) {
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
  const tierColor = TIER_COLOR[user.tier] ?? colors.text

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
            <Avatar
              size={52}
              source={user.avatarUri ? { uri: user.avatarUri } : DEFAULT_AVATAR}
              borderColor={colors.borderStrong}
              offset={3}
            />
            <View style={vl.nameBlock}>
              <Text style={vl.playerName} numberOfLines={1}>{user.name}</Text>
              <View style={vl.tierChip}>
                <Text style={vl.tierLabel}>{user.tier.toUpperCase()}</Text>
                <Text style={vl.ratingDot}>·</Text>
                <Text style={vl.ratingText}>{user.rating}</Text>
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
            <Text style={vl.footerEmoji}>{category.emoji}</Text>
            <Text style={[vl.footerLabel, { color: colors.textSubtle }]} numberOfLines={1}>
              {category.label.toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

    </View>
  )
}

const vl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

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

type RouteParams = { categoryId?: string; stanceId?: string; topicId?: number; categoryAccent?: string; topicTitle?: string }
type Props = { navigation: any; route?: { params?: RouteParams } }

export default function JoinDebateScreen({ navigation, route }: Props) {
  const params = route?.params

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    isRefetching: refreshing,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories()

  const { data: myProfile } = useUserProfile()

  const currentUser: CurrentUser = {
    name:      myProfile?.user.first_name || myProfile?.user.username || 'You',
    initials:  (myProfile?.user.first_name || myProfile?.user.username || '?').slice(0, 2).toUpperCase(),
    rating:    myProfile ? Math.round(myProfile.elo_rating) : 0,
    tier:      getTierInfo(myProfile?.elo_rating ?? 0).current.key,
    avatarUri: myProfile ? mediaUrl(myProfile.profile_pic) : null,
  }

  const categories: DebateCategory[] = categoriesData?.categories ?? []
  const rules: string[] = categoriesData?.rules ?? []
  const fetchError = categoriesError
    ? ((categoriesError as ApiError).message ?? 'Failed to load categories')
    : null

  const categoryChips = useMemo(() => toCategoryChips(categories), [categories])

  const [category, setCategory] = useState<CategoryChip>(ALL_CHIP)
  const [selectedStance, setSelectedStance] = useState(
    params?.stanceId
      ? (STANCES.find(s => s.id === params.stanceId) ?? STANCES[0])
      : STANCES[0]
  )
  const [searching, setSearching] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const wsRef = useRef<WebSocketClient | null>(null)

  type MatchedDebate = {
    debateId: string
    motion: string
    userSide: 'for' | 'against'
    opponentName: string
    categoryAccent: string
    myUserId: number
  }
  const [matchedDebate, setMatchedDebate] = useState<MatchedDebate | null>(null)

  // Reconcile selected category once data arrives — preserve route-param default if it matches.
  useEffect(() => {
    if (categories.length === 0) return
    if (category.id !== ALL_CATEGORY_ID) {
      const stillExists = categoryChips.find(c => c.id === category.id)
      if (stillExists) { setCategory(stillExists); return }
    }
    if (params?.categoryId) {
      const match = categoryChips.find(c => c.id === params.categoryId)
      if (match) setCategory(match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryChips])

  const onRefresh = useCallback(() => { void refetchCategories() }, [refetchCategories])

  const closeSocket = () => {
    wsRef.current?.close()
    wsRef.current = null
  }

  useEffect(() => closeSocket, [])

  const hasSpecificTopic = !!params?.topicId

const stanceToSide = (id: string): 'PRO' | 'CON' | null => {
    if (id === 'for') return 'PRO'
    if (id === 'against') return 'CON'
    return null
  }

  const handleStepIntoRing = async () => {
    setQueueError(null)
    setConnecting(true)
    try {
      // Pre-fetch userId so the WS message handler stays synchronous.
      // An async WS callback silently swallows rejected Promises — errors become invisible.
      const myUserId = await getCurrentUserId()
      console.log('[WS] myUserId =', myUserId)

      const client = await connectWebSocket('/ws/debate/')
      wsRef.current = client

      client.on('message', (msg) => {
        console.log('[WS] message =', msg)
        if (!msg || typeof msg !== 'object') return
        const m = msg as { type?: string; message?: string; data?: unknown }

        if (m.type === 'error') {
          if (typeof m.message === 'string' && m.message.length > 0) setToast(m.message)
          setConnecting(false)
          return
        }

        if (m.type === 'queue.waiting') {
          setConnecting(false)
          setSearching(true)
          return
        }

        if (m.type === 'queue.matched') {
          try {
            const debate = (m.data as any)?.debate
            console.log('[WS] queue.matched debate =', JSON.stringify(debate))
            if (!debate) { setConnecting(false); return }

            const isUserPro = !!myUserId && Number(debate.user_pro?.id) === Number(myUserId)
            const opponent = isUserPro ? debate.user_con : debate.user_pro
            console.log('[WS] isUserPro =', isUserPro, '| opponent =', opponent?.username)

            if (wsRef.current) {
              debateSession.set(wsRef.current, debate.id)
              debateSession.startBuffering()
              wsRef.current = null
            }

            setConnecting(false)
            setMatchedDebate({
              debateId: String(debate.id),
              motion: debate.topic?.title ?? 'Debate',
              userSide: isUserPro ? 'for' : 'against',
              opponentName: opponent?.username ?? 'Opponent',
              categoryAccent: category.accent,
              myUserId: myUserId ?? 0,
            })
          } catch (navErr) {
            console.error('[WS] queue.matched handler error:', navErr)
          }
          return
        }
      })
      client.on('close', (info) => {
        console.log('[WS] closed =', info)
        wsRef.current = null
      })
      client.on('error', (err) => {
        console.log('[WS] error =', err)
      })

      const categoryIdNum = Number(category.id)
      const data: Record<string, number | string> = {}
      if (params?.topicId) {
        data.topic_id = params.topicId
      } else if (category.id !== ALL_CATEGORY_ID && Number.isFinite(categoryIdNum)) {
        data.category_id = categoryIdNum
      }
      const side = stanceToSide(selectedStance.id)
      if (side) data.pro_or_con = side

      client.send({ type: 'join_queue', data })
    } catch (err) {
      console.log('[WS] connect failed =', err)
      setQueueError('Could not connect to matchmaking. Please try again.')
      setConnecting(false)
      closeSocket()
    }
  }

  const handleCancelSearch = () => {
    closeSocket()
    setSearching(false)
    setConnecting(false)
  }

  const handleBack = () => {
    if (searching || connecting) handleCancelSearch()
    else navigation.goBack()
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <Toast message={toast} variant="error" onHide={() => setToast(null)} />

      {/* ── Header ── */}
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          accent={colors.text}
          onPress={handleBack}
        />
      </View>

      {searching ? (
        /* ── Searching state ── */
        <View style={s.searchingContainer}>
          <Text style={s.searchingTitle}>FINDING{'\n'}YOUR MATCH.</Text>
          <VsLock category={category} stance={selectedStance} user={currentUser} />
          <Text style={s.searchingMeta}>
            {category.emoji}  {category.label}  ·  {selectedStance.emoji}  {selectedStance.label}
          </Text>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={handleCancelSearch}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.textMuted}
                colors={[colors.textMuted]}
              />
            }
          >
            {/* Dropdowns */}
            <View style={s.filterRow}>
              {!hasSpecificTopic && (
                <>
                  <ChipDropdown
                    selected={category}
                    options={categoryChips}
                    onSelect={setCategory}
                    accent={category.accent}
                    zIndex={20}
                    menuAlign="left"
                  />
                  <Text style={s.filterSep}>·</Text>
                </>
              )}
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
              {loadingCategories && rules.length === 0 ? (
                <ActivityIndicator color={colors.lime} style={s.rulesLoader} />
              ) : fetchError && rules.length === 0 ? (
                <Text style={s.ruleText} tone="danger">{fetchError}</Text>
              ) : rules.length === 0 ? (
                <Text style={s.ruleText} tone="muted">No rules available.</Text>
              ) : rules.map((rule, i) => (
                <View key={i} style={s.ruleRow}>
                  <Text style={s.ruleDot}>—</Text>
                  <Text style={s.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>

            {/* ── Etiquette ── */}
            <View style={s.etiquetteSection}>
              <Text style={s.etiquetteHeading}>ETIQUETTE</Text>
              {ETIQUETTE.map((rule, i) => (
                <View key={i} style={s.etiquetteRow}>
                  <Text style={s.etiquetteDot}>·</Text>
                  <Text style={s.etiquetteText}>{rule}</Text>
                </View>
              ))}
            </View>

          </ScrollView>

          <View style={s.footer}>
            <Button
              label="STEP INTO THE RING"
              onPress={handleStepIntoRing}
              variant="steel"
              isLoading={connecting}
              disabled={connecting}
            />
            {queueError && (
              <Text variant="caption" tone="danger" style={s.queueError}>
                {queueError}
              </Text>
            )}
          </View>
        </>
      )}

      {matchedDebate && (
        <OpeningOverlay
          motion={matchedDebate.motion}
          userSide={matchedDebate.userSide}
          onSubmit={(openingText) => {
            const d = matchedDebate
            setMatchedDebate(null)
            navigation.replace('DebateChat', { ...d, pendingOpening: openingText })
          }}
        />
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

  // ── Topic mode label ──
  titleSmall: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: spacing.md,
    marginBottom: 2,
  },

  // ── Topic mode headline ──
  motionHeadline: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 22,
    color: colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },

  // ── Dropdowns (both modes) ──
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
  categoryDisabled: {
    opacity: 0.5,
  },

  // ── Format rounds ──
  formatSection: {
    gap: spacing.sm,
  },
  formatHeading: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  formatNum: {
    fontFamily: fonts.display.black,
    fontSize: 30,
    lineHeight: 32,
    color: colors.textFaint,
    letterSpacing: -1.5,
    width: 44,
  },
  formatBody: {
    flex: 1,
    paddingTop: 2,
    gap: 3,
  },
  formatTitle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  formatText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // ── Etiquette ──
  etiquetteSection: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  etiquetteHeading: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  etiquetteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 3,
  },
  etiquetteDot: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textFaint,
    lineHeight: 20,
  },
  etiquetteText: {
    flex: 1,
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // ── Footer CTA ──
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  // ── Searching state ──
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
  queueError: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  rulesLoader: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },

  rulesSection: {
    gap: spacing.sm,
  },
  rulesHeading: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  ruleDot: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textFaint,
    lineHeight: 20,
  },
  ruleText: {
    flex: 1,
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSubtle,
    lineHeight: 20,
  },
})
