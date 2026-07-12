import React from 'react'
import { View, StyleSheet, Image, Alert } from 'react-native'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { Text } from '../../components/Text'

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png')
const LOGO = require('../../assets/icon.png')

type Props = {
  text: string
  name: string
  avatarUri?: string | null
  motion: string
}

export const OpeningShareCard = React.forwardRef<View, Props>(
  ({ text, name, avatarUri, motion }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={s.card}>
        <Text style={s.kicker}>THE MOTION</Text>
        <Text style={s.motion} numberOfLines={3}>{motion}</Text>

        <View style={s.header}>
          <Image
            source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR}
            style={s.avatar}
          />
          <Text style={s.name} numberOfLines={1}>{name}</Text>
        </View>

        <Text style={s.body}>{text}</Text>

        <View style={s.footer}>
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
          <Text style={s.url}>joinduella.com</Text>
        </View>
      </View>
    )
  }
)

export async function shareOpeningCard(ref: React.RefObject<View | null>) {
  try {
    if (!ref.current) return
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' })
    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.')
      return
    }
    await Sharing.shareAsync(uri, { mimeType: 'image/png' })
  } catch {
    Alert.alert('Could not share', 'Something went wrong while creating the share image.')
  }
}

const s = StyleSheet.create({
  card: {
    width: 360,
    padding: 28,
    backgroundColor: colors.black,
  },
  kicker: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    color: colors.textSubtle,
    letterSpacing: 2,
    marginBottom: 6,
  },
  motion: {
    fontFamily: fonts.display.black,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
  },
  name: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  body: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
    letterSpacing: -0.1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  logo: {
    width: 20,
    height: 20,
  },
  url: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
})
