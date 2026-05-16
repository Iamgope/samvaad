import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, RefreshControl,
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
import { IconButton } from '../../components/IconButton';
import {
  CoinIcon, EditIcon, MoreVerticalIcon, ShareIcon, StarIcon,
} from '../../components/Icons';
import { TIERS, TIER_COLOR, getTierInfo } from '../../constants/tiers';
import { pickSquareImage } from '../../utils/imagePicker';
import { ShareCard, shareProfileCard } from '../../components/profile/ShareCard';
import { TrophyCase, type Badge } from '../../components/profile/TrophyCase';
import { DebateHistory, type Match } from '../../components/profile/DebateHistory';
import { MoreMenuModal, type MoreMenuAction } from '../../components/profile/MoreMenuModal';
import { fetchUserProfile, fetchMyDebates, mediaUrl, logout, type UserProfile, type DebateSummary } from '../../services/api';

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
  onOpenMenu,
}: {
  profile: ProfileData;
  avatarUri: string | null;
  onPickAvatar: () => void;
  onOpenMenu?: () => void;
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

      {onOpenMenu && (
        <View style={hero.kebab}>
          <IconButton
            size="md"
            icon={<MoreVerticalIcon size={18} color={colors.text} />}
            onPress={onOpenMenu}
            accent={colors.text}
            transparent
          />
        </View>
      )}

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
  kebab: {
    position: 'absolute',
    top: spacing.md,
    right: SCREEN_PADDING,
    zIndex: 10,
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
    { label: 'Streak',  value: String(profile.streak) },
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

// ─── SECTION SPACING ──────────────────────────────────────────────

function Section({ children, gap = spacing.xl }: { children: React.ReactNode; gap?: number }) {
  return <View style={{ marginTop: gap }}>{children}</View>;
}

// ─── SCREEN ───────────────────────────────────────────────────────

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0 || Number.isNaN(ms)) return 'just now';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function topicKeyFor(name: string): Match['topic'] {
  const n = name.toLowerCase();
  if (n === 'politics') return 'politics';
  if (n === 'sports') return 'sports';
  return 'culture';
}

function mapDebatesToMatches(debates: DebateSummary[], myId: number): Match[] {
  return debates
    .filter(d => d.status === 'COMPLETED')
    .map((d): Match => {
      const meIsPro = d.user_pro.id === myId;
      const opponent = meIsPro ? d.user_con : d.user_pro;
      const outcome: Match['outcome'] = d.winner?.id === myId ? 'win' : 'loss';
      const when = d.completed_at ?? d.started_at;
      return {
        id: String(d.id),
        motion: d.topic.title,
        opponentName: opponent.username,
        opponentInit: opponent.username.slice(0, 2).toUpperCase(),
        format: 'clash',
        topic: topicKeyFor(d.topic.category.name),
        outcome,
        agoLabel: formatAgo(when),
      };
    });
}

function mergeApiProfile(base: ProfileData, api: UserProfile): ProfileData {
  const { first_name, last_name, username } = api.user;
  const fullName = [first_name, last_name].filter(Boolean).join(' ').trim();
  const initials = [first_name, last_name]
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
  return {
    ...base,
    name: fullName || base.name,
    handle: username ? `@${username}` : base.handle,
    initials: initials || base.initials,
    bio: api.bio,
    rating: api.elo_rating,
    debates: api.total_debates,
    wins: api.wins,
    streak: api.streak,
  };
}

export default function ProfileScreen({
  profile: initialProfile = MOCK_PROFILE,
}: { profile?: ProfileData }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialProfile.avatarUri ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shareCardRef = useRef<View>(null);

  const loadProfile = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [apiProfile, apiDebates] = await Promise.all([
        fetchUserProfile(),
        fetchMyDebates(),
      ]);
      const matches = mapDebatesToMatches(apiDebates, apiProfile.user.id);
      setProfile(p => ({ ...mergeApiProfile(p, apiProfile), matches }));
      setAvatarUri(mediaUrl(apiProfile.profile_pic));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile');
    } finally {
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile('initial');
  }, [loadProfile]);

  const onRefresh = useCallback(() => {
    void loadProfile('refresh');
  }, [loadProfile]);

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

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            // tokens are cleared in logout()'s finally; ignore network errors
          }
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handlePickAvatar = async () => {
    const uri = await pickSquareImage();
    if (uri) setAvatarUri(uri);
  };

  const handleShareProfile = () => shareProfileCard(shareCardRef, profile.name);

  const menuActions: MoreMenuAction[] = [
    { key: 'privacy', label: 'Privacy policy', onPress: () => navigation.navigate('PrivacyPolicy') },
    { key: 'help',    label: 'Help & support', onPress: () => navigation.navigate('HelpSupport') },
    { key: 'logout',  label: 'Log out',        danger: true, onPress: confirmLogout },
  ];

  if (loading) {
    return (
      <SafeAreaView style={screen.safe} edges={['top']}>
        <View style={screen.centered}>
          <ActivityIndicator color={colors.lime} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={screen.safe} edges={['top']}>
        <View style={screen.centered}>
          <Text variant="bodyMd" tone="danger" style={screen.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadProfile('initial')} style={screen.retryBtn} activeOpacity={0.8}>
            <Text variant="labelMd" style={{ color: colors.lime }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screen.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screen.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lime}
            colors={[colors.lime]}
          />
        }
      >
        <ProfileHero
          profile={profile}
          avatarUri={avatarUri}
          onPickAvatar={handlePickAvatar}
          onOpenMenu={profile.isOwn ? () => setMenuOpen(true) : undefined}
        />

        <Section gap={spacing.xl}>
          <StatRow profile={profile} />
        </Section>

        {profile.isOwn && (
          <Section gap={spacing.md}>
            <ActionButtons onEdit={goToEdit} onShare={handleShareProfile} />
          </Section>
        )}

        <Section>
          <TrophyCase
            badges={profile.badges}
            onSeeAll={() => navigation.navigate('AllTrophies', { badges: profile.badges })}
          />
        </Section>

        <Section>
          <DebateHistory matches={profile.matches} isOwn={profile.isOwn} />
        </Section>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>

      <MoreMenuModal
        visible={menuOpen}
        actions={menuActions}
        onClose={() => setMenuOpen(false)}
      />

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
  shareCapture: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lime,
  },
});
