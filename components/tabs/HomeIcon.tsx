import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../../constants/colors';

const TILE = 11;
const GAP = 3;
const SIZE = TILE * 2 + GAP;

type Props = { focused: boolean };

export function HomeIcon({ focused }: Props) {
  const fill = focused ? colors.lime : 'none';
  const stroke = focused ? 'none' : colors.textSubtle;

  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 25 25">
      <Rect x="0.5" y="0.5" width="10" height="10" rx="2.5" fill={fill} stroke={stroke} strokeWidth={1.5} />
      <Rect x="14.5" y="0.5" width="10" height="10" rx="2.5" fill={fill} stroke={stroke} strokeWidth={1.5} />
      <Rect x="0.5" y="14.5" width="10" height="10" rx="2.5" fill={fill} stroke={stroke} strokeWidth={1.5} />
      <Rect x="14.5" y="14.5" width="10" height="10" rx="2.5" fill={fill} stroke={stroke} strokeWidth={1.5} />
    </Svg>
  );
}
