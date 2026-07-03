import { colors } from './colors';

export type CategoryConfig = {
  emoji: string;
  accent: string;
  icon: any;
  poster: any;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Politics: {
    emoji:  '🏛️',
    accent: colors.streak,
    icon:   require('../assets/politics_icon.png'),
    poster: require('../assets/poster_politics.png'),
  },
  Sports: {
    emoji:  '🏆',
    accent: colors.sky,
    icon:   require('../assets/sports_icon.png'),
    poster: require('../assets/poster_sports.png'),
  },
  Culture: {
    emoji:  '🎭',
    accent: colors.purple2,
    icon:   require('../assets/art_icon.png'),
    poster: require('../assets/poster_culture.png'),
  },
};

export const CATEGORY_ORDER = ['Politics', 'Sports', 'Culture'] as const;

export const FALLBACK_CATEGORY: CategoryConfig = {
  emoji:  '💬',
  accent: colors.lime,
  icon:   null,
  poster: null,
};

export function categoryConfig(name: string): CategoryConfig {
  return CATEGORY_CONFIG[name] ?? FALLBACK_CATEGORY;
}
