import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
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

export function InfoIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.6,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="8.2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="10" cy="6.2" r="1" fill={color} />
      <Path
        d="M10 9.2 V14.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18 L15 12 L9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18 L9 12 L15 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20h9 M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({
  size = 14,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7 M16 6l-4-4-4 4 M12 2v13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockIcon({
  size = 26,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 11h14v10H5z M8 11V7a4 4 0 018 0v4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarIcon({ size = 12, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L14.6 9.3 L21.5 9.9 L16.3 14.4 L17.9 21 L12 17.3 L6.1 21 L7.7 14.4 L2.5 9.9 L9.4 9.3 Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}

export function CoinIcon({ size = 13, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9.5" fill={color} />
      <Circle cx="12" cy="12" r="6" stroke="rgba(0,0,0,0.32)" strokeWidth={1.3} fill="none" />
    </Svg>
  );
}
