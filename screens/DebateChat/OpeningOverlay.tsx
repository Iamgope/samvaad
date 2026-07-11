import React, { useState, useEffect, useRef } from 'react'
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  Animated, Keyboard, Platform,
} from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../components/Text'
import { IconButton } from '../../components/IconButton'
import { ChevronLeftIcon } from '../../components/Icons'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'

const COUNTDOWN = 30
const CHAR_LIMIT = 220


function WatchIcon({ size = 20, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth={1.6} />
      <Path d="M12 8.5v3.5l2.5 2.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 4h5M9.5 20h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M9.5 4.5L10.5 6M14.5 4.5L13.5 6" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  )
}

function SwordsIcon({ size = 20, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* sword 1: tip top-left → handle bottom-right */}
      <Path d="M4 4L20 20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M13.5 18.5L18.5 13.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* sword 2: tip top-right → handle bottom-left */}
      <Path d="M20 4L4 20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M5.5 13.5L10.5 18.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}

function SendIcon({ size = 20, color = colors.black }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

type Props = {
  motion: string
  userSide: 'for' | 'against'
  onSubmit: (text: string) => void
}

export function OpeningOverlay({ motion, userSide, onSubmit }: Props) {
  const insets = useSafeAreaInsets()
  const [text, setText] = useState('')
  const [seconds, setSeconds] = useState(COUNTDOWN)
  const submitted = useRef(false)
  const inputRef = useRef<TextInput>(null)
  const fadeIn = useRef(new Animated.Value(0)).current

  const [kbHeight, setKbHeight] = useState(0)
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKbHeight(e.endCoordinates.height),
    )
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKbHeight(0),
    )
    return () => { show.remove(); hide.remove() }
  }, [])

  const isPro = userSide === 'for'
  const sideLabel = isPro ? 'Defend' : 'Attack'
  const placeholder = isPro ? 'I agree with this.' : "I don't agree with this."

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => {
      inputRef.current?.focus()
    })
  }, [])

  useEffect(() => {
    if (seconds <= 0) { handleSubmit(); return }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  const canSend = text.trim().length > 0

  const handleSubmit = () => {
    if (submitted.current) return
    submitted.current = true
    onSubmit(text.trim() || placeholder)
  }

  const timerColor = seconds <= 10 ? colors.streak : seconds <= 20 ? colors.gold : colors.textMuted

  return (
    <Animated.View style={[s.overlay, { opacity: fadeIn }]}>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          icon={<ChevronLeftIcon size={18} color={colors.text} strokeWidth={2.2} />}
          accent={colors.text}
          onPress={handleSubmit}
        />
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={s.submitBtn}>
          <View style={s.submitFace}>
            <Text style={s.submitLabel}>Send</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Compose – fills remaining space ── */}
      <View style={s.compose}>
        <Text style={s.motionLabel} numberOfLines={3}>{motion}</Text>
        <TextInput
          ref={inputRef}
          style={s.input}
          placeholder="Your opening shot..."
          placeholderTextColor={colors.textSubtle}
          value={text}
          onChangeText={t => setText(t.slice(0, CHAR_LIMIT))}
          multiline
          selectionColor={colors.text}
          maxLength={CHAR_LIMIT}
        />
      </View>

      {/* ── Toolbar – always at bottom, rises with keyboard ── */}
      <View style={[s.toolbar, { paddingBottom: insets.bottom + spacing.sm, marginBottom: kbHeight }]}>
        <View style={s.pillBox}>
          <WatchIcon size={18} color={colors.text} />
          <Text style={[s.pillNum, { color: timerColor }]}>
            {seconds}<Text style={[s.pillSign, { color: timerColor }]}>s</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSend}
          activeOpacity={0.85}
          style={[s.pillBox, s.sendPillBox, { backgroundColor: canSend ? colors.surface2 : colors.surface }]}
        >
          <View style={s.sendPillLeft}>
            <SwordsIcon size={18} color={colors.text} />
            <Text style={[s.pillNum, { color: canSend ? colors.text : colors.textMuted }]}>{sideLabel}</Text>
          </View>
          <View style={s.sendIconWrap}>
            <SendIcon size={24} color={canSend ? colors.text : colors.textSubtle} />
          </View>
        </TouchableOpacity>

      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    zIndex: 100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.md,
  },
  submitBtn: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: colors.text + '55',
    borderBottomColor: colors.text + 'AA',
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  submitFace: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text + '22',
    paddingHorizontal: spacing.md,
  },
  submitLabel: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 14,
    color: colors.text,
  },

  compose: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  motionLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 20,
    color: colors.textSubtle,
    lineHeight: 28,
    textAlign: 'center',
  },
  input: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 17,
    color: colors.text,
    lineHeight: 25,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
  pillBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    gap: 4,
  },
  sendPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sendPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sendIconWrap: {
    marginRight: 5,
  },
  pillNum: {
    fontFamily: fonts.display.black,
    fontSize: 15,
    letterSpacing: -0.3,
    color: colors.text,
  },
  pillSign: {
    fontFamily: fonts.display.bold,
    fontSize: 11,
    letterSpacing: -0.2,
  },
})
