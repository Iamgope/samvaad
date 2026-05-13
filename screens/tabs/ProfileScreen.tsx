import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, Pattern, Rect, Line } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { Text } from '../../components/Text';
import { ChipDropdown } from '../../components/ChipDropdown';
import { DebateHeadline } from '../../components/DebateHeadline';
import { TOPICS, TopicId } from '../../constants/topics';

// ─── TYPES ─────────────────────────────────────────────────────────

type FormatKey = 'stronger' | 'counter' | 'clash';
type TopicKey  = 'all' | 'politics' | 'sports' | 'culture';

type BreakdownRow = { key: string; label: string; wins: number; total: number };

type Match = {
  id: string;
  motion: string;
  opponentName: string;
  opponentInit: string;
  format: FormatKey;
  topic: TopicKey;
  outcome: 'win' | 'loss';
  agoLabel: string;
};

type TrophyIcon = 'hexMedal' | 'boltShield' | 'compassStar' | 'laurel' | 'gem' | 'monolith';

type Badge = {
  key: string;
  label: string;
  earned: boolean;
  iconKey: TrophyIcon;
  earnedOn?: string;
};

type ProfileData = {
  isOwn: boolean;
  name: string;
  handle: string;
  initials: string;
  bio: string | null;
  joinedLabel: string;
  rating: number;
  wins: number;
  debates: number;
  streak: number;
  bestStreak: number;
  byTopic: BreakdownRow[];
  byFormat: BreakdownRow[];
  matches: Match[];
  badges: Badge[];
};

// ─── TIER SYSTEM ───────────────────────────────────────────────────

type Tier = { key: string; label: string; min: number; max: number };

const TIERS: Tier[] = [
  { key: 'novice',  label: 'Novice',  min: 0,    max: 1200 },
  { key: 'skilled', label: 'Skilled', min: 1200, max: 1500 },
  { key: 'expert',  label: 'Expert',  min: 1500, max: 1800 },
  { key: 'master',  label: 'Master',  min: 1800, max: 9999 },
];

function getTierInfo(rating: number) {
  const idx = TIERS.findIndex(t => rating < t.max);
  const current = idx === -1 ? TIERS[TIERS.length - 1] : TIERS[idx];
  const next    = TIERS[TIERS.indexOf(current) + 1] ?? null;
  const inBand   = rating - current.min;
  const bandSize = current.max - current.min;
  const progress = next ? Math.min(1, inBand / bandSize) : 1;
  const toNext   = next ? Math.max(0, next.min - rating) : 0;
  return { current, next, progress, toNext };
}

// ─── MOCK DATA ─────────────────────────────────────────────────────

const MOCK_PROFILE: ProfileData = {
  isOwn:       true,
  name:        'Aman Gope',
  handle:      '@aman',
  initials:    'AG',
  bio:         'Reading more than I write. Trying to argue better.',
  joinedLabel: 'Joined May 2026',
  rating:      1647,
  wins:        94,
  debates:     142,
  streak:      6,
  bestStreak:  12,
  byTopic: [
    { key: 'all',      label: 'All topics', wins: 94, total: 142 },
    { key: 'politics', label: 'Politics',   wins: 38, total: 52  },
    { key: 'sports',   label: 'Sports',     wins: 21, total: 38  },
    { key: 'culture',  label: 'Culture',    wins: 35, total: 52  },
  ],
  byFormat: [
    { key: 'stronger', label: 'Stronger Argument', wins: 52, total: 78 },
    { key: 'clash',    label: 'Clash',             wins: 28, total: 45 },
    { key: 'counter',  label: 'Best Counter',      wins: 14, total: 19 },
  ],
  matches: [
    { id: 'm1', motion: 'Should India remove religion-based laws?',     opponentName: 'Zara Khan',    opponentInit: 'ZK', format: 'clash',    topic: 'politics', outcome: 'win',  agoLabel: '2h'  },
    { id: 'm2', motion: 'Should cricket be added to the Olympics?',     opponentName: 'Dev Patel',    opponentInit: 'DP', format: 'stronger', topic: 'sports',   outcome: 'win',  agoLabel: '5h'  },
    { id: 'm3', motion: 'Are translations betraying the originals?',    opponentName: 'Aisha Nair',   opponentInit: 'AN', format: 'counter',  topic: 'culture',  outcome: 'loss', agoLabel: 'Yesterday' },
    { id: 'm4', motion: 'Is judicial review undemocratic by design?',   opponentName: 'Kabir Singh',  opponentInit: 'KS', format: 'stronger', topic: 'politics', outcome: 'win',  agoLabel: '2d'  },
    { id: 'm5', motion: 'Do we glorify violence in cinema too much?',   opponentName: 'Priya Sharma', opponentInit: 'PS', format: 'clash',    topic: 'culture',  outcome: 'win',  agoLabel: '3d'  },
  ],
  badges: [
    { key: 'b1', label: 'First win',     earned: true,  iconKey: 'hexMedal',    earnedOn: 'May 22' },
    { key: 'b2', label: '10-win streak', earned: true,  iconKey: 'boltShield',  earnedOn: 'Jun 08' },
    { key: 'b3', label: '100 debates',   earned: true,  iconKey: 'compassStar', earnedOn: 'Jul 14' },
    { key: 'b4', label: 'Top 10 finish', earned: false, iconKey: 'laurel' },
  ],
};

const TROPHY_GOLD = colors.text;

const FORMAT_LABELS: Record<FormatKey, string> = {
  stronger: 'Stronger',
  clash:    'Clash',
  counter:  'Counter',
};

// ─── ICONS ─────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, React.ReactNode> = {
  back: <Path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.8} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  share: <Path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />,
  edit:  <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />,
  chevronRight: <Path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
  // ── Trophy icons — geometric, distinctive, monochrome ─────────
  // Hexagonal medal with an inscribed 5-point star
  hexMedal: (
    <>
      <Path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" fill="none" />
      <Path d="M12 7.5 L13.4 11 H17 L14.1 13.2 L15.2 16.6 L12 14.6 L8.8 16.6 L9.9 13.2 L7 11 H10.6 Z" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" fill="none" />
    </>
  ),
  // Pointed crest shield with a lightning bolt inside
  boltShield: (
    <>
      <Path d="M12 2 L4 5 V12 C4 17 7.5 20.5 12 22 C16.5 20.5 20 17 20 12 V5 Z" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" fill="none" />
      <Path d="M13.4 7 L9 14 H12 L10.6 18 L15 11 H12 Z" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" fill="none" />
    </>
  ),
  // 8-point compass star
  compassStar: (
    <Path
      d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
      stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" fill="none"
    />
  ),
  // Laurel wreath with a center ribbon
  laurel: (
    <>
      <Path d="M7 4 C3 8 3 14 7 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M17 4 C21 8 21 14 17 20" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M5 7 L8 8 M4 11 L7.5 11.5 M5 15 L8 14.5 M19 7 L16 8 M20 11 L16.5 11.5 M19 15 L16 14.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M9 18 L12 22 L15 18" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" fill="none" />
    </>
  ),
  // Faceted diamond
  gem: (
    <Path
      d="M5 9 L8 4 H16 L19 9 L12 21 Z M5 9 H19 M8 4 L12 9 L16 4 M9.5 9 L12 21 L14.5 9"
      stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" fill="none"
    />
  ),
  // Stacked monolith / podium
  monolith: (
    <>
      <Path d="M8 6 H16 V22 H8 Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" fill="none" />
      <Path d="M8 6 L10 2 H14 L16 6" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" fill="none" />
      <Path d="M9.5 11 H14.5 M9.5 15 H14.5" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),
  // Compact chip icons
  flame: <Path d="M12 3 c1 3 3 4 3 7 a3 3 0 11-6 0 c0-1.5 1-2.5 1.5-3 -.5-.7 -.5-2 1.5-4 zm0 9 a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  bolt: <Path d="M13 3 L5 13 H11 L9 21 L17 11 H11 Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" fill="none" />,
  chat: <Path d="M21 12 a8 8 0 11-3.5-6.5 L21 4 V8 H17 M17 8 a7 7 0 10.5 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  lock: <Path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
};

function Icon({ name, size = 20, color = colors.text }: { name: string; size?: number; color?: string }) {
  // react-native-svg doesn't honor `currentColor`; resolve manually by cloning with the stroke/fill.
  const node = ICON_PATHS[name];
  if (!node) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {React.Children.map(node, (child: any, i) =>
        React.cloneElement(child, {
          key: i,
          stroke: child.props.stroke === 'currentColor' ? color : child.props.stroke,
          fill:   child.props.fill   === 'currentColor' ? color : child.props.fill,
        })
      )}
    </Svg>
  );
}

// ─── HERO (cover band + centered square avatar + tier pill) ──────

const AVATAR_SIZE = 96;
const COVER_HEIGHT = 168;

// Subtle decorative pattern for the cover: faint diagonal hatching with
// a single concentric ring on the right for asymmetric weight.
function CoverPattern() {
  const lines: React.ReactNode[] = [];
  const step = 10;
  for (let x = -COVER_HEIGHT; x <= 420; x += step) {
    lines.push(
      <Line
        key={x}
        x1={x}
        y1={0}
        x2={x + COVER_HEIGHT}
        y2={COVER_HEIGHT}
        stroke="rgba(255,255,255,0.035)"
        strokeWidth={1}
      />
    );
  }
  return (
    <Svg width="100%" height={COVER_HEIGHT} style={StyleSheet.absoluteFill}>
      {lines}
      {/* Concentric rings — right side accent */}
      <Circle cx="88%" cy={COVER_HEIGHT / 2} r={40} stroke="rgba(255,255,255,0.06)" strokeWidth={1} fill="none" />
      <Circle cx="88%" cy={COVER_HEIGHT / 2} r={26} stroke="rgba(255,255,255,0.05)" strokeWidth={1} fill="none" />
      <Circle cx="88%" cy={COVER_HEIGHT / 2} r={12} stroke="rgba(255,255,255,0.08)" strokeWidth={1} fill="none" />
      {/* Tiny dot — small left-side accent */}
      <Circle cx="14%" cy={26} r={2} fill="rgba(255,255,255,0.18)" />
    </Svg>
  );
}

function ProfileHero({
  profile,
}: { profile: ProfileData }) {
  const { current } = getTierInfo(profile.rating);

  return (
    <View style={hero.wrap}>
      {/* Cover band with decorative pattern + centered square avatar */}
      <View style={hero.coverWrap}>
        <View style={hero.cover}>
          <CoverPattern />
        </View>
        <View style={hero.avatarSlot}>
          <View style={hero.avatar}>
            <Text variant="displayMd" style={{ letterSpacing: 0.5 }}>
              {profile.initials.charAt(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Identity */}
      <View style={hero.identity}>
        <Text variant="titleLg">{profile.name}</Text>
        <Text variant="bodySm" tone="subtle">
          {profile.handle} · {profile.joinedLabel}
        </Text>

        <View style={hero.tierPill}>
          <Icon name="hexMedal" size={13} color={colors.text} />
          <Text variant="labelSm">{current.label}</Text>
        </View>

        {profile.bio && (
          <Text variant="bodySm" tone="muted" style={hero.bio}>{profile.bio}</Text>
        )}
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  wrap: {
    paddingHorizontal: SCREEN_PADDING,
  },
  coverWrap: {
    marginTop: spacing.md,
    marginBottom: AVATAR_SIZE / 2 + spacing.sm,
  },
  cover: {
    height: COVER_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  avatarSlot: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: -AVATAR_SIZE / 2,
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  identity: {
    alignItems: 'center',
    gap: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: spacing.sm,
  },
  bio: {
    textAlign: 'center',
    marginTop: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
});

// ─── STAT ROW (4-up Strava-style, no card chrome) ─────────────────

function StatRow({ profile }: { profile: ProfileData }) {
  const winRate = profile.debates === 0 ? 0 : Math.round((profile.wins / profile.debates) * 100);
  const items: { label: string; value: string }[] = [
    { label: 'Debates', value: String(profile.debates) },
    { label: 'Wins',    value: String(profile.wins) },
    { label: 'Streak',  value: profile.streak > 0 ? String(profile.streak) : '—' },
    { label: 'Win %',   value: String(winRate) },
  ];
  return (
    <View style={sr.row}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <StatItem label={it.label} value={it.value} />
          {i < items.length - 1 && <View style={sr.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={sr.item}>
      <Text variant="titleLg">{value}</Text>
      <Text variant="labelSm" tone="subtle">{label}</Text>
    </View>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});

// ─── ACTION BUTTONS (Share QR + Edit, lime-outlined pills) ────────

function ActionButtons({ onEdit, onShare }: { onEdit: () => void; onShare: () => void }) {
  return (
    <View style={ab.row}>
      <TouchableOpacity style={ab.btn} activeOpacity={0.75} onPress={onShare}>
        <Icon name="share" size={14} color={colors.text} />
        <Text variant="labelMd">Share profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ab.btn} activeOpacity={0.75} onPress={onEdit}>
        <Icon name="edit" size={14} color={colors.text} />
        <Text variant="labelMd">Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const ab = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
  },
  // Pill button with the project's neo-brutalist anatomy: thin top/side border,
  // thick bottom border, hard offset shadow below — the "from-below" weight.
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: 'rgba(255,255,255,0.22)',
    borderBottomColor: 'rgba(255,255,255,0.40)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 4,
  },
});

// ─── TROPHY CASE (4-up grid, no horizontal scroll) ────────────────

function TrophyCase({ badges, onSeeAll }: { badges: Badge[]; onSeeAll: () => void }) {
  const earned = badges.filter(b => b.earned);
  const visible = badges.slice(0, 4); // first 4 to fill the row

  return (
    <View>
      <View style={ts.head}>
        <View>
          <Text variant="titleLg">Trophy Case</Text>
          <Text variant="caption" tone="subtle">{earned.length} earned · {badges.length - earned.length} to go</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text variant="labelSm" tone="muted">{badges.length}</Text>
        </TouchableOpacity>
      </View>
      <View style={ts.grid}>
        {visible.map(b => <TrophyTile key={b.key} badge={b} />)}
      </View>
      <TouchableOpacity style={ts.allBtn} onPress={onSeeAll} activeOpacity={0.6}>
        <Text variant="bodyMd">All trophies</Text>
        <Icon name="chevronRight" size={14} color={colors.textFaint} />
      </TouchableOpacity>
    </View>
  );
}

function TrophyTile({ badge }: { badge: Badge }) {
  const accent = badge.earned ? TROPHY_GOLD : colors.textFaint;
  return (
    <View style={ts.tile}>
      <View style={[ts.iconHex, {
        backgroundColor: badge.earned ? accent + '18' : 'rgba(255,255,255,0.04)',
        borderColor:     badge.earned ? accent + '66' : 'rgba(255,255,255,0.10)',
      }]}>
        <Icon name={badge.earned ? badge.iconKey : 'lock'} size={26} color={accent} />
      </View>
      <Text variant="labelSm" tone={badge.earned ? 'default' : 'faint'} numberOfLines={2} style={ts.tileLabel}>
        {badge.label}
      </Text>
      {badge.earned && badge.earnedOn && (
        <Text variant="caption" tone="subtle">{badge.earnedOn}</Text>
      )}
    </View>
  );
}

const ts = StyleSheet.create({
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
    width: 64, height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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

// ─── DEBATE HISTORY ───────────────────────────────────────────────

function DebateHistory({ matches, isOwn }: { matches: Match[]; isOwn: boolean }) {
  const [topic, setTopic] = useState<TopicId>('all');
  const currentTopic = TOPICS.find(t => t.id === topic) ?? TOPICS[0];

  if (matches.length === 0) {
    return (
      <View style={dh.wrap}>
        <Text variant="titleSm" style={dh.title}>Recent debates</Text>
        <View style={dh.empty}>
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
    <View style={dh.wrap}>
      <View style={dh.titleRow}>
        <Text variant="titleSm">Recent debates</Text>
        <View style={dh.filterSlot}>
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
        <View style={dh.empty}>
          <Text variant="bodySm" tone="subtle">No debates in {currentTopic.label.toLowerCase()}.</Text>
        </View>
      ) : (
        filtered.map((m, i) => {
          const isWin = m.outcome === 'win';
          const t = TOPICS.find(t => t.id === m.topic) ?? TOPICS[0];
          return (
            <View
              key={m.id}
              style={i !== filtered.length - 1 ? dh.rowDivider : undefined}
            >
              <DebateHeadline
                motion={m.motion}
                context={`${FORMAT_LABELS[m.format]} · ${m.agoLabel}`}
                categoryName={t.label}
                categoryAccent={colors.textMuted}
                headlineSize={15}
                footer={
                  <View style={[dh.outcome, isWin ? dh.outcomeWin : dh.outcomeLoss]}>
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

const dh = StyleSheet.create({
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
  outcomeWin:  {
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

// ─── SETTINGS ─────────────────────────────────────────────────────

function SettingsRow({
  label, danger, onPress, last,
}: { label: string; danger?: boolean; onPress?: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[set.row, !last && set.rowDivider]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <Text variant="bodyMd" tone={danger ? 'danger' : 'default'}>{label}</Text>
      <Icon name="chevronRight" size={14} color={danger ? colors.red : colors.textFaint} />
    </TouchableOpacity>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={set.group}>{children}</View>;
}

const set = StyleSheet.create({
  group: {
    marginHorizontal: SCREEN_PADDING,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
});

// ─── SECTION SPACING ──────────────────────────────────────────────

function Section({ children, gap = spacing.xl }: { children: React.ReactNode; gap?: number }) {
  return <View style={{ marginTop: gap }}>{children}</View>;
}

// ─── SCREEN ───────────────────────────────────────────────────────

export default function ProfileScreen({
  profile = MOCK_PROFILE,
}: { profile?: ProfileData }) {
  const confirmDelete = () => {
    Alert.alert(
      'Request account deletion',
      'This sends a request to support. Your account stays active until reviewed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', style: 'destructive' },
      ],
    );
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={screen.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screen.scroll}>
        <ProfileHero profile={profile} />

        <Section gap={spacing.md}>
          <StatRow profile={profile} />
        </Section>

        {profile.isOwn && (
          <Section gap={spacing.md}>
            <ActionButtons onEdit={() => {}} onShare={() => {}} />
          </Section>
        )}

        <Section>
          <TrophyCase badges={profile.badges} onSeeAll={() => {}} />
        </Section>

        <Section>
          <DebateHistory matches={profile.matches} isOwn={profile.isOwn} />
        </Section>

        {profile.isOwn && (
          <Section>
            <Text variant="titleSm" style={screen.sectionTitle}>Account</Text>
            <SettingsGroup>
              <SettingsRow label="Privacy policy" />
              <SettingsRow label="Help & support" />
              <SettingsRow label="Log out" danger onPress={confirmLogout} />
              <SettingsRow label="Request account deletion" danger onPress={confirmDelete} last />
            </SettingsGroup>
          </Section>
        )}

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const screen = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  scroll: { paddingBottom: spacing.xl },
  sectionTitle: {
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.sm,
  },
});
