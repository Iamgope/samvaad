import type { TextStyle } from 'react-native';
import { fonts } from './fonts';

// Type scale. Every screen consumes these tokens via the <Text variant="..."> wrapper
// or by spreading into a StyleSheet. Never set fontFamily/fontSize/lineHeight/letterSpacing
// ad-hoc — pick a token. If a token is missing for a real role, add one here.
//
// Tracking rule: tighten as size grows, neutral mid-range, open up small.
// Line-height ratio: ~1.05–1.15 display, ~1.2–1.3 title, ~1.4–1.5 body.

export const text = {
  // DISPLAY — hero moments. Auth headlines, landing.
  displayHero: {
    fontFamily: fonts.display.black,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.4,
  },
  displayLg: {
    fontFamily: fonts.display.extraBold,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1,
  },
  displayMd: {
    fontFamily: fonts.display.extraBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },

  // TITLE — section, screen, modal titles.
  titleLg: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  titleMd: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  titleSm: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },

  // BODY — paragraphs, descriptions, subheads under hero.
  bodyLg: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodyMd: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // LABEL — buttons, pills, tags. Compact, action-y.
  labelLg: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  labelMd: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },

  // CAPTION — terms, hints, microcopy.
  caption: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  overline: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // NUMERIC — OTP digits, counters, scores.
  numericLg: {
    fontFamily: fonts.display.black,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
