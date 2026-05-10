import { colors } from './colors';

export type TopicId = 'all' | 'politics' | 'sports' | 'culture';

export type Topic = {
  id: TopicId;
  label: string;
  emoji: string;
  accent: string;
};

export const TOPICS: Topic[] = [
  { id: 'all', label: 'All', emoji: '🌏', accent: colors.lime },
  { id: 'politics', label: 'Politics', emoji: '🏛️', accent: colors.streak },
  { id: 'sports', label: 'Sports', emoji: '🏆', accent: colors.sky },
  { id: 'culture', label: 'Culture', emoji: '🎨', accent: colors.purple2 },
];

export const getTopic = (id: TopicId) => TOPICS.find(t => t.id === id) ?? TOPICS[0];
