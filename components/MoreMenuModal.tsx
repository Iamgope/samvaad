import React from 'react';
import { Modal, View, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fonts } from '../constants/fonts';
import { Text } from './Text';
import { ChevronRightIcon } from './Icons';

export type MoreMenuAction = {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
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
          {actions.map((a, i) => {
            const tone = a.danger ? colors.red : colors.text;
            return (
              <TouchableOpacity
                key={a.key}
                style={[s.row, i !== actions.length - 1 && s.rowDivider]}
                activeOpacity={0.6}
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
              >
                {a.icon ? <View style={s.icon}>{a.icon}</View> : null}
                <View style={s.body}>
                  <Text style={[s.label, { color: tone }]}>{a.label}</Text>
                  {a.description ? (
                    <Text style={s.desc}>{a.description}</Text>
                  ) : null}
                </View>
                <ChevronRightIcon size={14} color={a.danger ? colors.red : colors.textFaint} />
              </TouchableOpacity>
            );
          })}
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
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  icon: {
    width: 22,
    alignItems: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  desc: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
