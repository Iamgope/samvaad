import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const C = {
  bg: '#5B4EE8',
  green: '#B5FF00',
  white: '#FFFFFF',
  black: '#0A0A0A',
  w60: 'rgba(255,255,255,0.60)',
  w20: 'rgba(255,255,255,0.20)',
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>

        <Text style={styles.wordmark}>samvaad</Text>

        <View style={styles.center}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>YOU'RE IN</Text>
          </View>
          <Text style={styles.headline}>Welcome{'\n'}aboard.</Text>
          <Text style={styles.sub}>
            This is the placeholder home screen.{'\n'}Real discussions start here.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, paddingHorizontal: 28, paddingBottom: 40 },

  wordmark: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
  },

  center: { flex: 1, justifyContent: 'center' },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: C.green,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '900',
    color: C.black,
    letterSpacing: 1.5,
  },
  headline: {
    fontSize: 56,
    fontWeight: '900',
    color: C.white,
    lineHeight: 60,
    letterSpacing: -2,
    marginBottom: 18,
  },
  sub: {
    fontSize: 15,
    color: C.w60,
    lineHeight: 24,
  },

  logoutBtn: { alignSelf: 'flex-start' },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.w60,
  },
});
