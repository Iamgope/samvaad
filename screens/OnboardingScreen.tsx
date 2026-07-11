import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { spacing } from '../constants/spacing';
import { SteelTicketButton } from '../components/Button';
import { OrbitingIcons } from '../components/OrbitingIcons';
import { PageHeading } from '../components/PageHeading';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={s.illusArea}>
        <OrbitingIcons centerImage={require('../assets/onboarding_meditation.png')} />
      </View>

      <View style={s.copyArea}>
        <PageHeading
          lines={[
            [{ text: 'Ideas deserve' }],
            [ { text: 'more', accent: 'lime' }, {text:' than'}],
            [{ text: ' a comment' }],
            [{ text: 'section.', accent: 'purple', squiggle: true }],
          ]}
        />
      </View>

      <View style={s.footer}>
        <SteelTicketButton
          label="Get Started"
          onPress={() => navigation.replace('Login')}
          style={s.ctaWrap}
        />
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  illusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  copyArea: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  ctaWrap: { width: '100%' },
});
