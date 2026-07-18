import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { GoogleLogo } from '../components/GoogleLogo';
import { signInWithGoogle, ApiError, registerDeviceAsync } from '../services/api';

GoogleSignin.configure({
  webClientId: '377669594538-g1cdo3e8uk3lfcrgdqden8s9mnipkm11.apps.googleusercontent.com',
});

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      if (result.type !== 'success') return;

      const idToken = result.data.idToken;
      if (!idToken) {
        setError('No ID token returned from Google. Please try again.');
        return;
      }

      const res = await signInWithGoogle(idToken);
      registerDeviceAsync();
      if (res.is_new_user) {
        navigation.navigate('OnboardingFlow', { suggestedUsername: res.username });
      } else {
        navigation.navigate('Main');
      }
    } catch (err: any) {
      console.log('[GOOGLE] sign-in error =', { code: err?.code, message: err?.message, raw: err });
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err?.code === statusCodes.IN_PROGRESS) return;
      if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available on this device.');
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err?.code || err?.message) {
        setError(`Google sign-in failed: ${err?.code ?? ''} ${err?.message ?? ''}`.trim());
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={s.heroArea}>
        <Image
          source={require('../assets/login_mascot.png')}
          style={s.heroImage}
          resizeMode="contain"
        />
      </View>

      <View style={s.brand}>
        <Text style={s.welcomeText}>Welcome to</Text>
        <View style={s.logoRow}>
          <Image
            source={require('../assets/adaptive-icon.png')}
            style={s.logoIcon}
            resizeMode="contain"
          />
          <Text style={s.wordmark}>Duella</Text>
        </View>
      </View>

      <View style={s.footer}>
        {/* <Button
          variant="pillBrand"
          label="Sign in with Phone"
          onPress={() => navigation.navigate('Phone')}
          shadowColor={colors.lime}
          disabled={loading}
        /> */}

        <Button
          variant="pillBrand"
          label="Sign in with Google"
          onPress={handleGoogleSignIn}
          shadowColor={colors.lime}
          leadingIcon={<GoogleLogo size={18} />}
          isLoading={loading}
          disabled={loading}
        />

        {error && (
          <Text variant="caption" tone="danger" style={s.errorText}>
            {error}
          </Text>
        )}

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
  heroImage: { width: '80%', height: '80%' },

  brand: {
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.xl,
    gap: 6,
  },
  welcomeText: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 18,
    color: colors.textMuted,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 80,
    height: 80,
  },
  wordmark: {
    fontFamily: fonts.display.black,
    fontSize: 40,
    lineHeight: 46,
    color: colors.text,
    letterSpacing: -1.6,
  },

  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  terms: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  termsLink: {
    color: colors.lime,
    fontFamily: fonts.jakarta.semiBold,
  },
});
