import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
/** One Child spends their tithes on a glass-and-concrete, Geisel-inspired estate. */
export function buildGeiselMansion(home: T.Group) {
  home.name = "Geisel-inspired mansion";
  home.userData.architecture = "geisel";
  const concrete = new T.MeshStandardMaterial({
    color: "#bcb7a6",
    roughness: 0.85,
  });
  const frames = new T.MeshStandardMaterial({
    color: "#283e47",
    roughness: 0.45,
    metalness: 0.45,
  });
  const glass = new T.MeshStandardMaterial({
    color: "#82b3c7",
    metalness: 0.6,
    roughness: 0.2,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  });
  const green = new T.MeshStandardMaterial({ color: "#536a3c", roughness: 1 });
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: T.Material,
    name?: string,
  ) {
    const p = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    p.position.set(x, y, z);
    p.castShadow = true;
    p.receiveShadow = true;
    if (name) p.name = name;
    home.add(p);
    return p;
  }
  function beam(a: T.Vector3, b: T.Vector3, w: number, d: number) {
    const p = box(
      0,
      0,
      0,
      w,
      a.distanceTo(b),
      d,
      concrete,
      "splayed-concrete-support",
    );
    p.position.copy(a).add(b).multiplyScalar(0.5);
    p.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    return p;
  }
  // Low landscaped wings flank a recessed entrance and leave its approach clear.
  box(0, 0.1, 0, 44, 0.2, 30, concrete);
  for (const side of [-1, 1]) {
    box(side * 15, 1.7, 1, 12, 3.4, 27, frames);
    box(side * 15, 1.7, 14.58, 11.8, 2.8, 0.08, glass);
    for (let x = side * 15 - 5; x < side * 15 + 6; x += 2)
      box(x, 1.7, 14.65, 0.08, 2.8, 0.1, frames);
    box(side * 15, 3.55, 1, 12.4, 0.3, 27.4, concrete);
    box(side * 15, 3.75, 1, 11.8, 0.18, 26.8, green);
  }
  // Narrow central base, widening suspended floors, then stepped-back upper stories.
  box(0, 3, 0, 12, 6, 14, frames);
  box(0, 3, 7.05, 11.8, 5.2, 0.09, glass);
  box(0, 2.6, 15.08, 4, 5.2, 0.18, frames, "mansion-door");
  box(0, 5.7, 11, 9, 0.35, 10, concrete);
  for (const x of [-6, 6])
    for (const z of [-6, 6]) {
      beam(
        new T.Vector3(x, 0, z),
        new T.Vector3(x * 2.85, 11, z * 1.95),
        1.3,
        1.5,
      );
      beam(new T.Vector3(x, 0, z), new T.Vector3(x, 19, z), 1.15, 1.15);
    }
  const tiers = [
    { w: 19, d: 15 },
    { w: 31, d: 23 },
    { w: 44, d: 30 },
    { w: 37, d: 26 },
    { w: 29, d: 21 },
    { w: 21, d: 16 },
  ];
  tiers.forEach((tier, i) => {
    const floor = 6 + i * 3;
    const slab = box(
      0,
      floor,
      0,
      tier.w,
      0.55,
      tier.d,
      concrete,
      `cantilever-floor-${i}`,
    );
    slab.userData.tier = i;
    const w = tier.w - 1.3,
      d = tier.d - 1.3,
      y = floor + 1.45,
      h = 2.35;
    for (const side of [-1, 1]) {
      box(0, y, (side * d) / 2, w, h, 0.09, glass);
      box((side * w) / 2, y, 0, 0.09, h, d, glass);
      for (let x = -w / 2; x <= w / 2; x += 2.3)
        box(x, y, side * (d / 2 + 0.07), 0.09, h, 0.12, frames);
      for (let z = -d / 2; z <= d / 2; z += 2.3)
        box(side * (w / 2 + 0.07), y, z, 0.12, h, 0.09, frames);
      box(0, y + h / 2, (side * d) / 2, w, 0.1, 0.1, frames);
      box((side * w) / 2, y + h / 2, 0, 0.1, 0.1, d, frames);
    }
  });
  box(0, 24, 0, 22, 0.6, 17, concrete, "flat-crown-roof");
  // Broad exposed ribs emphasize the cantilevers beneath the widest floor.
  for (const x of [-18, -12, -6, 0, 6, 12, 18])
    box(x, 11.4, 0, 0.3, 0.9, 30, concrete);
  // Batch static concrete and mullions while retaining the operable door.
  home.updateMatrix();
  for (const mat of [concrete, frames, glass, green]) {
    const meshes = home.children.filter(
      (o): o is T.Mesh =>
        o instanceof T.Mesh && o.material === mat && o.name !== "mansion-door",
    );
    meshes.forEach((o) => o.updateMatrix());
    const geometry = mergeGeometries(
      meshes.map((o) => o.geometry.clone().applyMatrix4(o.matrix)),
    );
    if (geometry) {
      const batch = new T.Mesh(geometry, mat);
      batch.name = `geisel-${mat === glass ? "glass" : mat === concrete ? "concrete" : mat === green ? "roof-gardens" : "mullions"}`;
      batch.castShadow = mat !== glass;
      batch.receiveShadow = true;
      home.add(batch);
    }
    meshes.forEach((o) => {
      o.removeFromParent();
      o.geometry.dispose();
    });
  }
  home.userData.cantileverWidths = tiers.map((t) => t.w);
}
