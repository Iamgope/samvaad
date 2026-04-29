import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { GoogleLogo } from '../components/GoogleLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={s.heroArea}>
        <Image
          source={require('../assets/login.png')}
          style={s.heroImage}
          resizeMode="contain"
        />
      </View>

      <View style={s.brand}>
        <Text style={s.wordmark}>samvaad</Text>
        <Text style={s.tagline}>
          Make <Text style={s.taglineAccent}>better</Text> arguments.
        </Text>
      </View>

      <View style={s.footer}>
        {/* Primary: lime shadow */}
        <Button
          label="Sign in with Phone"
          onPress={() => navigation.navigate('Phone')}
          shadowColor={colors.lime}
        />

        {/* Secondary: purple shadow to distinguish from primary */}
        <Button
          label="Sign in with Google"
          onPress={() => navigation.navigate('OnboardingFlow')}
          shadowColor={colors.purple2}
          leadingIcon={<GoogleLogo size={18} />}
        />

        <Text variant="caption" tone="subtle" style={s.terms}>
          By continuing, you agree to our{'\n'}
          <Text style={s.termsLink}>Terms of Use</Text>
          <Text>{' and '}</Text>
          <Text style={s.termsLink}>Privacy Policy.</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },

  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.lg,
  },
  heroImage: { width: '100%', height: '100%' },

  brand: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.xl,
    gap: 6,
  },
  wordmark: {
    fontFamily: fonts.display.black,
    fontSize: 40,
    lineHeight: 46,
    color: colors.text,
    letterSpacing: -1.6,
  },
  tagline: {
    fontFamily: fonts.serif.italic,
    fontSize: 22,
    lineHeight: 30,
    color: colors.textMuted,
    letterSpacing: -0.3,
  },
  taglineAccent: {
    fontFamily: fonts.serif.italic,
    color: colors.lime,
  },

  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  terms: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  termsLink: {
    color: colors.purple2,
    fontFamily: fonts.jakarta.semiBold,
  },
});
