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

// Neo-brutalist anatomy: surface · border · offset shadow that collapses on press.
// 'game' variant amps up the shadow (6px) and border (3px) for a heavier, tactile feel.
const SHADOW_OFFSET = 4;
const GAME_SHADOW   = 6;
const BORDER_WIDTH  = 2;
const GAME_BORDER   = 3;
const RADIUS = 6;

const HEIGHTS = { lg: 56, md: 48, sm: 40 };
const CHIP_SIZE = { lg: 36, md: 32, sm: 28 };

type Size = 'lg' | 'md' | 'sm';
export type ButtonVariant = 'primary' | 'action' | 'outline' | 'ghost' | 'text' | 'game' | 'pill' | 'pillBrand' | 'ticket';

const PILL_HEIGHT = 38;
const PILL_UNDER  = 4;
const TICKET_NOTCH = 10;
const TICKET_PER_SIDE = 4;

function darken(hex: string, amount = 0.45): string {
  const c = hex.replace('#', '');
  if (c.length !== 6) return hex;
  const r = Math.max(0, Math.round(parseInt(c.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(c.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(c.slice(4, 6), 16) * (1 - amount)));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  filled?: boolean;
  shadowColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
  arrow?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  size?: Size;
  style?: ViewStyle;
  notchColor?: string;
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
    case 'game':
      return {
        surface: shadowColor,
        border:  colors.black,
        text:    colors.black,
        shadow:  colors.black,
        hasShadow: true,
        hasBorder: true,
      };
    case 'primary':
    case 'action':
      return filled
        ? {
            surface: shadowColor,
            border:  colors.black,
            text:    colors.black,
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
    case 'pill':
      return {
        surface: colors.surface,
        border:  'rgba(255,255,255,0.22)',
        text:    colors.text,
        shadow:  'rgba(255,255,255,0.40)',
        hasShadow: true,
        hasBorder: true,
      };
    case 'pillBrand':
      return {
        surface: colors.text,
        border:  colors.black,
        text:    colors.black,
        shadow:  darken(shadowColor, 0.4),
        hasShadow: true,
        hasBorder: true,
      };
    case 'ticket':
      return {
        surface: colors.text,
        border:  'transparent',
        text:    colors.black,
        shadow:  shadowColor,
        hasShadow: true,
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
  notchColor = colors.black,
}: ButtonProps) {
  const press = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(1)).current;

  const v = tokensFor(variant, filled, disabled, shadowColor);
  const isInteractable = !disabled && !isLoading;

  const isGame   = variant === 'game';
  const isAction = variant === 'action';
  const shadowOff = isGame ? GAME_SHADOW : SHADOW_OFFSET;
  const borderW   = isGame ? GAME_BORDER : BORDER_WIDTH;

  const sink = () => {
    if (v.hasShadow) {
      Animated.spring(press, {
        toValue: shadowOff,
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

  if (variant === 'ticket') {
    const h = HEIGHTS[size];
    const notchDot = {
      width: TICKET_NOTCH,
      height: TICKET_NOTCH,
      borderRadius: TICKET_NOTCH / 2,
      backgroundColor: notchColor,
    } as const;
    const dots = Array.from({ length: TICKET_PER_SIDE }, (_, i) => i);
    const perforationTrack = (
      orientation: 'horizontal' | 'vertical',
      side: 'top' | 'bottom' | 'left' | 'right',
    ) => (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          ...(orientation === 'horizontal'
            ? {
                left: 0,
                right: 0,
                height: TICKET_NOTCH,
                [side]: -TICKET_NOTCH / 2,
                flexDirection: 'row',
              }
            : {
                top: 0,
                bottom: 0,
                width: TICKET_NOTCH,
                [side]: -TICKET_NOTCH / 2,
                flexDirection: 'column',
              }),
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {dots.map(i => <View key={i} style={notchDot} />)}
      </View>
    );
    return (
      <Pressable
        onPress={isInteractable ? onPress : undefined}
        onPressIn={isInteractable ? sink : undefined}
        onPressOut={isInteractable ? rise : undefined}
        style={[
          { paddingRight: SHADOW_OFFSET, paddingBottom: SHADOW_OFFSET, overflow: 'visible' },
          style,
        ]}
      >
        {/* offset lime shadow — solid rectangle so it doesn't introduce its
            own cutouts in the visible rim. The white face on top still has
            the full notch silhouette. */}
        <View
          style={{
            position: 'absolute',
            top: SHADOW_OFFSET,
            left: SHADOW_OFFSET,
            right: 0,
            bottom: 0,
            borderRadius: RADIUS,
            backgroundColor: v.shadow,
          }}
        />

        {/* top ticket — white face that collapses onto the shadow on press */}
        <Animated.View
          style={{
            height: h,
            backgroundColor: v.surface,
            borderRadius: RADIUS,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 28,
            transform: [{ translateX: press }, { translateY: press }],
          }}
        >
          {perforationTrack('vertical', 'left')}
          {perforationTrack('vertical', 'right')}
          {leadingIcon && <View style={s.iconLeft}>{leadingIcon}</View>}
          <Text
            style={[s.label, { color: v.text, letterSpacing: 0.2 }]}
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
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === 'pill' || variant === 'pillBrand') {
    return (
      <Pressable
        onPress={isInteractable ? onPress : undefined}
        onPressIn={isInteractable ? sink : undefined}
        onPressOut={isInteractable ? rise : undefined}
        style={[s.pillWrap, style]}
      >
        <View
          style={[
            s.pillBase,
            { backgroundColor: v.shadow, borderColor: v.shadow },
          ]}
        />
        <Animated.View
          style={[
            s.pillTop,
            {
              backgroundColor: v.surface,
              borderColor: v.border,
              borderWidth: v.hasBorder ? 1.5 : 0,
              transform: [{ translateY: press }],
            },
          ]}
        >
          {leadingIcon && <View style={s.pillIcon}>{leadingIcon}</View>}
          <Text style={[s.pillLabel, { color: v.text }]} numberOfLines={1}>
            {label}
          </Text>
          {trailingIcon && !isLoading && (
            <View style={s.pillIconRight}>{trailingIcon}</View>
          )}
          {isLoading && <ActivityIndicator color={v.text} style={s.pillIconRight} />}
        </Animated.View>
      </Pressable>
    );
  }

  const chipBg = isAction
    ? (filled ? colors.black : shadowColor)
    : 'transparent';

  return (
    <Pressable
      onPress={isInteractable ? onPress : undefined}
      onPressIn={isInteractable ? sink : undefined}
      onPressOut={isInteractable ? rise : undefined}
      style={[
        v.hasShadow ? { paddingRight: shadowOff, paddingBottom: shadowOff } : null,
        style,
      ]}
    >
      {v.hasShadow && (
        <View
          style={{
            position: 'absolute',
            top:    shadowOff,
            left:   shadowOff,
            right:  0,
            bottom: 0,
            borderRadius: RADIUS,
            backgroundColor: v.shadow,
          }}
        />
      )}

      <Animated.View
        style={[
          s.btn,
          {
            height: isGame ? 60 : HEIGHTS[size],
            borderRadius: RADIUS,
            borderWidth: v.hasBorder ? borderW : 0,
            borderColor: v.border,
            backgroundColor: v.surface,
            transform: [{ translateX: press }, { translateY: press }],
            opacity: v.hasShadow ? 1 : fade,
            paddingHorizontal: isAction ? 12 : 16,
          },
        ]}
      >
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
            <View style={{ opacity: 1 }}>{leadingIcon}</View>
          </View>
        )}

        {arrow && !isLoading && !isAction && (
          <View style={s.arrowContainer}>
            <Text style={[s.arrow, { color: v.text }]}>→</Text>
          </View>
        )}

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
                color:         v.text,
                letterSpacing: isGame ? 1.5 : (isAction ? 0.4 : -0.1),
                fontSize:      isGame ? 16 : 15,
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
  pillWrap: {
    height: PILL_HEIGHT + PILL_UNDER,
    borderRadius: 999,
  },
  pillBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PILL_UNDER,
    bottom: 0,
    borderRadius: 999,
  },
  pillTop: {
    height: PILL_HEIGHT,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  pillIcon: {
    marginRight: 2,
  },
  pillLabel: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  pillIconRight: {
    marginLeft: 4,
  },
});
