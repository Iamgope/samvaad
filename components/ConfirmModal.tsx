import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fonts } from '../constants/fonts';
import { Text } from './Text';
import { Button } from './Button';

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

          {/* The safe choice gets the app's primary CTA treatment; the destructive
              choice is deliberately understated so it isn't the easiest thing to tap. */}
          <Button variant="steel" label={cancelLabel} onPress={onCancel} size="md" style={s.stayBtn} />
          <Pressable onPress={onConfirm} hitSlop={8} style={s.confirmBtn}>
            <Text style={[s.confirmLabel, !danger && s.confirmLabelSafe]}>{confirmLabel}</Text>
          </Pressable>
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
  eyebrow: {
    fontFamily: fonts.jakarta.bold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.red,
    marginBottom: 2,
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
  stayBtn: {
    marginTop: spacing.xs,
  },
  confirmBtn: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
    color: colors.red,
  },
  confirmLabelSafe: {
    color: colors.lime,
  },
});
