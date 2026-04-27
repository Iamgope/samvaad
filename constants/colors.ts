export const colors = {
  // Core — 3 colors, 3 jobs
  black:  '#080808',
  purple: '#6B3FE4',
  lime:   '#CAFF33',

  // Supporting
  cream:    '#F4EEDE',
  surface:  '#111111',
  surface2: '#1A1A1A',
  border:   '#242424',
  purple2:  '#8B5CF6',
  purple3:  '#2D1B6E',
  red:      '#FF3B5C',
  streak:   '#FF6B35',

  // Text tiers — use these instead of one-off hex grays.
  // Calibrated for the dark surface (#080808). For light backgrounds
  // (Onboarding cream), use textOnLight* below.
  text:        '#FFFFFF',
  textMuted:   '#9A9A9A',
  textSubtle:  '#6A6A6A',
  textFaint:   '#444444',

  // Light-bg text tiers (for cream / white backgrounds).
  textOnLight:        '#0A0A0A',
  textOnLightMuted:   '#2D2D2D',
  textOnLightSubtle:  '#4A4A4A',

  // Deprecated aliases — kept for any stragglers, prefer the named tiers.
  text2:    '#9A9A9A',
  text3:    '#6A6A6A',
} as const;

export type ColorToken = keyof typeof colors;
