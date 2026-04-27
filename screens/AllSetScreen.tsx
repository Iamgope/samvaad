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
import { spacing } from '../constants/spacing';
import { Text } from '../components/Text';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AllSet'>;
};

export default function AllSetScreen({ navigation }: Props) {
  const ctaScale = useRef(new Animated.Value(1)).current;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={s.headerArea}>
        <Text variant="displayLg" style={s.center}>You’re in.</Text>
        <Text variant="displayHero" tone="accent" style={s.center}>
          Let the debates begin.
        </Text>
      </View>

      <View style={s.heroArea}>
        <Image
          source={require('../assets/allset.png')}
          style={s.heroImage}
          resizeMode="contain"
        />
      </View>

      <View style={s.footer}>
        <Pressable
          onPress={() => navigation.replace('Home')}
          onPressIn={() =>
            Animated.timing(ctaScale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start()
          }
          onPressOut={() =>
            Animated.timing(ctaScale, { toValue: 1, duration: 80, useNativeDriver: true }).start()
          }
        >
          <Animated.View style={[s.cta, { transform: [{ scale: ctaScale }] }]}>
            <Text variant="labelLg" tone="inverse">Explore Arena  →</Text>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL = 24;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },

  headerArea: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: spacing.xxl + spacing.md,
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },

  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL,
    marginTop: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  footer: { paddingHorizontal: HORIZONTAL, paddingBottom: spacing.lg },
  cta: {
    backgroundColor: colors.lime,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
