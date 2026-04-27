import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { text, type TextVariant } from '../constants/typography';
import { colors } from '../constants/colors';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'faint'
  | 'accent'
  | 'inverse'
  | 'onAccent'
  | 'danger'
  | 'onLight'
  | 'onLightMuted'
  | 'onLightSubtle';

const TONE_COLOR: Record<TextTone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  faint: colors.textFaint,
  accent: colors.lime,
  inverse: colors.black,
  onAccent: colors.black,
  danger: colors.red,
  onLight: colors.textOnLight,
  onLightMuted: colors.textOnLightMuted,
  onLightSubtle: colors.textOnLightSubtle,
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

// Standardized Text. Pick a variant for size/weight/spacing, a tone for color.
// Both are optional so this can also be used as a transparent wrapper for nested
// runs (e.g. an italic accent inside a display headline).
export function Text({ variant, tone, style, children, ...rest }: TextProps) {
  const variantStyle = variant ? text[variant] : undefined;
  const toneStyle = {
    color: TONE_COLOR[tone ?? 'default']
  }
  return (
    <RNText style={[variantStyle, toneStyle, style]} {...rest}>
      {children}
    </RNText>
  );
}
