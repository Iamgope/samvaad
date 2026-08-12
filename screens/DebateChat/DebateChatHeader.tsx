import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
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

function PlayerBadge({ name, avatarUri, side, disconnected }: {
  name: string
  avatarUri?: string | null
  side: Side
  disconnected?: boolean
}) {
  const stanceColor = side === 'for' ? FOR_COLOR : AGAINST_COLOR
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!disconnected) return
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]))
    loop.start()
    return () => loop.stop()
  }, [disconnected, pulse])

  const reconnectOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] })

  return (
    <View style={s.playerBadge}>
      <View style={s.avatarWrap}>
        <Avatar
          size={44}
          source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR}
          borderColor={colors.border}
          backgroundColor={colors.surface2}
          style={disconnected ? { opacity: 0.4 } : undefined}
        />
        <View style={[s.stanceBox, { backgroundColor: stanceColor }]}>
          <Text style={s.stanceText}>{sideLabel(side)}</Text>
        </View>
      </View>
      <Text style={s.playerName} numberOfLines={1}>{name}</Text>
      {disconnected && (
        <Animated.Text style={[s.reconnecting, { opacity: reconnectOpacity }]} numberOfLines={1}>
          Reconnecting…
        </Animated.Text>
      )}
    </View>
  )
}

export function DebateChatHeader({
  opponentName,
  opponentAvatarUri,
  opponentSide,
  opponentActive,
  opponentDisconnected,
  opTime,
  myAvatarUri,
  mySide,
  myActive,
  myTime,
  myDisconnected,
}: {
  opponentName: string
  opponentAvatarUri?: string | null
  opponentSide: Side
  opponentActive: boolean
  opponentDisconnected?: boolean
  opTime: number
  myAvatarUri?: string | null
  mySide: Side
  myActive: boolean
  myTime: number
  myDisconnected?: boolean
}) {
  return (
    <View style={s.header}>
      <PlayerBadge
        name={opponentName}
        avatarUri={opponentAvatarUri}
        side={opponentSide}
        disconnected={opponentDisconnected}
      />
      <View style={s.timerCenter}>
        <View style={s.timerBadge}>
          <Text style={[s.timerText, opponentActive && { color: colors.text }]}>{fmtTime(opTime)}</Text>
          <Text style={s.timerSep}>·</Text>
          <Text style={[s.timerText, myActive && { color: USER_BLUE }]}>{fmtTime(myTime)}</Text>
        </View>
      </View>
      <PlayerBadge name="You" avatarUri={myAvatarUri} side={mySide} disconnected={myDisconnected} />
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
  reconnecting: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 8,
    color: colors.tierMaster,
    letterSpacing: 0.3,
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
