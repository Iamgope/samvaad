import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../constants/colors';

const SIZE = 28;
type Props = { focused: boolean };

export function SearchIcon({ focused }: Props) {
  const stroke = focused ? colors.lime : colors.textSubtle;
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      <Circle cx="12" cy="12" r="7.5" stroke={stroke} strokeWidth={2.2} />
      <Path d="M18 18L24 24" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}
