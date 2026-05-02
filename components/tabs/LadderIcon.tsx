import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import { colors } from '../../constants/colors';

const SIZE = 28;

type Props = { focused: boolean };

export function LadderIcon({ focused }: Props) {
  const color = focused ? colors.red : colors.textSubtle;
  const cupFill = focused ? colors.red : 'none';
  const starFill = focused ? '#fff' : 'none';

  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      <Path
        d="M6 5h16v7a8 8 0 01-16 0V5z"
        fill={cupFill} stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Path d="M6 8H4a2 2 0 000 4h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 8h2a2 2 0 010 4h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="14" y1="20" x2="14" y2="24" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="9" y1="24" x2="19" y2="24" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M14 8.5l1 2.2 2.4.3-1.7 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.7-1.7 2.4-.3z"
        fill={starFill} stroke={focused ? 'none' : color} strokeWidth={1.2} strokeLinejoin="round"
      />
    </Svg>
  );
}
