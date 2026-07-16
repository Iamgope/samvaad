import React, { useRef, useEffect, useState } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'

// Ambient only — no fake stage progression. These describe mood, not
// discrete backend steps, since the judge call is a single LLM pass.
const MOODS = [
  'Weighing every argument.',
  "Duella doesn't rush this part.",
  'Reading between the rebuttals.',
  'Almost there.',
]

const RING_SIZE = 96
const RING_RADIUS = 42

export function JudgingOverlay({ visible }: { visible: boolean }) {
  const cardScale = useRef(new Animated.Value(0.92)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current
  const spinCW = useRef(new Animated.Value(0)).current
  const spinCCW = useRef(new Animated.Value(0)).current
  const moodOpacity = useRef(new Animated.Value(1)).current
  const [moodIndex, setMoodIndex] = useState(0)

  useEffect(() => {
    if (!visible) return

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 140, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start()

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    const spinCWLoop = Animated.loop(
      Animated.timing(spinCW, { toValue: 1, duration: 5200, easing: Easing.linear, useNativeDriver: true }),
    )
    const spinCCWLoop = Animated.loop(
      Animated.timing(spinCCW, { toValue: 1, duration: 7800, easing: Easing.linear, useNativeDriver: true }),
    )

    pulseLoop.start()
    spinCWLoop.start()
    spinCCWLoop.start()

    return () => {
      pulseLoop.stop()
      spinCWLoop.stop()
      spinCCWLoop.stop()
      cardScale.setValue(0.92)
      cardOpacity.setValue(0)
    }
  }, [visible])

  // Crossfade mood text on an interval, independent of any real progress
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      Animated.timing(moodOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setMoodIndex(i => (i + 1) % MOODS.length)
        Animated.timing(moodOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start()
      })
    }, 2800)
    return () => clearInterval(id)
  }, [visible])

  if (!visible) return null

  const orbScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] })
  const rotateCW = spinCW.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const rotateCCW = spinCCW.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] })

  const circumference = 2 * Math.PI * RING_RADIUS

  return (
    <View style={s.overlay}>
      <Animated.View style={[s.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
        <View style={s.orbWrap}>
          {/* soft breathing glow behind everything */}
          <Animated.View
            style={[
              s.glow,
              { backgroundColor: colors.lime, opacity: glowOpacity, transform: [{ scale: orbScale }] },
            ]}
          />

          {/* outer dashed ring, slow clockwise spin */}
          <Animated.View style={{ transform: [{ rotate: rotateCW }] }}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.lime}
                strokeWidth={1.5}
                strokeOpacity={0.4}
                strokeDasharray={`${circumference * 0.18} ${circumference * 0.1}`}
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* inner dashed ring, faster counter-rotation */}
          <Animated.View style={[s.innerRing, { transform: [{ rotate: rotateCCW }] }]}>
            <Svg width={RING_SIZE - 22} height={RING_SIZE - 22} viewBox={`0 0 ${RING_SIZE - 22} ${RING_SIZE - 22}`}>
              <Circle
                cx={(RING_SIZE - 22) / 2}
                cy={(RING_SIZE - 22) / 2}
                r={RING_RADIUS - 11}
                stroke={colors.lime}
                strokeWidth={1.5}
                strokeOpacity={0.65}
                strokeDasharray={`${circumference * 0.1} ${circumference * 0.16}`}
                fill="none"
              />
            </Svg>
          </Animated.View>
        </View>

        <Text style={s.title}>JUDGING YOUR DEBATE</Text>

        <Animated.View style={{ opacity: moodOpacity, minHeight: 20 }}>
          <Text style={s.subtitle}>{MOODS[moodIndex]}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.86)',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl + spacing.md,
    gap: spacing.sm,
  },
  orbWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  glow: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  innerRing: {
    position: 'absolute',
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    letterSpacing: 1.5,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
