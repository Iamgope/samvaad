import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { ChipDropdown } from '../components/ChipDropdown'
import { ChevronLeftIcon } from '../components/Icons'
import { Toast } from '../components/Toast'
import { ConfirmModal } from '../components/ConfirmModal'
import {
  connectWebSocket,
  WebSocketClient,
  ApiError,
  getCurrentUserId,
  debateSession,
  mediaUrl,
  type DebateCategory,
} from '../services/api'
import { useCategories, useUserProfile, useUserProfileById } from '../hooks/useQueries'
import { getTierInfo } from '../constants/tiers'
import { OpeningOverlay } from './DebateChat/OpeningOverlay'
import { MatchIntroOverlay } from './DebateChat/MatchIntroOverlay'
import { VsLock, type VsLockPerson } from './DebateChat/VsLock'

// ─── DATA ─────────────────────────────────────────────────────────

const STANCES = [
  { id: 'surprise', label: 'Surprise Me', emoji: '🎲', accent: colors.lime },
  { id: 'for', label: 'Defend', emoji: '🛡️', accent: colors.lime },
  { id: 'against', label: 'Attack', emoji: '⚔️', accent: colors.limeMuted },
]

const ALL_CATEGORY_ID = 'all'
const CATEGORY_ACCENTS = [colors.streak, colors.sky, colors.purple2, colors.lime, '#F472B6', '#FB923C']
const CATEGORY_EMOJIS = ['🏛️', '🏆', '🎭', '🤖', '📚', '🎨', '⚖️', '🌍']

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

  const currentUser: VsLockPerson = {
    name: myProfile?.user.first_name || myProfile?.user.username || 'You',
    rating: myProfile ? Math.round(myProfile.elo_rating) : 0,
    tier: getTierInfo(myProfile?.elo_rating ?? 0).current.key,
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
    topicDescription: string | null
    proContext: string | null
    conContext: string | null
    userSide: 'for' | 'against'
    opponentName: string
    opponentId: number
    categoryAccent: string
    myUserId: number
  }
  const [matchedDebate, setMatchedDebate] = useState<MatchedDebate | null>(null)
  const { data: opponentProfile } = useUserProfileById(
    matchedDebate?.opponentId ?? 0,
    undefined,
    !!matchedDebate?.opponentId,
  )
  const [introDone, setIntroDone] = useState(false)
  const [leaveMatchWarning, setLeaveMatchWarning] = useState(false)
  const bypassLeaveGuard = useRef(false)
  const pendingNavAction = useRef<Parameters<typeof navigation.dispatch>[0] | null>(null)

  // Intercept swipe-back / hardware back once a match is found — losing the
  // WS connection here forfeits the debate, so it needs the same confirmation
  // as leaving mid-round from DebateChatScreen.
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e: any) => {
      if (!matchedDebate || bypassLeaveGuard.current) return
      e.preventDefault()
      pendingNavAction.current = e.data.action
      setLeaveMatchWarning(true)
    })
  }, [navigation, matchedDebate])

  const confirmLeaveMatch = () => {
    debateSession.clear()
    setLeaveMatchWarning(false)
    bypassLeaveGuard.current = true
    if (pendingNavAction.current) {
      navigation.dispatch(pendingNavAction.current)
      pendingNavAction.current = null
    } else {
      navigation.goBack()
    }
  }

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
            setIntroDone(false)
            setMatchedDebate({
              debateId: String(debate.id),
              motion: debate.topic?.title ?? 'Debate',
              topicDescription: debate.topic?.description ?? null,
              proContext: debate.topic?.pro_context ?? null,
              conContext: debate.topic?.con_context ?? null,
              userSide: isUserPro ? 'for' : 'against',
              opponentName: opponent?.username ?? 'Opponent',
              opponentId: opponent?.id ?? 0,
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
          <VsLock
            you={currentUser}
            youFooter={{ emoji: selectedStance.emoji, label: selectedStance.label.toUpperCase(), color: selectedStance.accent }}
            opponent={null}
            opponentFooter={{ emoji: category.emoji, label: category.label.toUpperCase() }}
            center={<Text style={s.vsText}>VS</Text>}
          />
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

            <Text style={s.stanceHint}>
              {selectedStance.id === 'surprise'
                ? "We'll randomly assign your stance once you're matched 🎲."
                : selectedStance.id === 'for'
                  ? "You'll debate FOR THIS MOTION."
                  : "You'll debate AGAINST THIS MOTION."}
            </Text>

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

      {matchedDebate && !introDone && (
        <MatchIntroOverlay
          motion={matchedDebate.motion}
          description={matchedDebate.topicDescription}
          sideContext={matchedDebate.userSide === 'for' ? matchedDebate.proContext : matchedDebate.conContext}
          you={currentUser}
          youStance={STANCES.find(st => st.id === matchedDebate.userSide) ?? selectedStance}
          opponentName={matchedDebate.opponentName}
          opponentRating={opponentProfile ? Math.round(opponentProfile.elo_rating) : undefined}
          onDone={() => setIntroDone(true)}
          onCancel={() => navigation.goBack()}
        />
      )}

      {matchedDebate && introDone && (
        <OpeningOverlay
          motion={matchedDebate.motion}
          userSide={matchedDebate.userSide}
          onSubmit={(openingText) => {
            const d = matchedDebate
            bypassLeaveGuard.current = true
            setMatchedDebate(null)
            navigation.replace('DebateChat', { ...d, pendingOpening: openingText })
          }}
          onBack={() => navigation.goBack()}
        />
      )}

      <ConfirmModal
        visible={leaveMatchWarning}
        title={introDone ? 'Leave debate?' : 'Cancel match?'}
        message={
          introDone
            ? "Your opponent will be declared the winner if you leave now. This can't be undone."
            : "You'll forfeit this match if you leave now. This can't be undone."
        }
        confirmLabel={introDone ? 'Leave' : 'End match'}
        cancelLabel="Stay"
        danger
        onConfirm={confirmLeaveMatch}
        onCancel={() => setLeaveMatchWarning(false)}
      />
    </SafeAreaView>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
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
  stanceHint: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    margin: spacing.lg
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
  vsText: {
    fontFamily: fonts.display.black,
    fontSize: 28, color: colors.lime, letterSpacing: -1.5,
    textShadowColor: colors.lime, textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
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
