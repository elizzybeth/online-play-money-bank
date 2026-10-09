import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
// Crooked, tapered limbs: fixed per plot so a saved tree keeps its silhouette.
export function moneySkeleton(
  index: number,
  height: number,
  material: T.Material,
  withered = false,
) {
  let seed = 7919 + index * 104729;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const trunkParts: T.BufferGeometry[] = [],
    branches: T.BufferGeometry[] = [],
    tips: T.Vector3[] = [];
  const segment = (
    a: T.Vector3,
    b: T.Vector3,
    r0: number,
    r1: number,
    parts: T.BufferGeometry[],
  ) => {
    const direction = b.clone().sub(a),
      geometry = new T.CylinderGeometry(r1, r0, direction.length(), 5, 1);
    geometry.applyQuaternion(
      new T.Quaternion().setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
    );
    geometry.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    parts.push(geometry);
  };
  const spine = [new T.Vector3(0, 0, 0)];
  for (let n = 1; n < 5; n++)
    spine.push(
      new T.Vector3(
        (random() - 0.5) * 0.22,
        (height * n) / 4,
        (random() - 0.5) * 0.14,
      ),
    );
  for (let n = 0; n < 4; n++)
    segment(
      spine[n],
      spine[n + 1],
      0.13 * (1 - n * 0.19),
      0.13 * (1 - (n + 1) * 0.19),
      trunkParts,
    );
  for (let root = 0; root < 3; root++) {
    const a = root * 2.1 + random();
    segment(
      new T.Vector3(Math.sin(a) * 0.25, 0.02, Math.cos(a) * 0.25),
      new T.Vector3(0, 0.17, 0),
      0.025,
      0.075,
      trunkParts,
    );
  }
  const count = 7 + (index % 3);
  for (let n = 0; n < count; n++) {
    const fraction = 0.32 + (n / (count - 1)) * 0.57,
      angle = n * 2.399 + random() * 0.65 + index;
    const start = spine[Math.min(3, Math.floor(fraction * 4))].clone();
    start.y = height * fraction;
    const reach = 0.4 + random() * 0.38,
      rise = (withered ? -0.05 : 0.16) + random() * 0.34;
    const elbow = start
      .clone()
      .add(
        new T.Vector3(
          Math.sin(angle) * reach * 0.6,
          height * rise * 0.65,
          Math.cos(angle) * reach * 0.6,
        ),
      );
    const tip = elbow
      .clone()
      .add(
        new T.Vector3(
          Math.sin(angle + 0.35) * reach * 0.48,
          height * rise * 0.5,
          Math.cos(angle + 0.35) * reach * 0.48,
        ),
      );
    segment(start, elbow, 0.052, 0.027, branches);
    segment(elbow, tip, 0.027, 0.008, branches);
    for (const side of [-1, 1]) {
      const forkAngle = angle + side * (0.48 + random() * 0.35),
        length = 0.15 + random() * 0.22;
      const fork = tip
        .clone()
        .add(
          new T.Vector3(
            Math.sin(forkAngle) * length,
            (withered ? -0.1 : 0.12) + random() * 0.22,
            Math.cos(forkAngle) * length,
          ),
        );
      segment(tip, fork, 0.009, 0.0015, branches);
      tips.push(fork);
      const twigBase = elbow.clone().lerp(tip, 0.35 + random() * 0.25);
      const twig = twigBase
        .clone()
        .add(
          new T.Vector3(
            Math.sin(forkAngle + side * 0.4) * 0.19,
            0.13 + random() * 0.13,
            Math.cos(forkAngle + side * 0.4) * 0.19,
          ),
        );
      segment(twigBase, twig, 0.011, 0.0015, branches);
    }
  }
  const mesh = (parts: T.BufferGeometry[]) => {
    const geometry = mergeGeometries(parts)!;
    parts.forEach((p) => p.dispose());
    const mesh = new T.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };
  return { trunk: mesh(trunkParts), branches: mesh(branches), tips };
}
