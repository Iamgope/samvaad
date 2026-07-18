import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { Avatar } from '../../components/Avatar'
import type { Side } from './types'
import { sideLabel, fmtTime, USER_BLUE } from './types'

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png')

// FOR = green, AGAINST = red — a clearer, more universal pair than the app's
// blue/light-blue stance accent used elsewhere, since these two need to read
// as distinct at a glance in a small badge.
const FOR_COLOR = '#4ADE80'
const AGAINST_COLOR = colors.red

function PlayerBadge({ name, avatarUri, side }: {
  name: string
  avatarUri?: string | null
  side: Side
}) {
  const stanceColor = side === 'for' ? FOR_COLOR : AGAINST_COLOR

  return (
    <View style={s.playerBadge}>
      <View style={s.avatarWrap}>
        <Avatar
          size={44}
          source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR}
          borderColor={colors.border}
          backgroundColor={colors.surface2}
        />
        <View style={[s.stanceBox, { backgroundColor: stanceColor }]}>
          <Text style={s.stanceText}>{sideLabel(side)}</Text>
        </View>
      </View>
      <Text style={s.playerName} numberOfLines={1}>{name}</Text>
    </View>
  )
}

export function DebateChatHeader({
  opponentName,
  opponentAvatarUri,
  opponentSide,
  opponentActive,
  opTime,
  myAvatarUri,
  mySide,
  myActive,
  myTime,
}: {
  opponentName: string
  opponentAvatarUri?: string | null
  opponentSide: Side
  opponentActive: boolean
  opTime: number
  myAvatarUri?: string | null
  mySide: Side
  myActive: boolean
  myTime: number
}) {
  return (
    <View style={s.header}>
      <PlayerBadge name={opponentName} avatarUri={opponentAvatarUri} side={opponentSide} />
      <View style={s.timerCenter}>
        <View style={s.timerBadge}>
          <Text style={[s.timerText, opponentActive && { color: colors.text }]}>{fmtTime(opTime)}</Text>
          <Text style={s.timerSep}>·</Text>
          <Text style={[s.timerText, myActive && { color: USER_BLUE }]}>{fmtTime(myTime)}</Text>
        </View>
      </View>
      <PlayerBadge name="You" avatarUri={myAvatarUri} side={mySide} />
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    zIndex: 20,
  },
  timerCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerText: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 17,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerSep: {
    fontSize: 15,
    fontFamily: fonts.jakarta.bold,
    color: colors.textSubtle,
  },
  playerBadge: {
    alignItems: 'center',
    gap: 9,
    width: 64,
  },
  avatarWrap: {
    alignItems: 'center',
  },
  playerName: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: -0.1,
  },
  stanceBox: {
    position: 'absolute',
    bottom: -5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.black,
  },
  stanceText: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 8,
    color: colors.text,
    letterSpacing: 0.4,
  },
})
