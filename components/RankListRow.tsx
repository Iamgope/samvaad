import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { Text } from './Text';

export type RankListRowAccent = 'default' | 'win' | 'loss';

export type RankListRowProps = {
  leftLabel: string | number;

  initials?: string;
  avatarUri?: string;

  name: string;

  metaText: string;
  metaIcon?: React.ReactNode;
  metaAccent?: RankListRowAccent;

  /** Topic / category accent — tints avatar bg and the meta pill. */
  accent?: string;

  rightSlot?: React.ReactNode;

  onPress?: () => void;
  isLast?: boolean;
};

const META_ACCENTS: Record<RankListRowAccent, { bg: string; fg: string }> = {
  default: { bg: 'rgba(255,255,255,0.06)', fg: colors.textMuted },
  win:     { bg: 'rgba(80, 220, 140, 0.14)', fg: '#7FE0AA' },
  loss:    { bg: 'rgba(220, 100, 100, 0.14)', fg: '#E08A8A' },
};

export function RankListRow({
  leftLabel,
  initials,
  avatarUri,
  name,
  metaText,
  metaIcon,
  metaAccent = 'default',
  accent,
  rightSlot,
  onPress,
  isLast = false,
}: RankListRowProps) {
  const Wrapper: any = onPress ? TouchableOpacity : View;

  const avatarBg = accent ? accent + '18' : 'rgba(255,255,255,0.05)';
  const pill = META_ACCENTS[metaAccent];

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.row, !isLast && styles.rowDivider]}
    >
      <View style={styles.rankSlot}>
        <Text variant="labelLg" tone="muted">{leftLabel}</Text>
      </View>

      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
        ) : (
          <Text variant="labelSm" tone="default" style={styles.avatarInitials}>
            {initials ?? ''}
          </Text>
        )}
      </View>

      <View style={styles.middle}>
        <Text variant="titleSm" numberOfLines={1}>{name}</Text>
        <View style={[styles.metaPill, { backgroundColor: pill.bg }]}>
          {metaIcon}
          <Text variant="labelSm" style={{ color: pill.fg }}>{metaText}</Text>
        </View>
      </View>

      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rankSlot: {
    width: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: { letterSpacing: 0.5 },
  middle: { flex: 1, gap: 4, marginLeft: 2 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rightSlot: { marginLeft: spacing.sm },
});
