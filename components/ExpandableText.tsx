import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Text, type TextTone } from './Text'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

type Props = {
  text: string
  style?: StyleProp<TextStyle>
  lines?: number
  toggleTone?: TextTone
  moreLabel?: string
  lessLabel?: string
}

export function ExpandableText({
  text, style, lines = 3, toggleTone = 'muted', moreLabel = 'See more', lessLabel = 'See less',
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState<boolean | null>(null)

  const isMeasuring = needsToggle === null
  const numberOfLines = isMeasuring || expanded ? undefined : lines

  return (
    <View>
      <Text
        style={[style, isMeasuring && { opacity: 0 }]}
        numberOfLines={numberOfLines}
        onTextLayout={(e) => {
          if (isMeasuring) setNeedsToggle(e.nativeEvent.lines.length > lines)
        }}
      >
        {text}
      </Text>
      {needsToggle ? (
        <TouchableOpacity onPress={() => setExpanded(v => !v)} activeOpacity={0.6}>
          <Text style={s.toggle} tone={toggleTone}>{expanded ? lessLabel : moreLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const s = StyleSheet.create({
  toggle: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12,
    marginTop: spacing.xs,
    letterSpacing: 0.1,
  },
})
