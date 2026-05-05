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

// Neo-brutalist anatomy: surface · 2px border · offset shadow that collapses
// on press. No angled corners — the shadow-color system already carries
// hierarchy; shape variation would be redundant signal.
const SHADOW_OFFSET = 4;
const BORDER_WIDTH = 2;
const RADIUS = 6;

const HEIGHTS = { lg: 56, md: 48, sm: 40 };
const CHIP_SIZE = { lg: 36, md: 32, sm: 28 };

type Size = 'lg' | 'md' | 'sm';
export type ButtonVariant = 'primary' | 'action' | 'outline' | 'ghost' | 'text';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Visual treatment. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /**
   * Inverts the surface to shadowColor with black text. Use sparingly —
   * reserved for the single highest-stakes action in a screen (e.g. COUNTER).
   */
  filled?: boolean;
  /** Offset shadow / accent color. Applies to primary, action, text. */
  shadowColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
  /** Trailing arrow → at the right edge (or inline for text variant). */
  arrow?: boolean;
  /**
   * Leading icon. On 'action' it sits inside a tinted chip;
   * on other variants it sits inline next to the label.
   */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  size?: Size;
  style?: ViewStyle;
};

type Tokens = {
  surface: string;
  border: string;
  text: string;
  shadow: string;
  hasShadow: boolean;
  hasBorder: boolean;
};

function tokensFor(
  variant: ButtonVariant,
  filled: boolean,
  disabled: boolean,
  shadowColor: string,
): Tokens {
  if (disabled) {
    return {
      surface: variant === 'outline' || variant === 'text' ? 'transparent' : colors.surface2,
      border:  variant === 'text' ? 'transparent' : colors.border,
      text:    colors.textSubtle,
      shadow:  'transparent',
      hasShadow: false,
      hasBorder: variant !== 'text',
    };
  }

  switch (variant) {
    case 'primary':
    case 'action':
      return filled
        ? {
            surface: shadowColor,
            border:  colors.black,
            text:    colors.black,
            // When filled, the offset shadow becomes solid black —
            // reads as a stamped, weighted move.
            shadow:  colors.black,
            hasShadow: true,
            hasBorder: true,
          }
        : {
            surface: colors.text,
            border:  colors.black,
            text:    colors.black,
            shadow:  shadowColor,
            hasShadow: true,
            hasBorder: true,
          };
    case 'outline':
      return {
        surface: 'transparent',
        border:  colors.text,
        text:    colors.text,
        shadow:  'transparent',
        hasShadow: false,
        hasBorder: true,
      };
    case 'ghost':
      return {
        surface: colors.surface2,
        border:  colors.border,
        text:    colors.textMuted,
        shadow:  'transparent',
        hasShadow: false,
        hasBorder: true,
      };
    case 'text':
      return {
        surface: 'transparent',
        border:  'transparent',
        text:    colors.text,
        shadow:  'transparent',
        hasShadow: false,
        hasBorder: false,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  filled = false,
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
  const fade  = useRef(new Animated.Value(1)).current;

  const v = tokensFor(variant, filled, disabled, shadowColor);
  const isInteractable = !disabled && !isLoading;

  const sink = () => {
    if (v.hasShadow) {
      Animated.spring(press, {
        toValue: SHADOW_OFFSET,
        useNativeDriver: true,
        tension: 600,
        friction: 25,
      }).start();
    } else {
      Animated.timing(fade, {
        toValue: 0.6,
        duration: 80,
        useNativeDriver: true,
      }).start();
    }
  };

  const rise = () => {
    if (v.hasShadow) {
      Animated.spring(press, {
        toValue: 0,
        useNativeDriver: true,
        tension: 600,
        friction: 25,
      }).start();
    } else {
      Animated.timing(fade, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  // Text variant: inline link style. No surface, no fixed height.
  if (variant === 'text') {
    return (
      <Pressable
        onPress={isInteractable ? onPress : undefined}
        onPressIn={isInteractable ? sink : undefined}
        onPressOut={isInteractable ? rise : undefined}
        style={style}
      >
        <Animated.View style={[s.textRow, { opacity: fade }]}>
          {leadingIcon && <View style={s.iconLeft}>{leadingIcon}</View>}
          <Text style={[s.label, { color: v.text }]}>{label}</Text>
          {arrow && (
            <Text style={[s.arrowInline, { color: shadowColor }]}>→</Text>
          )}
          {trailingIcon && <View style={s.iconRight}>{trailingIcon}</View>}
        </Animated.View>
      </Pressable>
    );
  }

  // Action variant: leading icon sits inside a tinted chip.
  // The chip flips contrast when filled (black chip on accent surface).
  const isAction = variant === 'action';
  const chipBg = isAction
    ? (filled ? colors.black : shadowColor)
    : 'transparent';
  const chipIconTint = isAction
    ? (filled ? shadowColor : colors.black)
    : v.text;

  return (
    <Pressable
      onPress={isInteractable ? onPress : undefined}
      onPressIn={isInteractable ? sink : undefined}
      onPressOut={isInteractable ? rise : undefined}
      style={[v.hasShadow ? s.wrapperWithShadow : null, style]}
    >
      {v.hasShadow && (
        <View
          style={[s.shadow, { backgroundColor: v.shadow, borderRadius: RADIUS }]}
        />
      )}

      <Animated.View
        style={[
          s.btn,
          {
            height: HEIGHTS[size],
            borderRadius: RADIUS,
            borderWidth: v.hasBorder ? BORDER_WIDTH : 0,
            borderColor: v.border,
            backgroundColor: v.surface,
            transform: [{ translateX: press }, { translateY: press }],
            opacity: v.hasShadow ? 1 : fade,
            paddingHorizontal: isAction ? 12 : 16,
          },
        ]}
      >
        {/* Action chip — pinned left, surface-tinted */}
        {isAction && leadingIcon && (
          <View
            style={[
              s.chip,
              {
                width: CHIP_SIZE[size],
                height: CHIP_SIZE[size],
                backgroundColor: chipBg,
              },
            ]}
          >
            {/* The icon's color comes from the consumer; we let them
                pass a node already coloured. chipIconTint is exposed
                via context-less prop drilling — i.e. the consumer
                should pass an icon coloured to match. */}
            <View style={{ opacity: 1 }}>{leadingIcon}</View>
          </View>
        )}

        {/* Trailing arrow pinned right (primary/action/outline/ghost) */}
        {arrow && !isLoading && !isAction && (
          <View style={s.arrowContainer}>
            <Text style={[s.arrow, { color: v.text }]}>→</Text>
          </View>
        )}

        {/* Centred label group */}
        <View
          style={[
            s.contentGroup,
            isAction && { flex: 1, justifyContent: 'flex-start', marginLeft: 10 },
          ]}
        >
          {!isAction && leadingIcon && (
            <View style={s.iconLeft}>{leadingIcon}</View>
          )}

          <Text
            style={[
              s.label,
              {
                color: v.text,
                letterSpacing: isAction ? 0.4 : -0.1,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>

          {trailingIcon && !isLoading && (
            <View style={s.iconRight}>{trailingIcon}</View>
          )}
          {isLoading && (
            <ActivityIndicator color={v.text} style={s.iconRight} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function DebateActionButton({
  icon,
  ...props
}: Omit<ButtonProps, 'variant' | 'leadingIcon'> & { icon?: React.ReactNode }) {
  return <Button {...props} variant="action" leadingIcon={icon} />;
}

const s = StyleSheet.create({
  wrapperWithShadow: {
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  contentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  iconLeft:  { marginRight: 4 },
  iconRight: { marginLeft:  4 },
  label: {
    fontFamily: fonts.display.bold,
    fontSize: 15,
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
  arrowInline: {
    fontFamily: fonts.display.black,
    fontSize: 16,
    marginLeft: 4,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
