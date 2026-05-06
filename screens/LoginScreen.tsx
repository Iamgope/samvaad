import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { GoogleLogo } from '../components/GoogleLogo';
import { signInWithGoogle, ApiError } from '../services/api';

// Required so the OAuth browser tab closes cleanly after redirect
WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [_request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '',
    androidClientId: '',
    webClientId: '',
  });

  useEffect(() => {
    if (response?.type === 'error') {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      setError('No ID token returned from Google. Please try again.');
      return;
    }

    handleGoogleToken(idToken);
  }, [response]);

  async function handleGoogleToken(idToken: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle(idToken);
      navigation.navigate(res.is_new_user ? 'OnboardingFlow' : 'Main');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
        <Button
          label="Sign in with Phone"
          onPress={() => navigation.navigate('Phone')}
          shadowColor={colors.lime}
          disabled={loading}
        />

        <Button
          label="Sign in with Google"
          onPress={() => { setError(null); promptAsync(); }}
          shadowColor={colors.purple2}
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
  errorText: {
    textAlign: 'center',
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
