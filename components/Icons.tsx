import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function ChevronDownIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <Svg width={size} height={size * (8 / 14)} viewBox="0 0 14 8">
      <Path
        d="M1 1 L7 7 L13 1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronUpIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <Svg width={size} height={size * (8 / 14)} viewBox="0 0 14 8">
      <Path
        d="M1 7 L7 1 L13 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
