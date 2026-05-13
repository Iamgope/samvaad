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
import Svg, { Path } from 'react-native-svg'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

/**
 * GridCard - A flexible, reusable card component for grids
 *
 * VARIANTS:
 * - 'category': Large card with pulsing animation, sparkles, and icon. Uses accent color with glow effect.
 *   Example: Homepage topic tiles (Politics, Sports, Culture)
 *
 * - 'achievement': Square achievement badge with icon, locked state, and label.
 *   Example: Profile achievements (First win, 10-win streak, etc.)
 *
 * - 'topic-stat': Horizontal card with colored dot, label, and percentage value.
 *   Example: By topic breakdown (Politics 73%, Sports 55%, etc.)
 *
 * - 'minimal': Simple centered card with icon, label, and optional sublabel.
 *   Example: Generic grid items with custom styling
 *
 * CUSTOMIZATION:
 * - accent: Color string for the primary accent color
 * - animation: { type: 'pulse' | 'none', delay?: number } - Add pulsing glow effect
 * - glowIntensity: 'low' | 'medium' | 'high' - Controls animation intensity
 * - showSparkles: boolean - Show decorative sparkles (category variant only)
 * - isLocked: boolean - Fade out and disable (achievement variant)
 * - icon: IconConfig - Customize icon (image or SVG path)
 *
 * USAGE EXAMPLES:
 *
 * Category card (with animation):
 * <GridCard
 *   variant="category"
 *   accent="#C7522A"
 *   label="Politics"
 *   icon={{ type: 'image', source: require('../assets/politics_icon.png') }}
 *   animation={{ type: 'pulse', delay: 250 }}
 *   onPress={() => handlePress()}
 * />
 *
 * Achievement card (locked state):
 * <GridCard
 *   variant="achievement"
 *   accent={colors.text}
 *   label="Top 10"
 *   isLocked={true}
 *   icon={{
 *     type: 'svg',
 *     svgPath: 'M3 18h18M3 8l4 4 5-7 5 7 4-4v10H3V8z',
 *     svgColor: colors.textFaint,
 *   }}
 * />
 *
 * Topic stat card:
 * <GridCard
 *   variant="topic-stat"
 *   accent="#2A8088"
 *   label="Sports"
 *   value={55}
 * />
 *
 * Minimal card:
 * <GridCard
 *   variant="minimal"
 *   accent="#6B4FB8"
 *   label="Culture"
 *   sublabel="67% win rate"
 *   onPress={() => handlePress()}
 * />
 */

type CardVariant = 'category' | 'achievement' | 'topic-stat' | 'minimal'

type IconConfig = {
  type: 'image' | 'svg'
  source?: any
  svgPath?: string
  svgColor?: string
}

type AnimationConfig = {
  type: 'pulse' | 'none'
  delay?: number
}

type Props = {
  variant: CardVariant
  accent: string
  icon?: IconConfig
  label: string
  sublabel?: string
  value?: string | number
  isActive?: boolean
  isLocked?: boolean
  onPress?: () => void
  outerStyle?: StyleProp<ViewStyle>
  animation?: AnimationConfig
  showSparkles?: boolean
  glowIntensity?: 'low' | 'medium' | 'high'
}

export function GridCard({
  variant,
  accent,
  icon,
  label,
  sublabel,
  value,
  isActive = true,
  isLocked = false,
  onPress,
  outerStyle,
  animation = { type: 'none' },
  showSparkles = true,
  glowIntensity = 'medium',
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animation.type === 'pulse') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 3200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
      const t = setTimeout(() => loop.start(), animation.delay ?? 0)
      return () => {
        clearTimeout(t)
        loop.stop()
      }
    }
  }, [pulse, animation])

  const glowOpacity =
    animation.type === 'pulse'
      ? pulse.interpolate({
          inputRange: [0, 1],
          outputRange: glowIntensity === 'high' ? [0.2, 0.4] : glowIntensity === 'low' ? [0.1, 0.2] : [0.15, 0.3],
        })
      : 0

  const innerScale =
    animation.type === 'pulse'
      ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] })
      : 1

  const cardBg = isLocked ? 'rgba(255,255,255,0.02)' : accent + '22'
  const borderColor = isLocked ? 'rgba(255,255,255,0.05)' : accent + '55'
  const borderBottomColor = isLocked ? 'rgba(255,255,255,0.08)' : accent + 'AA'

  const renderIcon = () => {
    if (!icon) return null
    if (icon.type === 'image' && icon.source) {
      return <Image source={icon.source} style={s.icon} resizeMode="contain" />
    }
    if (icon.type === 'svg' && icon.svgPath) {
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d={icon.svgPath} stroke={icon.svgColor || colors.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    }
    return null
  }

  const renderVariant = () => {
    switch (variant) {
      case 'category':
        return (
          <>
            {animation.type === 'pulse' && (
              <Animated.View
                style={[s.hemisphere, { backgroundColor: accent, opacity: glowOpacity, transform: [{ scale: innerScale }] }]}
              />
            )}
            {showSparkles && (
              <>
                <View style={[s.sparkle, s.sparkleTopRight]} />
                <View style={[s.sparkle, s.sparkleSm, s.sparkleTopLeft]} />
              </>
            )}
            <View style={s.iconWrap} pointerEvents="none">
              {renderIcon()}
            </View>
          </>
        )

      case 'achievement':
        return (
          <View style={s.achievementContent}>
            <View style={[s.achievementIconWrap, isLocked ? s.achievementIconLocked : s.achievementIconEarned]}>
              {renderIcon()}
            </View>
            <Text style={[s.achievementLabel, isLocked && s.achievementLabelLocked]} numberOfLines={2}>
              {label}
            </Text>
          </View>
        )

      case 'topic-stat':
        return (
          <View style={s.topicContent}>
            <View style={s.topicHeader}>
              <View style={[s.topicDot, { backgroundColor: accent }]} />
              <Text style={s.topicLabel} numberOfLines={1}>
                {label}
              </Text>
            </View>
            {value && <Text style={s.topicValue}>{value}%</Text>}
          </View>
        )

      case 'minimal':
      default:
        return (
          <View style={s.minimalContent}>
            <View style={s.minimalIconWrap}>{renderIcon()}</View>
            <Text style={s.minimalLabel} numberOfLines={2}>
              {label}
            </Text>
            {sublabel && (
              <Text style={s.minimalSublabel} numberOfLines={1}>
                {sublabel}
              </Text>
            )}
          </View>
        )
    }
  }

  const cardContent = (
    <View style={[s.card, { backgroundColor: cardBg }, variant === 'category' && s.categoryCard]}>
      {renderVariant()}
    </View>
  )

  const content =
    variant === 'achievement' || variant === 'topic-stat' || variant === 'minimal' ? (
      <View style={s.simpleCard}>{cardContent}</View>
    ) : (
      <View style={[s.outer, outerStyle, { borderColor, borderBottomColor }]}>{cardContent}</View>
    )

  if (onPress && isActive) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
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
  categoryCard: {
    justifyContent: 'flex-end',
  },
  simpleCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: spacing.md,
  },

  // Category variant
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
  sparkleSm: { width: 3, height: 3, borderRadius: 1.5, opacity: 0.55 },
  sparkleTopRight: { top: 12, right: 10 },
  sparkleTopLeft: { top: 22, left: 8 },

  // Achievement variant
  achievementContent: {
    alignItems: 'center',
    gap: 8,
  },
  achievementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  achievementIconEarned: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  achievementLabel: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },
  achievementLabelLocked: {
    color: colors.textFaint,
  },

  // Topic stat variant
  topicContent: {
    gap: 8,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topicLabel: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
  },
  topicValue: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.text,
  },

  // Minimal variant
  minimalContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  minimalIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  minimalSublabel: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
  },
})
