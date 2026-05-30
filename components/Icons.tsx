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

export function FlagIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 22V4 M4 4c6 0 7 3 13 3v9c-6 0-7-3-13-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeOffIcon({
  size = 16,
  color = colors.text,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18 M10.6 6.1A10.4 10.4 0 0112 6c5 0 9 4 10 6-0.5 1-1.6 2.7-3.3 4.2 M6.3 7.6C4.1 9.1 2.6 11 2 12c1 2 5 6 10 6 1.7 0 3.3-.5 4.8-1.3 M9.9 9.9a3 3 0 004.2 4.2"
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

export function MoreVerticalIcon({ size = 18, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6 H20"  stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 12 H20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 18 H20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
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

// Clean monochrome thumb icons for the stance vote.
// Outline (fill="none") when inactive, solid fill when the side is selected.
export function ThumbUpIcon({
  size = 24,
  color = colors.text,
  filled = false,
  strokeWidth = 1.6,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ThumbDownIcon({
  size = 24,
  color = colors.text,
  filled = false,
  strokeWidth = 1.6,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4h-8.1c-.71 0-1.36.37-1.72.97l-2.67 6.15z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}