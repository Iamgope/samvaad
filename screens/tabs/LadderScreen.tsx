import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, Dimensions, ScrollView, Animated, PanResponder, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { useLeaderboard } from '../../hooks/useQueries';
import type { LeaderboardEntry, Timeframe } from '../../services/api';
import { Text } from '../../components/Text';
import { RankListRow } from '../../components/RankListRow';
import { IconButton } from '../../components/IconButton';
import { ChevronUpIcon, ChevronDownIcon } from '../../components/Icons';

type Player = {
  rank: number; name: string; initials: string;
  wins: number; debates: number; streak: number;
  entry: LeaderboardEntry;
};

function toPlayer(entry: LeaderboardEntry): Player {
  const name = entry.user.first_name || entry.user.username;
  return {
    rank: entry.rank,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    wins: entry.wins,
    debates: entry.total_debates,
    streak: entry.streak,
    entry,
  };
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PODIUM_GAP = 4;
const DEPTH = 14;
const COL_WIDTH = (SCREEN_W - 2 * SCREEN_PADDING - 2 * PODIUM_GAP) / 3;
const FRONT_W = COL_WIDTH - DEPTH;
const SHEET_HEIGHT = SCREEN_H * 0.50;

type BlockColors = {
  top: string; front: string; side: string; edge: string;
  numeralFill: string; numeralStroke: string;
};

// #1 gets the topic accent; #2/#3 stay neutral dark so the winner pops.
const NEUTRAL_HUE = '#8B93A9'; // colors.textMuted — cool gray over dark bg

const BLOCK_ALPHA: Record<1 | 2 | 3, {
  top: string; front: string; side: string; edge: string;
  numFill: string; numStroke: string;
}> = {
  1: { top: '4D', front: '2E', side: '1A', edge: '70', numFill: '24', numStroke: '52' },
  2: { top: '1F', front: '12', side: '0A', edge: '33', numFill: '0E', numStroke: '24' },
  3: { top: '14', front: '0C', side: '08', edge: '24', numFill: '0A', numStroke: '1C' },
};

function getBlockColors(accent: string, position: 1 | 2 | 3): BlockColors {
  const hue = position === 1 ? accent : NEUTRAL_HUE;
  const a = BLOCK_ALPHA[position];
  return {
    top: hue + a.top,
    front: hue + a.front,
    side: hue + a.side,
    edge: hue + a.edge,
    numeralFill: hue + a.numFill,
    numeralStroke: hue + a.numStroke,
  };
}

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
        <Text style={[styles.avatarInitials, { fontSize: isFirst ? 18 : 13 }]}>{initials}</Text>
      </View>
    </View>
  );
}

function Block3D({ height, position, label, accent }: { height: number; position: 1 | 2 | 3; label: string; accent: string }) {
  const c = getBlockColors(accent, position);
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

function PodiumColumn({ player, position, accent, onPress }: { player: Player; position: 1 | 2 | 3; accent: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.podiumCol} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.podiumAvatarSlot}>
        <Avatar initials={player.initials} size={AVATAR_S[position]} isFirst={position === 1} />
      </View>
      <Block3D height={STEP_H[position]} position={position} label={String(position)} accent={accent} />
    </TouchableOpacity>
  );
}

function Podium({ players, accent, onPressPlayer }: { players: Player[]; accent: string; onPressPlayer: (player: Player) => void }) {
  if (players.length === 0) {
    return (
      <View style={styles.podiumEmpty}>
        <Text style={styles.podiumEmptyText}>No players in this topic yet.</Text>
      </View>
    );
  }

  const order: { player: Player; position: 1 | 2 | 3 }[] = [];
  if (players.length >= 2) order.push({ player: players[1], position: 2 });
  order.push({ player: players[0], position: 1 });
  if (players.length >= 3) order.push({ player: players[2], position: 3 });

  return (
    <View>
      <View style={styles.podiumRow}>
        {order.map(o => (
          <PodiumColumn
            key={o.position}
            player={o.player}
            position={o.position}
            accent={accent}
            onPress={() => onPressPlayer(o.player)}
          />
        ))}
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

const ACCENT = colors.lime;

export default function LadderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'allTime'>('weekly');
  const [isExpanded, setIsExpanded] = useState(false);

  const apiTimeframe: Timeframe = timeFrame === 'weekly' ? 'weekly' : 'all_time';
  const { data: leaderboard } = useLeaderboard(apiTimeframe);

  const goToPlayerProfile = (player: Player) =>
    navigation.navigate('UserProfile', { userId: player.entry.user.id, initialProfile: player.entry });

  const players: Player[] = (leaderboard ?? []).map(toPlayer);
  const topThree = players.slice(0, 3);
  const restOfList = players.slice(3);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const lastY = useRef(SHEET_HEIGHT);
  const currentSheetY = useRef(SHEET_HEIGHT);

  const toggleExpand = () => {
    const targetY = isExpanded ? SHEET_HEIGHT : SCREEN_H * 0.3;
    lastY.current = targetY;
    Animated.spring(sheetY, {
      toValue: targetY,
      useNativeDriver: false,
      bounciness: 8,
      speed: 12,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        const next = lastY.current + g.dy;
        const min = SCREEN_H * 0.3;
        const max = SHEET_HEIGHT;
        if (next >= min && next <= max) {
          sheetY.setValue(next);
        }
      },
      onPanResponderRelease: (_, g) => {
        const next = lastY.current + g.dy;
        const threshold = (SHEET_HEIGHT - SCREEN_H * 0.3) / 2;
        lastY.current = next < SHEET_HEIGHT - threshold ? SCREEN_H * 0.3 : SHEET_HEIGHT;
        Animated.spring(sheetY, {
          toValue: lastY.current,
          useNativeDriver: false,
          bounciness: 8,
          speed: 12,
        }).start();
      },
    })
  ).current;

  sheetY.addListener(({ value }) => {
    currentSheetY.current = value;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.timeToggle}>
          {(['weekly', 'allTime'] as const).map(tf => (
            <TouchableOpacity
              key={tf}
              style={[styles.timeBtn, timeFrame === tf && styles.timeBtnActive]}
              onPress={() => setTimeFrame(tf)}
              activeOpacity={0.8}
            >
              <Text style={[styles.timeBtnText, timeFrame === tf && styles.timeBtnTextActive]}>
                {tf === 'weekly' ? 'Weekly' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.podiumSection}>
        <Podium players={topThree} accent={ACCENT} onPressPlayer={goToPlayerProfile} />
      </View>

      <Animated.View style={[styles.sheet, { top: sheetY }]}>
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <IconButton
            icon={
              isExpanded
                ? <ChevronDownIcon color={colors.textMuted} />
                : <ChevronUpIcon color={colors.textMuted} />
            }
            onPress={toggleExpand}
            size="sm"
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            lastY.current = currentSheetY.current;
          }}
        >
          <Text style={styles.sectionTitle}>Full standings</Text>

          {restOfList.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>Only the podium so far. More to come.</Text>
            </View>
          ) : (
            restOfList.map((p, i) => (
              <RankListRow
                key={p.rank}
                leftLabel={p.rank}
                initials={p.initials}
                name={p.name}
                metaText={`${p.wins} wins`}
                accent={ACCENT}
                isLast={i === restOfList.length - 1}
                onPress={() => goToPlayerProfile(p)}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.sm, paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTitle: { fontFamily: fonts.jakarta.semiBold, fontSize: 16, color: colors.text, flex: 1 },

  timeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  timeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeBtnActive: {
    backgroundColor: colors.borderStrong,
  },
  timeBtnText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  timeBtnTextActive: {
    color: colors.text,
  },

  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { backgroundColor: '#1C2535', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontFamily: fonts.display.bold, color: colors.text, letterSpacing: 0.5 },

  podiumCol: { width: COL_WIDTH, alignItems: 'center' },
  podiumAvatarSlot: { marginBottom: 6, zIndex: 2 },
  podiumRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING, gap: PODIUM_GAP,
  },
  podiumNameRow: {
    flexDirection: 'row', paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.md,
    gap: PODIUM_GAP, justifyContent: 'center',
  },
  podiumNameCol: { width: COL_WIDTH, alignItems: 'center', gap: 3 },
  podiumName: { fontFamily: fonts.jakarta.semiBold, fontSize: 13, color: colors.text },
  podiumWins: { fontFamily: fonts.display.bold, fontSize: 10, color: colors.textSubtle, letterSpacing: 1.5 },
  podiumEmpty: { height: 280, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SCREEN_PADDING },
  podiumEmptyText: { fontFamily: fonts.jakarta.regular, fontSize: 13, color: colors.textSubtle, textAlign: 'center' },

  podiumSection: { paddingTop: spacing.xl },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#0F1420',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandleArea: {
    paddingTop: 12, paddingBottom: 8, paddingHorizontal: SCREEN_PADDING,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },

  sectionTitle: {
    fontFamily: fonts.jakarta.semiBold, fontSize: 12, color: colors.textSubtle,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: spacing.sm, marginTop: spacing.xs,
  },
  emptyList: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyListText: { fontFamily: fonts.jakarta.regular, fontSize: 13, color: colors.textSubtle },
});
