import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { spacing, SCREEN_PADDING } from '../constants/spacing';
import { Text } from '../components/Text';
import { IconButton } from '../components/IconButton';
import { ChevronLeftIcon } from '../components/Icons';

export default function LearnScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <IconButton
          size="md"
          icon={<ChevronLeftIcon size={18} color={colors.text} />}
          onPress={() => navigation.goBack()}
          accent={colors.text}
        />
        <Text variant="titleLg">Study Room</Text>
        <View style={{ width: 36 }} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
  },
});
