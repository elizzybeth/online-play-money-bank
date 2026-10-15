import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { makeFurnishing } from "./furnishing-models";
import { furnitureById, type FurnishingId } from "./furnishings";
import type { Rect } from "./game";
import { signCanvas } from "./signage";
export function makeMarvelsShowroom() {
  const root = new T.Group();
  root.name = "Mansion Marvels";
  const obstacles: Rect[] = [],
    mats = new Map<string, T.MeshStandardMaterial>();
  const fixtures = new T.Group();
  root.add(fixtures);
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
  ) {
    let mat = mats.get(c);
    if (!mat) {
      mat = new T.MeshStandardMaterial({ color: c, roughness: 0.8 });
      mats.set(c, mat);
    }
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    fixtures.add(m);
    return m;
  }
  box(0, 0.005, 0, 20, 0.04, 18, "#d2cbbd");
  // Three pale walls and warm vertical oak slats frame open, walkable vignettes.
  for (const [x, z, w, d] of [
    [-10, 0, 0.24, 18],
    [10, 0, 0.24, 18],
    [0, -9, 20, 0.24],
  ]) {
    box(x, 2.5, z, w, 5, d, "#e5dfd2");
    obstacles.push({ x, z, w, d });
  }
  for (let i = 0; i < 48; i++)
    box(-9.65 + i * 0.41, 2.2, -8.8, 0.095, 4.35, 0.11, "#aa8c68");
  for (const x of [-9.8, 9.8]) {
    for (const z of [-3, 3]) {
      box(x, 2.5, z, 0.04, 3.5, 4.4, "#c7d7d0");
      for (let j = -1; j <= 1; j++)
        box(
          x + (x < 0 ? 0.03 : -0.03),
          2.5,
          z + j * 1.4,
          0.05,
          3.6,
          0.045,
          "#5d6660",
        );
      box(x + (x < 0 ? 0.03 : -0.03), 2.5, z, 0.05, 0.045, 4.5, "#5d6660");
    }
  }
  // The front courtyard arch echoes the garden reference without closing the entrance.
  for (const x of [-9.3, 9.3]) box(x, 2.5, 8.7, 0.35, 5, 0.35, "#d8ccba");
  const arch = new T.Mesh(
    new T.TorusGeometry(4.7, 0.1, 8, 48, Math.PI),
    new T.MeshStandardMaterial({ color: "#d8ccba" }),
  );
  arch.position.set(0, 4.6, 8.7);
  arch.scale.y = 0.25;
  fixtures.add(arch);
  const roof = new T.Group();
  roof.name = "marvels-roof";
  root.add(roof);
  for (const x of [-7.2, 7.2]) {
    const m = box(x, 5.05, 0, 5.6, 0.12, 18, "#b19b7a");
    fixtures.remove(m);
    roof.add(m);
  }
  const lightMat = new T.MeshStandardMaterial({
    color: "#fff4d4",
    emissive: "#fff2cb",
    emissiveIntensity: 0.65,
  });
  for (let i = 0; i < 3; i++) {
    const curve = new T.CatmullRomCurve3(
      Array.from({ length: 49 }, (_, j) => {
        const a = (j / 48) * Math.PI * 2;
        return new T.Vector3(
          Math.cos(a) * (2.8 - i * 0.35),
          4.7 - Math.sin(a) * Math.sin(a) * (0.8 + i * 0.2),
          Math.sin(a) * (1.5 - i * 0.1) + (i - 1) * 2,
        );
      }),
    );
    const loop = new T.Mesh(
      new T.TubeGeometry(curve, 64, 0.035, 6, true),
      lightMat,
    );
    fixtures.add(loop);
  }
  const display: {
    id: FurnishingId;
    x: number;
    z: number;
    rotation?: number;
    y?: number;
  }[] = [
    { id: "royal-bed", x: -7, z: -5 },
    { id: "gilded-chair", x: -3.7, z: -5 },
    { id: "marble-planter", x: -1.7, z: -6.2 },
    { id: "palace-rug", x: -4.2, z: -4.5 },
    { id: "gilded-painting", x: 0, z: -8.65, y: 2.6 },
    { id: "chesterfield", x: 5.3, z: -5.7 },
    { id: "oval-table", x: 5.3, z: -3.65 },
    { id: "wire-chair", x: 3.3, z: -2.1, rotation: 0.4 },
    { id: "petal-chair", x: 7.8, z: -2.1, rotation: -0.4 },
    { id: "linen-sectional", x: -5, z: 1.5 },
    { id: "linen-rug", x: -5, z: 2.5 },
    { id: "woven-ottoman", x: -3, z: 3.5 },
    { id: "arc-lamp", x: -7.8, z: 2.2 },
    { id: "olive-planter", x: 6.8, z: 4.8 },
  ];
  for (const f of display) {
    const model = makeFurnishing(f.id);
    model.position.set(f.x, f.y ?? (f.id.includes("rug") ? 0.04 : 0), f.z);
    model.rotation.y = f.rotation ?? 0;
    model.userData.marvelsProduct = f.id;
    root.add(model);
    const item = furnitureById(f.id);
    if (!item.wall && !f.id.includes("rug"))
      obstacles.push({ x: f.x, z: f.z, w: item.w, d: item.d });
  }
  const sign = new T.Mesh(
    new T.PlaneGeometry(6.5, 0.8),
    new T.MeshBasicMaterial({
      map: new T.CanvasTexture(signCanvas("Mansion Marvels", 1024, 128)),
    }),
  );
  sign.position.set(0, 4.45, 8.9);
  root.add(sign);
  // Slats, window bars and room trim are batched once; no extra animated lights.
  fixtures.updateMatrixWorld(true);
  for (const mat of [...mats.values(), lightMat]) {
    const meshes = fixtures.children.filter(
      (o): o is T.Mesh => o instanceof T.Mesh && o.material === mat,
    );
    if (meshes.length < 2) continue;
    const geo = mergeGeometries(
      meshes.map((m) => {
        const copy = m.geometry.index
          ? m.geometry.toNonIndexed()
          : m.geometry.clone();
        return copy.applyMatrix4(m.matrix);
      }),
    );
    if (!geo) continue;
    for (const m of meshes) {
      fixtures.remove(m);
      m.geometry.dispose();
    }
    const merged = new T.Mesh(geo, mat);
    merged.castShadow = merged.receiveShadow = true;
    fixtures.add(merged);
  }
  return { root, roof, obstacles, display };
}
