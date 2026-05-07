import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { spacing } from '../constants/spacing'

type Props = {
  emoji: string
  motion: string
  forVotes: number
  againstVotes: number
  debating: number
  categoryTag: string
  accent: string
  onJoin: () => void
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

export function DebateListRow({ emoji, motion, forVotes, againstVotes, debating, categoryTag, accent, onJoin }: Props) {
  const total  = forVotes + againstVotes
  const forPct = (forVotes / total) * 100
  const proPct = Math.round(forPct)
  const conPct = 100 - proPct

  return (
    <View style={s.row}>
      <View style={s.top}>
        <View style={[s.emojiWrap, { backgroundColor: accent + '18' }]}>
          <Text style={s.emoji}>{emoji}</Text>
        </View>
        <Text style={s.motion} numberOfLines={2}>{motion}</Text>
        <TouchableOpacity style={s.joinBtn} onPress={onJoin} activeOpacity={0.8}>
          <Text style={s.joinText}>Join →</Text>
        </TouchableOpacity>
      </View>

      <View style={s.bottom}>
        <View style={s.barRow}>
          <View style={[s.barFor, { flex: forPct }]} />
          <View style={[s.barAgainst, { flex: 100 - forPct }]} />
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaText}>Pro {proPct}% vs Con {conPct}%</Text>
          <View style={[s.tag, { backgroundColor: accent + '18' }]}>
            <Text style={[s.tagText, { color: accent }]}>{categoryTag}</Text>
          </View>
          <Text style={s.metaText}>👥 {fmt(debating)}</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  row:  { padding: spacing.md },
  top:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emoji:  { fontSize: 20 },
  motion: {
    flex: 1,
    fontFamily: fonts.display.bold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    letterSpacing: -0.1,
  },
  joinBtn: {
    backgroundColor: colors.lime,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  joinText: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12,
    color: colors.black,
    letterSpacing: 0.2,
  },
  bottom:   { paddingLeft: 48 },
  barRow:   {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  barFor:     { height: '100%', backgroundColor: colors.lime },
  barAgainst: { height: '100%', backgroundColor: colors.textFaint },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText:   { fontFamily: fonts.jakarta.medium, fontSize: 11, color: colors.textSubtle },
  tag:        { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText:    { fontFamily: fonts.jakarta.semiBold, fontSize: 10, letterSpacing: 0.3 },
})
