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
  categoryIcon: any
  agreeCount: number
  disagreeCount: number
  unsureCount: number
  isNew?: boolean
  endsIn?: string
  onPress?: () => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  'politics':    '🏛️',
  'sports':      '🏆',
  'culture':     '🎭',
  'philosophy':  '🧠',
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

export function DebateHeadline({
  motion,
  context,
  categoryName,
  categoryAccent,
  categoryIcon,
  agreeCount,
  disagreeCount,
  unsureCount,
  isNew,
  endsIn,
  onPress,
}: Props) {
  const emoji = CATEGORY_EMOJI[categoryName.toLowerCase()] ?? '💬'

  return (
    <TouchableOpacity style={s.root} onPress={onPress} activeOpacity={0.7}>
      {/* Category label row */}
      <View style={s.labelRow}>
        <Text style={[s.categoryLabel, { color: categoryAccent }]}>
          {emoji}  {categoryName}
        </Text>
        {/* {isNew && <Text style={[s.badge, { color: colors.lime }]}>· NEW</Text>}
        {endsIn && <Text style={[s.badge, { color: colors.red }]}>· ENDS {endsIn}</Text>} */}
      </View>

      {/* Headline + thumbnail */}
      <View style={s.mainRow}>
        <View style={s.mainLeft}>
          <Text style={s.headline} numberOfLines={3}>{motion}</Text>
          {context ? (
            <Text style={s.context} numberOfLines={2}>{context}</Text>
          ) : null}
        </View>
        <View style={[s.thumb, { backgroundColor: categoryAccent + '18' }]}>
          <Image source={categoryIcon} style={s.thumbIcon} resizeMode="contain" />
        </View>
      </View>

      {/* Opinion stats */}
      <View style={s.opinionRow}>
        <Text style={s.opinionItem}>👍  {fmt(agreeCount)}</Text>
        <Text style={s.opinionDot}>·</Text>
        <Text style={s.opinionItem}>👎  {fmt(disagreeCount)}</Text>
        <Text style={s.opinionDot}>·</Text>
        <Text style={s.opinionItem}>🤷  {fmt(unsureCount)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  root: {
    paddingVertical: spacing.lg,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  badge: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  mainLeft: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontFamily: fonts.display.black,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  thumbIcon: {
    width: 56,
    height: 56,
  },

  context: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSubtle,
  },

  opinionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  opinionItem: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textFaint,
  },
  opinionDot: {
    fontSize: 10,
    color: colors.textFaint,
  },
})
