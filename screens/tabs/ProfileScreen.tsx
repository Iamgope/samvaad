import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors } from '../../constants/colors';
import { spacing, SCREEN_PADDING } from '../../constants/spacing';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import {
  ChevronRightIcon, CoinIcon, EditIcon, ShareIcon, StarIcon,
} from '../../components/Icons';
import { TIERS, TIER_COLOR, getTierInfo } from '../../constants/tiers';
import { pickSquareImage } from '../../utils/imagePicker';
import { ShareCard, shareProfileCard } from '../../components/profile/ShareCard';
import { TrophyCase, type Badge } from '../../components/profile/TrophyCase';
import { DebateHistory, type Match } from '../../components/profile/DebateHistory';

const DEFAULT_AVATAR = require('../../assets/defaultprofilepic.png');

// ─── TYPES ─────────────────────────────────────────────────────────

type ProfileData = {
  isOwn: boolean;
  name: string;
  handle: string;
  initials: string;
  avatarUri?: string | null;
  bio: string | null;
  rating: number;
  wins: number;
  debates: number;
  streak: number;
  matches: Match[];
  badges: Badge[];
};

// ─── MOCK DATA ─────────────────────────────────────────────────────

const MOCK_PROFILE: ProfileData = {
  isOwn:    true,
  name:     'Aman Gope',
  handle:   '@aman',
  initials: 'AG',
  bio:      'Reading more than I write. Trying to argue better.',
  rating:   1647,
  wins:     94,
  debates:  142,
  streak:   6,
  matches: [
    { id: 'm1', motion: 'Should India remove religion-based laws?',     opponentName: 'Zara Khan',    opponentInit: 'ZK', format: 'clash',    topic: 'politics', outcome: 'win',  agoLabel: '2h'  },
    { id: 'm2', motion: 'Should cricket be added to the Olympics?',     opponentName: 'Dev Patel',    opponentInit: 'DP', format: 'stronger', topic: 'sports',   outcome: 'win',  agoLabel: '5h'  },
    { id: 'm3', motion: 'Are translations betraying the originals?',    opponentName: 'Aisha Nair',   opponentInit: 'AN', format: 'counter',  topic: 'culture',  outcome: 'loss', agoLabel: 'Yesterday' },
    { id: 'm4', motion: 'Is judicial review undemocratic by design?',   opponentName: 'Kabir Singh',  opponentInit: 'KS', format: 'stronger', topic: 'politics', outcome: 'win',  agoLabel: '2d'  },
    { id: 'm5', motion: 'Do we glorify violence in cinema too much?',   opponentName: 'Priya Sharma', opponentInit: 'PS', format: 'clash',    topic: 'culture',  outcome: 'win',  agoLabel: '3d'  },
  ],
  badges: [
    { key: 'b1', label: 'First debate',    earned: true,  image: require('../../assets/badges/FirstDebateBadge.png'), earnedOn: 'May 22' },
    { key: 'b2', label: '10 debates',      earned: true,  image: require('../../assets/badges/TenDebateBadge.png'),   earnedOn: 'Jun 08' },
    { key: 'b3', label: '3 debates a day', earned: true,  image: require('../../assets/badges/ThreeDebateADay.png'),  earnedOn: 'Jul 14' },
    { key: 'b4', label: 'Top 10 finish',   earned: false },
  ],
};

// ─── HERO ─────────────────────────────────────────────────────────

function ProfileHero({
  profile,
  avatarUri,
  onPickAvatar,
}: {
  profile: ProfileData;
  avatarUri: string | null;
  onPickAvatar: () => void;
}) {
  const { current } = getTierInfo(profile.rating);
  const tierColor = TIER_COLOR[current.key] ?? colors.text;
  const tierIdx = Math.max(0, TIERS.findIndex(t => t.key === current.key));
  const topAlpha = ['40', '55', '70', '8C'][tierIdx];
  const avatarSource = avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR;

  return (
    <View style={hero.root}>
      <LinearGradient
        pointerEvents="none"
        colors={[tierColor + topAlpha, colors.black + '00']}
        style={hero.gradient}
      />

      <View style={hero.content}>
        <View style={hero.heroRow}>
          <View style={hero.avatarWrap}>
            <View style={hero.avatarShadow} />
            <TouchableOpacity
              style={[hero.avatar, { borderColor: tierColor }]}
              onPress={profile.isOwn ? onPickAvatar : undefined}
              activeOpacity={profile.isOwn ? 0.85 : 1}
              disabled={!profile.isOwn}
            >
              <Image source={avatarSource} style={hero.avatarImage} resizeMode="cover" />
            </TouchableOpacity>
            {profile.isOwn && (
              <TouchableOpacity style={hero.avatarEdit} onPress={onPickAvatar} activeOpacity={0.8}>
                <EditIcon size={12} color={colors.black} />
              </TouchableOpacity>
            )}
          </View>

          <View style={hero.identityLeft}>
            <Text variant="titleLg">{profile.name}</Text>
            <Text variant="bodySm" tone="muted" style={{ marginTop: 2 }}>
              {profile.handle}
            </Text>
            {profile.bio && (
              <Text
                variant="bodySm"
                style={{ marginTop: 6, fontSize: 12, lineHeight: 16 }}
                numberOfLines={3}
              >
                {profile.bio}
              </Text>
            )}
          </View>
        </View>

        <View style={hero.statPillRow}>
          <View style={[hero.statChip, hero.statChipNeutral]}>
            <Text style={[hero.tierName, { color: tierColor }]}>
              {current.label.toUpperCase()}
            </Text>
          </View>
          <View style={[hero.statChip, hero.statChipNeutral]}>
            <StarIcon size={12} color={tierColor} />
            <Text style={[hero.statChipLabel, { color: colors.text }]}>
              {profile.rating}
            </Text>
          </View>
          <View style={[hero.statChip, hero.statChipNeutral]}>
            <CoinIcon size={13} color={colors.gold} />
            <Text style={[hero.statChipLabel, { color: colors.lime }]}>250</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  root: { position: 'relative' },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.xxxl,
  },
  tierName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  identityLeft: { flex: 1 },
  avatarWrap: {
    width: 92 + 4,
    height: 92 + 4,
  },
  avatarShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: colors.black,
  },
  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEdit: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.text,
    borderWidth: 1.5,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statChipNeutral: {
    backgroundColor: colors.text + '14',
    borderColor: colors.text + '40',
    borderBottomColor: colors.text + '88',
  },
  statChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

// ─── STAT ROW ─────────────────────────────────────────────────────

function StatRow({ profile }: { profile: ProfileData }) {
  const winRate = profile.debates === 0 ? 0 : Math.round((profile.wins / profile.debates) * 100);
  const items = [
    { label: 'Debates', value: String(profile.debates) },
    { label: 'Wins',    value: String(profile.wins) },
    { label: 'Streak',  value: profile.streak > 0 ? String(profile.streak) : '—' },
    { label: 'Win %',   value: String(winRate) },
  ];
  return (
    <View style={sr.row}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <View style={sr.item}>
            <Text variant="titleLg">{it.value}</Text>
            <Text variant="labelSm" tone="subtle">{it.label}</Text>
          </View>
          {i < items.length - 1 && <View style={sr.divider} />}
        </React.Fragment>
      ))}
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
  item: { flex: 1, alignItems: 'center', gap: 2 },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});

// ─── ACTION BUTTONS ───────────────────────────────────────────────

function ActionButtons({ onEdit, onShare }: { onEdit: () => void; onShare: () => void }) {
  return (
    <View style={ab.row}>
      <Button
        variant="pillBrand"
        label="Share profile"
        onPress={onShare}
        shadowColor={colors.limeMuted}
        leadingIcon={<ShareIcon size={14} color={colors.black} />}
        style={ab.btn}
      />
      <Button
        variant="pillBrand"
        label="Edit"
        onPress={onEdit}
        shadowColor={colors.purple}
        leadingIcon={<EditIcon size={14} color={colors.black} />}
        style={ab.btn}
      />
    </View>
  );
}

const ab = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
  },
  btn: { flex: 1 },
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
      <ChevronRightIcon size={14} color={danger ? colors.red : colors.textFaint} />
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
  profile: initialProfile = MOCK_PROFILE,
}: { profile?: ProfileData }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialProfile.avatarUri ?? null);
  const shareCardRef = useRef<View>(null);

  const goToEdit = () => {
    navigation.navigate('EditProfile', {
      initial: {
        name: profile.name,
        handle: profile.handle,
        bio: profile.bio,
        avatarUri,
      },
      onSave: (next) => {
        setProfile(p => ({ ...p, name: next.name, handle: next.handle, bio: next.bio }));
        setAvatarUri(next.avatarUri);
      },
    });
  };

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

  const handlePickAvatar = async () => {
    const uri = await pickSquareImage();
    if (uri) setAvatarUri(uri);
  };

  const handleShareProfile = () => shareProfileCard(shareCardRef, profile.name);

  return (
    <SafeAreaView style={screen.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screen.scroll}>
        <ProfileHero profile={profile} avatarUri={avatarUri} onPickAvatar={handlePickAvatar} />

        <Section gap={spacing.xl}>
          <StatRow profile={profile} />
        </Section>

        {profile.isOwn && (
          <Section gap={spacing.md}>
            <ActionButtons onEdit={goToEdit} onShare={handleShareProfile} />
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

      <View style={screen.shareCapture} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          name={profile.name}
          handle={profile.handle}
          rating={profile.rating}
          avatarUri={avatarUri}
        />
      </View>
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
  shareCapture: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },
});
