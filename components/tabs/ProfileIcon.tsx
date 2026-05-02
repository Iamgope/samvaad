import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../constants/colors';

const SIZE = 28;
const ACTIVE = '#4ECDC4';

type Props = { focused: boolean };

export function ProfileIcon({ focused }: Props) {
  const fill = focused ? ACTIVE : 'none';
  const stroke = focused ? 'none' : colors.textSubtle;

  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={fill} stroke={stroke} strokeWidth={2} />
      <Path
        d="M4 20a8 8 0 0116 0z"
        fill={fill} stroke={stroke} strokeWidth={2} strokeLinecap="round"
      />
    </Svg>
  );
}
