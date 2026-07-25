import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon } from '../components/Icons';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'What we collect',
    body:
      'We collect the information you give us when you create an account — your name, username, email or phone, and anything you add to your profile. We also store your debate history, ratings, and badges so the app works.',
  },
  {
    title: 'How we use it',
    body:
      'Your data powers your matches, your ladder placement, and the public parts of your profile. We do not sell your data, and we do not run third-party advertising inside the app.',
  },
  {
    title: 'What other users see',
    body:
      'Your name, username, avatar, rating, badges, and recent debates are visible to other users. Your email and phone are never shown.',
  },
  {
    title: 'Your controls',
    body:
      'You can edit your profile, change your avatar, or request account deletion at any time from Help & support. Deletion takes up to 14 days and removes your data from active systems.',
  },
  {
    title: 'Contact',
    body: 'Questions? Reach us at support@joinduella.com.',
  },
];

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Privacy policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text variant="bodySm" tone="subtle" style={s.updated}>
          Last updated 16 May 2026
        </Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text variant="titleSm" style={s.sectionTitle}>{sec.title}</Text>
            <Text variant="bodyMd" tone="muted">{sec.body}</Text>
          </View>
        ))}
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
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.xxl,
  },
  updated: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
});
