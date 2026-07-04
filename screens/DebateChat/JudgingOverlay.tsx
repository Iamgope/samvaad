import React, { useRef, useEffect } from 'react'
import { Modal, View, StyleSheet, Animated, Easing } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { AnalysisIcon } from '../../components/Icons'
import { TypingDots } from './MessageBubble'

export function JudgingOverlay({ visible, accent }: { visible: boolean; accent: string }) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [visible])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] })

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Animated.View style={[s.glow, { backgroundColor: accent, opacity: glowOpacity, transform: [{ scale }] }]} />
            <View style={[s.iconRing, { borderColor: accent + '55' }]}>
              <AnalysisIcon size={26} color={accent} />
            </View>
          </View>

          <Text style={s.title}>JUDGING YOUR DEBATE</Text>
          <Text style={s.subtitle}>
            Our AI referee is weighing every argument, rebuttal, and comeback. Be patient — the verdict is on its way.
          </Text>

          <TypingDots color={colors.textMuted} />
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl + spacing.sm,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  glow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
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
    marginBottom: spacing.xs,
  },
})
