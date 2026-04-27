import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';
import { GoogleLogo } from '../components/GoogleLogo';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const phoneScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;

  const press = (val: Animated.Value, to: number) =>
    Animated.timing(val, { toValue: to, duration: 80, useNativeDriver: true }).start();

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

      <View style={s.headerArea}>
        <Text variant="displayLg">Enter the</Text>
        <Text variant="displayHero" tone="accent">Arena</Text>
      </View>

      <View style={s.footer}>
        <Pressable
          onPress={() => navigation.navigate('Phone')}
          onPressIn={() => press(phoneScale, 0.97)}
          onPressOut={() => press(phoneScale, 1)}
        >
          <Animated.View style={[s.btnPrimary, { transform: [{ scale: phoneScale }] }]}>
            <Text variant="labelLg" tone="inverse">Sign in with Phone</Text>
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('ChooseArenas')}
          onPressIn={() => press(googleScale, 0.97)}
          onPressOut={() => press(googleScale, 1)}
        >
          <Animated.View style={[s.btnSecondary, { transform: [{ scale: googleScale }] }]}>
            <GoogleLogo size={18} />
            <Text variant="labelLg" tone="inverse">Sign in with Google</Text>
          </Animated.View>
        </Pressable>

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

  headerArea: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.xl,
     gap: -6,
  },

  footer: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  btnPrimary: {
    backgroundColor: colors.lime,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnSecondary: {
    backgroundColor: colors.text,
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
