import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const C = {
  bg: '#5B4EE8',
  green: '#B5FF00',
  white: '#FFFFFF',
  black: '#0A0A0A',
  w12: 'rgba(255,255,255,0.12)',
  w20: 'rgba(255,255,255,0.20)',
  w30: 'rgba(255,255,255,0.30)',
  w60: 'rgba(255,255,255,0.60)',
  w80: 'rgba(255,255,255,0.80)',
};

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const canContinue = phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <View style={styles.inner}>

          {/* Wordmark */}
          <Text style={styles.wordmark}>samvaad</Text>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.headline}>Talk.{'\n'}Debate.{'\n'}Grow.</Text>
            <Text style={styles.sub}>Where ideas collide and minds evolve.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Google */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.88}
            >
              <Text style={styles.googleWordmark}>
                <Text style={{ color: '#4285F4' }}>G</Text>
                <Text style={{ color: '#EA4335' }}>o</Text>
                <Text style={{ color: '#FBBC05' }}>o</Text>
                <Text style={{ color: '#4285F4' }}>g</Text>
                <Text style={{ color: '#34A853' }}>l</Text>
                <Text style={{ color: '#EA4335' }}>e</Text>
              </Text>
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or</Text>
              <View style={styles.divLine} />
            </View>

            {/* Phone */}
            <View style={styles.phoneWrap}>
              <Text style={styles.dialCode}>+1</Text>
              <View style={styles.dialSep} />
              <TextInput
                style={styles.phoneInput}
                placeholder="(000) 000-0000"
                placeholderTextColor={C.w30}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.cta, !canContinue && styles.ctaOff]}
              onPress={() => canContinue && navigation.navigate('OTP', { phone })}
              activeOpacity={canContinue ? 0.88 : 1}
            >
              <Text style={[styles.ctaText, !canContinue && styles.ctaTextOff]}>
                Let's Go →
              </Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' '}&{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28 },

  wordmark: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 8,
  },
  headline: {
    fontSize: 54,
    fontWeight: '900',
    color: C.white,
    lineHeight: 58,
    letterSpacing: -2,
    marginBottom: 18,
  },
  sub: {
    fontSize: 16,
    color: C.w80,
    lineHeight: 24,
    fontWeight: '400',
  },

  form: { paddingBottom: 40 },

  googleBtn: {
    backgroundColor: C.white,
    borderRadius: 16,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  googleWordmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  googleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.black,
  },

  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  divLine: { flex: 1, height: 1, backgroundColor: C.w20 },
  divText: { fontSize: 14, fontWeight: '600', color: C.w60 },

  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.w12,
    borderRadius: 16,
    height: 58,
    borderWidth: 1.5,
    borderColor: C.w30,
    marginBottom: 14,
    overflow: 'hidden',
  },
  dialCode: {
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
  },
  dialSep: { width: 1, height: 26, backgroundColor: C.w30 },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: C.white,
    height: '100%',
  },

  cta: {
    backgroundColor: C.green,
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaOff: { backgroundColor: 'rgba(181,255,0,0.18)' },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: C.black,
    letterSpacing: 0.3,
  },
  ctaTextOff: { color: 'rgba(181,255,0,0.35)' },

  terms: {
    fontSize: 12,
    color: C.w60,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: C.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
