import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  color?: string;
};

export function Squiggle({ width = 130, color = '#8B5CF6' }: Props) {
  return (
    <Svg width={width} height={10} viewBox="0 0 120 10">
      <Path
        d="M2 6 Q12 1 22 6 T42 6 T62 6 T82 6 T102 6 T118 6"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
