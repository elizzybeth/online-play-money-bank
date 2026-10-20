import * as T from "three";
import type { Rect } from "./game";
import {
  riverSections,
  riverBridges,
  riverBankDistance,
  riverGroundHeight,
} from "./river-land";
import { sharedRiverPlantGeometry, type RiverPlant } from "./river-plants";
export function plantRiverBanks(
  vegetation: T.Group,
  obstacles: Rect[],
  paths: Rect[],
  buildings: Rect[] = [],
) {
  let seed = 7419;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const reserved = [
    ...paths,
    ...riverBridges.map((b) => ({ ...b, w: b.w + 5, d: b.d + 10 })),
  ];
  const excluded = [...reserved, ...obstacles, ...buildings];
  const bounds = new T.Box3();
  const clear = () =>
    !excluded.some(
      (r) =>
        bounds.min.x < r.x + r.w / 2 + 0.15 &&
        bounds.max.x > r.x - r.w / 2 - 0.15 &&
        bounds.min.z < r.z + r.d / 2 + 0.15 &&
        bounds.max.z > r.z - r.d / 2 - 0.15,
    );
  const buckets = new Map<
    string,
    { kind: RiverPlant; matrices: T.Matrix4[] }
  >();
  const geometries = new Map<RiverPlant, T.BufferGeometry>();
  const material = new T.MeshStandardMaterial({
    vertexColors: true,
    side: T.DoubleSide,
    roughness: 0.62,
  });
  const transform = new T.Object3D();
  function plant(
    kind: RiverPlant,
    x: number,
    z: number,
    size = 1,
    angle = random() * Math.PI * 2,
  ) {
    const key = `${kind}:${Math.floor(x / 24)}:${Math.floor(z / 24)}`;
    transform.position.set(x, riverGroundHeight(x, z) ?? 0.02, z);
    transform.rotation.set(0, angle, 0);
    transform.scale.setScalar(size);
    transform.updateMatrix();
    bounds
      .copy(sharedRiverPlantGeometry(kind).boundingBox!)
      .applyMatrix4(transform.matrix);
    if (!clear()) return;
    if (!buckets.has(key)) buckets.set(key, { kind, matrices: [] });
    buckets.get(key)!.matrices.push(transform.matrix.clone());
  }
  const heliconias: RiverPlant[] = [
    "heliconia-red",
    "heliconia-pendant",
    "heliconia-gold",
    "heliconia-orange",
  ];
  for (let i = 2; i < riverSections.length - 2; i += 3) {
    const p = riverSections[i];
    for (const side of [-1, 1]) {
      const at = (distance: number) => ({
        x: p.x + p.nx * side * distance,
        z: p.z + p.nz * side * distance,
      });
      const fernKinds: RiverPlant[] = [
        "fern",
        "fern-ostrich",
        "fern-maidenhair",
        "fern-strap",
        "fern-silver",
      ];
      for (let row = 0; row < 4; row++) {
        const f = at(2.15 + row * 0.9 + random() * 0.25);
        for (let n = 0; n < 2; n++)
          plant(
            row === 0
              ? "fern-ostrich"
              : fernKinds[(i + row + n) % fernKinds.length],
            f.x + (random() - 0.5) * 0.65,
            f.z + (random() - 0.5) * 0.65,
            row === 0 ? 1 : 0.65 + random() * 0.4,
          );
      }
      const water = at(2.1 + random() * 1.1);
      if (riverBankDistance(water.x, water.z) < 3.4)
        for (let n = 0; n < 3; n++)
          plant(
            n === 0 ? "rush" : "sedge",
            water.x + (random() - 0.5) * 0.6,
            water.z + (random() - 0.5) * 0.6,
            0.85 + random() * 0.45,
          );
      if (i % 4 === 0) {
        const h = at(5.05 + random() * 0.55);
        plant(
          heliconias[Math.floor(i / 12) % 4],
          h.x,
          h.z,
          0.8 + random() * 0.25,
        );
      }
      if (i % 9 === 2) {
        const v = at(4.6 + random() * 0.5);
        plant(
          "passionflower",
          v.x,
          v.z,
          0.8 + random() * 0.2,
          side > 0 ? Math.atan2(p.nx, p.nz) : Math.atan2(-p.nx, -p.nz),
        );
      }
      if (random() < 0.48) {
        const d = at(4.1 + random() * 1.3);
        for (let n = 0; n < 2; n++)
          plant(
            "daisy",
            d.x + (random() - 0.5) * 0.6,
            d.z + (random() - 0.5) * 0.6,
            0.8 + random() * 0.35,
          );
      }
      if (i % 5 === 0) {
        const r = at(2.0 + random() * 1.3);
        plant("moss-rock", r.x, r.z, 1 + random() * 0.8);
      }
    }
  }
  const totals: Partial<Record<RiverPlant, number>> = {};
  for (const { kind, matrices } of buckets.values()) {
    if (!geometries.has(kind))
      geometries.set(kind, sharedRiverPlantGeometry(kind));
    const mesh = new T.InstancedMesh(
      geometries.get(kind)!,
      material,
      matrices.length,
    );
    mesh.name = kind.startsWith("fern")
      ? "bank-ferns"
      : kind === "rush" || kind === "sedge"
        ? "bank-reeds"
        : kind === "daisy"
          ? "bank-wildflowers"
          : `bank-${kind}`;
    mesh.userData.riverPlant = kind;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    mesh.castShadow = kind.startsWith("heliconia") || kind === "moss-rock";
    mesh.receiveShadow = true;
    vegetation.add(mesh);
    totals[kind] = (totals[kind] ?? 0) + matrices.length;
  }
  vegetation.userData.plants = totals;
  return {
    setDrought(dry: boolean) {
      material.color.set(dry ? "#a99c77" : "#ffffff");
      for (const child of vegetation.children) {
        const kind = child.userData.riverPlant as RiverPlant;
        if (
          kind === "daisy" ||
          kind === "passionflower" ||
          kind.startsWith("heliconia")
        )
          child.visible = !dry;
      }
    },
  };
}
