import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Polygon, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { TOPICS, TopicId } from '../../constants/topics';
import { Text } from '../../components/Text';
import { ChipDropdown } from '../../components/ChipDropdown';

type Player = {
  rank: number;
  name: string;
  initials: string;
  wins: number;
  debates: number;
  streak: number;
};

const PLAYERS_BY_TOPIC: Record<TopicId, Player[]> = {
  all: [
    { rank: 1, name: 'Arjun Mehta', initials: 'AM', wins: 142, debates: 178, streak: 12 },
    { rank: 2, name: 'Zara Khan', initials: 'ZK', wins: 118, debates: 155, streak: 7 },
    { rank: 3, name: 'Dev Patel', initials: 'DP', wins: 97, debates: 134, streak: 3 },
    { rank: 4, name: 'Priya Sharma', initials: 'PS', wins: 89, debates: 120, streak: 5 },
    { rank: 5, name: 'Rishi Gupta', initials: 'RG', wins: 76, debates: 110, streak: 2 },
    { rank: 6, name: 'Aisha Nair', initials: 'AN', wins: 71, debates: 105, streak: 0 },
    { rank: 7, name: 'Kabir Singh', initials: 'KS', wins: 65, debates: 98, streak: 4 },
    { rank: 8, name: 'Meera Iyer', initials: 'MI', wins: 58, debates: 90, streak: 1 },
  ],
  politics: [
    { rank: 1, name: 'Zara Khan', initials: 'ZK', wins: 64, debates: 82, streak: 5 },
    { rank: 2, name: 'Arjun Mehta', initials: 'AM', wins: 58, debates: 78, streak: 3 },
    { rank: 3, name: 'Kabir Singh', initials: 'KS', wins: 41, debates: 60, streak: 2 },
    { rank: 4, name: 'Aisha Nair', initials: 'AN', wins: 38, debates: 55, streak: 0 },
    { rank: 5, name: 'Dev Patel', initials: 'DP', wins: 33, debates: 50, streak: 1 },
  ],
  sports: [
    { rank: 1, name: 'Dev Patel', initials: 'DP', wins: 44, debates: 60, streak: 4 },
    { rank: 2, name: 'Arjun Mehta', initials: 'AM', wins: 39, debates: 55, streak: 2 },
    { rank: 3, name: 'Rishi Gupta', initials: 'RG', wins: 31, debates: 48, streak: 0 },
    { rank: 4, name: 'Meera Iyer', initials: 'MI', wins: 22, debates: 38, streak: 1 },
  ],
  culture: [
    { rank: 1, name: 'Arjun Mehta', initials: 'AM', wins: 51, debates: 68, streak: 6 },
    { rank: 2, name: 'Priya Sharma', initials: 'PS', wins: 47, debates: 62, streak: 3 },
    { rank: 3, name: 'Meera Iyer', initials: 'MI', wins: 36, debates: 52, streak: 2 },
    { rank: 4, name: 'Zara Khan', initials: 'ZK', wins: 29, debates: 45, streak: 0 },
    { rank: 5, name: 'Aisha Nair', initials: 'AN', wins: 25, debates: 40, streak: 1 },
  ],
};

const { width: SCREEN_W } = Dimensions.get('window');
const PODIUM_GAP = 4;
const DEPTH = 14;
const COL_WIDTH = (SCREEN_W - 2 * SCREEN_PADDING - 2 * PODIUM_GAP) / 3;
const FRONT_W = COL_WIDTH - DEPTH;

type BlockColors = {
  top: string; front: string; side: string; edge: string;
  numeralFill: string; numeralStroke: string;
};

const BLOCK_COLORS: Record<1 | 2 | 3, BlockColors> = {
  1: {
    top: '#2B3650', front: '#181F2E', side: '#0A0E17', edge: '#3A4866',
    numeralFill: '#26314A', numeralStroke: '#4A5A80'
  },
  2: {
    top: '#252F44', front: '#141A28', side: '#080C13', edge: '#33405C',
    numeralFill: '#1F2940', numeralStroke: '#3A4866'
  },
  3: {
    top: '#202A3D', front: '#111724', side: '#070A11', edge: '#2D3953',
    numeralFill: '#1A2235', numeralStroke: '#2D3953'
  },
};

const NUMERAL_SIZE = { 1: 76, 2: 56, 3: 44 } as const;
const STEP_H = { 1: 132, 2: 92, 3: 64 } as const;
const AVATAR_S = { 1: 66, 2: 54, 3: 50 } as const;

function Avatar({ initials, size, isFirst }: { initials: string; size: number; isFirst: boolean }) {
  return (
    <View style={[styles.avatarWrap, { width: size + 8, height: size + 8 }]}>
      <View style={[
        styles.avatarCircle,
        {
          width: size, height: size, borderRadius: size / 2,
          borderColor: isFirst ? '#3A4866' : '#2A3548',
          borderWidth: isFirst ? 2 : 1.5,
        },
      ]}>
        <Text style={[styles.avatarInitials, { fontSize: isFirst ? 18 : 13 }]}>
          {initials}
        </Text>
      </View>
    </View>
  );
}

function Block3D({ height, position, label }: { height: number; position: 1 | 2 | 3; label: string }) {
  const c = BLOCK_COLORS[position];
  const totalH = height + DEPTH;
  const numSize = NUMERAL_SIZE[position];
  const numY = DEPTH + (height + numSize * 0.35) / 2;

  return (
    <Svg width={COL_WIDTH} height={totalH}>
      <Polygon points={`${FRONT_W},${DEPTH} ${COL_WIDTH},0 ${COL_WIDTH},${height} ${FRONT_W},${totalH}`} fill={c.side} />
      <Polygon points={`0,${DEPTH} ${FRONT_W},${DEPTH} ${FRONT_W},${totalH} 0,${totalH}`} fill={c.front} />
      <Polygon points={`0,${DEPTH} ${FRONT_W},${DEPTH} ${COL_WIDTH},0 ${DEPTH},0`} fill={c.top} />
      <Polygon points={`${DEPTH},0 ${COL_WIDTH},0 ${COL_WIDTH - 1},1 ${DEPTH + 1},1`} fill={c.edge} />
      <SvgText
        x={FRONT_W / 2}
        y={numY}
        textAnchor="middle"
        fontSize={numSize}
        fontWeight="800"
        fill={c.numeralFill}
        stroke={c.numeralStroke}
        strokeWidth={position === 1 ? 1 : 0.8}
      >
        {label}
      </SvgText>
    </Svg>
  );
}

function PodiumColumn({ player, position }: { player: Player; position: 1 | 2 | 3 }) {
  return (
    <View style={styles.podiumCol}>
      <View style={styles.podiumAvatarSlot}>
        <Avatar initials={player.initials} size={AVATAR_S[position]} isFirst={position === 1} />
      </View>
      <Block3D height={STEP_H[position]} position={position} label={String(position)} />
    </View>
  );
}

function Podium({ players }: { players: Player[] }) {
  if (players.length < 3) {
    return (
      <View style={styles.podiumEmpty}>
        <Text style={styles.podiumEmptyText}>Not enough players in this topic yet.</Text>
      </View>
    );
  }

  const order: { player: Player; position: 1 | 2 | 3 }[] = [
    { player: players[1], position: 2 },
    { player: players[0], position: 1 },
    { player: players[2], position: 3 },
  ];

  return (
    <View>
      <View style={styles.podiumRow}>
        {order.map(o => <PodiumColumn key={o.position} player={o.player} position={o.position} />)}
      </View>
      <View style={styles.podiumNameRow}>
        {order.map(o => (
          <View key={o.position} style={styles.podiumNameCol}>
            <Text style={styles.podiumName} numberOfLines={1}>{o.player.name.split(' ')[0]}</Text>
            <Text style={styles.podiumWins}>{o.player.wins} WINS</Text>
          </View>
        ))}
      </View>
    </View>
  );
}


function LeaderRow({ player }: { player: Player }) {
  const winRate = Math.round((player.wins / player.debates) * 100);

  return (
    <View style={styles.leaderWrap}>
      <View style={styles.leaderCard}>
        <View style={styles.leaderAvatar}>
          <Text style={styles.leaderAvatarText}>{player.initials}</Text>
        </View>

        <View style={styles.leaderInfo}>
          <Text style={styles.leaderName} numberOfLines={1}>{player.name}</Text>
          <View style={styles.leaderMetaRow}>
            <Text style={styles.leaderMeta}>{player.debates} debates</Text>
            <View style={styles.leaderDot} />
            <Text style={styles.leaderMeta}>{winRate}%</Text>
          </View>
        </View>

        <View style={styles.leaderScoreSection}>
          <View style={styles.leaderScore}>
            <Text style={styles.leaderScoreText}>{player.wins}</Text>
          </View>
          <Text style={styles.leaderRankLabel}>#{player.rank}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LadderScreen() {
  const [topic, setTopic] = useState<TopicId>('all');
  const currentTopic = TOPICS.find(t => t.id === topic) ?? TOPICS[0];
  const players = PLAYERS_BY_TOPIC[topic];
  const restOfList = players.slice(3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.filterWrap}>
          <ChipDropdown
            selected={currentTopic}
            options={TOPICS}
            onSelect={(t) => setTopic(t.id)}
            accent={currentTopic.accent}
            zIndex={20}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.podiumSection}>
          <Podium players={players} />
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            {topic === 'all' ? 'Full standings' : `Top in ${TOPICS.find(t => t.id === topic)?.label}`}
          </Text>
          {restOfList.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>Only the podium so far. More to come.</Text>
            </View>
          ) : (
            restOfList.map((p: Player) => <LeaderRow key={p.rank} player={p} />)
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm, paddingBottom: spacing.sm, gap: spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.jakarta.semiBold, fontSize: 16, color: colors.text, flex: 1 },
  filterWrap: { position: 'relative', zIndex: 10, minWidth: 140 },

  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { backgroundColor: '#1C2535', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontFamily: fonts.display.bold, color: colors.text, letterSpacing: 0.5 },

  podiumCol: { width: COL_WIDTH, alignItems: 'center' },
  podiumAvatarSlot: { marginBottom: 6, zIndex: 2 },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: SCREEN_PADDING, gap: PODIUM_GAP },
  podiumNameRow: { flexDirection: 'row', paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.md, gap: PODIUM_GAP, justifyContent: 'center' },
  podiumNameCol: { width: COL_WIDTH, alignItems: 'center', gap: 3 },
  podiumName: { fontFamily: fonts.jakarta.semiBold, fontSize: 13, color: colors.text },
  podiumWins: { fontFamily: fonts.display.bold, fontSize: 10, color: colors.textSubtle, letterSpacing: 1.5 },
  podiumEmpty: { height: 280, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SCREEN_PADDING },
  podiumEmptyText: { fontFamily: fonts.jakarta.regular, fontSize: 13, color: colors.textSubtle, textAlign: 'center' },

  leaderWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: SCREEN_PADDING, marginBottom: spacing.sm },
  leaderCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.06)' },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C2535', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A3548' },
  leaderAvatarText: { fontFamily: fonts.display.bold, fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  leaderInfo: { flex: 1, gap: 3 },
  leaderName: { fontFamily: fonts.jakarta.semiBold, fontSize: 14, color: colors.text },
  leaderMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaderMeta: { fontFamily: fonts.jakarta.regular, fontSize: 11, color: colors.textSubtle },
  leaderDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: colors.textFaint },
  leaderScoreSection: { alignItems: 'center', gap: 4 },
  leaderScore: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', minWidth: 50, alignItems: 'center' },
  leaderScoreText: { fontFamily: fonts.display.bold, fontSize: 14, color: colors.text },
  leaderRankLabel: { fontFamily: fonts.jakarta.semiBold, fontSize: 11, color: colors.textMuted },

  scrollContent: { paddingBottom: spacing.xl },
  podiumSection: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  listSection: { paddingHorizontal: SCREEN_PADDING },
  sectionTitle: { fontFamily: fonts.jakarta.semiBold, fontSize: 12, color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md, paddingHorizontal: SCREEN_PADDING },
  emptyList: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyListText: { fontFamily: fonts.jakarta.regular, fontSize: 13, color: colors.textSubtle },
});
