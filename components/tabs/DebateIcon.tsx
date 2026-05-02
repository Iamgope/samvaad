import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/colors';

const SIZE = 28;

type Props = { focused: boolean };

export function DebateIcon({ focused }: Props) {
  const stroke = focused ? colors.purple2 : colors.textSubtle;
  // Use the brand color for the "spark" when focused to make it pop
  const sparkStroke = focused ? colors.purple2 : colors.textSubtle;

  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 28 28" fill="none">
      {/* Left Argument ( > ) */}
      <Path
        d="M6 8L11 14L6 20"
        stroke={stroke}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The Debate "Spark" / Lightning Bolt */}
      <Path
        d="M16 5L12 14H16L12 23"
        stroke={sparkStroke}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Argument ( < ) */}
      <Path
        d="M22 8L17 14L22 20"
        stroke={stroke}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}