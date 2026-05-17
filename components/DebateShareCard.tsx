import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { Text } from './Text'
import { FakeQR } from './FakeQR'

type Props = {
  motion: string
  categoryName: string
  categoryAccent: string
  forPct: number
  againstPct: number
}

export const DebateShareCard = React.forwardRef<View, Props>(
  ({ motion, categoryName, categoryAccent, forPct, againstPct }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={s.card}>
        <LinearGradient
          colors={[categoryAccent + '55', colors.black]}
          locations={[0, 0.65]}
          style={StyleSheet.absoluteFill}
        />

        <View style={s.body}>
          <Text style={[s.category, { color: categoryAccent }]}>
            {categoryName.toUpperCase()}
          </Text>

          <Text style={s.kicker}>THE MOTION</Text>
          <Text style={s.motion} numberOfLines={5}>{motion}</Text>

          <View style={s.splitWrap}>
            <View style={s.splitRow}>
              <Text style={s.pctNum}>{forPct}<Text style={s.pctSign}>%</Text></Text>
              <Text style={s.pctSep}>:</Text>
              <Text style={s.pctNum}>{againstPct}<Text style={s.pctSign}>%</Text></Text>
            </View>
            <View style={s.splitLabels}>
              <Text style={s.splitLabel}>FOR</Text>
              <Text style={s.splitLabel}>AGAINST</Text>
            </View>
          </View>

          <View style={s.footer}>
            <View style={s.qrFrame}>
              <FakeQR size={88} />
            </View>
            <View style={s.footerText}>
              <Text style={s.brand}>SAMVAAD</Text>
              <Text variant="bodySm" tone="muted">Scan to join this debate</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
)

export async function shareDebateCard(
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
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: motion,
    })
  } catch {
    Alert.alert('Could not share', 'Something went wrong while creating the share image.')
  }
}

const s = StyleSheet.create({
  card: {
    width: 360,
    height: 580,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
  },
  category: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 12,
    letterSpacing: 2.4,
    marginBottom: 28,
  },
  kicker: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    color: colors.textSubtle,
    letterSpacing: 2,
    marginBottom: 10,
  },
  motion: {
    fontFamily: fonts.display.black,
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
    letterSpacing: -0.8,
  },
  splitWrap: {
    marginTop: 36,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pctNum: {
    fontFamily: fonts.display.black,
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -1,
    color: colors.text,
  },
  pctSign: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.textMuted,
  },
  pctSep: {
    fontFamily: fonts.display.bold,
    fontSize: 32,
    lineHeight: 52,
    color: colors.textFaint,
  },
  splitLabels: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  splitLabel: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.6,
    width: 88,
  },
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qrFrame: {
    padding: 6,
    backgroundColor: colors.text,
    borderRadius: 10,
  },
  footerText: {
    flex: 1,
  },
  brand: {
    color: colors.text,
    fontFamily: fonts.display.extraBold,
    fontSize: 16,
    letterSpacing: 3,
  },
})
