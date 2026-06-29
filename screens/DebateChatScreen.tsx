import React, { useRef, useState, useEffect, useMemo } from 'react'
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'
import { Text } from '../components/Text'
import { Avatar } from '../components/Avatar'
import { IconButton } from '../components/IconButton'
import { ChevronLeftIcon, FlagIcon } from '../components/Icons'
import { debateSession } from '../services/api'

type Props = NativeStackScreenProps<RootStackParamList, 'DebateChat'>

const CLOCK_SECONDS = 2 * 60 // each side's independent budget — never resets
const CHAR_LIMIT    = 400
const PASTE_GUARD_LEN = 8 // a single insertion bigger than this is treated as a paste and rejected

// Emoji palette for the in-composer picker.
const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣',
  '😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗',
  '🤔','🤭','🫢','🤫','🤥','😶','😐','😑','😬','🙄','😮','😯','😲','🥱','😴','🤤','😪','🫠','🤐','🥴',
  '🔥','💯','✨','⚡','💥','💢','💪','👏','🙌','🤝','👍','👎','👌','🤌','✌️','🤞','🫡','🙏','💀','👀',
  '🎯','🏆','🥇','🚀','💡','📈','📉','⚖️','🧠','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❓','❗',
]

type Side = 'for' | 'against'

const sideLabel = (s: Side) => (s === 'for' ? 'FOR' : 'AGAINST')
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

type WsMsg = { id: string; isMe: boolean; text: string; time: string; roundId: number }
type RoundLabel = { roundId: number; label: string }

const ROUND_TYPE_LABELS: Record<string, string> = {
  OPENING:  'OPENING ROUND',
  REBUTTAL: 'REBUTTAL ROUND',
}

// ─── Send arrow (ChatGPT-style "up") ──────────────────────────────

function ArrowUpIcon({ size = 18, color = colors.black as string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19 V6 M6 12 L12 6 L18 12"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// ─── Emoji (smiley) icon ──────────────────────────────────────────

function EmojiIcon({ size = 22, color = colors.textMuted as string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Circle cx="9" cy="10" r="1.15" fill={color} />
      <Circle cx="15" cy="10" r="1.15" fill={color} />
      <Path
        d="M8.2 14 C 9.6 16, 14.4 16, 15.8 14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  )
}

// ─── 3-dot menu icon ──────────────────────────────────────────────

function DotsVerticalIcon({ size = 18, color = colors.text }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="1.8" fill={color} />
      <Circle cx="12" cy="12" r="1.8" fill={color} />
      <Circle cx="12" cy="19" r="1.8" fill={color} />
    </Svg>
  )
}

// ─── Typing dots ───────────────────────────────────────────────────

function TypingDots({ color = colors.textMuted }: { color?: string }) {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current]
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    )
    loops.forEach(l => l.start())
    return () => loops.forEach(l => l.stop())
  }, [])
  return (
    <View style={s.typingBubble}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[s.typingDot, { backgroundColor: color, opacity: d }]} />
      ))}
    </View>
  )
}

// ─── Keyboard height ──────────────────────────────────────────────
// We lift the composer ourselves with a spacer rather than rely on the
// OS resizing the window. Under Android edge-to-edge (enabled in app.json)
// the window does NOT resize for the keyboard, so we must listen on both
// platforms — iOS gets the smoother `will` events, Android the `did` ones.

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

// ─── Screen ────────────────────────────────────────────────────────

export default function DebateChatScreen({ route, navigation }: Props) {
  const { motion, userSide, opponentName, categoryAccent, myUserId } = route.params

  const accent = !categoryAccent || categoryAccent === colors.lime ? colors.purple : categoryAccent
  const listRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // myUserId is passed as a route param (pre-fetched synchronously in JoinDebateScreen)

  const opSide = (userSide === 'for' ? 'against' : 'for') as Side

  const nowStr = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  const [messages, setMessages] = useState<WsMsg[]>([])
  const [roundLabels, setRoundLabels] = useState<RoundLabel[]>([
    { roundId: 0, label: 'OPENING ROUND' },
  ])
  const [currentRoundType, setCurrentRoundType] = useState<'OPENING' | 'REBUTTAL'>('OPENING')
  // OPENING: both can type simultaneously; REBUTTAL: strict turns, one message at a time
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [iHaveSentOpening, setIHaveSentOpening] = useState(false)
  const [hasSentInCurrentRound, setHasSentInCurrentRound] = useState(false)
  const [waitingForBotReply, setWaitingForBotReply] = useState(false)
  const [myTime, setMyTime] = useState(CLOCK_SECONDS)
  const [opTime, setOpTime] = useState(CLOCK_SECONDS)
  const [over, setOver] = useState(false)
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [opponentTyping, setOpponentTyping] = useState(false)
  const opponentTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingThrottleRef = useRef<number>(0)

  const insets = useSafeAreaInsets()
  const kbHeight = useKeyboardHeight()

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)

  useEffect(() => {
    if (kbHeight > 0) scrollToEnd()
  }, [kbHeight])

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

  // Wire live WebSocket events
  useEffect(() => {
    const ws = debateSession.client()
    if (!ws) return

    const off = ws.on('message', (raw) => {
      if (!raw || typeof raw !== 'object') return
      const ev = raw as { type?: string; message?: any; round?: any; judgement?: any }

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
          // Opponent replied — clear typing indicator and bot-reply gate
          setOpponentTyping(false)
          if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current)
          setWaitingForBotReply(false)
          // In REBUTTAL: after opponent's message, flip to my turn unless round.advanced arrives first
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
        // Whoever the backend set as first speaker opens REBUTTAL
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
    })

    return () => {
      off()
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
      if (opponentTypingTimer.current) clearTimeout(opponentTypingTimer.current)
    }
  }, []) // mount once

  const onChangeDraft = (t: string) => {
    if (t.length - draft.length > PASTE_GUARD_LEN) return
    setDraft(t.slice(0, CHAR_LIMIT))
    // Throttle typing events to once per 2 seconds
    const now = Date.now()
    if (canType && t.length > 0 && now - typingThrottleRef.current > 2000) {
      typingThrottleRef.current = now
      debateSession.client()?.send({ type: 'typing', data: {} })
    }
  }

  const addEmoji = (e: string) => setDraft(d => (d + e).slice(0, CHAR_LIMIT))

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
    // Always open with the OPENING label
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

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      <View>
      {/* ── Header: back · motion · menu ── */}
      <View style={s.header}>
        <IconButton
          icon={<ChevronLeftIcon size={18} color={colors.text} strokeWidth={2.2} />}
          accent={colors.text}
          onPress={() => navigation.goBack()}
        />
        <View style={s.headerCenter}>
          <Text style={s.motion} numberOfLines={2}>{motion}</Text>
        </View>
        <View style={s.menuWrap}>
          <IconButton
            icon={<DotsVerticalIcon size={18} color={colors.text} />}
            accent={colors.text}
            onPress={() => setMenuOpen(v => !v)}
          />
          {menuOpen && (
            <>
              <Pressable style={s.menuBackdrop} onPress={() => setMenuOpen(false)} />
              <View style={s.menu}>
                <TouchableOpacity
                  style={s.menuItem}
                  activeOpacity={0.7}
                  onPress={() => setMenuOpen(false)}
                >
                  <FlagIcon size={15} color={colors.red} />
                  <Text style={s.menuLabel}>Report user</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── Combatants: opponent (left) vs you (right) ── */}
      <View style={s.vsRow}>
        <Combatant name={opponentName} side={opSide} isYou={false} accent={accent} time={opTime} active={showTypingDots} />
        <Text style={s.vs}>VS</Text>
        <Combatant name="You" side={userSide} isYou accent={accent} time={myTime} active={canType} mirror />
      </View>
      </View>

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

        {/* ── Composer ── */}
        <View style={[s.composer, { paddingBottom: insets.bottom + (kbHeight > 0 ? spacing.md : 0) }]}>
          {over && (
            <View style={s.statusRow}>
              <Text style={s.statusFlag}>🏁</Text>
              <Text style={s.statusText}>Match complete</Text>
            </View>
          )}

          {showEmoji && canType && (
            <View style={s.emojiPanel}>
              <ScrollView
                contentContainerStyle={s.emojiGrid}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {EMOJIS.map((e, i) => (
                  <TouchableOpacity key={`${e}_${i}`} style={s.emojiCell} onPress={() => addEmoji(e)} activeOpacity={0.6}>
                    <Text style={s.emojiChar}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={s.inputBox}>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={draft}
              onChangeText={onChangeDraft}
              onFocus={() => setShowEmoji(false)}
              placeholder={
                over ? 'Match complete'
                : currentRoundType === 'OPENING'
                  ? (iHaveSentOpening ? 'Waiting for opponent…' : 'State your opening…')
                  : (isMyTurn ? 'Make your point…' : 'Waiting…')
              }
              placeholderTextColor={colors.textSubtle}
              editable={canType}
              multiline
              maxLength={CHAR_LIMIT}
              contextMenuHidden
              returnKeyType="send"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={send}
            />

            <View style={s.inputFooter}>
              {canType && (
                <TouchableOpacity onPress={toggleEmoji} hitSlop={8} activeOpacity={0.7}>
                  <EmojiIcon size={22} color={showEmoji ? accent : colors.textMuted} />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {canType && <Text style={s.charCount}>{draft.length}/{CHAR_LIMIT}</Text>}
              {canEndTurn && (
                <TouchableOpacity
                  onPress={endTurn}
                  activeOpacity={0.85}
                  style={s.endTurnBtn}
                >
                  <Text style={s.endTurnLabel}>End Turn</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={send}
                disabled={!canSend}
                activeOpacity={0.85}
                style={[s.sendBtn, { backgroundColor: canSend ? accent : colors.surface2 }]}
              >
                <ArrowUpIcon size={18} color={canSend ? colors.black : colors.textSubtle} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spacer lifts the composer above the keyboard on both platforms */}
        {kbHeight > 0 && <View style={{ height: kbHeight }} />}
    </SafeAreaView>
  )
}

// ─── Combatant (avatar only — no box) ──────────────────────────────

function Combatant({ name, side, isYou, accent, time, active, mirror }: {
  name: string
  side: Side
  isYou: boolean
  accent: string
  time: number
  active: boolean
  mirror?: boolean
}) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase()
  const ring = isYou ? accent : colors.text

  return (
    <View style={[cb.wrap, mirror && { flexDirection: 'row-reverse' }]}>
      <Avatar
        size={44}
        offset={3}
        initials={initial}
        borderColor={active ? ring : colors.border}
        glowColor={active ? ring : undefined}
        backgroundColor={isYou ? accent + '14' : colors.surface2}
        textColor={isYou ? accent : colors.textMuted}
      />
      <View style={[cb.info, mirror && { alignItems: 'flex-end' }]}>
        <Text style={cb.name} numberOfLines={1}>{name}</Text>
        <View style={cb.meta}>
          <Text style={cb.side}>{sideLabel(side)}</Text>
          <Text style={cb.sep}>·</Text>
          <Text style={[cb.time, active && { color: isYou ? accent : colors.text }]}>{fmtTime(time)}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Round divider ─────────────────────────────────────────────────

function RoundDivider({ label }: { label: string }) {
  return (
    <View style={s.dividerWrap}>
      <View style={s.dividerPill}><Text style={s.dividerText}>{label}</Text></View>
    </View>
  )
}

// ─── Bubble ────────────────────────────────────────────────────────

function Bubble({ message, accent }: { message: WsMsg; accent: string }) {
  const { isMe } = message
  return (
    <View style={[s.bubbleRow, isMe ? s.bubbleRowMe : s.bubbleRowThem]}>
      <View
        style={[
          s.bubble,
          isMe
            ? { backgroundColor: accent + '14', borderColor: accent + '2E', borderWidth: 1, borderBottomRightRadius: 6 }
            : s.bubbleThem,
        ]}
      >
        <Text style={s.bubbleText}>{message.text}</Text>
        <Text style={s.bubbleTime}>{message.time}</Text>
      </View>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    zIndex: 20, // let the dropdown menu paint above the combatants row
  },

  // ── 3-dot menu ──
  menuWrap: { position: 'relative' },
  menuBackdrop: { position: 'absolute', top: -1000, left: -2000, right: -2000, height: 4000 },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    minWidth: 168,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  menuLabel: { fontFamily: fonts.jakarta.medium, fontSize: 14, color: colors.red },
  headerCenter: { flex: 1, alignItems: 'center', gap: 3 },
  motion: {
    fontFamily: fonts.display.bold, fontSize: 16, lineHeight: 21,
    color: colors.text, letterSpacing: -0.3, textAlign: 'center',
  },

  // Combatants
  vsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs, paddingBottom: spacing.md,
  },
  vs: { fontFamily: fonts.display.black, fontSize: 11, color: colors.textSubtle, letterSpacing: 0.5 },

  // Feed
  list: { paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs, paddingBottom: spacing.md },

  dividerWrap: { alignItems: 'center', marginVertical: spacing.md },
  dividerPill: {
    backgroundColor: colors.surface, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 5,
  },
  dividerText: { fontFamily: fonts.jakarta.extraBold, fontSize: 10, color: colors.textMuted, letterSpacing: 1.4 },

  bubbleRow: { marginBottom: spacing.sm, maxWidth: '80%' },
  bubbleRowMe: { alignSelf: 'flex-end' },
  bubbleRowThem: { alignSelf: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2, paddingBottom: spacing.xs + 2,
    borderRadius: 18, minWidth: 64,
  },
  bubbleThem: { backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  bubbleText: { fontFamily: fonts.jakarta.regular, fontSize: 14, lineHeight: 21, color: colors.text },
  bubbleTime: { fontFamily: fonts.jakarta.regular, fontSize: 10, color: colors.textSubtle, alignSelf: 'flex-end', marginTop: 2 },

  typingBubble: {
    flexDirection: 'row', gap: 4, alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18, borderBottomLeftRadius: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4 },

  // Composer
  composer: {
    backgroundColor: colors.black,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs,
  },
  statusFlag: { fontSize: 13 },
  statusText: { fontFamily: fonts.jakarta.bold, fontSize: 12, color: colors.textMuted },

  inputBox: {
    backgroundColor: colors.surface,
    borderRadius: 24, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.sm + 2, paddingBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.jakarta.regular, fontSize: 15, lineHeight: 21,
    color: colors.text, maxHeight: 120, paddingVertical: 0, paddingTop: 2,
  },
  inputFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  charCount: { fontFamily: fonts.jakarta.regular, fontSize: 11, color: colors.textSubtle },

  // Emoji picker
  emojiPanel: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xs },
  emojiCell: { width: `${100 / 8}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  emojiChar: { fontSize: 24 },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  endTurnBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
  },
  endTurnLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11, color: colors.textMuted, letterSpacing: 0.3,
  },
})

const cb = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.display.bold, fontSize: 14, color: colors.text, letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  side: { fontFamily: fonts.jakarta.extraBold, fontSize: 9, color: colors.textSubtle, letterSpacing: 1 },
  sep: { fontSize: 9, color: colors.textFaint },
  time: { fontFamily: fonts.jakarta.bold, fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
})
