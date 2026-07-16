import React, { useRef, useEffect } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing } from '../../constants/spacing'
import { Text } from '../../components/Text'
import { ShareNodesIcon } from '../../components/Icons'
import { USER_BLUE, type WsMsg } from './types'

export const QUOTE_CARD_BG = '#D7D9DE'

function QuoteTail({ side, color = QUOTE_CARD_BG }: { side: 'left' | 'right'; color?: string }) {
  return (
    <View
      style={[
        s.tailWrap,
        side === 'left'
          ? { left: -4, transform: [{ rotate: '-30deg' }] }
          : { right: -4, transform: [{ rotate: '200deg' }] },
      ]}
    >
      <Svg width={10} height={18} viewBox="0 0 10 18">
        <Path d="M10 0L0 9L10 18Z" fill={color} />
      </Svg>
    </View>
  )
}

export function TypingDots({ color = colors.textMuted }: { color?: string }) {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ]
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    )
    loops.forEach(l => l.start())
    return () => loops.forEach(l => l.stop())
  }, [])
  return (
    <View style={s.typingBubble}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[s.typingDot, { backgroundColor: color, opacity: d }]} />
      ))}
    </View>
  )
}

export function RoundDivider({ label }: { label: string }) {
  return (
    <View style={s.dividerWrap}>
      <LinearGradient
        colors={['transparent', colors.steel]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.dividerLine}
      />
      <View style={s.dividerBanner}>
        <LinearGradient
          colors={[colors.steel + '33', colors.steel + '0D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={s.dividerText}>{label}</Text>
      </View>
      <LinearGradient
        colors={[colors.steel, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.dividerLine}
      />
    </View>
  )
}

export function OpeningCard({
  message, name, onShare,
}: { message: WsMsg; name: string; onShare?: () => void }) {
  const { isMe } = message
  return (
    <View style={s.quoteCard}>
      <QuoteTail side={isMe ? 'right' : 'left'} />
      <Text style={s.quoteBody}>{message.text}</Text>
      <View style={s.quoteDivider} />
      <View style={s.quoteFooter}>
        <Text style={s.quoteAttrName} numberOfLines={1}>{isMe ? 'You' : name}</Text>
        <TouchableOpacity onPress={onShare} hitSlop={8} style={s.shareBtn}>
          <ShareNodesIcon size={13} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function Bubble({ message }: { message: WsMsg }) {
  const { isMe } = message
  const fill = isMe ? USER_BLUE : colors.surface
  return (
    <View style={[s.bubbleRow, isMe ? s.bubbleRowMe : s.bubbleRowThem]}>
      <View style={[s.bubble, { backgroundColor: fill }]}>
        <QuoteTail side={isMe ? 'right' : 'left'} color={fill} />
        <Text style={s.bubbleText}>{message.text}</Text>
        <Text style={s.bubbleTime}>{message.time}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  typingBubble: {
    flexDirection: 'row', gap: 4, alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18, borderBottomLeftRadius: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4 },

  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerBanner: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.steel + '66',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  dividerText: { fontFamily: fonts.display.bold, fontSize: 10.5, letterSpacing: 2, color: colors.text },

  quoteCard: {
    position: 'relative',
    backgroundColor: QUOTE_CARD_BG,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 6,
  },
  tailWrap: {
    position: 'absolute',
    bottom: 2,
  },
  shareBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.textOnLight,
    alignItems: 'center', justifyContent: 'center',
  },
  quoteBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textOnLight,
    letterSpacing: -0.1,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: '#00000014',
    marginTop: 2,
  },
  quoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  quoteAttrName: { fontFamily: fonts.jakarta.semiBold, fontSize: 11.5, color: colors.textOnLightMuted, flex: 1, marginRight: spacing.sm },

  bubbleRow: { marginBottom: spacing.sm, maxWidth: '80%' },
  bubbleRowMe: { alignSelf: 'flex-end' },
  bubbleRowThem: { alignSelf: 'flex-start' },
  bubble: {
    position: 'relative',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2, paddingBottom: spacing.xs + 2,
    borderRadius: 14, minWidth: 64,
  },
  bubbleText: { fontFamily: fonts.jakarta.regular, fontSize: 14, lineHeight: 21, color: colors.text },
  bubbleTime: { fontFamily: fonts.jakarta.regular, fontSize: 10, color: colors.textSubtle, alignSelf: 'flex-end', marginTop: 2 },
})
