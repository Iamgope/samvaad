import { colors } from './colors';

export type Tier = { key: string; label: string; min: number; max: number };

export const TIERS: Tier[] = [
  { key: 'novice',  label: 'Novice',  min: 0,    max: 1200 },
  { key: 'skilled', label: 'Skilled', min: 1200, max: 1500 },
  { key: 'expert',  label: 'Expert',  min: 1500, max: 1800 },
  { key: 'master',  label: 'Master',  min: 1800, max: 9999 },
];

export const TIER_COLOR: Record<string, string> = {
  novice:  colors.tierNovice,
  skilled: colors.tierSkilled,
  expert:  colors.tierExpert,
  master:  colors.tierMaster,
};

export function getTierInfo(rating: number) {
  const idx = TIERS.findIndex(t => rating < t.max);
  const current = idx === -1 ? TIERS[TIERS.length - 1] : TIERS[idx];
  const next    = TIERS[TIERS.indexOf(current) + 1] ?? null;
  const inBand   = rating - current.min;
  const bandSize = current.max - current.min;
  const progress = next ? Math.min(1, inBand / bandSize) : 1;
  const toNext   = next ? Math.max(0, next.min - rating) : 0;
  return { current, next, progress, toNext };
}
