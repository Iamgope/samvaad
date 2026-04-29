import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { text } from '../constants/typography';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { PageHeading } from '../components/PageHeading';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const N = 6;
const RESEND_SECONDS = 28;

export default function OTPScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(N).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const refs = useRef<(TextInput | null)[]>([]);
  const isComplete = otp.every(d => d !== '');

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleChange = (raw: string, i: number) => {
    if (raw.length > 1) {
      const cleaned = raw.replace(/\D/g, '').split('').slice(0, N - i);
      const next = [...otp];
      cleaned.forEach((d, j) => { next[i + j] = d; });
      setOtp(next);
      refs.current[Math.min(i + cleaned.length, N - 1)]?.focus();
      return;
    }
    const next = [...otp];
    next[i] = raw.replace(/\D/g, '');
    setOtp(next);
    if (raw && i < N - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (key: string, i: number) => {
    if (key === 'Backspace' && !otp[i] && i > 0) {
      const next = [...otp];
      next[i - 1] = '';
      setOtp(next);
      refs.current[i - 1]?.focus();
    }
  };

  const fmt = (n: number) => `00:${n.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.kav}
      >
        <View style={s.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={16}
            style={s.backBtn}
          >
            <Text variant="titleLg">{'←'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          <PageHeading
            lines={[
              [{ text: 'Enter the' }],
              [{ text: 'code', accent: 'lime' }],
            ]}
          />
          <Text style={s.subhead}>
            We've sent a 6-digit code{'\n'}to{' '}
            <Text style={s.subheadAccent}>{phone}</Text>
          </Text>

          <View style={s.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { refs.current[i] = r; }}
                style={[s.otpBox, digit ? s.otpFilled : null]}
                value={digit}
                onChangeText={t => handleChange(t, i)}
                onKeyPress={({ nativeEvent: { key } }) => handleKey(key, i)}
                keyboardType="number-pad"
                maxLength={N}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          <Text variant="bodyMd" tone="subtle" style={s.resend}>
            {seconds > 0 ? (
              <>Resend code in <Text variant="bodyMd" tone="accent">{fmt(seconds)}</Text></>
            ) : (
              <Text variant="bodyMd" tone="accent" onPress={() => setSeconds(RESEND_SECONDS)}>
                Resend code
              </Text>
            )}
          </Text>
        </View>

        <View style={s.footer}>
          <Button
            label="Verify"
            onPress={() => navigation.replace('OnboardingFlow')}
            shadowColor={colors.lime}
            disabled={!isComplete}
            arrow
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  kav: { flex: 1 },

  topRow: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  content: { flex: 1, paddingHorizontal: HORIZONTAL, paddingTop: spacing.xl },
  subhead: {
    fontFamily: fonts.serif.italic,
    fontSize: 22,
    lineHeight: 30,
    color: colors.textMuted,
    letterSpacing: -0.3,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  subheadAccent: {
    fontFamily: fonts.serif.italic,
    color: colors.lime,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpBox: {
    ...text.numericLg,
    width: 48,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    color: colors.text,
  },
  otpFilled: {
    borderColor: colors.lime,
    backgroundColor: 'rgba(202,255,51,0.06)',
  },

  resend: { textAlign: 'center' },

  footer: { paddingHorizontal: HORIZONTAL, paddingBottom: spacing.lg },
});
