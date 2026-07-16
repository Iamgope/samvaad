import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon } from '../components/Icons';
import { ProfileHero, StatRow, type ProfileData } from './tabs/ProfileScreen';
import { mediaUrl, type UserProfile } from '../services/api';
import { useUserProfileById } from '../hooks/useQueries';

function toProfileData(api: UserProfile): ProfileData {
  const { first_name, last_name, username } = api.user;
  const fullName = [first_name, last_name].filter(Boolean).join(' ').trim();
  const initials = [first_name, last_name]
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
  return {
    isOwn: false,
    name: fullName || username,
    handle: `@${username}`,
    initials: initials || username.slice(0, 2).toUpperCase(),
    bio: api.bio,
    rating: api.elo_rating,
    xp: api.xp ?? 0,
    wins: api.wins,
    debates: api.total_debates,
    streak: api.streak,
    matches: [],
    badges: [],
  };
}

export default function UserProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId, initialProfile } = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>().params;
  const { data: apiProfile, isLoading, error, refetch } = useUserProfileById(userId, initialProfile);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg" numberOfLines={1} style={s.headerTitle}>
          {apiProfile ? toProfileData(apiProfile).name : 'Profile'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!apiProfile && isLoading && (
        <View style={s.centered}>
          <ActivityIndicator color={colors.lime} />
        </View>
      )}

      {!apiProfile && !isLoading && error && (
        <View style={s.centered}>
          <Text variant="bodyMd" tone="danger" style={s.errorText}>
            {(error as Error).message ?? 'Could not load profile'}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={s.retryBtn} activeOpacity={0.8}>
            <Text variant="labelMd" style={{ color: colors.lime }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {apiProfile && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <ProfileHero profile={toProfileData(apiProfile)} avatarUri={mediaUrl(apiProfile.profile_pic) ?? null} />

          <View style={{ marginTop: spacing.xl }}>
            <StatRow profile={toProfileData(apiProfile)} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
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
