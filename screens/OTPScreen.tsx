import React, { useState, useRef } from 'react';
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
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const C = {
  bg: '#0A0A0A',
  purple: '#5B4EE8',
  green: '#B5FF00',
  white: '#FFFFFF',
  dim: '#555555',
  card: '#141414',
  border: '#242424',
};

const N = 6;

export default function OTPScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(N).fill(''));
  const [hasError, setHasError] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);

  const digits = phone.replace(/\D/g, '');
  const maskedPhone = `+1 ••••••${digits.slice(-4)}`;
  const isComplete = otp.every(d => d !== '');

  const handleChange = (text: string, i: number) => {
    if (text.length > 1) {
      const cleaned = text.replace(/\D/g, '').split('').slice(0, N - i);
      const next = [...otp];
      cleaned.forEach((d, j) => { next[i + j] = d; });
      setOtp(next);
      refs.current[Math.min(i + cleaned.length, N - 1)]?.focus();
      return;
    }
    const next = [...otp];
    next[i] = text.replace(/\D/g, '');
    setOtp(next);
    setHasError(false);
    if (text && i < N - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (key: string, i: number) => {
    if (key === 'Backspace' && !otp[i] && i > 0) {
      const next = [...otp];
      next[i - 1] = '';
      setOtp(next);
      refs.current[i - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (!isComplete) { setHasError(true); return; }
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>STEP 2 OF 2</Text>
          <Text style={styles.headline}>Check your{'\n'}phone.</Text>
          <Text style={styles.sub}>
            We texted a 6-digit code to{'\n'}
            <Text style={styles.phoneNum}>{maskedPhone}</Text>
          </Text>

          {/* OTP Row */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { refs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpFilled : null,
                  hasError ? styles.otpError : null,
                ]}
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

          {hasError && <Text style={styles.errorMsg}>Enter all 6 digits to continue.</Text>}

          <View style={styles.hint}>
            <Text style={styles.hintText}>Demo mode — any 6-digit code works 👍</Text>
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, !isComplete && styles.verifyOff]}
            onPress={handleVerify}
            activeOpacity={0.88}
          >
            <Text style={[styles.verifyText, !isComplete && styles.verifyTextOff]}>
              Verify & Join →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendRow}>
            <Text style={styles.resendText}>
              Didn't receive it?{' '}
              <Text style={styles.resendLink}>Resend code</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BOX = 44;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  kav: { flex: 1 },

  back: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  backText: { fontSize: 15, fontWeight: '700', color: C.dim },

  content: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },

  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: C.purple,
    letterSpacing: 2,
    marginBottom: 16,
  },
  headline: {
    fontSize: 46,
    fontWeight: '900',
    color: C.white,
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  sub: {
    fontSize: 15,
    color: C.dim,
    lineHeight: 24,
    marginBottom: 44,
  },
  phoneNum: {
    color: C.white,
    fontWeight: '700',
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  otpBox: {
    width: BOX,
    height: BOX + 14,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: C.white,
  },
  otpFilled: {
    borderColor: C.purple,
    backgroundColor: 'rgba(91,78,232,0.18)',
  },
  otpError: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255,82,82,0.1)',
  },

  errorMsg: {
    fontSize: 13,
    color: '#FF7070',
    fontWeight: '600',
    marginBottom: 8,
  },

  hint: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  hintText: {
    fontSize: 13,
    color: C.dim,
    fontWeight: '500',
  },

  verifyBtn: {
    backgroundColor: C.green,
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyOff: { backgroundColor: 'rgba(181,255,0,0.12)' },
  verifyText: {
    fontSize: 16,
    fontWeight: '900',
    color: C.bg,
    letterSpacing: 0.3,
  },
  verifyTextOff: { color: 'rgba(181,255,0,0.3)' },

  resendRow: { alignItems: 'center' },
  resendText: { fontSize: 14, color: C.dim, fontWeight: '500' },
  resendLink: {
    color: C.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
