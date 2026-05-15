import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon } from '../components/Icons';
import { TrophyTile } from '../components/profile/TrophyCase';
import type { RootStackParamList } from '../App';

const COLUMNS = 3;

export default function AllTrophiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { badges } = useRoute<RouteProp<RootStackParamList, 'AllTrophies'>>().params;

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Trophies</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text variant="bodySm" tone="subtle" style={s.summary}>
          {earned.length} of {badges.length} earned
        </Text>

        {earned.length > 0 && (
          <Section title="Earned">
            <Grid>
              {earned.map(b => (
                <View key={b.key} style={s.cell}>
                  <TrophyTile badge={b} />
                </View>
              ))}
            </Grid>
          </Section>
        )}

        {locked.length > 0 && (
          <Section title="Locked">
            <Grid>
              {locked.map(b => (
                <View key={b.key} style={s.cell}>
                  <TrophyTile badge={b} />
                </View>
              ))}
            </Grid>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text variant="titleSm" style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <View style={s.grid}>{children}</View>;
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
  summary: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xl,
  },
  cell: {
    width: `${100 / COLUMNS}%`,
  },
});
