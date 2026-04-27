import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  Text,
} from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

// Neo-brutalist anatomy: white surface · 2px border · offset shadow that
// collapses on press for tactile depth feedback.
const SHADOW_OFFSET = 4;
const BORDER_WIDTH = 2;
const RADIUS = 6;

const HEIGHTS = { lg: 56, md: 48, sm: 40 };

type Size = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Offset shadow color. Defaults to muted lime. */
  shadowColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
  /** Fixed → arrow on the right. */
  arrow?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  size?: Size;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  shadowColor = colors.limeMuted,
  disabled = false,
  isLoading = false,
  arrow = false,
  leadingIcon,
  trailingIcon,
  size = 'lg',
  style,
}: ButtonProps) {
  const press = useRef(new Animated.Value(0)).current;

  const sink = () =>
    Animated.spring(press, {
      toValue: SHADOW_OFFSET,
      useNativeDriver: true,
      tension: 600,
      friction: 25,
    }).start();

  const rise = () =>
    Animated.spring(press, {
      toValue: 0,
      useNativeDriver: true,
      tension: 600,
      friction: 25,
    }).start();

  const isInteractable = !disabled && !isLoading;

  const surfaceColor = disabled ? colors.surface2 : colors.text;
  const borderColor  = disabled ? colors.border   : colors.black;
  const textColor    = disabled ? colors.textSubtle : colors.black;
  const activeShadow = disabled ? 'transparent'   : shadowColor;

  return (
    <Pressable
      onPress={isInteractable ? onPress : undefined}
      onPressIn={isInteractable ? sink : undefined}
      onPressOut={isInteractable ? rise : undefined}
      style={[s.wrapper, style]}
    >
      {/* Shadow layer — static, pinned bottom-right */}
      <View style={[s.shadow, { backgroundColor: activeShadow, borderRadius: RADIUS }]} />

      {/* Button surface — translates into shadow on press */}
      <Animated.View
        style={[
          s.btn,
          {
            height: HEIGHTS[size],
            borderRadius: RADIUS,
            borderColor,
            backgroundColor: surfaceColor,
            transform: [{ translateX: press }, { translateY: press }],
          },
        ]}
      >
        {/* → arrow pinned to right edge */}
        {arrow && !isLoading && (
          <View style={s.arrowContainer}>
            <Text style={[s.arrow, { color: textColor }]}>→</Text>
          </View>
        )}

        {/* Centred content */}
        <View style={s.contentGroup}>
          {leadingIcon && <View style={s.iconLeft}>{leadingIcon}</View>}

          <Text style={[s.label, { color: textColor }]}>
            {label}
          </Text>

          {trailingIcon && !isLoading && (
            <View style={s.iconRight}>{trailingIcon}</View>
          )}
          {isLoading && (
            <ActivityIndicator color={textColor} style={s.iconRight} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrapper: {
    paddingRight: SHADOW_OFFSET,
    paddingBottom: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: 0,
    bottom: 0,
  },
  btn: {
    borderWidth: BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconLeft:  { marginRight: 4 },
  iconRight: { marginLeft:  4 },
  label: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  arrowContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  arrow: {
    fontFamily: fonts.display.black,
    fontSize: 18,
  },
});
