import React from 'react';
import { Modal, View, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fonts } from '../constants/fonts';
import { Text } from './Text';

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={s.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.confirmBtn, danger ? s.confirmBtnDanger : s.confirmBtnSafe]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[s.confirmLabel, danger ? s.confirmLabelDanger : s.confirmLabelSafe]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  message: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDanger: {
    backgroundColor: colors.red + '1A',
    borderWidth: 1,
    borderColor: colors.red + '55',
  },
  confirmBtnSafe: {
    backgroundColor: colors.lime + '1A',
    borderWidth: 1,
    borderColor: colors.lime + '55',
  },
  confirmLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
  },
  confirmLabelDanger: {
    color: colors.red,
  },
  confirmLabelSafe: {
    color: colors.lime,
  },
});
