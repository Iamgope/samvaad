import React from 'react'
import { View, StyleSheet, Image, Alert, type ImageSourcePropType } from 'react-native'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { colors } from '../constants/colors'
import { fonts } from '../constants/fonts'
import { Text } from './Text'

const LOGO = require('../assets/icon.png')
const FOR_ACCENT = colors.lime
const AGAINST_ACCENT = colors.limeMuted
const CARD_BG = colors.cream

type Props = {
  motion: string
  username: string
  side: 'PRO' | 'CON'
  comment: string
  image?: ImageSourcePropType
}

// Styled like a tweet/Substack-quote screenshot rather than an Instagram-story
// card — light card, dark text, a nested "link preview" for the motion so the
// image (if any) reads as context rather than a full-bleed background.
export const CommentShareCard = React.forwardRef<View, Props>(
  ({ motion, username, side, comment, image }, ref) => {
    const accent = side === 'PRO' ? FOR_ACCENT : AGAINST_ACCENT
    const initials = username.slice(0, 2).toUpperCase()

    return (
      <View ref={ref} collapsable={false} style={s.card}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarLabel}>{initials}</Text>
          </View>
          <Text style={s.username} numberOfLines={1}>@{username}</Text>
          <View style={[s.sideTag, { backgroundColor: accent + '22' }]}>
            <Text style={[s.sideTagLabel, { color: accent }]}>
              {side === 'PRO' ? 'FOR' : 'AGAINST'}
            </Text>
          </View>
        </View>

        <Text style={s.comment}>{comment}</Text>

        <View style={s.topicCard}>
          {image && <Image source={image} style={s.topicImage} resizeMode="cover" />}
          <View style={s.topicTextWrap}>
            <Text style={s.topicKicker}>THE MOTION</Text>
            <Text style={s.topicMotion} numberOfLines={2}>{motion}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Image source={LOGO} style={s.logo} resizeMode="contain" />
          <Text style={s.url}>joinduella.com</Text>
        </View>
      </View>
    )
  }
)

export async function shareCommentCard(ref: React.RefObject<View | null>) {
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
    padding: 24,
    borderRadius: 20,
    backgroundColor: CARD_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.textOnLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: CARD_BG,
  },
  username: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 15,
    color: colors.textOnLight,
    flex: 1,
  },
  sideTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sideTagLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  comment: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 19,
    lineHeight: 26,
    color: colors.textOnLight,
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#00000018',
    borderRadius: 12,
    padding: 10,
    marginBottom: 18,
  },
  topicImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#00000010',
  },
  topicTextWrap: {
    flex: 1,
    gap: 2,
  },
  topicKicker: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 9,
    color: colors.textOnLightSubtle,
    letterSpacing: 1.6,
  },
  topicMotion: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textOnLightMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 18,
    height: 18,
  },
  url: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textOnLightSubtle,
  },
})
