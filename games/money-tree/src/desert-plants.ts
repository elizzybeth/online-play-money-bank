import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mansionSites } from "./millionaire-land";
import { mansionLot, marvelsLot } from "./housing";
export function makeDesertPlants() {
  const root = new T.Group();
  root.name = "saguaro-and-joshua-desert";
  const parts = new Map<string, T.BufferGeometry[]>();
  let seed = 89271;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const add = (
    geometry: T.BufferGeometry,
    color: string,
    matrix: T.Matrix4,
  ) => {
    if (geometry.index) {
      const original = geometry;
      geometry = geometry.toNonIndexed();
      original.dispose();
    }
    geometry.applyMatrix4(matrix);
    (parts.get(color) ?? (parts.set(color, []), parts.get(color)!)).push(
      geometry,
    );
  };
  const transform = (x: number, y: number, z: number) =>
    new T.Matrix4().makeTranslation(x, y, z);
  const tube = (points: T.Vector3[], radius: number, color: string) =>
    add(
      new T.TubeGeometry(new T.CatmullRomCurve3(points), 12, radius, 8, false),
      color,
      new T.Matrix4(),
    );
  for (let i = 0; i < 150; i++) {
    const x = -92 + random() * 245,
      z = -165 - random() * 290;
    if (
      (Math.abs(x - 34) < 42 && z < -320) ||
      Math.abs(x - 34) < 8 ||
      mansionSites.some(
        (s) => Math.abs(x - s.x) < 29 && Math.abs(z - s.z) < 25,
      ) ||
      [mansionLot, marvelsLot].some(
        (s) =>
          Math.abs(x - s.x) < s.w / 2 + 6 && Math.abs(z - s.z) < s.d / 2 + 6,
      ) ||
      [
        [-80, -180],
        [142, -220],
        [-77, -255],
        [150, -270],
        [-80, -460],
        [150, -460],
      ].some((s) => Math.hypot(x - s[0], z - s[1]) < 13) ||
      (z > -240 && random() > 0.35)
    )
      continue;
    const size = 3 + random() * 4;
    if (random() < 0.57) {
      const radius = 0.3 + random() * 0.2;
      add(
        new T.CapsuleGeometry(radius, size - radius * 2, 5, 12),
        "#667e3b",
        transform(x, size / 2, z),
      );
      for (let rib = 0; rib < 12; rib++) {
        const angle = (rib * Math.PI) / 6;
        tube(
          [
            new T.Vector3(
              x + Math.cos(angle) * radius * 0.98,
              0.15,
              z + Math.sin(angle) * radius * 0.98,
            ),
            new T.Vector3(
              x + Math.cos(angle) * radius * 0.98,
              size - 0.4,
              z + Math.sin(angle) * radius * 0.98,
            ),
          ],
          0.025,
          "#99a861",
        );
      }
      const arms = 2 + Math.floor(random() * 3);
      for (let j = 0; j < arms; j++) {
        const angle = (j * Math.PI * 2) / arms + random() * 0.6,
          y = size * (0.25 + random() * 0.35),
          length = 0.9 + random() * 1.2;
        const offset = new T.Vector3(
            Math.cos(angle) * length,
            0,
            Math.sin(angle) * length,
          ),
          start = new T.Vector3(x, y, z),
          elbow = start.clone().add(offset);
        tube(
          [
            start,
            start.clone().add(offset.clone().multiplyScalar(0.8)),
            elbow.clone().add(new T.Vector3(0, 0.4, 0)),
            elbow.clone().add(new T.Vector3(0, 1 + random() * 2, 0)),
          ],
          radius * 0.65,
          "#667e3b",
        );
      }
    } else {
      const trunk = [
        new T.Vector3(x, 0, z),
        new T.Vector3(x + 0.2, size * 0.35, z - 0.1),
        new T.Vector3(x - 0.25, size * 0.6, z + 0.2),
      ];
      tube(trunk, 0.24, "#756346");
      for (let j = 0; j < 4 + Math.floor(random() * 3); j++) {
        const angle = j * 2.4,
          tip = new T.Vector3(
            x + Math.cos(angle) * (1 + random()),
            size * (0.65 + random() * 0.4),
            z + Math.sin(angle) * (1 + random()),
          );
        tube(
          [
            trunk[1],
            trunk[2],
            tip.clone().add(new T.Vector3(-0.1, -0.3, 0)),
            tip,
          ],
          0.11,
          "#756346",
        );
        for (let leaf = 0; leaf < 22; leaf++) {
          const a = leaf * 2.4,
            up = -0.4 + random() * 1.6,
            direction = new T.Vector3(Math.cos(a), up, Math.sin(a)).normalize();
          const geometry = new T.ConeGeometry(0.065, 0.9, 3);
          const matrix = new T.Matrix4().compose(
            tip.clone().add(direction.clone().multiplyScalar(0.4)),
            new T.Quaternion().setFromUnitVectors(
              new T.Vector3(0, 1, 0),
              direction,
            ),
            new T.Vector3(1, 1, 1),
          );
          add(geometry, leaf % 3 ? "#84934d" : "#b7ad69", matrix);
        }
      }
    }
  }
  for (const [color, geometries] of parts) {
    const mesh = new T.Mesh(
      mergeGeometries(geometries)!,
      new T.MeshStandardMaterial({ color, roughness: 0.95 }),
    );
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    geometries.forEach((g) => g.dispose());
  }
  return root;
}
