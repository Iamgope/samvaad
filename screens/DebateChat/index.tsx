import React, { useRef, useState, useEffect, useMemo } from 'react'
import { FlatList, View, StyleSheet, Platform, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { TextInput } from 'react-native'
import { Text } from '../../components/Text'
import { ConfirmModal } from '../../components/ConfirmModal'
import { useQueryClient } from '@tanstack/react-query'
import { debateSession, fetchUserProfile, mediaUrl } from '../../services/api'
import { QUERY_KEYS, useUserProfile } from '../../hooks/useQueries'
import { roundHalfEven } from '../../utils/math'
import { DebateChatHeader } from './DebateChatHeader'
import { Bubble, OpeningCard, RoundDivider, TypingDots } from './MessageBubble'
import { DebateComposer } from './DebateComposer'
import { OpeningShareCard, shareOpeningCard } from './OpeningShareCard'
import { JudgingOverlay } from './JudgingOverlay'
import {
  CLOCK_SECONDS, CHAR_LIMIT, PASTE_GUARD_LEN, ROUND_TYPE_LABELS,
  type Side, type WsMsg, type RoundLabel, type Judgement,
} from './types'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateChat'>

function useKeyboardHeight() {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const show = Keyboard.addListener(showEvt, e => setHeight(e.endCoordinates.height))
    const hide = Keyboard.addListener(hideEvt, () => setHeight(0))
    return () => { show.remove(); hide.remove() }
  }, [])
  return height
}

export default function DebateChatScreen({ route, navigation }: Props) {
  const { motion, userSide, opponentName, categoryAccent, myUserId, pendingOpening } = route.params

  const queryClient = useQueryClient()
  const listRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // The opening round's real DB id — captured from the first message we see,
  // since the backend never actually uses 0 as a round id.
  const openingRoundIdRef = useRef<number | null>(null)

  const { data: myProfile } = useUserProfile()
  const shareCardRef = useRef<View>(null)
  const [shareData, setShareData] = useState<{ text: string; name: string; avatarUri: string | null } | null>(null)

  useEffect(() => {
    if (!shareData) return
    const id = setTimeout(() => {
      shareOpeningCard(shareCardRef).then(() => setShareData(null))
    }, 50)
    return () => clearTimeout(id)
  }, [shareData])

  const handleShareMessage = (msg: WsMsg) => {
    setShareData({
      text: msg.text,
      name: msg.isMe ? (myProfile?.user.username ?? 'You') : opponentName,
      avatarUri: msg.isMe && myProfile ? mediaUrl(myProfile.profile_pic) : null,
    })
  }

  const opSide = (userSide === 'for' ? 'against' : 'for') as Side

  const nowStr = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  const [messages, setMessages] = useState<WsMsg[]>([])
  const [roundLabels, setRoundLabels] = useState<RoundLabel[]>([{ roundId: 0, label: 'Opening' }])
  const [currentRoundType, setCurrentRoundType] = useState<'OPENING' | 'REBUTTAL'>('OPENING')
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [iHaveSentOpening, setIHaveSentOpening] = useState(false)
  const [hasSentInCurrentRound, setHasSentInCurrentRound] = useState(false)
  const [waitingForBotReply, setWaitingForBotReply] = useState(false)
  const [myTime, setMyTime] = useState(CLOCK_SECONDS)
  const [opTime, setOpTime] = useState(CLOCK_SECONDS)
  const [over, setOver] = useState(false)
  const completedSentRef = useRef(false)
  const [draft, setDraft] = useState('')
  const [wsLost, setWsLost] = useState(false)
  const [leaveWarning, setLeaveWarning] = useState(false)
  const verdictRef = useRef<any>(null)   // stores raw judgement from debate.completed
  // Drives JudgingOverlay independently of `over` — `over` never resets, and RN's
  // Modal renders above the whole app, so relying on `over` would leave it stuck
  // on screen even after we've navigated to DebateResult (which stays mounted underneath).
  const [judging, setJudging] = useState(false)
  useEffect(() => {
    if (!over) return
    setJudging(true)

    // Tell the backend the debate is over so it triggers the judge.
    // Safe to call even if end_turn was already used — the backend is idempotent.
    try {
      debateSession.client()?.send({ type: 'time_expired', data: {} })
    } catch (_) {}

    const goToResult = (username: string, rating: number) => {
      const j = verdictRef.current as Judgement | null
      const result: 'win' | 'loss' | 'draw' =
        j == null          ? 'draw'
        : j.winner == null ? 'draw'
        : Number(j.winner.id) === Number(myUserId) ? 'win'
        : 'loss'

      // Backend doesn't return a rating delta directly — derive it from the
      // side's own overall score, signed by whether that side won.
      const mySideOverall = j ? (userSide === 'for' ? j.overall_score_pro : j.overall_score_con) : 0
      const ratingDelta = result === 'draw' ? 0 : roundHalfEven(Number(mySideOverall) || 0) * (result === 'win' ? 1 : -1)
      const xpDelta = Number(j
        ? (userSide === 'for' ? j.xp_delta_pro : j.xp_delta_con)
        : 0) || 0

      // Profile was fetched before ELO update ran; add the delta to get the new rating.
      const updatedRating = rating + ratingDelta

      setJudging(false)
      navigation.replace('DebateResult', {
        motion,
        categoryId:    '',
        categoryName:  'Debate',
        categoryAccent,
        userSide,
        myUsername:    username,
        myRating:      updatedRating,
        opponentName,
        result,
        ratingDelta,
        xpDelta,
        reasoning:       j?.reasoning,
        strongestMoment: j?.strongest_moment,
        coachingTip:     userSide === 'for' ? j?.coaching_tip_pro : j?.coaching_tip_con,
        scores: j ? {
          argumentPro:  Number(j.argument_score_pro) || 0,
          rebuttalPro:  Number(j.rebuttal_score_pro) || 0,
          clarityPro:   Number(j.clarity_score_pro) || 0,
          persuasionPro: Number(j.persuasion_score_pro) || 0,
          argumentCon:  Number(j.argument_score_con) || 0,
          rebuttalCon:  Number(j.rebuttal_score_con) || 0,
          clarityCon:   Number(j.clarity_score_con) || 0,
          persuasionCon: Number(j.persuasion_score_con) || 0,
        } : undefined,
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myDebates })
    }

    // Fetch profile in parallel while waiting for the verdict
    const profilePromise = fetchUserProfile()
      .then(p => ({ username: p.user.username, rating: p.elo_rating }))
      .catch(() => ({ username: 'you', rating: 0 }))

    // Poll for verdictRef up to 18s (judge typically takes ~10s).
    // Enforce a minimum wait so the JudgingOverlay animation is actually
    // visible even when the verdict is already in hand the instant we go `over`.
    const MAX_WAIT_MS  = 18_000
    const MIN_WAIT_MS  = 2_500
    const POLL_MS      = 300
    let elapsed        = 0

    const poll = setInterval(async () => {
      elapsed += POLL_MS
      if ((verdictRef.current && elapsed >= MIN_WAIT_MS) || elapsed >= MAX_WAIT_MS) {
        clearInterval(poll)
        const { username, rating } = await profilePromise
        goToResult(username, rating)
      }
    }, POLL_MS)

    return () => clearInterval(poll)
  }, [over])
  const [showEmoji, setShowEmoji] = useState(false)
  const [opponentTyping, setOpponentTyping] = useState(false)
  const opponentTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingThrottleRef = useRef<number>(0)
  const bypassLeaveGuard = useRef(false)
  const pendingNavAction = useRef<Parameters<typeof navigation.dispatch>[0] | null>(null)

  const kbHeight = useKeyboardHeight()

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)

  useEffect(() => {
    if (kbHeight > 0) scrollToEnd()
  }, [kbHeight])

  // Intercept swipe-back gesture and Android hardware back
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (over || bypassLeaveGuard.current) return
      e.preventDefault()
      pendingNavAction.current = e.data.action
      setLeaveWarning(true)
    })
  }, [navigation, over])

  const confirmLeave = () => {
    debateSession.clear()
    setLeaveWarning(false)
    bypassLeaveGuard.current = true
    if (pendingNavAction.current) {
      navigation.dispatch(pendingNavAction.current)
      pendingNavAction.current = null
    } else {
      navigation.goBack()
    }
  }

  // Chess clock — ticks for whoever can currently act
  useEffect(() => {
    if (over) return
    if (currentRoundType === 'OPENING') return // Opening phase is handled by OpeningOverlay's 30s timer

    const myActive = isMyTurn && !waitingForBotReply
    const id = setInterval(() => {
      if (myActive) setMyTime(t => Math.max(0, t - 1))
      else setOpTime(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [currentRoundType, isMyTurn, waitingForBotReply, over])

  useEffect(() => {
    if (!over && (myTime === 0 || opTime === 0)) setOver(true)
  }, [myTime, opTime, over])

  // Ask the backend to judge the debate as soon as it ends, however it ended.
  useEffect(() => {
    if (!over || completedSentRef.current) return
    completedSentRef.current = true
    const ws = debateSession.client()
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    try {
      ws.send({ type: 'debate_completed', data: { debate_id: debateSession.debateId() } })
    } catch (err) {
      console.warn('Failed to send debate_completed', err)
    }
  }, [over])

  // Wire live WebSocket events
  useEffect(() => {
    const ws = debateSession.client()
    if (!ws) return

    const handleEvent = (raw: unknown) => {
      if (!raw || typeof raw !== 'object') return
      const ev = raw as { type?: string; message?: any; round?: any; data?: any; judgement?: any }

      if (ev.type === 'message.new' && ev.message) {
        const msg = ev.message
        const isMe = !!myUserId && Number(msg.user?.id) === Number(myUserId)
        const roundId = msg.round_id ?? 0
        if (openingRoundIdRef.current === null) openingRoundIdRef.current = roundId
        setMessages(prev => [...prev, {
          id: String(msg.id),
          isMe,
          text: msg.content ?? '',
          time: nowStr(),
          roundId,
        }])
        scrollToEnd()

        if (!isMe) {
          setOpponentTyping(false)
          if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current)
          setWaitingForBotReply(false)
          setCurrentRoundType(rt => {
            if (rt === 'REBUTTAL') {
              if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
              turnTimerRef.current = setTimeout(() => {
                setIsMyTurn(prev => prev ? prev : true)
              }, 700)
            }
            return rt
          })
        }
      }

      if (ev.type === 'round.advanced' && ev.round) {
        if (turnTimerRef.current) { clearTimeout(turnTimerRef.current); turnTimerRef.current = null }
        const round = ev.round
        const label = ROUND_TYPE_LABELS[round.round_type] ?? round.round_type
        setRoundLabels(prev => [...prev, { roundId: round.id, label }])
        setCurrentRoundType('REBUTTAL')
        setHasSentInCurrentRound(false)
        setWaitingForBotReply(false)
        const firstSpeakerId = round.current_speaker_id
        setIsMyTurn(!!myUserId && Number(firstSpeakerId) === Number(myUserId))
      }

      if (ev.type === 'opponent.typing') {
        setOpponentTyping(true)
        if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current)
        opponentTypingTimer.current = setTimeout(() => setOpponentTyping(false), 3000)
      }

      if (ev.type === 'debate.completed') {
        if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
        if (ev.judgement) verdictRef.current = ev.judgement
        setOver(true)
      }

      if (ev.type === 'debate_result' && ev.data) {
        verdictRef.current = ev.data as Judgement
      }
    }

    const off = ws.on('message', handleEvent)
    const offClose = ws.on('close', () => setWsLost(true))

    // Replay any events that arrived during the opening overlay
    debateSession.drainBuffer().forEach(handleEvent)

    // Auto-send the opening statement written before match
    if (pendingOpening && ws.readyState === WebSocket.OPEN) {
      ws.send({ type: 'message', data: { content: pendingOpening } })
      setIHaveSentOpening(true)
      setIsMyTurn(false)
    }

    return () => {
      off()
      offClose()
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
      if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current)
    }
  }, []) // mount once

  const onChangeDraft = (t: string) => {
    if (t.length - draft.length > PASTE_GUARD_LEN) return
    setDraft(t.slice(0, CHAR_LIMIT))
    const now = Date.now()
    if (canType && t.length > 0 && now - typingThrottleRef.current > 2000) {
      typingThrottleRef.current = now
      const wsTyping = debateSession.client()
      if (wsTyping && wsTyping.readyState === WebSocket.OPEN) {
        try { wsTyping.send({ type: 'typing', data: {} }) } catch (_) {}
      }
    }
  }

  const toggleEmoji = () =>
    setShowEmoji(v => {
      const next = !v
      if (next) Keyboard.dismiss()
      else inputRef.current?.focus()
      return next
    })

  const send = () => {
    if (!draft.trim() || over) return
    if (currentRoundType === 'OPENING' && iHaveSentOpening) return
    if (currentRoundType === 'REBUTTAL' && !isMyTurn) return

    const ws = debateSession.client()
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send({ type: 'message', data: { content: draft.trim() } })
    setDraft('')
    setShowEmoji(false)
    Keyboard.dismiss()
    scrollToEnd()
    if (currentRoundType === 'OPENING') {
      setIHaveSentOpening(true)
      setIsMyTurn(false)
    } else {
      setHasSentInCurrentRound(true)
      setWaitingForBotReply(true)
    }
  }

  const endTurn = () => {
    if (!isMyTurn || over || currentRoundType !== 'REBUTTAL') return
    const ws = debateSession.client()
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send({ type: 'end_turn', data: {} })
    setIsMyTurn(false)
    Keyboard.dismiss()
  }

  const listData = useMemo(() => {
    type ListItem = { type: 'divider'; id: string; label: string } | (WsMsg & { type: 'msg' })
    const out: ListItem[] = []
    const seenRounds = new Set<number>()
    out.push({ type: 'divider', id: 'div_opening', label: 'Opening' })

    messages.forEach(m => {
      if (m.roundId !== openingRoundIdRef.current && !seenRounds.has(m.roundId)) {
        seenRounds.add(m.roundId)
        const extra = roundLabels.find(r => r.roundId === m.roundId)
        if (extra) out.push({ type: 'divider', id: `div_${m.roundId}`, label: extra.label })
      }
      out.push({ ...m, type: 'msg' })
    })
    if (over) out.push({ type: 'divider', id: 'div_verdict', label: 'VERDICT' })
    return out
  }, [messages, roundLabels, over])

  const canType = !over && (currentRoundType === 'OPENING' ? !iHaveSentOpening : isMyTurn && !waitingForBotReply)
  const canSend = canType && !!draft.trim()
  const canEndTurn = !over && currentRoundType === 'REBUTTAL' && isMyTurn && !waitingForBotReply && hasSentInCurrentRound
  const showTypingDots = !over && (
    opponentTyping ||
    (currentRoundType === 'OPENING' && iHaveSentOpening) ||
    (currentRoundType === 'REBUTTAL' && waitingForBotReply)
  )
  const placeholder = over
    ? 'Match complete'
    : currentRoundType === 'OPENING'
      ? (iHaveSentOpening ? 'Waiting for opponent…' : 'State your opening…')
      : (isMyTurn ? 'Make your point…' : 'Waiting…')

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <DebateChatHeader
        opponentName={opponentName}
        myAvatarUri={myProfile ? mediaUrl(myProfile.profile_pic) : null}
        opponentSide={opSide}
        mySide={userSide}
        opTime={opTime}
        myTime={myTime}
        opponentActive={showTypingDots}
        myActive={canType}
      />

      <View style={s.motionBar}>
        <Text style={s.motionText} numberOfLines={2}>{motion}</Text>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          if (item.type === 'divider') return <RoundDivider label={item.label} />
          if (item.roundId === openingRoundIdRef.current) {
            return (
              <OpeningCard
                message={item}
                name={item.isMe ? 'You' : opponentName}
                onShare={() => handleShareMessage(item)}
              />
            )
          }
          return <Bubble message={item} />
        }}
        ListFooterComponent={showTypingDots ? <TypingDots color={colors.textMuted} /> : null}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {wsLost && !over && (
        <View style={s.wsLostBanner}>
          <Text variant="labelSm" style={s.wsLostText}>Connection lost — messages may not send</Text>
        </View>
      )}

      <DebateComposer
        draft={draft}
        onChangeDraft={onChangeDraft}
        inputRef={inputRef}
        showEmoji={showEmoji}
        onToggleEmoji={toggleEmoji}
        onHideEmoji={() => setShowEmoji(false)}
        over={over}
        canType={canType}
        canSend={canSend}
        canEndTurn={canEndTurn}
        placeholder={placeholder}
        onSend={send}
        onEndTurn={endTurn}
        kbHeight={kbHeight}
      />

      <JudgingOverlay visible={judging} />

      <ConfirmModal
        visible={leaveWarning}
        title="Leave debate?"
        message="Your opponent will be declared the winner if you leave now. This can't be undone."
        confirmLabel="Leave"
        cancelLabel="Stay"
        danger
        onConfirm={confirmLeave}
        onCancel={() => setLeaveWarning(false)}
      />

      {/* Off-screen — captured by view-shot when sharing an opening statement */}
      <View style={s.shareCapture} pointerEvents="none">
        <OpeningShareCard
          ref={shareCardRef}
          text={shareData?.text ?? ''}
          name={shareData?.name ?? ''}
          avatarUri={shareData?.avatarUri}
          motion={motion}
        />
      </View>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  motionBar: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  motionText: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  list: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs, paddingBottom: spacing.md },
  wsLostBanner: {
    backgroundColor: '#7C2D12',
    paddingVertical: spacing.xs,
    paddingHorizontal: SCREEN_PADDING,
    alignItems: 'center',
  },
  wsLostText: { color: '#FED7AA' },
  shareCapture: { position: 'absolute', left: -9999, top: 0 },
})
