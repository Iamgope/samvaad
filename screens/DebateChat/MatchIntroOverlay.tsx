import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../components/Text'
import { ExpandableText } from '../../components/ExpandableText'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/fonts'
import { spacing, SCREEN_PADDING } from '../../constants/spacing'
import { VsLock, type VsLockPerson } from './VsLock'
import { QUOTE_CARD_BG } from './MessageBubble'

const COUNTDOWN_START = 10

type Stance = { emoji: string; label: string; accent: string }

type Props = {
  motion: string
  description?: string | null
  sideContext?: string | null
  you: VsLockPerson
  youStance: Stance
  opponentName: string
  opponentStance: Stance
  onDone: () => void
  onCancel: () => void
}

export function MatchIntroOverlay({
  motion, description, sideContext, you, youStance, opponentName, opponentStance, onDone, onCancel,
}: Props) {
  const insets = useSafeAreaInsets()
  const fadeIn = useRef(new Animated.Value(0)).current
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

  return (
    <Animated.View style={[s.overlay, { opacity: fadeIn }]}>
      {/*
        Scrollable instead of a fixed space-between layout: when description/sideContext
        are long (or expanded via "Read more"), the old layout could push the cancel
        button toward or past the bottom safe area with no way to reach it. Scrolling
        degrades gracefully instead of clipping or overlapping content.
      */}
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.top}>
          <Text style={s.eyebrow} allowFontScaling={false}>MATCH FOUND</Text>
          <Text style={s.motion} numberOfLines={4}>{motion}</Text>

          {!!(description || sideContext) && (
            <View style={s.contextBox}>
              {!!description && (
                <View style={s.angleBlock}>
                  <Text style={s.angleHeading} allowFontScaling={false}>CONTEXT</Text>
                  <ExpandableText
                    text={description}
                    style={s.contextText}
                    lines={3}
                    toggleTone="accent"
                    moreLabel="Read more"
                    lessLabel="Show less"
                  />
                </View>
              )}
              {!!description && !!sideContext && <View style={s.divider} />}
              {!!sideContext && (
                <View style={s.angleBlock}>
                  <Text style={[s.angleHeading, { color: youStance.accent }]} allowFontScaling={false}>
                    YOUR ANGLE
                  </Text>
                  <ExpandableText
                    text={sideContext}
                    style={s.contextText}
                    lines={2}
                    toggleTone="accent"
                    moreLabel="Read more"
                    lessLabel="Show less"
                  />
                </View>
              )}
            </View>
          )}
        </View>

        <View style={s.middle}>

          <VsLock
            you={you}
            youFooter={{ emoji: youStance.emoji, label: youStance.label.toUpperCase(), color: youStance.accent }}
            opponent={{ name: opponentName, avatarUri: null }}
            opponentFooter={{ emoji: opponentStance.emoji, label: opponentStance.label.toUpperCase(), color: opponentStance.accent }}
            center={<Text style={[s.countdownDigit, { textShadowColor: youStance.accent }]} allowFontScaling={false}>{count}</Text>}
            centerKey={count}
            breatheDurationMs={420}
          />
          <Text style={s.startsInLabel} allowFontScaling={false}>YOUR DEBATE STARTS IN</Text>

          <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={s.cancelLabel}>Cancel match</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING,
    justifyContent: 'space-between',
    gap: spacing.xl,
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
  motion: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  contextBox: {
    width: '100%',
    marginTop: spacing.xs,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: QUOTE_CARD_BG,
    gap: spacing.md,
  },
  contextText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.textOnLight,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#00000014',
  },
  angleBlock: {
    gap: 6,
  },
  angleHeading: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.textOnLightMuted,
  },

  middle: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  countdownDigit: {
    fontFamily: fonts.display.black,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -1.5,
    textAlign: 'center',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  startsInLabel: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 12,
    letterSpacing: 1.6,
    color: colors.textSubtle,
  },
  cancelBtn: {
    marginTop: spacing.sm,
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
