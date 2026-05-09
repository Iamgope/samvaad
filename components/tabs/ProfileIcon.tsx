import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 28;
type Props = { focused: boolean };

export function ProfileIcon({ focused }: Props) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
       <Defs>
        <LinearGradient id="profile3d" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e0e0e0" />
          <Stop offset="0.4" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#7a7a7a" />
        </LinearGradient>
      </Defs>
      {focused ? (
        <>
          <Path d="M14 4a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" fill="url(#profile3d)"/>
          <Path d="M5.5 24c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5v1H5.5v-1z" fill="url(#profile3d)"/>
        </>
      ) : (
        <>
          <Path d="M14 5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" stroke="#666666" strokeWidth={1.8}/>
          <Path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#666666" strokeWidth={1.8} strokeLinecap="round"/>
        </>
      )}
    </Svg>
  );
}