import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does the rating work?',
    a: 'Your rating moves up or down after each debate based on the format, the result, and the rating of your opponent. Bigger wins against stronger opponents move you faster.',
  },
  {
    q: 'What if my opponent leaves mid-debate?',
    a: 'Forfeits count as a win for you and have no effect on your rating loss column.',
  },
  {
    q: 'Can I change my username?',
    a: 'Yes — from Edit profile. Usernames are unique, so the one you pick has to be free.',
  },
  {
    q: 'How do I report someone?',
    a: 'Long-press a message in any debate to report it. Reports go straight to the moderation team.',
  },
];

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  const emailSupport = () => {
    Linking.openURL('mailto:support@samvaad.app?subject=Samvaad%20help');
  };

  const confirmSuspend = () => {
    Alert.alert(
      'Suspend account',
      'This hides your profile and pauses matchmaking. You can reactivate by logging in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Suspend', style: 'destructive' },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Request account deletion',
      'This sends a deletion request to support. Your account stays active until reviewed (up to 14 days).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', style: 'destructive' },
      ],
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Help & support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text variant="titleSm" style={s.sectionTitle}>FAQs</Text>
        {FAQS.map((item) => (
          <View key={item.q} style={s.faq}>
            <Text variant="bodyMd" style={s.faqQ}>{item.q}</Text>
            <Text variant="bodyMd" tone="muted">{item.a}</Text>
          </View>
        ))}

        <Text variant="titleSm" style={[s.sectionTitle, s.sectionGap]}>Contact</Text>
        <Row label="Email support" onPress={emailSupport} />

        <Text variant="titleSm" style={[s.sectionTitle, s.sectionGap]}>Account</Text>
        <Row label="Suspend account" danger onPress={confirmSuspend} />
        <Row label="Request account deletion" danger onPress={confirmDelete} last />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label, danger, onPress, last,
}: { label: string; danger?: boolean; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[s.row, !last && s.rowDivider]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <Text variant="bodyMd" tone={danger ? 'danger' : 'default'}>{label}</Text>
      <ChevronRightIcon size={14} color={danger ? colors.red : colors.textFaint} />
    </TouchableOpacity>
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
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionGap: {
    marginTop: spacing.xl,
  },
  faq: {
    marginBottom: spacing.lg,
  },
  faqQ: {
    marginBottom: 4,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
});
