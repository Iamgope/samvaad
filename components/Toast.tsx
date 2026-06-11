import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'
import { Text } from './Text'

type Variant = 'error' | 'info' | 'success'

type Props = {
  message: string | null
  variant?: Variant
  duration?: number
  onHide: () => void
}

const VARIANT_COLORS: Record<Variant, { bg: string; border: string }> = {
  error:   { bg: '#3A0E14', border: colors.red },
  info:    { bg: colors.surface, border: colors.border },
  success: { bg: '#0E3A1E', border: colors.lime },
}

export function Toast({ message, variant = 'error', duration = 2500, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-12)).current

  useEffect(() => {
    if (!message) return

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0,   duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
      ]).start(() => onHide())
    }, duration)

    return () => clearTimeout(timer)
  }, [message, duration, onHide, opacity, translateY])

  if (!message) return null

  const palette = VARIANT_COLORS[variant]

  return (
    <View pointerEvents="none" style={s.wrap}>
      <Animated.View
        style={[
          s.toast,
          { backgroundColor: palette.bg, borderColor: palette.border, opacity, transform: [{ translateY }] },
        ]}
      >
        <Text variant="bodySm" style={s.text}>{message}</Text>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    maxWidth: '90%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: fonts.jakarta.medium,
    color: colors.text,
    textAlign: 'center',
  },
})
