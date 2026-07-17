import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../components/Text'
import { ExpandableText } from '../../components/ExpandableText'
import { IconButton } from '../../components/IconButton'
import { ChevronLeftIcon } from '../../components/Icons'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import type { VsLockPerson } from './VsLock'

const COUNTDOWN_START = 10

type Stance = { emoji: string; label: string; accent: string }

type Props = {
  motion: string
  description?: string | null
  sideContext?: string | null
  you: VsLockPerson
  youStance: Stance
  opponentName: string
  opponentRating?: number
  onDone: () => void
  onCancel: () => void
}

export function MatchIntroOverlay({
  motion, description, sideContext, you, youStance, opponentName, opponentRating, onDone, onCancel,
}: Props) {
  const insets = useSafeAreaInsets()
  const fadeIn = useRef(new Animated.Value(0)).current
  const tickFade = useRef(new Animated.Value(1)).current
  const [count, setCount] = useState(COUNTDOWN_START)
  const done = useRef(false)

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 260, useNativeDriver: true }).start()
  }, [])

  // Ticks 5→1, then fires onDone once — never renders 0.
  useEffect(() => {
    if (count <= 0) {
      if (!done.current) { done.current = true; onDone() }
      return
    }
    const id = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [count])

  // A brief fade on each tick — simple feedback that the number changed, nothing fancier.
  useEffect(() => {
    tickFade.setValue(0.35)
    Animated.timing(tickFade, { toValue: 1, duration: 220, useNativeDriver: true }).start()
  }, [count])

  return (
    <Animated.View style={[s.overlay, { opacity: fadeIn }]}>
      <View style={[s.backBtnWrap, { top: insets.top + spacing.sm }]}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={onCancel}
          accent={colors.text}
        />
      </View>

      <View style={[s.topBar, { top: insets.top + spacing.sm }]}>
        <View style={s.timerBadge}>
          <Animated.Text style={[s.timerBadgeDigit, { opacity: tickFade }]} allowFontScaling={false}>
            Starts in {count}s
          </Animated.Text>
        </View>
      </View>

      {/*
        Scrollable instead of a fixed space-between layout: when description/sideContext
        are long (or expanded via "Read more"), the old layout could push the cancel
        button toward or past the bottom safe area with no way to reach it. Scrolling
        degrades gracefully instead of clipping or overlapping content.
      */}
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + spacing.xxl + 36, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.top}>
          <View style={s.motionBlock}>
            <Text style={s.motion} numberOfLines={4}>{motion}</Text>
          </View>

          {!!(description || sideContext) && (
            <View style={s.contextBlock}>
              {!!description && (
                <View style={s.card}>
                  <Text style={s.cardEyebrow} allowFontScaling={false}>CONTEXT</Text>
                  <ExpandableText
                    text={description}
                    style={s.cardBody}
                    lines={3}
                    toggleTone="accent"
                    moreLabel="Read more"
                    lessLabel="Show less"
                  />
                </View>
              )}
              {!!sideContext && (
                <View style={s.card}>
                  <Text style={[s.cardEyebrow, { color: youStance.accent }]} allowFontScaling={false}>
                    YOUR ANGLE · {youStance.label.toUpperCase()}
                  </Text>
                  <ExpandableText
                    text={sideContext}
                    style={s.cardBody}
                    lines={2}
                    toggleTone="accent"
                    moreLabel="Read more"
                    lessLabel="Show less"
                  />
                </View>
              )}
            </View>
          )}

          <Text style={s.eyebrow} allowFontScaling={false}>MATCH FOUND</Text>

          <View style={[s.card, s.matchup]}>
            <View style={s.playerCol}>
              <Text style={s.playerName} numberOfLines={1} allowFontScaling={false}>{you.name}</Text>
              <Text style={s.playerRating} allowFontScaling={false}>
                {you.rating != null ? `${you.rating} rating` : ' '}
              </Text>
            </View>

            <Text style={s.vsText} allowFontScaling={false}>VS</Text>

            <View style={s.playerCol}>
              <Text style={s.playerName} numberOfLines={1} allowFontScaling={false}>{opponentName}</Text>
              <Text style={s.playerRating} allowFontScaling={false}>
                {opponentRating != null ? `${opponentRating} rating` : ' '}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={s.cancelLabel}>Cancel match</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
    zIndex: 100,
  },
  backBtnWrap: {
    position: 'absolute',
    left: SCREEN_PADDING,
    zIndex: 11,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
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
  timerBadgeDigit: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 14,
    color: colors.text,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.xxl,
  },

  top: {
    alignItems: 'center',
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.lime,
  },
  motionBlock: {
    alignItems: 'center',
    gap: 6,
  },
  motion: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 19,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  contextBlock: {
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardEyebrow: {
    fontFamily: fonts.jakarta.extraBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  cardBody: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.1,
    opacity: 0.85,
  },

  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  playerCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  playerName: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  playerRating: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 12,
    color: colors.textSubtle,
  },
  vsText: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textFaint,
  },

  cancelBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
})
