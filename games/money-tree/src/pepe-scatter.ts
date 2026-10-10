export type ScatterPoint = { x: number; z: number };
// Fixed seed keeps uncollected packets in the same places after reloading a save.
export function pepeScatter(
  isBlocked: (x: number, z: number) => boolean,
  seed = 718203,
): ScatterPoint[] {
  let rng = seed;
  const random = () => {
    rng = (rng * 16807) % 2147483647;
    return rng / 2147483647;
  };
  const points: ScatterPoint[] = [];
  for (let i = 0; i < 100; i++) {
    let point: ScatterPoint | undefined;
    for (let attempt = 0; attempt < 3000; attempt++) {
      const candidate = { x: -6 + random() * 46, z: -43 - random() * 42 };
      if (isBlocked(candidate.x, candidate.z)) continue;
      if (
        i < 25 &&
        points.some(
          (p) => Math.hypot(p.x - candidate.x, p.z - candidate.z) < 1.4,
        )
      )
        continue;
      point = candidate;
      break;
    }
    if (!point) throw new Error("No reachable ground for Pepe fragments");
    points.push(point);
  }
  return points;
}
