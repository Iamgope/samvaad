import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 28;
type Props = { focused: boolean };

export function SearchIcon({ focused }: Props) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      <Defs>
        <LinearGradient id="search3d" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e0e0e0" />
          <Stop offset="0.4" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#7a7a7a" />
        </LinearGradient>
      </Defs>
      {focused ? (
        <>
          <Path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2.4a9.6 9.6 0 110 19.2 9.6 9.6 0 010-19.2z" fill="url(#search3d)" />
          <Path d="M14 6.5l3 8.5L14 21.5l-3-6.5L14 6.5z" fill="url(#search3d)" />
        </>
      ) : (
        <>
          <Circle cx="14" cy="14" r="10.5" stroke="#666666" strokeWidth={1.8} />
          <Path d="M14 8l2.5 6-2.5 5-2.5-5L14 8z" stroke="#666666" strokeWidth={1.5} strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}
