import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { Text } from '../Text';
import { ChipDropdown } from '../ChipDropdown';
import { DebateHeadline } from '../DebateHeadline';
import { TOPICS, TopicId } from '../../constants/topics';

export type FormatKey = 'stronger' | 'counter' | 'clash';
export type TopicKey  = 'all' | 'politics' | 'sports' | 'culture';

export type Match = {
  id: string;
  motion: string;
  opponentName: string;
  opponentInit: string;
  format: FormatKey;
  topic: TopicKey;
  outcome: 'win' | 'loss' | 'draw';
  agoLabel: string;
  userSide: 'for' | 'against';
};

const FORMAT_LABELS: Record<FormatKey, string> = {
  stronger: 'Stronger',
  clash:    'Clash',
  counter:  'Counter',
};

export function DebateHistory({
  matches,
  isOwn,
  onPress,
}: {
  matches: Match[];
  isOwn: boolean;
  onPress?: (match: Match) => void;
}) {
  const [topic, setTopic] = useState<TopicId>('all');
  const currentTopic = TOPICS.find(t => t.id === topic) ?? TOPICS[0];

  if (matches.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text variant="titleSm" style={styles.title}>Recent debates</Text>
        <View style={styles.empty}>
          <Text variant="bodySm" tone="subtle">
            {isOwn ? 'No debates yet — join your first match.' : 'No debates yet.'}
          </Text>
        </View>
      </View>
    );
  }

  const filtered = topic === 'all'
    ? matches
    : matches.filter(m => m.topic === topic);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text variant="titleSm">Recent debates</Text>
        <View style={styles.filterSlot}>
          <ChipDropdown
            selected={currentTopic}
            options={TOPICS}
            onSelect={(t) => setTopic(t.id)}
            accent={colors.text}
            zIndex={20}
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodySm" tone="subtle">
            No debates in {currentTopic.label.toLowerCase()}.
          </Text>
        </View>
      ) : (
        filtered.map((m, i) => {
          const t = TOPICS.find(t => t.id === m.topic) ?? TOPICS[0];
          const chipStyle = m.outcome === 'win' ? styles.outcomeWin
            : m.outcome === 'loss' ? styles.outcomeLoss
            : styles.outcomeDraw;
          const chipColor = m.outcome === 'win' ? '#7FE0AA'
            : m.outcome === 'loss' ? '#E08A8A'
            : '#93C5FD';
          return (
            <View
              key={m.id}
              style={[
                styles.rowWrap,
                i !== filtered.length - 1 ? styles.rowDivider : undefined,
              ]}
            >
              <DebateHeadline
                motion={m.motion}
                context={`${FORMAT_LABELS[m.format]} · ${m.agoLabel}`}
                categoryName={t.label}
                categoryAccent={colors.textMuted}
                headlineSize={15}
                onPress={onPress ? () => onPress(m) : undefined}
              />
              <View style={[styles.outcomeChip, chipStyle]}>
                <Text style={[styles.outcomeText, { color: chipColor }]}>
                  {m.outcome === 'win' ? 'WIN' : m.outcome === 'loss' ? 'LOSS' : 'DRAW'}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SCREEN_PADDING },
  title: { marginBottom: spacing.sm },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    zIndex: 20,
  },
  filterSlot: { minWidth: 130 },
  rowWrap: {
    position: 'relative',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  outcomeChip: {
    position: 'absolute',
    top: spacing.lg,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  outcomeWin: {
    backgroundColor: 'rgba(127, 224, 170, 0.10)',
    borderColor: 'rgba(127, 224, 170, 0.35)',
    borderBottomColor: 'rgba(127, 224, 170, 0.65)',
  },
  outcomeLoss: {
    backgroundColor: 'rgba(224, 138, 138, 0.10)',
    borderColor: 'rgba(224, 138, 138, 0.35)',
    borderBottomColor: 'rgba(224, 138, 138, 0.65)',
  },
  outcomeDraw: {
    backgroundColor: 'rgba(147, 197, 253, 0.10)',
    borderColor: 'rgba(147, 197, 253, 0.35)',
    borderBottomColor: 'rgba(147, 197, 253, 0.65)',
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
