import type { State, Rect } from "./game";
import { riverDistance } from "./river-land";
/** Keep legacy custom beds (and all their crop/harvest state) on dry lawn. */
export function relocateRiverBeds(s: State, obstacles: Rect[]) {
  let moved = 0;
  for (let i = 5; i < s.plots.length; i++) {
    const plot = s.plots[i];
    if (
      plot.community ||
      plot.mountain ||
      plot.meteor !== undefined ||
      plot.x === undefined ||
      plot.z === undefined ||
      riverDistance(plot.x, plot.z) > 5
    )
      continue;
    let best: { x: number; z: number; distance: number } | undefined;
    for (let x = -30; x <= -9; x += 0.5)
      for (let z = -4; z <= 22; z += 0.5) {
        if (riverDistance(x, z) <= 5 || (x > -22 && x < -8 && z > -3 && z < 15))
          continue;
        const distance = (x - plot.x) ** 2 + (z - plot.z) ** 2;
        if (best && distance >= best.distance) continue;
        if (
          obstacles.some(
            (r) =>
              Math.abs(x - r.x) < r.w / 2 + 0.9 &&
              Math.abs(z - r.z) < r.d / 2 + 1.6,
          )
        )
          continue;
        if (
          s.plots.some(
            (p, j) =>
              i !== j &&
              Math.abs(x - (p.x ?? -20 + j * 2)) < 1.9 &&
              Math.abs(z - (p.z ?? 19)) < 3.3,
          )
        )
          continue;
        best = { x, z, distance };
      }
    if (best) {
      plot.x = best.x;
      plot.z = best.z;
      moved++;
    }
  }
  if (moved)
    s.events.push(
      `Moved ${moved} garden ${moved === 1 ? "bed" : "beds"} onto dry lawn beside the new river; all crops kept.`,
    );
  return moved;
}
