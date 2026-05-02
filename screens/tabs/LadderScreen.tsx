import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { Text } from '../../components/Text';

export default function LadderScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Text style={s.label}>Ladder</Text>
        <Text variant="bodyMd" tone="subtle">Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: {
    fontFamily: 'Archivo_800ExtraBold',
    fontSize: 32,
    color: colors.text,
    letterSpacing: -1,
  },
});
