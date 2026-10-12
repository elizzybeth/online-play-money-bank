import * as T from "three";
type Face = {
  mesh: string;
  triangle: number;
  points: T.Vector3[];
  normal: T.Vector3;
  distance: number;
  min: T.Vector3;
  max: T.Vector3;
};
export type DepthRisk = {
  first: string;
  second: string;
  separation: number;
  overlapArea: number;
};
// This is geometric risk detection, not a claim about every GPU/camera's depth precision.
export function depthAudit(
  root: T.Object3D,
  options: {
    epsilon?: number;
    taggedOnly?: boolean;
    upwardOnly?: boolean;
  } = {},
) {
  const epsilon = options.epsilon ?? 0.015,
    buckets = new Map<string, Face[]>(),
    risks: DepthRisk[] = [];
  root.updateMatrixWorld(true);
  root.traverseVisible((o) => {
    if (
      !(o instanceof T.Mesh) ||
      o instanceof T.InstancedMesh ||
      (options.taggedOnly && !o.userData.depthAudit)
    )
      return;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    if (
      materials.every(
        (m) =>
          !m.depthTest ||
          !m.depthWrite ||
          m.polygonOffset ||
          (m.transparent && m.opacity < 1),
      )
    )
      return;
    const p = o.geometry.getAttribute("position"),
      index = o.geometry.index;
    if (!p) return;
    for (let t = 0; t < (index?.count ?? p.count); t += 3) {
      const points = [0, 1, 2].map((j) =>
        new T.Vector3()
          .fromBufferAttribute(p, index ? index.getX(t + j) : t + j)
          .applyMatrix4(o.matrixWorld),
      );
      const normal = new T.Vector3().crossVectors(
        points[1].clone().sub(points[0]),
        points[2].clone().sub(points[0]),
      );
      if (normal.lengthSq() < 1e-12) continue;
      normal.normalize();
      if (
        options.upwardOnly &&
        normal.y < 0.99 &&
        !(
          Math.abs(normal.y) > 0.99 &&
          materials.some((m) => m.side === T.DoubleSide)
        )
      )
        continue;
      const dominant = [normal.x, normal.y, normal.z]
        .map(Math.abs)
        .indexOf(
          Math.max(Math.abs(normal.x), Math.abs(normal.y), Math.abs(normal.z)),
        );
      if (normal.getComponent(dominant) < 0) normal.negate();
      const distance = normal.dot(points[0]),
        key = [normal.x, normal.y, normal.z]
          .map((n) => Math.round(n * 1000))
          .join(",");
      const face: Face = {
        mesh: o.name || o.uuid,
        triangle: t / 3,
        points,
        normal,
        distance,
        min: new T.Vector3(Infinity, Infinity, Infinity),
        max: new T.Vector3(-Infinity, -Infinity, -Infinity),
      };
      points.forEach((v) => {
        face.min.min(v);
        face.max.max(v);
      });
      const bin = Math.floor(distance / epsilon);
      for (let b = bin - 1; b <= bin + 1; b++)
        for (const other of buckets.get(key + ":" + b) ?? []) {
          if (
            Math.abs(distance - other.distance) > epsilon ||
            normal.dot(other.normal) < 0.999999
          )
            continue;
          if (
            [0, 1, 2].some(
              (axis) =>
                face.min.getComponent(axis) >
                  other.max.getComponent(axis) + epsilon ||
                face.max.getComponent(axis) <
                  other.min.getComponent(axis) - epsilon,
            )
          )
            continue;
          const area = overlap(points, other.points, dominant);
          if (area > 1e-5)
            risks.push({
              first: face.mesh + "#" + face.triangle,
              second: other.mesh + "#" + other.triangle,
              separation: Math.abs(distance - other.distance),
              overlapArea: area,
            });
        }
      const list = buckets.get(key + ":" + bin) ?? [];
      list.push(face);
      buckets.set(key + ":" + bin, list);
    }
  });
  return risks;
}
function overlap(a: T.Vector3[], b: T.Vector3[], drop: number) {
  const axes = [0, 1, 2].filter((i) => i !== drop);
  const project = (p: T.Vector3) => [
    p.getComponent(axes[0]),
    p.getComponent(axes[1]),
  ];
  const clip = b.map(project);
  let poly = a.map(project);
  const cross = (p: number[], q: number[], r: number[]) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const winding = cross(clip[0], clip[1], clip[2]) >= 0 ? 1 : -1;
  for (let i = 0; i < 3; i++) {
    const start = clip[i],
      end = clip[(i + 1) % 3],
      out: number[][] = [];
    for (let j = 0; j < poly.length; j++) {
      const p = poly[j],
        q = poly[(j + 1) % poly.length],
        dp = cross(start, end, p) * winding,
        dq = cross(start, end, q) * winding;
      if (dp >= -1e-10) out.push(p);
      if (dp >= 0 !== dq >= 0) {
        const f = dp / (dp - dq);
        out.push([p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])]);
      }
    }
    poly = out;
    if (poly.length < 3) return 0;
  }
  return (
    Math.abs(
      poly.reduce((sum, p, i) => {
        const q = poly[(i + 1) % poly.length];
        return sum + p[0] * q[1] - p[1] * q[0];
      }, 0),
    ) / 2
  );
}
