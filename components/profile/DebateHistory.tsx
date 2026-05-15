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
  outcome: 'win' | 'loss';
  agoLabel: string;
};

const FORMAT_LABELS: Record<FormatKey, string> = {
  stronger: 'Stronger',
  clash:    'Clash',
  counter:  'Counter',
};

export function DebateHistory({
  matches,
  isOwn,
}: {
  matches: Match[];
  isOwn: boolean;
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
          const isWin = m.outcome === 'win';
          const t = TOPICS.find(t => t.id === m.topic) ?? TOPICS[0];
          return (
            <View
              key={m.id}
              style={i !== filtered.length - 1 ? styles.rowDivider : undefined}
            >
              <DebateHeadline
                motion={m.motion}
                context={`${FORMAT_LABELS[m.format]} · ${m.agoLabel}`}
                categoryName={t.label}
                categoryAccent={colors.textMuted}
                headlineSize={15}
                footer={
                  <View style={[styles.outcome, isWin ? styles.outcomeWin : styles.outcomeLoss]}>
                    <Text variant="labelSm" style={{ color: isWin ? '#7FE0AA' : '#E08A8A' }}>
                      {isWin ? 'WIN' : 'LOSS'}
                    </Text>
                  </View>
                }
              />
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
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  outcome: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  outcomeWin: {
    backgroundColor: 'rgba(127, 224, 170, 0.10)',
    borderColor: 'rgba(127, 224, 170, 0.35)',
  },
  outcomeLoss: {
    backgroundColor: 'rgba(224, 138, 138, 0.10)',
    borderColor: 'rgba(224, 138, 138, 0.35)',
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
