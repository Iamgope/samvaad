import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
import { mediaUrl, type LeaderboardEntry } from '../services/api';

function toProfileData(entry: LeaderboardEntry): ProfileData {
  const { first_name, last_name, username } = entry.user;
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
    bio: entry.bio,
    rating: entry.elo_rating,
    xp: entry.xp ?? 0,
    wins: entry.wins,
    debates: entry.total_debates,
    streak: entry.streak,
    matches: [],
    badges: [],
  };
}

export default function UserProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile: entry } = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>().params;
  const profile = toProfileData(entry);
  const avatarUri = mediaUrl(entry.profile_pic) ?? null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg" numberOfLines={1} style={s.headerTitle}>{profile.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <ProfileHero profile={profile} avatarUri={avatarUri} />

        <View style={{ marginTop: spacing.xl }}>
          <StatRow profile={profile} />
        </View>
      </ScrollView>
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
});
