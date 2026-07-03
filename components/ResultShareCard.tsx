import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { Text } from './Text'

export type ResultShareCardProps = {
  motion: string
  result: 'win' | 'loss' | 'draw'
  categoryName: string
  categoryAccent: string
  userUsername: string
  opponentUsername: string
  userSide: 'for' | 'against'
  ratingDelta: string
  xp: number
}

const FOR_COLOR     = '#4ADE80'
const AGAINST_COLOR = '#FF3B5C'

export const ResultShareCard = React.forwardRef<View, ResultShareCardProps>(
  (
    { motion, result, categoryName, categoryAccent,
      userUsername, opponentUsername, userSide, ratingDelta, xp },
    ref,
  ) => {
    const resultLabel = result === 'win' ? 'YOU WON' : result === 'loss' ? 'YOU LOST' : 'DRAW'
    const resultColor = result === 'win' ? '#F59E0B' : result === 'loss' ? '#9CA3AF' : '#38BDF8'
    const opponentSide: 'for' | 'against' = userSide === 'for' ? 'against' : 'for'
    const deltaColor  = ratingDelta.startsWith('+') ? FOR_COLOR : AGAINST_COLOR

    return (
      <View ref={ref} collapsable={false} style={s.card}>
        <LinearGradient
          colors={[categoryAccent + '44', colors.black, colors.black]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Result */}
        <Text style={[s.resultLabel, { color: resultColor }]}>{resultLabel}</Text>

        {/* Category + motion */}
        <Text style={[s.category, { color: categoryAccent }]}>{categoryName.toUpperCase()}</Text>
        <Text style={s.kicker}>THE MOTION</Text>
        <Text style={s.motion} numberOfLines={4}>{motion}</Text>

        {/* VS row */}
        <View style={s.vsRow}>
          <View style={s.player}>
            <Text style={s.username}>@{userUsername}</Text>
            <Text style={[s.sideTag, { color: userSide === 'for' ? FOR_COLOR : AGAINST_COLOR }]}>
              {userSide.toUpperCase()}
            </Text>
          </View>
          <Text style={s.vs}>VS</Text>
          <View style={[s.player, { alignItems: 'flex-end' }]}>
            <Text style={s.username}>@{opponentUsername}</Text>
            <Text style={[s.sideTag, { color: opponentSide === 'for' ? FOR_COLOR : AGAINST_COLOR }]}>
              {opponentSide.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statLabel}>RATING</Text>
            <Text style={[s.statValue, { color: deltaColor }]}>{ratingDelta}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statLabel}>XP EARNED</Text>
            <Text style={[s.statValue, { color: colors.lime }]}>+{xp}</Text>
          </View>
        </View>

        {/* Branding */}
        <View style={s.footer}>
          <Text style={s.brand}>SAMVAAD</Text>
          <Text style={s.footerSub}>debate · learn · grow</Text>
        </View>
      </View>
    )
  },
)

export async function shareResultCard(
  ref: React.RefObject<View | null>,
  motion: string,
) {
  try {
    if (!ref.current) return
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' })
    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.')
      return
    }
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: motion })
  } catch {
    Alert.alert('Could not share', 'Something went wrong while creating the share image.')
  }
}

const s = StyleSheet.create({
  card: {
    width: 360,
    height: 560,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.black,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
  },
  resultLabel: {
    fontFamily: fonts.display.black,
    fontSize: 32,
    letterSpacing: 5,
    marginBottom: 20,
  },
  category: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 16,
  },
  kicker: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 9,
    color: colors.textSubtle,
    letterSpacing: 2,
    marginBottom: 8,
  },
  motion: {
    fontFamily: fonts.display.black,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
    letterSpacing: -0.6,
    marginBottom: 28,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  player: { gap: 5 },
  username: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  sideTag: {
    fontFamily: fonts.display.bold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  vs: {
    fontFamily: fonts.display.black,
    fontSize: 18,
    color: colors.textSubtle,
    letterSpacing: 3,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 'auto' as any,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 9,
    color: colors.textSubtle,
    letterSpacing: 1.5,
  },
  statValue: {
    fontFamily: fonts.display.black,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  footer: {
    position: 'absolute',
    left: 28,
    bottom: 28,
    gap: 3,
  },
  brand: {
    fontFamily: fonts.display.extraBold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 3,
  },
  footerSub: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
})
