import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { TIER_COLOR } from '../../constants/tiers'
import { Text } from '../../components/Text'
import { Avatar } from '../../components/Avatar'

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png')

export const CARD_W = 132
export const CARD_H = 182

export type VsLockPerson = {
  name: string
  rating?: number
  tier?: string
  avatarUri: string | null
}

type Footer = { emoji: string; label: string; color?: string }

type VsLockProps = {
  you: VsLockPerson
  youFooter: Footer
  // `null` renders the original "still searching" placeholder card (glow border + scan bar).
  opponent: VsLockPerson | null
  opponentFooter: Footer
  // Rendered inside the pulsing center badge — a static "VS" or an animated countdown digit.
  center: React.ReactNode
  // Change this (e.g. to the current countdown number) to re-trigger the badge's pop-in.
  centerKey?: string | number
  // How fast the badge breathes between pop-ins — slower for a static "VS", faster for a
  // countdown that only holds each value for ~1s.
  breatheDurationMs?: number
}

export function VsLock({
  you, youFooter, opponent, opponentFooter, center, centerKey, breatheDurationMs = 900,
}: VsLockProps) {
  const slideLeft = useRef(new Animated.Value(-220)).current
  const slideRight = useRef(new Animated.Value(220)).current
  const badgeScale = useRef(new Animated.Value(0)).current
  const scanLine = useRef(new Animated.Value(0)).current
  const borderGlow = useRef(new Animated.Value(0.25)).current

  // Cards slide in once, on mount.
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideLeft, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.spring(slideRight, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
    ]).start()

    if (!opponent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLine, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(scanLine, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(500),
        ])
      ).start()

      Animated.loop(
        Animated.sequence([
          Animated.timing(borderGlow, { toValue: 0.9, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(borderGlow, { toValue: 0.2, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start()
    }

    return () => {
      [slideLeft, slideRight, scanLine, borderGlow].forEach(a => a.stopAnimation())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Badge pop-in, then a continuous back-and-forth breathe — restarts whenever centerKey changes.
  useEffect(() => {
    badgeScale.setValue(0)
    let breathe: Animated.CompositeAnimation | null = null
    Animated.sequence([
      Animated.delay(centerKey === undefined ? 260 : 0),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 7 }),
    ]).start(() => {
      breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeScale, { toValue: 1.08, duration: breatheDurationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(badgeScale, { toValue: 1.00, duration: breatheDurationMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      )
      breathe.start()
    })
    return () => breathe?.stop()
  }, [centerKey])

  const scanY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, CARD_H] })
  const youTierColor = you.tier ? (TIER_COLOR[you.tier] ?? colors.text) : colors.text

  return (
    <View style={s.row}>

      {/* ── Left card — YOU ── */}
      <Animated.View style={[s.outer, {
        borderColor: colors.border,
        borderBottomColor: youTierColor + '99',
        transform: [{ translateX: slideLeft }],
      }]}>
        <View style={s.inner}>
          <View style={s.cardTop}>
            <Text style={s.eyebrow} allowFontScaling={false}>YOU</Text>
            <Avatar
              size={52}
              source={you.avatarUri ? { uri: you.avatarUri } : DEFAULT_AVATAR}
              borderColor={colors.borderStrong}
              offset={3}
            />
            <View style={s.nameBlock}>
              <Text style={s.playerName} numberOfLines={1} allowFontScaling={false}>{you.name}</Text>
              {you.tier && (
                <View style={s.tierChip}>
                  <Text style={s.tierLabel} numberOfLines={1} allowFontScaling={false}>{you.tier.toUpperCase()}</Text>
                  {you.rating != null && (
                    <>
                      <Text style={s.ratingDot} allowFontScaling={false}>·</Text>
                      <Text style={s.ratingText} allowFontScaling={false}>{you.rating}</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
          <View style={s.footer}>
            <Text style={s.footerEmoji}>{youFooter.emoji}</Text>
            <Text
              style={[s.footerLabel, { color: youFooter.color ?? colors.textMuted }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {youFooter.label}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Center badge ──
          Widened from 40 to 56: a two-digit countdown value (e.g. "10") at fontSize 30
          overflowed the old 40px box and visually bled into the side cards since neither
          this view nor its parent clip overflow. 56px comfortably fits two digits. */}
      <Animated.View style={[s.centerWrap, { transform: [{ scale: badgeScale }] }]}>
        {center}
      </Animated.View>

      {/* ── Right card — OPPONENT ── */}
      <Animated.View style={[s.outer, {
        borderColor: colors.border,
        borderBottomColor: (opponent ? (opponentFooter.color ?? colors.lime) : colors.lime) + '88',
        transform: [{ translateX: slideRight }],
      }]}>
        <View style={[s.inner, { overflow: 'hidden' }]}>
          {!opponent && (
            <>
              <Animated.View
                style={[StyleSheet.absoluteFill, s.glowBorder, { borderColor: colors.lime, opacity: borderGlow }]}
                pointerEvents="none"
              />
              <Animated.View
                style={[s.scanBar, { transform: [{ translateY: scanY }] }]}
                pointerEvents="none"
              />
            </>
          )}
          <View style={s.cardTop}>
            <Text style={[s.eyebrow, !opponent && { color: colors.textFaint }]} allowFontScaling={false}>
              OPPONENT
            </Text>
            {opponent ? (
              <Avatar
                size={52}
                source={opponent.avatarUri ? { uri: opponent.avatarUri } : DEFAULT_AVATAR}
                borderColor={colors.borderStrong}
                offset={3}
              />
            ) : (
              <Avatar
                size={52}
                initials="?"
                borderColor={colors.borderStrong}
                backgroundColor={colors.surface2}
                textColor={colors.textFaint}
                offset={3}
              />
            )}
            <View style={s.nameBlock}>
              <Text
                style={[s.playerName, !opponent && { color: colors.textFaint }]}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {opponent ? opponent.name : '· · ·'}
              </Text>
              {!opponent && (
                <View style={s.tierChip}>
                  <Text
                    style={[s.tierLabel, { color: colors.textFaint }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    allowFontScaling={false}
                  >
                    SEARCHING
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={s.footer}>
            <Text style={s.footerEmoji}>{opponentFooter.emoji}</Text>
            <Text
              style={[s.footerLabel, { color: opponent ? (opponentFooter.color ?? colors.textMuted) : colors.textSubtle }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {opponentFooter.label}
            </Text>
          </View>
        </View>
      </Animated.View>

    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  outer: {
    width: CARD_W, height: CARD_H,
    borderRadius: 16,
    borderWidth: 1.5, borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 0,
    elevation: 6,
  },
  inner: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  glowBorder: { borderRadius: 13, borderWidth: 1.5 },

  cardTop: {
    alignItems: 'center',
    paddingTop: 13, paddingHorizontal: 10,
    gap: 7,
  },
  eyebrow: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 8.5, letterSpacing: 2.2,
    color: colors.textSubtle,
  },
  nameBlock: { alignItems: 'center', gap: 5 },
  playerName: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12.5, color: colors.text, letterSpacing: -0.2,
  },
  tierChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: colors.surface2,
    maxWidth: CARD_W - 20,
  },
  tierLabel: { fontFamily: fonts.jakarta.bold, fontSize: 7.5, letterSpacing: 0.8, color: colors.textMuted },
  ratingDot: { fontFamily: fonts.jakarta.bold, fontSize: 8, color: colors.textFaint },
  ratingText: { fontFamily: fonts.jakarta.bold, fontSize: 8.5, color: colors.textMuted },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'center',
    paddingVertical: 9, paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerEmoji: { fontSize: 11 },
  footerLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 8, letterSpacing: 0.8, flexShrink: 1,
  },

  centerWrap: { width: 56, alignItems: 'center', justifyContent: 'center' },

  scanBar: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: colors.lime, opacity: 0.4,
  },
})
