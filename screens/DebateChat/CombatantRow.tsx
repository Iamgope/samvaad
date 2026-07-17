import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { Avatar } from '../../components/Avatar'
import type { Side } from './types'
import { sideLabel, fmtTime } from './types'

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png')

// NOTE: this is a second, independent definition of the for/against color pair —
// MatchIntroOverlay/VsLock derive theirs from `youStance.accent` / `opponentStance.accent`.
// If those get updated (e.g. to a lime/coral pair for clearer distinction), this file
// won't follow automatically and the avatar glow here will drift out of sync with what
// the player just saw on the match-intro screen. Once the real color values are settled,
// pull both from one shared constant (e.g. colors.ts: DEBATE_FOR / DEBATE_AGAINST) instead
// of defining them independently in each file.
const FOR_COLOR = colors.lime
const AGAINST_COLOR = colors.limeMuted

function Combatant({ name, side, isYou, accent, time, active, mirror, avatarUri }: {
  name: string
  side: Side
  isYou: boolean
  accent: string
  time: number
  active: boolean
  mirror?: boolean
  avatarUri?: string | null
}) {
  const sideColor = side === 'for' ? FOR_COLOR : AGAINST_COLOR

  return (
    <View style={[cb.wrap, mirror && { flexDirection: 'row-reverse' }]}>
      <Avatar
        size={44}
        offset={3}
        source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR}
        borderColor={colors.border}
        glowColor={sideColor}
        glowOpacity={0.35}
        glowRadius={4}
        backgroundColor={colors.surface2}
      />
      <View style={[cb.info, mirror && { alignItems: 'flex-end' }]}>
        <Text style={cb.name} numberOfLines={1}>{name}</Text>
        <View style={cb.meta}>
          <Text style={cb.side}>{sideLabel(side)}</Text>
          <Text style={cb.sep}>·</Text>
          <Text style={[cb.time, active && { color: isYou ? accent : colors.text }]}>{fmtTime(time)}</Text>
        </View>
      </View>
    </View>
  )
}

export function CombatantRow({
  opponentName,
  opSide,
  userSide,
  accent,
  opTime,
  myTime,
  showTypingDots,
  canType,
  myAvatarUri,
}: {
  opponentName: string
  opSide: Side
  userSide: Side
  accent: string
  opTime: number
  myTime: number
  showTypingDots: boolean
  canType: boolean
  myAvatarUri?: string | null
}) {
  return (
    <View style={s.vsRow}>
      <Combatant
        name={opponentName}
        side={opSide}
        isYou={false}
        accent={accent}
        time={opTime}
        active={showTypingDots}
      />
      <Text style={s.vs}>VS</Text>
      <Combatant
        name="You"
        side={userSide}
        isYou
        accent={accent}
        time={myTime}
        active={canType}
        mirror
        avatarUri={myAvatarUri}
      />
    </View>
  )
}

const s = StyleSheet.create({
  vsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.xs, paddingBottom: spacing.md,
  },
  vs: { fontFamily: fonts.display.black, fontSize: 11, color: colors.textSubtle, letterSpacing: 0.5 },
})

const cb = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.display.bold, fontSize: 14, color: colors.text, letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  side: { fontFamily: fonts.jakarta.extraBold, fontSize: 9, color: colors.textSubtle, letterSpacing: 1 },
  sep: { fontSize: 9, color: colors.textFaint },
  time: { fontFamily: fonts.jakarta.bold, fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
})
