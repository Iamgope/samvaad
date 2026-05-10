import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 28;
type Props = { focused: boolean; accent?: string };

export function SearchIcon({ focused }: Props) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rot, {
      toValue: focused ? 45 : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 16,
    }).start();
  }, [focused]);

  const rotDeg = rot.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {/* Ring — never rotates (circle looks the same either way) */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={SIZE} height={SIZE}
        viewBox="0 0 28 28" fill="none"
      >
        <Defs>
          <LinearGradient id="srRing" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#e0e0e0" />
            <Stop offset="0.4" stopColor="#ffffff" />
            <Stop offset="1"   stopColor="#7a7a7a" />
          </LinearGradient>
        </Defs>
        {focused ? (
          <Path
            d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2.4a9.6 9.6 0 110 19.2 9.6 9.6 0 010-19.2z"
            fill="url(#srRing)"
          />
        ) : (
          <Circle cx="14" cy="14" r="10.5" stroke="#666666" strokeWidth={1.8} />
        )}
      </Svg>

      {/* Needle + pivot dot — springs to NE–SW (45°) when focused */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotDeg }] }]}
      >
        <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
          <Defs>
            <LinearGradient id="srNeedle" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"   stopColor="#e0e0e0" />
              <Stop offset="0.4" stopColor="#ffffff" />
              <Stop offset="1"   stopColor="#7a7a7a" />
            </LinearGradient>
          </Defs>
          {focused ? (
            <Path d="M14 6.5l3 8.5L14 21.5l-3-6.5L14 6.5z" fill="url(#srNeedle)" />
          ) : (
            <Path
              d="M14 8l2.5 6-2.5 5-2.5-5L14 8z"
              stroke="#666666" strokeWidth={1.5} strokeLinejoin="round"
            />
          )}
          {/* Pivot dot — separates north and south needle halves */}
          <Circle cx="14" cy="14" r="2.2" fill={focused ? '#0C0F16' : '#555555'} />
        </Svg>
      </Animated.View>
    </View>
  );
}
