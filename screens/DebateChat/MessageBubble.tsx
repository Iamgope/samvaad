import React, { useRef, useEffect } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'
import type { WsMsg } from './types'

export function TypingDots({ color = colors.textMuted }: { color?: string }) {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ]
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

export function RoundDivider({ label }: { label: string }) {
  return (
    <View style={s.dividerWrap}>
      <View style={s.dividerPill}>
        <Text style={s.dividerText}>{label}</Text>
      </View>
    </View>
  )
}

export function Bubble({ message, accent }: { message: WsMsg; accent: string }) {
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

const s = StyleSheet.create({
  typingBubble: {
    flexDirection: 'row', gap: 4, alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18, borderBottomLeftRadius: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4 },

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
})
