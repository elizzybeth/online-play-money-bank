import * as T from "three";
import type { Rect } from "./game";
/** Tessellate a rectangle union once; junctions never have duplicate surfaces. */
export function flatPath(rects: Rect[], height: number) {
  const xs = [
    ...new Set(rects.flatMap((r) => [r.x - r.w / 2, r.x + r.w / 2])),
  ].sort((a, b) => a - b);
  const zs = [
    ...new Set(rects.flatMap((r) => [r.z - r.d / 2, r.z + r.d / 2])),
  ].sort((a, b) => a - b);
  const vertices: number[] = [],
    uv: number[] = [];
  for (let i = 0; i < xs.length - 1; i++)
    for (let j = 0; j < zs.length - 1; j++) {
      const [a, b, c, d] = [xs[i], xs[i + 1], zs[j], zs[j + 1]];
      if (
        !rects.some(
          (r) =>
            (a + b) / 2 > r.x - r.w / 2 &&
            (a + b) / 2 < r.x + r.w / 2 &&
            (c + d) / 2 > r.z - r.d / 2 &&
            (c + d) / 2 < r.z + r.d / 2,
        )
      )
        continue;
      for (const [x, z] of [
        [a, c],
        [a, d],
        [b, d],
        [a, c],
        [b, d],
        [b, c],
      ]) {
        vertices.push(x, height, z);
        uv.push(x / 2, z / 2);
      }
    }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
