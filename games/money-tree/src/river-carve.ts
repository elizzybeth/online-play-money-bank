import * as T from "three";
import { riverSections, riverBankWidth } from "./river-land";
type V = { x: number; y: number; z: number; u: number; v: number };
const quads = riverSections.slice(1).flatMap((b, i) => {
  const a = riverSections[i],
    r = riverBankWidth;
  const q = [
    { x: a.x + a.nx * r, z: a.z + a.nz * r },
    { x: b.x + b.nx * r, z: b.z + b.nz * r },
    { x: b.x - b.nx * r, z: b.z - b.nz * r },
    { x: a.x - a.nx * r, z: a.z - a.nz * r },
  ];
  // Subtract the same two triangles as the rendered ribbon. Tight bends can
  // make the four-point outline concave; treating it as convex leaves wedges.
  return [
    [q[0], q[1], q[2]],
    [q[0], q[2], q[3]],
  ].map((triangle) => {
    const area = triangle.reduce(
      (sum, p, j) =>
        sum + p.x * triangle[(j + 1) % 3].z - p.z * triangle[(j + 1) % 3].x,
      0,
    );
    if (area < 0) triangle.reverse();
    return {
      q: triangle,
      minX: Math.min(...triangle.map((p) => p.x)),
      maxX: Math.max(...triangle.map((p) => p.x)),
      minZ: Math.min(...triangle.map((p) => p.z)),
      maxZ: Math.max(...triangle.map((p) => p.z)),
    };
  });
});
/** Subtract the actual channel from existing terrain/pavement, once at setup.
 * Water sits below ground: no coplanar overlays, hidden grass, or depth bias. */
export function carveRiver(mesh: T.Mesh) {
  mesh.updateWorldMatrix(true, false);
  const original = mesh.geometry,
    geometry = original.index ? original.toNonIndexed() : original;
  const pos = geometry.getAttribute("position"),
    uv = geometry.getAttribute("uv");
  const inverse = mesh.matrixWorld.clone().invert(),
    out: number[] = [],
    tex: number[] = [];
  const vector = new T.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    let fragments: V[][] = [
      Array.from({ length: 3 }, (_, j) => {
        vector.fromBufferAttribute(pos, i + j).applyMatrix4(mesh.matrixWorld);
        return {
          x: vector.x,
          y: vector.y,
          z: vector.z,
          u: uv?.getX(i + j) ?? 0,
          v: uv?.getY(i + j) ?? 0,
        };
      }),
    ];
    for (const { q, minX, maxX, minZ, maxZ } of quads) {
      const next: V[][] = [];
      for (const poly of fragments) {
        if (
          poly.every((p) => p.x < minX) ||
          poly.every((p) => p.x > maxX) ||
          poly.every((p) => p.z < minZ) ||
          poly.every((p) => p.z > maxZ)
        ) {
          next.push(poly);
          continue;
        }
        let inside = poly;
        for (let k = 0; k < q.length && inside.length; k++) {
          const a = q[k],
            b = q[(k + 1) % q.length];
          const cross = (p: V) =>
            (b.x - a.x) * (p.z - a.z) - (b.z - a.z) * (p.x - a.x);
          const keep: V[] = [],
            outside: V[] = [];
          for (let j = 0; j < inside.length; j++) {
            const p = inside[j],
              v = inside[(j + 1) % inside.length],
              cp = cross(p),
              cv = cross(v);
            (cp >= 0 ? keep : outside).push(p);
            if (cp >= 0 !== cv >= 0) {
              const t = cp / (cp - cv),
                at = {
                  x: p.x + (v.x - p.x) * t,
                  y: p.y + (v.y - p.y) * t,
                  z: p.z + (v.z - p.z) * t,
                  u: p.u + (v.u - p.u) * t,
                  v: p.v + (v.v - p.v) * t,
                };
              keep.push(at);
              outside.push(at);
            }
          }
          if (outside.length >= 3) next.push(outside);
          inside = keep;
        }
      }
      fragments = next;
      if (!fragments.length) break;
    }
    for (const poly of fragments)
      for (let j = 1; j < poly.length - 1; j++)
        for (const p of [poly[0], poly[j], poly[j + 1]]) {
          vector.set(p.x, p.y, p.z).applyMatrix4(inverse);
          out.push(vector.x, vector.y, vector.z);
          tex.push(p.u, p.v);
        }
  }
  const cut = new T.BufferGeometry();
  cut.setAttribute("position", new T.Float32BufferAttribute(out, 3));
  cut.setAttribute("uv", new T.Float32BufferAttribute(tex, 2));
  cut.computeVertexNormals();
  mesh.geometry = cut;
  original.dispose();
  if (geometry !== original) geometry.dispose();
}
