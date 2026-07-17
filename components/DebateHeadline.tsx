import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

type Props = {
  motion: string
  context?: string
  categoryName: string
  categoryAccent: string
  /** Real topic photo — preferred over categoryIcon when present. */
  image?: any
  /** Static per-category placeholder — used only when image is absent. */
  categoryIcon?: any
  agreeCount?: number
  disagreeCount?: number
  unsureCount?: number
  /** Custom footer node — replaces the default byline/stats row. */
  footer?: React.ReactNode
  headlineSize?: number
  onPress?: () => void
  /** Show the hairline divider below the card (default true, like a feed list). */
  divider?: boolean
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

export function DebateHeadline({
  motion,
  context,
  categoryName,
  categoryAccent,
  image,
  categoryIcon,
  agreeCount,
  disagreeCount,
  unsureCount,
  footer,
  headlineSize = 21,
  onPress,
  divider = true,
}: Props) {
  const hasStats = agreeCount !== undefined && disagreeCount !== undefined && unsureCount !== undefined
  const totalVotes = hasStats ? agreeCount! + disagreeCount! + unsureCount! : 0

  return (
    <TouchableOpacity
      style={[s.root, divider && s.rootDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={s.mainRow}>
        <View style={s.mainLeft}>
          <Text
            style={[s.headline, { fontSize: headlineSize, lineHeight: headlineSize * 1.28 }]}
            numberOfLines={3}
          >
            {motion}
          </Text>

          {context ? (
            <Text style={s.context} numberOfLines={2}>{context}</Text>
          ) : null}

          {/* Byline: category + stat, understated, below the headline */}
          <View style={s.bylineRow}>
            <Text style={[s.bylineCategory, { color: categoryAccent }]}>
              {categoryName}
            </Text>
            {hasStats ? (
              <>
                <Text style={s.bylineDot}>·</Text>
                <Text style={s.bylineMeta}>{fmt(totalVotes)} weighed in</Text>
              </>
            ) : null}
          </View>
        </View>

        {(image || categoryIcon) ? (
          <View style={s.thumb}>
            <Image source={image ?? categoryIcon} style={s.thumbImage} resizeMode="cover" />
          </View>
        ) : null}
      </View>

      {footer ? <View style={s.footerSlot}>{footer}</View> : null}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  root: {
    paddingVertical: spacing.lg,
  },
  rootDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.textFaint + '40',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  mainLeft: {
    flex: 1,
    gap: 6,
  },

  headline: {
    fontFamily: fonts.display.black,
    color: colors.text,
    letterSpacing: -0.3,
  },
  context: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },

  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  bylineCategory: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
  },
  bylineDot: {
    fontSize: 12,
    color: colors.textFaint,
  },
  bylineMeta: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textFaint,
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 6,
    overflow: 'hidden',
    flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textFaint + '30',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },

  footerSlot: {
    paddingTop: spacing.sm,
  },
})
