import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Path, Rect, G, ClipPath, Defs } from 'react-native-svg'
import { colors } from '../constants/colors'

const AnimatedRect = Animated.createAnimatedComponent(Rect)

// 24x32 viewBox. Top bulb is wide at the top (y=3), tapering to a point at the
// neck (y=15). Bottom bulb mirrors it, widening from the neck (y=17) down to
// its base (y=29).
const TOP_BULB = 'M4,3 L20,3 L12,15 Z'
const BOTTOM_BULB = 'M4,29 L20,29 L12,17 Z'

type Props = {
  /** Seconds remaining. */
  seconds: number
  /** Seconds the countdown started from. */
  total: number
  size?: number
  color?: string
}

export function HourglassIcon({ seconds, total, size = 20, color = colors.text }: Props) {
  const progress = useRef(new Animated.Value(0)).current
  const trickle = useRef(new Animated.Value(0)).current

  // 0 = just flipped (sand all in the top bulb), 1 = time's up (sand all in the bottom bulb).
  useEffect(() => {
    const target = total > 0 ? 1 - seconds / total : 1
    Animated.timing(progress, {
      toValue: target,
      duration: 480,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start()
  }, [seconds, total])

  // A small grain falling through the neck on a continuous loop — just for a bit of life.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(trickle, { toValue: 1, duration: 650, easing: Easing.linear, useNativeDriver: false })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  // Remaining sand in the top bulb sits above the neck (apex at y=15) and its
  // surface descends toward the apex as it drains.
  const topSandY = progress.interpolate({ inputRange: [0, 1], outputRange: [3, 15] })
  const topSandHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] })
  // Sand piling up in the bottom bulb grows upward from its base (y=29).
  const bottomSandY = progress.interpolate({ inputRange: [0, 1], outputRange: [29, 17] })
  const bottomSandHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 12] })

  const trickleY = trickle.interpolate({ inputRange: [0, 1], outputRange: [15, 17] })
  const trickleOpacity = trickle.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] })

  return (
    <Svg width={size} height={size * (32 / 24)} viewBox="0 0 24 32">
      <Defs>
        <ClipPath id="hourglassTopBulb"><Path d={TOP_BULB} /></ClipPath>
        <ClipPath id="hourglassBottomBulb"><Path d={BOTTOM_BULB} /></ClipPath>
      </Defs>

      <G clipPath="url(#hourglassTopBulb)">
        <AnimatedRect x={4} width={16} y={topSandY} height={topSandHeight} fill={color} opacity={0.85} />
      </G>
      <G clipPath="url(#hourglassBottomBulb)">
        <AnimatedRect x={4} width={16} y={bottomSandY} height={bottomSandHeight} fill={color} opacity={0.85} />
      </G>
      <AnimatedRect x={11.3} width={1.4} rx={0.7} y={trickleY} height={2} fill={color} opacity={trickleOpacity} />

      {/* glass frame, drawn last so it sits above the sand */}
      <Path d={`${TOP_BULB} ${BOTTOM_BULB}`} stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
      <Path d="M2,3 H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M2,29 H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
}
