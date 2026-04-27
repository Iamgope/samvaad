// Hero + Display: Archivo (heavy editorial grotesque) — headlines, CTAs, labels.
// Serif italic: Fraunces — calligraphic accent words inside headlines.
// Body font: Plus Jakarta Sans.
export const fonts = {
  hero: {
    bold:      'Archivo_700Bold',
    extraBold: 'Archivo_800ExtraBold',
    black:     'Archivo_900Black',
  },
  display: {
    bold:      'Archivo_700Bold',
    extraBold: 'Archivo_800ExtraBold',
    black:     'Archivo_900Black',
  },
  serif: {
    regular: 'InstrumentSerif_400Regular',
    italic:  'InstrumentSerif_400Regular_Italic',
  },
  jakarta: {
    regular:       'PlusJakartaSans_400Regular',
    regularItalic: 'PlusJakartaSans_400Regular_Italic',
    medium:        'PlusJakartaSans_500Medium',
    semiBold:      'PlusJakartaSans_600SemiBold',
    bold:          'PlusJakartaSans_700Bold',
    extraBold:     'PlusJakartaSans_800ExtraBold',
    black:         'PlusJakartaSans_800ExtraBold',
  },
} as const;
