import React, { useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

type Props = {
  name: string
  icon: any
  accent: string
  onPress: () => void
  delay?: number
  outerStyle?: StyleProp<ViewStyle>
}

export function CategoryCard({ name, icon, accent, onPress, delay = 0, outerStyle }: Props) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    )
    const t = setTimeout(() => loop.start(), delay)
    return () => { clearTimeout(t); loop.stop() }
  }, [pulse, delay])

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.3] })
  const innerScale  = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] })

  return (
    <View style={[s.outer, outerStyle, { borderColor: accent + '55', borderBottomColor: accent + 'AA' }]}>
      <TouchableOpacity
        style={[s.card, { backgroundColor: accent + '22' }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Animated.View
          style={[s.hemisphere, { backgroundColor: accent, opacity: glowOpacity, transform: [{ scale: innerScale }] }]}
        />
        <View style={[s.sparkle, s.sparkleTopRight]} />
        <View style={[s.sparkle, s.sparkleSm, s.sparkleTopLeft]} />
        <View style={s.iconWrap} pointerEvents="none">
          <Image source={icon} style={s.icon} resizeMode="contain" />
        </View>
        <Text style={s.name} numberOfLines={2}>{name}</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  outer: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 6,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 2,
    paddingBottom: spacing.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hemisphere: {
    position: 'absolute',
    top: '55%',
    alignSelf: 'center',
    width: '150%',
    aspectRatio: 1.1,
    borderRadius: 999,
  },
  iconWrap: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: '95%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: '180%', height: '180%' },
  name: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    opacity: 0.8,
    color: colors.text,
    letterSpacing: -0.1,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  sparkleSm:       { width: 3, height: 3, borderRadius: 1.5, opacity: 0.55 },
  sparkleTopRight: { top: 12, right: 10 },
  sparkleTopLeft:  { top: 22, left: 8 },
})
