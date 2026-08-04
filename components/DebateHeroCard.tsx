import React from 'react'
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing, SCREEN_PADDING } from '../constants/spacing'

type Props = {
  motion: string
  categoryName: string
  categoryAccent: string
  /** Optional artwork. Falls back to a tinted placeholder when omitted. */
  image?: ImageSourcePropType
  /** SVG illustration shown when there's no artwork. */
  categoryIllustration?: React.ComponentType<{ size?: number; color?: string }>
  height?: number
  /** Corner radius. Use 0 for a full-bleed hero. */
  borderRadius?: number
  motionSize?: number
  /** Optional content rendered under the motion (e.g. a "12K debating" line). */
  footer?: React.ReactNode
  /** Optional content rendered in the top-left corner. */
  headerLeft?: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

export function DebateHeroCard({
  motion,
  categoryName,
  categoryAccent,
  image,
  categoryIllustration: CategoryIllustration,
  height = 210,
  borderRadius = 16,
  motionSize = 22,
  footer,
  headerLeft,
  style,
  onPress,
}: Props) {
  const Container: React.ComponentType<any> = onPress ? TouchableOpacity : View

  return (
    <Container
      style={[s.hero, { height, borderRadius, backgroundColor: categoryAccent + '22' }, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image ? (
        <Image source={image} style={s.image} resizeMode="cover" />
      ) : CategoryIllustration ? (
        <View style={s.placeholder}>
          <CategoryIllustration size={Math.min(height * 0.55, 140)} color={categoryAccent} />
        </View>
      ) : (
        <View style={s.placeholder}>
          <Text style={s.placeholderText}>Hero artwork placeholder</Text>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(12,15,22,0.6)', 'rgba(12,15,22,0.98)']}
        locations={[0, 0.5, 1]}
        style={s.scrim}
        pointerEvents="none"
      />

      {headerLeft && (
        <View style={s.headerLeft}>
          {headerLeft}
        </View>
      )}

      <View
        style={[
          s.tag,
          {
            backgroundColor: colors.surface2,
            borderColor: colors.border,
            borderBottomColor: colors.steel,
          },
        ]}
      >
        <Text style={[s.tagText, { color: colors.steel }]}>{categoryName}</Text>
      </View>

      <View style={s.footer}>
        <Text style={[s.motion, { fontSize: motionSize, lineHeight: motionSize * 1.25 }]} numberOfLines={3}>
          {motion}
        </Text>
        {footer}
      </View>
    </Container>
  )
}

const s = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    top: '35%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textSubtle,
    letterSpacing: 0.4,
  },
  headerLeft: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 10,
  },
  tag: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    letterSpacing: 0.1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.lg,
  },
  motion: {
    fontFamily: fonts.display.black,
    color: colors.text,
    letterSpacing: -0.6,
  },
})
