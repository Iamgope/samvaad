import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Image,
  ImageSourcePropType,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

type HeadLine =
  | { kind: 'base'; text: string }
  | { kind: 'hero'; text: string };

type Slide = {
  lines: HeadLine[];
  subhead?: string;
  body: { text: string; accent?: boolean }[];
  image: ImageSourcePropType;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    lines: [
      { kind: 'base', text: 'Your Ideas' },
      { kind: 'base', text: 'Deserve' },
      { kind: 'hero', text: 'Better' },
    ],
    subhead: 'than a comment section.',
    body: [],
    image: require('../assets/onboarding.png'),
    cta: 'Get Started',
  },
  {
    lines: [
      { kind: 'base', text: 'Make' },
      { kind: 'hero', text: 'Better' },
      { kind: 'base', text: 'Arguments' },
    ],
    body: [
      { text: 'Structured debates. Ranked matches. Sharpen your ' },
      { text: 'thinking', accent: true },
      { text: '.' },
    ],
    image: require('../assets/onboarding2.png'),
    cta: 'Continue',
  },
];

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.25;

export default function OnboardingScreen({ navigation }: Props) {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const transitionTo = (next: number) => {
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setIdx(next);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const advance = () => {
    if (isLast) {
      navigation.replace('Login');
      return;
    }
    transitionTo(idx + 1);
  };

  const goBack = () => {
    if (idx === 0) return;
    transitionTo(idx - 1);
  };

  const onPressIn = () =>
    Animated.timing(ctaScale, { toValue: 0.96, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.timing(ctaScale, { toValue: 1, duration: 80, useNativeDriver: true }).start();

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -SWIPE_THRESHOLD || g.vx < -SWIPE_VELOCITY) {
            advance();
          } else if (g.dx > SWIPE_THRESHOLD || g.vx > SWIPE_VELOCITY) {
            goBack();
          }
        },
      }),
    [idx, isLast],
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={s.swipeArea} {...panResponder.panHandlers}>
        <Animated.View style={[s.headerArea, { opacity: fade }]}>
          <View>
            {slide.lines.map((line, li) =>
              line.kind === 'hero' ? (
                <View key={li} style={s.heroRow}>
                  <View style={s.heroBrush} pointerEvents="none" />
                  <View style={s.heroBrushOverlay} pointerEvents="none" />
                  <Text style={s.heroPill}>{line.text}</Text>
                </View>
              ) : (
                <Text key={li} style={s.heroBase}>
                  {line.text}
                </Text>
              ),
            )}
          </View>

          {!!slide.subhead && (
            <Text variant="bodyLg" tone="onLightMuted" style={s.subhead}>
              {slide.subhead}
            </Text>
          )}

          <Text variant="bodyMd" tone="onLightSubtle" style={s.body}>
            {slide.body.map((seg, i) =>
              seg.accent ? (
                <Text key={i} style={s.bodyAccent}>{seg.text}</Text>
              ) : (
                <Text key={i} tone="inverse">{seg.text}</Text>
              ),
            )}
          </Text>
        </Animated.View>

        <Animated.View style={[s.illusArea, { opacity: fade }]}>
          <Image source={slide.image} style={s.illusImage} resizeMode="contain" />
        </Animated.View>
      </View>

      <View style={s.footer}>
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === idx ? s.dotActive : s.dotInactive]} />
          ))}
        </View>

        <Pressable
          onPress={advance}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={s.ctaWrap}
        >
          <Animated.View style={[s.cta, { transform: [{ scale: ctaScale }] }]}>
            <Text variant="labelLg" style={s.ctaText}>{slide.cta}</Text>
            <Text style={s.ctaArrow}>{'→'}</Text>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  swipeArea: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 48,
  },

  // The hero brush text keeps custom dimensions because the brushstroke
  // background geometry (rotation, skew, offset) is calibrated to these
  // exact font sizes. Don't swap to a typography token without recalibrating.
  heroBase: {
    fontFamily: fonts.display.extraBold,
    fontSize: 38,
    lineHeight: 44,
    color: colors.textOnLight,
    letterSpacing: -1.6,
  },
  heroRow: {
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingVertical: 2,
    position: 'relative',
  },
  heroBrush: {
    position: 'absolute',
    top: 8,
    left: -4,
    right: -2,
    bottom: 6,
    backgroundColor: colors.lime,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
    transform: [{ rotate: '-1.6deg' }, { skewX: '-3deg' }],
  },
  heroBrushOverlay: {
    position: 'absolute',
    top: 12,
    left: 2,
    right: -6,
    bottom: 4,
    backgroundColor: colors.lime,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 20,
    transform: [{ rotate: '1.2deg' }],
    opacity: 0.95,
  },
  heroPill: {
    fontFamily: fonts.display.black,
    fontSize: 52,
    lineHeight: 60,
    color: colors.textOnLight,
    letterSpacing: -2,
  },

  subhead: {
    marginTop: spacing.md,
  },
  body: {
    marginTop: spacing.md,
    maxWidth: '88%',
  },
  bodyAccent: {
    color: colors.purple,
    fontFamily: fonts.jakarta.semiBold,
  },

  illusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL,
    marginTop: spacing.lg,
  },
  illusImage: {
    width: '100%',
    height: '100%',
  },

  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: { backgroundColor: colors.purple },
  dotInactive: { backgroundColor: 'rgba(0,0,0,0.14)' },

  ctaWrap: { width: '100%' },
  cta: {
    backgroundColor: colors.black,
    borderRadius: 28,
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  ctaText: {
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  ctaArrow: {
    fontFamily: fonts.display.black,
    fontSize: 20,
    color: colors.lime,
    position: 'absolute',
    right: spacing.xl,
  },
});
