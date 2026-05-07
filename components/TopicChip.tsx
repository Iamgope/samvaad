import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { Text } from './Text'
import { fonts } from '../constants/fonts'
import { colors } from '../constants/colors'
import { spacing } from '../constants/spacing'

type Props = {
  label: string
  emoji: string
  accent: string
  active?: boolean
  onPress?: () => void
  style?: ViewStyle
}

export function TopicChip({ label, emoji, accent, active = false, onPress, style }: Props) {
  const content = (
    <View
      style={[
        s.key,
        {
          backgroundColor: active ? accent + '22' : accent + '0E',
          borderColor: active ? accent + '55' : accent + '28',
        },
        style,
      ]}
    >
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, { color: active ? accent : colors.textMuted }]}>
        {label}
      </Text>
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const s = StyleSheet.create({
  key: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    paddingBottom: 8,           // extra padding on bottom = raised-key illusion
    borderRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,     // thick bottom border = the "key depth" shadow
    opacity: 0.85,
  },
  emoji: {
    fontSize: 13,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
})
