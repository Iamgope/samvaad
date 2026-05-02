import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.inner}>

        <Text style={s.wordmark}>samvaad</Text>

        <View style={s.center}>
          <View style={s.chip}>
            <Text variant="overline" tone="inverse">YOU'RE IN</Text>
          </View>
          <Text style={s.headline}>Welcome{'\n'}aboard.</Text>
          <Text variant="bodyLg" style={s.sub}>
            This is the placeholder home screen.{'\n'}Real discussions start here.
          </Text>
        </View>

        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.7}
        >
          <Text variant="labelMd" style={s.logoutText}>Log out</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.purple },
  inner: { flex: 1, paddingHorizontal: 28, paddingBottom: 40 },

  wordmark: {
    marginTop: 28,
    fontFamily: fonts.display.extraBold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
  },

  center: { flex: 1, justifyContent: 'center' },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lime,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing.xl,
  },
  headline: {
    fontFamily: fonts.display.black,
    fontSize: 52,
    lineHeight: 58,
    color: colors.text,
    letterSpacing: -1.8,
    marginBottom: spacing.lg,
  },
  sub: {
    color: 'rgba(237,238,243,0.60)',
  },

  logoutBtn: { alignSelf: 'flex-start' },
  logoutText: {
    color: 'rgba(237,238,243,0.55)',
  },
});
