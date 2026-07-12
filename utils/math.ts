// Mirrors Python's round() (round-half-to-even), used to stay in exact sync
// with the backend's elo/xp delta math (see debate/selectors.py).
export function roundHalfEven(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
