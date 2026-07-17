import type { ComponentType } from 'react';
import { colors } from './colors';
import {
  PoliticsIllustration,
  SportsIllustration,
  CultureIllustration,
  GeneralIllustration,
  type IllustrationProps,
} from '../components/CategoryIllustrations';

export type CategoryConfig = {
  emoji: string;
  accent: string;
  icon: any;
  /** SVG illustration shown in place of a missing topic photo. */
  Illustration: ComponentType<IllustrationProps>;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Politics: {
    emoji: '🏛️',
    accent: colors.streak,
    icon: require('../assets/politics_icon.png'),
    Illustration: CultureIllustration,
  },
  Sports: {
    emoji: '🏆',
    accent: colors.sky,
    icon: require('../assets/sports_icon.png'),
    Illustration: SportsIllustration,
  },
  Culture: {
    emoji: '🎭',
    accent: colors.purple2,
    icon: require('../assets/art_icon.png'),
    Illustration: CultureIllustration,
  },
};

export const CATEGORY_ORDER = ['Politics', 'Sports', 'Culture'] as const;

export const FALLBACK_CATEGORY: CategoryConfig = {
  emoji: '💬',
  accent: colors.lime,
  icon: null,
  Illustration: GeneralIllustration,
};

export function categoryConfig(name: string): CategoryConfig {
  return CATEGORY_CONFIG[name] ?? FALLBACK_CATEGORY;
}
