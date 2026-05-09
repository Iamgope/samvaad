import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 28;
type Props = { focused: boolean };

export function HomeIcon({ focused }: Props) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      <Defs>
        <LinearGradient id="home3d" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e0e0e0" />
          <Stop offset="0.4" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#7a7a7a" />
        </LinearGradient>
      </Defs>
      {focused ? (
        <Path 
          d="M14 3.5 L3.5 13H6v10.5h6v-6h4v6h6V13h2.5L14 3.5z" 
          fill="url(#home3d)" 
        />
      ) : (
        <Path 
          d="M14 4.5 L4.5 13H7v9.5h4v-6h6v6h4V13h2.5L14 4.5z" 
          stroke="#666666" 
          strokeWidth={1.8} 
          strokeLinejoin="round" 
        />
      )}
    </Svg>
  );
}
