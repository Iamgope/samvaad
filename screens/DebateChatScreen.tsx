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
type Phase = 'opening' | 'rebuttal' | 'verdict'

const sideLabel = (s: Side) => (s === 'for' ? 'FOR' : 'AGAINST')
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

type Message = { id: string; side: Side; text: string; time: string }

const OPENERS: Record<Side, string> = {
  for:  'The motion stands on solid ground — every measure of progress moves in its favour. I am here to defend it.',
  against: "It's net negative. The mechanics are engineered to exploit, not inform — and the costs land hardest on the most vulnerable.",
}

const MOCK_REPLIES = [
  'Sure, some good comes of it — but the same mechanics amplify outrage and misinformation far more efficiently than they spread truth.',
  'Reach without trust is just noise. A billion impressions don’t make a claim true.',
  'You are ignoring the broader context entirely. Zoom out and the picture inverts.',
  'Has this actually worked anywhere in practice, or is it theory dressed as fact?',
  'The burden of proof is on you here — and so far it has not been met.',
]

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
  const { motion, userSide, opponentName, categoryAccent } = route.params

  // The arena themes off the topic colour, resolved upstream at match time.
  // `colors.lime` is only the generic "All" filter accent (never a real topic),
  // so if it somehow reaches here, fall back to a neutral brand purple.
  const accent = !categoryAccent || categoryAccent === colors.lime ? colors.purple : categoryAccent
  const listRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)

  const opSide = (userSide === 'for' ? 'against' : 'for') as Side

  const now = () =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Opens with one statement from the opponent, then it's your turn.
  const [messages, setMessages] = useState<Message[]>([
    { id: 'opener', side: opSide, text: OPENERS[opSide], time: now() },
  ])
  const [activeSide, setActiveSide] = useState<Side>(userSide)
  const [myTime, setMyTime] = useState(CLOCK_SECONDS)
  const [opTime, setOpTime] = useState(CLOCK_SECONDS)
  const [over, setOver] = useState(false)
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const insets = useSafeAreaInsets()
  const kbHeight = useKeyboardHeight()
  const isMyTurn = activeSide === userSide

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)

  // Keep the latest message visible when the keyboard opens.
  useEffect(() => {
    if (kbHeight > 0) scrollToEnd()
  }, [kbHeight])

  // Chess clock — only the active side's budget ticks, and it never refreshes.
  useEffect(() => {
    if (over) return
    const id = setInterval(() => {
      if (activeSide === userSide) setMyTime(t => Math.max(0, t - 1))
      else setOpTime(t => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [activeSide, over])

  // A clock hitting zero ends the match.
  useEffect(() => {
    if (!over && (myTime === 0 || opTime === 0)) setOver(true)
  }, [myTime, opTime, over])

  // Opponent thinks, replies once, hands the mic back.
  useEffect(() => {
    if (isMyTurn || over) return
    const t = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: `op_${Date.now()}`, side: opSide, text: MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)], time: now() },
      ])
      setActiveSide(userSide)
      scrollToEnd()
    }, 2400 + Math.random() * 2600)
    return () => clearTimeout(t)
  }, [activeSide, over]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pasting is banned — arguments must be typed. `contextMenuHidden` kills the
  // long-press paste menu on touch; this guard also blocks a hardware-keyboard
  // paste, which lands as one big insertion no real typing/IME would produce.
  const onChangeDraft = (t: string) => {
    if (t.length - draft.length > PASTE_GUARD_LEN) return
    setDraft(t.slice(0, CHAR_LIMIT))
  }

  const addEmoji = (e: string) => setDraft(d => (d + e).slice(0, CHAR_LIMIT))

  // Swap between the emoji panel and the keyboard, like a chat app.
  const toggleEmoji = () =>
    setShowEmoji(v => {
      const next = !v
      if (next) Keyboard.dismiss()
      else inputRef.current?.focus()
      return next
    })

  const send = () => {
    if (!draft.trim() || !isMyTurn || over) return
    setMessages(prev => [...prev, { id: `me_${Date.now()}`, side: userSide, text: draft.trim(), time: now() }])
    setDraft('')
    setShowEmoji(false)
    setActiveSide(opSide)
    Keyboard.dismiss() // it's the opponent's turn now — drop the composer back down
    scrollToEnd()
  }

  const listData = useMemo(() => {
    const out: ({ type: 'divider'; id: string; label: string } | (Message & { type: 'msg' }))[] = []
    let prev: Phase | null = null
    messages.forEach((m, i) => {
      const ph: Phase = i < 2 ? 'opening' : 'rebuttal'
      if (ph !== prev) {
        out.push({ type: 'divider', id: `div_${ph}`, label: ph === 'opening' ? 'OPENING ROUND' : 'REBUTTAL ROUND' })
        prev = ph
      }
      out.push({ ...m, type: 'msg' })
    })
    if (over) out.push({ type: 'divider', id: 'div_verdict', label: 'VERDICT' })
    return out
  }, [messages, over])

  const canSend = isMyTurn && !over && !!draft.trim()

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
        <Combatant name={opponentName} side={opSide} isYou={false} accent={accent} time={opTime} active={!isMyTurn && !over} />
        <Text style={s.vs}>VS</Text>
        <Combatant name="You" side={userSide} isYou accent={accent} time={myTime} active={isMyTurn && !over} mirror />
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
              : <Bubble message={item} isMe={item.side === userSide} accent={accent} />
          }
          ListFooterComponent={!isMyTurn && !over ? <TypingDots color={colors.textMuted} /> : null}
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

          {showEmoji && isMyTurn && !over && (
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
              placeholder={over ? 'Match complete' : isMyTurn ? 'Make your point…' : 'Waiting…'}
              placeholderTextColor={colors.textSubtle}
              editable={isMyTurn && !over}
              multiline
              maxLength={CHAR_LIMIT}
              contextMenuHidden
              returnKeyType="send"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={send}
            />

            <View style={s.inputFooter}>
              {isMyTurn && !over && (
                <TouchableOpacity onPress={toggleEmoji} hitSlop={8} activeOpacity={0.7}>
                  <EmojiIcon size={22} color={showEmoji ? accent : colors.textMuted} />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {isMyTurn && !over && <Text style={s.charCount}>{draft.length}/{CHAR_LIMIT}</Text>}
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

function Bubble({ message, isMe, accent }: { message: Message; isMe: boolean; accent: string }) {
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
