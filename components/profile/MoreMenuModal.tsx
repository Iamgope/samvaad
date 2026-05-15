import React from 'react';
import { Modal, View, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { Text } from '../Text';
import { ChevronRightIcon } from '../Icons';

export type MoreMenuAction = {
  key: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
};

export function MoreMenuModal({
  visible,
  actions,
  onClose,
}: {
  visible: boolean;
  actions: MoreMenuAction[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        <SafeAreaView edges={['bottom']}>
          <View style={s.handle} />
          {actions.map((a, i) => (
            <TouchableOpacity
              key={a.key}
              style={[s.row, i !== actions.length - 1 && s.rowDivider]}
              activeOpacity={0.6}
              onPress={() => {
                onClose();
                a.onPress();
              }}
            >
              <Text variant="bodyMd" tone={a.danger ? 'danger' : 'default'}>{a.label}</Text>
              <ChevronRightIcon size={14} color={a.danger ? colors.red : colors.textFaint} />
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
});
