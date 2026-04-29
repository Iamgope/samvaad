import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
import XIcon from '../assets/icons/x-icon.svg';
import RedditIcon from '../assets/icons/reddit-icon.svg';
import CommentIcon from '../assets/icons/comment-icon.svg';
import FireIcon from '../assets/icons/fire-icon.svg';
import HeartIcon from '../assets/icons/heart-icon.svg';
import FrustratedIcon from '../assets/icons/frustrated-icon.svg';

type IconComponent = React.FC<SvgProps>;

type IconDef = { Icon: IconComponent; bg?: string };

const INNER_ICONS: IconDef[] = [
  { Icon: XIcon },
  { Icon: RedditIcon },
];

const OUTER_ICONS: IconDef[] = [
  { Icon: CommentIcon, bg: 'rgba(107,63,228,0.40)' },
  { Icon: FireIcon, bg: 'rgba(255,107,53,0.40)' },
  { Icon: HeartIcon, bg: 'rgba(255,59,92,0.40)' },
  { Icon: FrustratedIcon, bg: 'rgba(244,196,48,0.40)' },
];

const SIZE = 320;
const INNER_RADIUS = 82;
const OUTER_RADIUS = 142;
// Inner glyph (X / Reddit) renders at 0.9× its slot so those two icons read
// ~10% smaller than the outer reactions, which fill their colored disc.
const SLOT_INNER = 56;
const SLOT_OUTER = 60;
const ICON_INNER = SLOT_INNER * 0.80;
const DISC_OUTER = Math.round(SLOT_OUTER * 0.82);
const ICON_OUTER = DISC_OUTER;
const CENTER = SIZE / 2;
const INNER_DURATION = 24000;
const OUTER_DURATION = 36000;

function useLoop(duration: number) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    value.setValue(0);
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration]);
  return value;
}

type Props = {
  centerImage: ImageSourcePropType;
};

export function OrbitingIcons({ centerImage }: Props) {
  const innerVal = useLoop(INNER_DURATION);
  const outerVal = useLoop(OUTER_DURATION);

  const innerRot = innerVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const innerCounter = innerVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const outerRot = outerVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const outerCounter = outerVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={s.container}>
      <Svg
        width={SIZE}
        height={SIZE}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_RADIUS}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
          strokeDasharray="4 7"
          fill="none"
        />
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
          strokeDasharray="4 7"
          fill="none"
        />
      </Svg>

      <Animated.View
        style={[s.orbit, { transform: [{ rotate: outerRot }] }]}
        pointerEvents="none"
      >
        {OUTER_ICONS.map(({ Icon, bg }, i) => {
          const angle = (i / OUTER_ICONS.length) * 2 * Math.PI - Math.PI / 2;
          const x = OUTER_RADIUS * Math.cos(angle);
          const y = OUTER_RADIUS * Math.sin(angle);
          return (
            <Animated.View
              key={i}
              style={[
                s.slot,
                {
                  width: SLOT_OUTER,
                  height: SLOT_OUTER,
                  left: CENTER - SLOT_OUTER / 2 + x,
                  top: CENTER - SLOT_OUTER / 2 + y,
                  transform: [{ rotate: outerCounter }],
                },
              ]}
            >
              <View
                style={{
                  width: DISC_OUTER,
                  height: DISC_OUTER,
                  borderRadius: DISC_OUTER / 2,
                  backgroundColor: bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Icon width={ICON_OUTER} height={ICON_OUTER} />
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>

      <Animated.View
        style={[s.orbit, { transform: [{ rotate: innerRot }] }]}
        pointerEvents="none"
      >
        {INNER_ICONS.map(({ Icon }, i) => {
          const angle = (i / INNER_ICONS.length) * 2 * Math.PI - Math.PI / 2;
          const x = INNER_RADIUS * Math.cos(angle);
          const y = INNER_RADIUS * Math.sin(angle);
          return (
            <Animated.View
              key={i}
              style={[
                s.slot,
                {
                  width: SLOT_INNER,
                  height: SLOT_INNER,
                  left: CENTER - SLOT_INNER / 2 + x,
                  top: CENTER - SLOT_INNER / 2 + y,
                  transform: [{ rotate: innerCounter }],
                },
              ]}
            >
              <Icon width={ICON_INNER} height={ICON_INNER} />
            </Animated.View>
          );
        })}
      </Animated.View>

      <Image source={centerImage} style={s.center} resizeMode="contain" />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  slot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: 165,
    height: 165,
  },
});
