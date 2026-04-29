import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import { Squiggle } from './Squiggle';

export type HeadSegment = {
  text: string;
  accent?: 'lime' | 'purple';
  squiggle?: boolean;
};

export type HeadLine = HeadSegment[];

type Props = {
  lines: HeadLine[];
};

export function PageHeading({ lines }: Props) {
  return (
    <View style={s.root}>
      {lines.map((segments, li) => {
        const hasSquiggle = segments.some((seg) => seg.squiggle);
        const lineContent = (
          <Text key={li} style={s.base}>
            {segments.map((seg, si) => (
              <Text
                key={si}
                style={[
                  s.base,
                  seg.accent === 'lime' && s.lime,
                  seg.accent === 'purple' && s.purple,
                ]}
              >
                {seg.text}
              </Text>
            ))}
          </Text>
        );

        return hasSquiggle ? (
          <View key={li} style={s.squiggleLine}>
            {lineContent}
            <Squiggle color={colors.purple2} />
          </View>
        ) : (
          lineContent
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  base: {
    fontFamily: fonts.display.extraBold,
    fontSize: 38,
    lineHeight: 44,
    color: colors.text,
    letterSpacing: -1.4,
  },
  lime: {
    fontFamily: fonts.display.black,
    color: colors.lime,
  },
  purple: {
    fontFamily: fonts.display.black,
    color: colors.purple2,
  },
  squiggleLine: {
    alignSelf: 'flex-start',
  },
});
