import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SIZE = 28;
type Props = { focused: boolean };

export function LadderIcon({ focused }: Props) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      <Defs>
        <LinearGradient id="ladder3d" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e0e0e0" />
          <Stop offset="0.4" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#7a7a7a" />
        </LinearGradient>
      </Defs>
      {focused ? (
        <Path 
          d="M14 2.5l3.6 7.3 8.1 1.2-5.8 5.7 1.4 8-7.3-3.8-7.3 3.8 1.4-8-5.8-5.7 8.1-1.2L14 2.5z" 
          fill="url(#ladder3d)" 
        />
      ) : (
        <Path 
          d="M14 4.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L14 4.2z" 
          stroke="#666666" 
          strokeWidth={1.8} 
          strokeLinejoin="round" 
        />
      )}
    </Svg>
  );
}
