import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../constants/colors';

type Size = 'sm' | 'md' | 'lg';

const DIMENSIONS: Record<Size, number> = { sm: 28, md: 36, lg: 44 };

export type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  size?: Size;
  accent?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  accent = colors.textSubtle,
  disabled = false,
  style,
}: IconButtonProps) {
  const dim = DIMENSIONS[size];

  return (
    <View
      style={[
        s.outer,
        {
          width: dim,
          height: dim,
          borderColor: accent + '55',
          borderBottomColor: accent + 'AA',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.8}
        style={[s.face, { backgroundColor: accent + '22' }]}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4,
  },
  face: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
