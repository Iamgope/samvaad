import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { spacing } from '../constants/spacing';
import { Text } from './Text';

export type ChipOption = { id: string; label: string; emoji: string; accent?: string };

interface ChipDropdownProps<T extends ChipOption> {
  selected: T;
  options: T[];
  onSelect: (o: T) => void;
  accent: string;
  zIndex?: number;
  menuAlign?: 'left' | 'right';
}

export function ChipDropdown<T extends ChipOption>({
  selected,
  options,
  onSelect,
  accent,
  zIndex,
  menuAlign = 'right',
}: ChipDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[s.wrap, { zIndex: open ? 50 : (zIndex ?? 1) }]}>
      <TouchableOpacity
        style={[s.chip, open && { borderColor: accent, backgroundColor: accent + '14' }]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={s.emoji}>{selected.emoji}</Text>
        <Text style={[s.label, open && { color: accent }]}>{selected.label}</Text>
        <Svg width={10} height={10} viewBox="0 0 10 10" fill="none" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Path d="M2 3.5l3 3 3-3" stroke={open ? accent : colors.textSubtle} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      {open && (
        <View style={[s.menu, menuAlign === 'left' ? { left: 0, right: undefined } : { right: 0 }]}>
          {options.map((o, i) => {
            const active = o.id === selected.id;
            const itemAccent = o.accent ?? accent;
            return (
              <TouchableOpacity
                key={o.id}
                style={[s.option, i < options.length - 1 && s.optionDivider]}
                onPress={() => { onSelect(o); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={s.optionEmoji}>{o.emoji}</Text>
                <Text style={[s.optionLabel, active && { color: itemAccent }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'relative' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },
  emoji: { fontSize: 14 },
  label: { fontFamily: fonts.jakarta.semiBold, fontSize: 13, color: colors.text },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 150,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  optionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  optionEmoji: { fontSize: 15 },
  optionLabel: { fontFamily: fonts.jakarta.medium, fontSize: 14, color: colors.textMuted },
});
