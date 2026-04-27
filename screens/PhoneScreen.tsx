import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { text } from '../constants/typography';
import { Text } from '../components/Text';
import {
  CountryPickerModal,
  COUNTRIES,
  type Country,
} from '../components/CountryPickerModal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Phone'>;
};

export default function PhoneScreen({ navigation }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const canContinue = phone.replace(/\D/g, '').length >= 7;
  const ctaScale = useRef(new Animated.Value(1)).current;

  const onContinue = () => {
    if (!canContinue) return;
    navigation.navigate('OTP', { phone: `${country.dial} ${phone}` });
  };

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
          <Text variant="displayLg">Enter your</Text>
          <Text>
            <Text variant="displayHero" tone="accent">phone</Text>
            <Text variant="displayLg"> number</Text>
          </Text>
          <Text variant="bodyLg" tone="muted" style={s.subhead}>
            We’ll send you a code to{'\n'}verify your number.
          </Text>

          <View style={s.inputRow}>
            <Pressable
              style={({ pressed }) => [s.dialPill, pressed && s.dialPillPressed]}
              onPress={() => setShowPicker(true)}
              hitSlop={6}
            >
              <Text style={s.flag}>{country.flag}</Text>
              <Text variant="labelLg">{country.dial}</Text>
              <Text variant="bodyMd" tone="subtle" style={s.dialChev}>{'⌄'}</Text>
            </Pressable>
            <View style={s.phoneFieldWrap}>
              <TextInput
                style={s.phoneInput}
                placeholder="Phone number"
                placeholderTextColor={colors.textSubtle}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
                autoFocus
              />
            </View>
          </View>

          <Pressable
            onPress={onContinue}
            onPressIn={() =>
              Animated.timing(ctaScale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.timing(ctaScale, { toValue: 1, duration: 80, useNativeDriver: true }).start()
            }
          >
            <Animated.View
              style={[
                s.cta,
                !canContinue && s.ctaOff,
                { transform: [{ scale: ctaScale }] },
              ]}
            >
              <Text
                variant="labelLg"
                tone="inverse"
                style={!canContinue && s.ctaTextOff}
              >
                Send Code
              </Text>
            </Animated.View>
          </Pressable>
        </View>

        <View style={s.privacyRow}>
          <View style={s.lockDot} />
          <Text variant="caption" tone="subtle" style={s.privacyText}>
            We never share your number. No spam. Ever.
          </Text>
        </View>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={showPicker}
        selected={country}
        onSelect={(c) => {
          setCountry(c);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
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

  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.xl,
  },
  subhead: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialPillPressed: { backgroundColor: colors.surface2 },
  flag: { fontSize: 18 },
  dialChev: { marginLeft: 2 },
  phoneFieldWrap: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  phoneInput: {
    ...text.bodyLg,
    color: colors.text,
  },

  cta: {
    backgroundColor: colors.lime,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaOff: { backgroundColor: 'rgba(202,255,51,0.18)' },
  ctaTextOff: { color: 'rgba(202,255,51,0.45)' },

  privacyRow: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  lockDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSubtle,
  },
  privacyText: {
    textAlign: 'center',
  },
});
