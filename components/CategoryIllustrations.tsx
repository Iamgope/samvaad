import React from 'react'
import Svg, { Rect, Path, Circle } from 'react-native-svg'
import { colors } from '../constants/colors'

export type IllustrationProps = {
  size?: number
  color?: string
}

function Frame({ size = 64, color, children }: { size?: number; color: string; children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x={0} y={0} width={64} height={64} rx={6} fill={`${color}1f`} />
      {children}
    </Svg>
  )
}

// Ballot box with a folded paper slip — politics.
export function PoliticsIllustration({ size = 64, color = colors.text }: IllustrationProps) {
  return (
    <Frame size={size} color={color}>
      <Path
        d="M18 30h28v18a2 2 0 01-2 2H20a2 2 0 01-2-2V30z M18 30l4-4h20l4 4"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <Path d="M27 30h10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M27 15h9v11h-9z M32 15v11 M29 21l2.5 2.5L36 19"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Frame>
  )
}

// Trophy — sports.
export function SportsIllustration({ size = 64, color = colors.text }: IllustrationProps) {
  return (
    <Frame size={size} color={color}>
      <Path
        d="M23 17h18v9a9 9 0 01-18 0v-9z
           M23 20h-4a5 5 0 005 5
           M41 20h4a5 5 0 01-5 5
           M32 35v6
           M27 47h10
           M28 41h8l1.5 6h-11z"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Frame>
  )
}

// Framed artwork — culture.
export function CultureIllustration({ size = 64, color = colors.text }: IllustrationProps) {
  return (
    <Frame size={size} color={color}>
      <Path
        d="M16 17h32v30H16z"
        stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none"
      />
      <Circle cx={25} cy={26} r={3} stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M18 42l9-10 6 6 7-9 6 13"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Frame>
  )
}

// Speech bubble with dots — general fallback, matches the app's debate theme.
export function GeneralIllustration({ size = 64, color = colors.text }: IllustrationProps) {
  return (
    <Frame size={size} color={color}>
      <Path
        d="M18 22a4 4 0 014-4h20a4 4 0 014 4v14a4 4 0 01-4 4H29l-8 7v-7h-.9a4 4 0 01-4-4z"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <Circle cx={26} cy={29} r={1.6} fill={color} />
      <Circle cx={32} cy={29} r={1.6} fill={color} />
      <Circle cx={38} cy={29} r={1.6} fill={color} />
    </Frame>
  )
}
