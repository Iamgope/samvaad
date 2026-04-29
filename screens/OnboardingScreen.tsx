import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { OrbitingIcons } from '../components/OrbitingIcons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

function Squiggle({ width, color }: { width: number; color: string }) {
  return (
    <Svg width={width} height={10} viewBox="0 0 120 10">
      <Path
        d="M2 6 Q12 1 22 6 T42 6 T62 6 T82 6 T102 6 T118 6"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={s.illusArea}>
        <OrbitingIcons centerImage={require('../assets/onboarding_meditation.png')} />
      </View>

      <View style={s.copyArea}>
        <Text style={s.head}>Your Ideas</Text>
        <Text style={s.head}>
          deserve <Text style={s.headLime}>more</Text>
        </Text>
        <Text style={s.head}>than a comment</Text>
        <View style={s.sectionWrap}>
          <Text style={[s.head, s.headPurple]}>section.</Text>
          <Squiggle width={130} color={colors.purple2} />
        </View>
      </View>

      <View style={s.footer}>
        <Button
          label="Get Started"
          onPress={() => navigation.replace('Login')}
          arrow
          shadowColor={colors.textSubtle}
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
  head: {
    fontFamily: fonts.display.extraBold,
    fontSize: 38,
    lineHeight: 44,
    color: colors.text,
    letterSpacing: -1.4,
  },
  headLime: {
    color: colors.lime,
    fontFamily: fonts.display.black,
  },
  headPurple: {
    color: colors.purple2,
    fontFamily: fonts.display.black,
  },
  sectionWrap: {
    alignSelf: 'flex-start',
  },
  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  ctaWrap: { width: '100%' },
});
