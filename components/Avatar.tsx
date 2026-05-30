import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { Text } from './Text'

type Props = {
  /** Side length of the (square) avatar tile, in px. */
  size?: number
  /** Image to show. When absent, falls back to `initials`. */
  source?: ImageSourcePropType | null
  /** Letter(s) shown when there is no image. */
  initials?: string
  /** Border colour of the tile — e.g. the tier or active-turn colour. */
  borderColor?: string
  /** When set, paints a coloured glow behind the tile (active state). */
  glowColor?: string
  backgroundColor?: string
  textColor?: string
  /** Offset of the tactile drop-shadow square. */
  offset?: number
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

// Profile uses radius 16 at size 92 — keep that corner softness at any size.
const RADIUS_RATIO = 16 / 92

export function Avatar({
  size = 92,
  source,
  initials = '?',
  borderColor = colors.border,
  glowColor,
  backgroundColor = colors.surface2,
  textColor = colors.textMuted,
  offset = 4,
  onPress,
  style,
}: Props) {
  const radius = Math.round(size * RADIUS_RATIO)
  const Tile: React.ComponentType<any> = onPress ? TouchableOpacity : View

  return (
    <View style={[{ width: size + offset, height: size + offset }, style]}>
      {/* Tactile drop square sitting behind the tile (down-right). */}
      <View
        style={[
          s.shadow,
          { top: offset, left: offset, width: size, height: size, borderRadius: radius },
          glowColor && {
            backgroundColor: 'transparent',
            shadowColor: glowColor, shadowOpacity: 0.55, shadowRadius: 9,
            shadowOffset: { width: 0, height: 0 }, elevation: 8,
          },
        ]}
      />
      <Tile
        style={[s.tile, { width: size, height: size, borderRadius: radius, borderColor, backgroundColor }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.85 : 1}
        disabled={!onPress}
      >
        {source ? (
          <Image source={source} style={s.image} resizeMode="cover" />
        ) : (
          <Text style={{ fontFamily: fonts.display.extraBold, fontSize: Math.round(size * 0.4), color: textColor }}>
            {initials}
          </Text>
        )}
      </Tile>
    </View>
  )
}

const s = StyleSheet.create({
  shadow: { position: 'absolute', backgroundColor: colors.black },
  tile: {
    position: 'absolute', top: 0, left: 0,
    borderWidth: 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
})
