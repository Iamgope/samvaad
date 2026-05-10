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
  categoryIcon?: any
  agreeCount: number
  disagreeCount: number
  unsureCount: number
  headlineSize?: number
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
  headlineSize = 20,
  onPress,
}: Props) {
  const emoji = CATEGORY_EMOJI[categoryName.toLowerCase()] ?? '💬'

  return (
    <TouchableOpacity style={s.root} onPress={onPress} activeOpacity={0.7}>
      {/* Category label row */}
      <View style={s.labelRow}>
        <Text style={[s.categoryLabel, { color: categoryAccent, opacity: 0.45 }]}>
          {emoji}  {categoryName}
        </Text>
      </View>

      {/* Headline + thumbnail */}
      <View style={s.mainRow}>
        <View style={s.mainLeft}>
          <Text style={[s.headline, { fontSize: headlineSize, lineHeight: headlineSize * 1.3 }]} numberOfLines={3}>{motion}</Text>
          {context ? (
            <Text style={s.context} numberOfLines={2}>{context}</Text>
          ) : null}
        </View>
        <View style={[s.thumb, { backgroundColor: categoryAccent + '18' }]}>
          {categoryIcon
            ? <Image source={categoryIcon} style={s.thumbIcon} resizeMode="contain" />
            : <Text style={s.thumbEmoji}>{emoji}</Text>
          }
        </View>
      </View>

      {/* For / Against counts */}
      <View style={s.statsRow}>
        <Text style={[s.statFor]}>{fmt(agreeCount)} for</Text>
        <Text style={s.statSep}>·</Text>
        <Text style={[s.statAgainst]}>{fmt(disagreeCount)} against</Text>
        <Text style={s.statSep}>·</Text>
        <Text style={s.statNeutral}>{fmt(unsureCount)} unsure</Text>
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
  thumbEmoji: {
    fontSize: 28,
  },

  context: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSubtle,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  statFor: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textMuted
  },
  statAgainst: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textMuted
  },
  statNeutral: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textFaint,
  },
  statSep: {
    fontSize: 10,
    color: colors.textFaint,
  },
})
