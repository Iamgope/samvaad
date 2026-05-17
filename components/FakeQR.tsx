import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../constants/colors';

// Deterministic QR-looking SVG. Not scannable — swap with a real
// asset / encoder when one lands.
export function FakeQR({ size }: { size: number }) {
  const grid = 25;
  const cell = size / grid;
  const bits = buildFakeQR(grid);

  return (
    <Svg width={size} height={size}>
      <Rect width={size} height={size} fill={colors.text} />
      {bits.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <Rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill={colors.black}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

function buildFakeQR(grid: number): boolean[][] {
  let s = 0x9e3779b9 >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const bits: boolean[][] = Array.from({ length: grid }, () =>
    Array.from({ length: grid }, () => rand() > 0.5),
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || rr >= grid || cc < 0 || cc >= grid) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          bits[rr][cc] = false;
        } else {
          const onEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          bits[rr][cc] = onEdge || center;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, grid - 7);
  drawFinder(grid - 7, 0);

  return bits;
}
