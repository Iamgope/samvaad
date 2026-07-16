import React, { useRef, useEffect, useState } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'

// Ambient only — no fake stage progression, since the judge call is a
// single LLM pass with no real intermediate steps to report.
const MOODS = [
  'Weighing every argument.',
  "Duella doesn't rush this part.",
  'Reading between the rebuttals.',
  'Almost there.',
]

export function JudgingOverlay({ visible }: { visible: boolean }) {
  const scrimOpacity = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const textTranslateY = useRef(new Animated.Value(6)).current
  const dot1 = useRef(new Animated.Value(0.3)).current
  const dot2 = useRef(new Animated.Value(0.3)).current
  const dot3 = useRef(new Animated.Value(0.3)).current
  const moodOpacity = useRef(new Animated.Value(1)).current
  const [moodIndex, setMoodIndex] = useState(0)

  useEffect(() => {
    if (!visible) return

    Animated.timing(scrimOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start()
    Animated.parallel([
      Animated.timing(textOpacity, { toValue: 1, duration: 420, delay: 120, useNativeDriver: true }),
      Animated.timing(textTranslateY, { toValue: 0, duration: 420, delay: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()

    // three dots, each breathing in sequence — a quiet "still thinking" tell
    const breathe = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.delay(700),
        ]),
      )
    const l1 = breathe(dot1, 0)
    const l2 = breathe(dot2, 160)
    const l3 = breathe(dot3, 320)
    l1.start(); l2.start(); l3.start()

    return () => {
      l1.stop(); l2.stop(); l3.stop()
      scrimOpacity.setValue(0)
      textOpacity.setValue(0)
      textTranslateY.setValue(6)
    }
  }, [visible])

  // Crossfade mood line on an interval — texture only, not progress
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      Animated.timing(moodOpacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => {
        setMoodIndex(i => (i + 1) % MOODS.length)
        Animated.timing(moodOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start()
      })
    }, 3200)
    return () => clearInterval(id)
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View style={[s.overlay, { opacity: scrimOpacity }]}>
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }] }}>
        <Text style={s.title}>Judging your debate</Text>

        <View style={s.dotsRow}>
          <Animated.View style={[s.dot, { opacity: dot1 }]} />
          <Animated.View style={[s.dot, { opacity: dot2 }]} />
          <Animated.View style={[s.dot, { opacity: dot3 }]} />
        </View>

        <Animated.View style={{ opacity: moodOpacity }}>
          <Text style={s.mood}>{MOODS[moodIndex]}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.94)',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textMuted,
  },
  mood: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
  },
})
