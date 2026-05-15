import React from 'react';
import {
  View, StyleSheet, TouchableOpacity, Image,
  type ImageSourcePropType,
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { Text } from '../Text';
import { ChevronRightIcon, LockIcon } from '../Icons';

export type Badge = {
  key: string;
  label: string;
  earned: boolean;
  image?: ImageSourcePropType;
  earnedOn?: string;
};

export function TrophyCase({
  badges,
  onSeeAll,
}: {
  badges: Badge[];
  onSeeAll: () => void;
}) {
  const earned = badges.filter(b => b.earned);
  const visible = badges.slice(0, 4);

  return (
    <View>
      <View style={styles.head}>
        <View>
          <Text variant="titleLg">Trophy Case</Text>
          <Text variant="caption" tone="subtle">
            {earned.length} earned · {badges.length - earned.length} to go
          </Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text variant="labelSm" tone="muted">{badges.length}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {visible.map(b => <TrophyTile key={b.key} badge={b} />)}
      </View>
      <TouchableOpacity style={styles.allBtn} onPress={onSeeAll} activeOpacity={0.6}>
        <Text variant="bodyMd">All trophies</Text>
        <ChevronRightIcon size={14} color={colors.textFaint} />
      </TouchableOpacity>
    </View>
  );
}

function TrophyTile({ badge }: { badge: Badge }) {
  return (
    <View style={styles.tile}>
      {badge.earned && badge.image ? (
        <Image source={badge.image} style={styles.badgeImage} resizeMode="contain" />
      ) : (
        <View style={styles.iconHex}>
          <LockIcon size={26} color={colors.textFaint} />
        </View>
      )}
      <Text
        variant="labelSm"
        tone={badge.earned ? 'default' : 'faint'}
        numberOfLines={2}
        style={styles.tileLabel}
      >
        {badge.label}
      </Text>
      {badge.earned && badge.earnedOn && (
        <Text variant="caption" tone="subtle">{badge.earnedOn}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconHex: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  badgeImage: {
    width: 72,
    height: 72,
  },
  tileLabel: {
    textAlign: 'center',
  },
  allBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
});
