import React, { useRef, useState, useEffect, useMemo } from 'react'
import { FlatList, StyleSheet, Platform, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { colors } from '../../constants/colors'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { TextInput } from 'react-native'
import { ConfirmModal } from '../../components/ConfirmModal'
import { debateSession } from '../../services/api'
import { DebateChatHeader } from './DebateChatHeader'
import { CombatantRow } from './CombatantRow'
import { Bubble, RoundDivider, TypingDots } from './MessageBubble'
import { DebateComposer } from './DebateComposer'
import { JudgementModal } from './JudgementModal'
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

  const accent = !categoryAccent || categoryAccent === colors.lime ? colors.purple : categoryAccent
  const listRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const opSide = (userSide === 'for' ? 'against' : 'for') as Side

  const nowStr = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  const [messages, setMessages] = useState<WsMsg[]>([])
  const [roundLabels, setRoundLabels] = useState<RoundLabel[]>([
    { roundId: 0, label: 'OPENING ROUND' },
  ])
  const [currentRoundType, setCurrentRoundType] = useState<'OPENING' | 'REBUTTAL'>('OPENING')
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [iHaveSentOpening, setIHaveSentOpening] = useState(false)
  const [hasSentInCurrentRound, setHasSentInCurrentRound] = useState(false)
  const [waitingForBotReply, setWaitingForBotReply] = useState(false)
  const [myTime, setMyTime] = useState(CLOCK_SECONDS)
  const [opTime, setOpTime] = useState(CLOCK_SECONDS)
  const [over, setOver] = useState(false)
  const [judgement, setJudgement] = useState<Judgement | null>(null)
  const completedSentRef = useRef(false)
  const [draft, setDraft] = useState('')
  const [leaveWarning, setLeaveWarning] = useState(false)
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
    const myActive = currentRoundType === 'OPENING' ? !iHaveSentOpening : isMyTurn && !waitingForBotReply
    const id = setInterval(() => {
      if (myActive) setMyTime(t => Math.max(0, t - 1))
      else setOpTime(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [currentRoundType, iHaveSentOpening, isMyTurn, waitingForBotReply, over])

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
      const ev = raw as { type?: string; message?: any; round?: any; data?: any }

      if (ev.type === 'message.new' && ev.message) {
        const msg = ev.message
        const isMe = !!myUserId && Number(msg.user?.id) === Number(myUserId)
        setMessages(prev => [...prev, {
          id: String(msg.id),
          isMe,
          text: msg.content ?? '',
          time: nowStr(),
          roundId: msg.round_id ?? 0,
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
        setOver(true)
      }

      if (ev.type === 'debate_result' && ev.data) {
        setJudgement(ev.data as Judgement)
      }
    }

    const off = ws.on('message', handleEvent)

    // Replay any events that arrived during the opening overlay
    debateSession.drainBuffer().forEach(handleEvent)

    // Auto-send the opening statement written before match
    if (pendingOpening) {
      ws.send({ type: 'message', data: { content: pendingOpening } })
      setIHaveSentOpening(true)
      setIsMyTurn(false)
    }

    return () => {
      off()
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
      debateSession.client()?.send({ type: 'typing', data: {} })
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
    if (!ws) return
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
    if (!ws) return
    ws.send({ type: 'end_turn', data: {} })
    setIsMyTurn(false)
    Keyboard.dismiss()
  }

  const listData = useMemo(() => {
    type ListItem = { type: 'divider'; id: string; label: string } | (WsMsg & { type: 'msg' })
    const out: ListItem[] = []
    const seenRounds = new Set<number>()
    out.push({ type: 'divider', id: 'div_opening', label: 'OPENING ROUND' })

    messages.forEach(m => {
      if (m.roundId !== 0 && !seenRounds.has(m.roundId)) {
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
        motion={motion}
        over={over}
        onBack={() => over ? navigation.goBack() : setLeaveWarning(true)}
        onForfeit={() => setLeaveWarning(true)}
        onReport={() => { /* TODO: report flow */ }}
      />

      <CombatantRow
        opponentName={opponentName}
        opSide={opSide}
        userSide={userSide}
        accent={accent}
        opTime={opTime}
        myTime={myTime}
        showTypingDots={showTypingDots}
        canType={canType}
      />

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          item.type === 'divider'
            ? <RoundDivider label={item.label} />
            : <Bubble message={item} accent={accent} />
        }
        ListFooterComponent={showTypingDots ? <TypingDots color={colors.textMuted} /> : null}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

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
        accent={accent}
        onSend={send}
        onEndTurn={endTurn}
        kbHeight={kbHeight}
      />

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

      <JudgingOverlay visible={over && !judgement} accent={accent} />

      <JudgementModal
        visible={!!judgement}
        judgement={judgement}
        myUserId={myUserId}
        userSide={userSide}
        opponentName={opponentName}
        onClose={() => navigation.goBack()}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  list: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs, paddingBottom: spacing.md },
})
