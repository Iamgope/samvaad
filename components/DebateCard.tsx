import React from 'react'
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

type Props = {
  motion: string
  debating: number
  categoryAccent?: string
  label?: string
  labelIcon?: string
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

export function DebateCard({
  motion,
  debating,
  categoryAccent = colors.streak,
  label = 'Hot Debate',
  labelIcon = '🔥',
  style,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={[s.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={s.labelRow}>
        <Text style={s.labelIcon}>{labelIcon}</Text>
        <Text style={s.label} tone="danger">{label}</Text>
      </View>

      <Text variant="titleLg" style={s.motion} numberOfLines={2}>{motion}</Text>

      <View style={s.debatingRow}>
        <View style={s.avatarStack}>
          <View style={[s.avatar, { backgroundColor: colors.streak,  left: 0  }]} />
          <View style={[s.avatar, { backgroundColor: categoryAccent, left: 14 }]} />
          <View style={[s.avatar, { backgroundColor: colors.purple2, left: 28 }]} />
        </View>
        <Text style={s.debatingText} tone="muted">{fmt(debating)} debating</Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: colors.borderStrong,
    borderBottomColor: '#3D4A5C',
    padding: spacing.lg,
    paddingBottom: spacing.xl + 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  labelIcon: { fontSize: 14 },
  label:     { fontFamily: fonts.jakarta.semiBold, fontSize: 13 },
  motion:    { marginBottom: spacing.md },
  debatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    width: 56,
    height: 22,
    marginRight: spacing.sm,
    position: 'relative',
  },
  avatar: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  debatingText: { fontFamily: fonts.jakarta.medium, fontSize: 13 },
})
