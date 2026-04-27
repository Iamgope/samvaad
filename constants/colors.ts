// Dark palette: navy-charcoal base instead of pure black.
// This reduces the harsh 21:1 white-on-black contrast to a comfortable ~14:1
// while keeping the same visual hierarchy. Lime and purple read warmer against
// the dark navy than they do against #000.
export const colors = {
  // Core brand
  lime:      '#CAFF33',
  limeMuted: '#A3E635', // softer default for button shadows
  purple: '#6B3FE4',
  red:    '#FF3B5C',

  // Dark surface hierarchy (bg → elevated → more elevated)
  black:    '#0C0F16',  // primary bg — dark navy-charcoal, not pure black
  surface:  '#131920',  // card / input bg
  surface2: '#1A2130',  // elevated surface, search bg
  border:   '#232B3C',  // structural dividers, card borders
  borderStrong: '#2D3748', // interactive element borders (pills, inputs)

  // Text hierarchy — calibrated for dark navy backgrounds.
  // Primary is off-white (#EDEEF3), not pure white, to cut harshness.
  text:        '#EDEEF3',  // primary
  textMuted:   '#8B93A9',  // supporting text, subheads
  textSubtle:  '#576079',  // hints, captions, terms, placeholders
  textFaint:   '#3B4558',  // very subdued, disabled-adjacent

  // Light-bg text hierarchy (Onboarding cream screen only)
  textOnLight:        '#0A0A0A',
  textOnLightMuted:   '#2D2D2D',
  textOnLightSubtle:  '#4A4A4A',

  // Misc
  cream:   '#F4EEDE',
  purple2: '#8B5CF6',
  purple3: '#2D1B6E',
  streak:  '#FF6B35',

  // Deprecated — kept so nothing breaks before a full sweep
  text2: '#8B93A9',
  text3: '#576079',
} as const;

export type ColorToken = keyof typeof colors;
