import { colors } from './colors';

export type CategoryConfig = {
  emoji: string;
  accent: string;
  icon: any;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Politics: {
    emoji:  '🏛️',
    accent: colors.streak,
    icon:   require('../assets/politics_icon.png'),
  },
  Sports: {
    emoji:  '🏆',
    accent: colors.sky,
    icon:   require('../assets/sports_icon.png'),
  },
  Culture: {
    emoji:  '🎭',
    accent: colors.purple2,
    icon:   require('../assets/art_icon.png'),
  },
};

export const CATEGORY_ORDER = ['Politics', 'Sports', 'Culture'] as const;

export const FALLBACK_CATEGORY: CategoryConfig = {
  emoji:  '💬',
  accent: colors.lime,
  icon:   null,
};

export function categoryConfig(name: string): CategoryConfig {
  return CATEGORY_CONFIG[name] ?? FALLBACK_CATEGORY;
}
