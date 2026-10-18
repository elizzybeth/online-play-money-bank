import { makeFarmSign } from "./farm-sign";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mazeWalls, mazeEntrance, mazeExit, mazePacket } from "./farm-layout";
import { makeSeedPacket } from "./seed-packet";
import { surfaceMaterial } from "./textures";
import { pitchedRoof } from "./architecture";
import { signCanvas } from "./signage";
import type { Rect } from "./game";
import type { Target } from "./world";
export function createFarm(scene: T.Scene, rects: Rect[], targets: Target[]) {
  const root = new T.Group();
  root.name = "robertsons-farm";
  scene.add(root);
  const mats = new Map<string, T.MeshStandardMaterial>();
  const mat = (color: string) => {
    if (!mats.has(color))
      mats.set(color, new T.MeshStandardMaterial({ color, roughness: 0.86 }));
    return mats.get(color)!;
  };
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    solid = false,
  ) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(color));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    root.add(m);
    if (solid) rects.push({ x, z, w, d });
    return m;
  };
  const sign = (
    text: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
  ) => {
    const tex = new T.CanvasTexture(signCanvas(text, 1536, 640));
    tex.colorSpace = T.SRGBColorSpace;
    const mesh = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  };
  // Red board-and-batten cottage, a steep shingled gable and a welcoming porch.
  const x = -69,
    z = -15;
  box(x, 0.14, z, 8, 0.28, 7, "#75563f", true);
  box(x, 2.1, z - 3.5, 8, 4.2, 0.22, "#a33329", true);
  for (const side of [-1, 1])
    box(x + side * 4, 2.1, z, 0.22, 4.2, 7, "#a33329", true);
  for (const dx of [-2.6, 2.6])
    box(x + dx, 2.1, z + 3.5, 2.8, 4.2, 0.22, "#a33329", true);
  box(x, 3.55, z + 3.5, 2.4, 1.3, 0.22, "#a33329");
  const roof = new T.Mesh(
    pitchedRoof(8.8, 8, 3.2),
    surfaceMaterial("#414b4b", "shingles", 4, 4),
  );
  roof.position.set(x, 4.25, z);
  root.add(roof);
  const gableShape = new T.Shape();
  gableShape.moveTo(-4.1, 0);
  gableShape.lineTo(0, 3);
  gableShape.lineTo(4.1, 0);
  gableShape.closePath();
  const gable = new T.Mesh(new T.ShapeGeometry(gableShape), mat("#a33329"));
  gable.position.set(x, 4.25, z + 4.02);
  root.add(gable);
  box(x, 5.25, z + 4.07, 1.25, 1.5, 0.06, "#f4dfac");
  box(x, 5.25, z + 4.12, 1, 1.25, 0.03, "#dcb06d");
  box(x, 5.25, z + 4.15, 0.05, 1.25, 0.02, "#f4dfac");
  box(x, 5.25, z + 4.15, 1, 0.05, 0.02, "#f4dfac");
  for (const side of [-1, 1]) {
    box(x + side * 4.13, 2.1, z, 0.04, 1.7, 1.6, "#f4dfac");
    box(x + side * 4.16, 2.1, z, 0.025, 1.4, 1.3, "#dfb76b");
    box(x + side * 1.3, 2.75, z + 3.84, 0.15, 0.15, 0.3, "#3a3830");
    const lamp = new T.Mesh(
      new T.BoxGeometry(0.18, 0.35, 0.18),
      new T.MeshStandardMaterial({
        color: "#ffe6a1",
        emissive: "#f6b35e",
        emissiveIntensity: 0.8,
      }),
    );
    lamp.position.set(x + side * 1.3, 2.5, z + 3.95);
    root.add(lamp);
    if (side === 1)
      for (const dx of [-3.8, -1.8, 1.8, 3.8]) {
        const pot = new T.Mesh(
          new T.CylinderGeometry(0.2, 0.14, 0.35, 10),
          mat("#a96846"),
        );
        pot.position.set(x + dx, 0.4, z + 4.85);
        root.add(pot);
        for (let i = 0; i < 3; i++) {
          const flower = new T.Mesh(
            new T.SphereGeometry(0.09, 6, 4),
            mat(i % 2 ? "#d0a0ca" : "#e9d183"),
          );
          flower.position.set(
            x + dx + Math.cos(i * 2.1) * 0.12,
            0.68,
            z + 4.85 + Math.sin(i * 2.1) * 0.12,
          );
          root.add(flower);
        }
      }
  }
  for (let dx = -3.8; dx <= 3.8; dx += 0.45)
    for (const side of [-1, 1])
      box(x + dx, 2.1, z + side * 3.64, 0.055, 4.1, 0.06, "#c34b37");
  box(x, 1.35, z + 3.65, 1.6, 2.7, 0.16, "#79291f");
  box(x, 1.85, z + 3.75, 1.1, 1.15, 0.025, "#e9be72");
  for (const dx of [-2.5, 2.5]) {
    box(x + dx, 2.1, z + 3.73, 1.5, 1.7, 0.11, "#f4dfac");
    box(x + dx, 2.1, z + 3.8, 1.25, 1.45, 0.035, "#dfb76b");
    box(x + dx, 2.1, z + 3.84, 0.055, 1.5, 0.025, "#f4dfac");
    box(x + dx, 2.1, z + 3.84, 1.3, 0.055, 0.025, "#f4dfac");
  }
  box(x, 0.16, z + 4.5, 9, 0.16, 2, "#ac8055");
  for (const dx of [-3.8, 3.8]) {
    box(x + dx, 0.85, z + 4.7, 0.13, 1.5, 0.13, "#ead1a1");
    box(x + dx, 0.95, z + 4.4, 0.12, 0.12, 2, "#ead1a1");
    box(x + dx * 0.7, 0.5, z + 4.2, 0.85, 0.14, 0.85, "#ead1a1");
    box(x + dx * 0.7, 0.92, z + 3.85, 0.85, 0.85, 0.12, "#ead1a1");
  }
  const farmSign = makeFarmSign();
  farmSign.position.set(x + 6.4, 3.1, z);
  farmSign.rotation.y = Math.PI / 2;
  root.add(farmSign);
  box(x + 5.4, 4.7, z, 3, 0.12, 0.12, "#292b27");
  for (const dz of [-1.5, 1.5])
    box(x + 6.4, 4.15, z + dz, 0.035, 1.1, 0.035, "#292b27");
  box(-88, 0.018, -47.5, 70.4, 0.025, 32, "#6b6041");
  // The entrance post stands beside the opening, never through its lettering.
  box(
    mazeEntrance.x + 0.8,
    1.8,
    mazeEntrance.z + 2.5,
    0.18,
    3.6,
    0.18,
    "#72543a",
  );
  const entry = sign(
    "CORN MAZE ENTRANCE",
    mazeEntrance.x + 0.8,
    2.8,
    mazeEntrance.z + 2.65,
    3.8,
    2.1,
  );
  entry.name = "corn-maze-entrance-sign";
  sign("EXIT ONLY →", mazeExit.x + 1.7, 1.4, mazeExit.z - 1.4, 2.6, 0.65);
  box(mazeExit.x, 0.75, mazeExit.z - 3.05, 0.15, 1.5, 0.15, "#92734c");
  const gate = new T.Group();
  gate.position.set(mazeExit.x, 1, mazeExit.z - 3.05);
  root.add(gate);
  const bar = new T.Mesh(new T.BoxGeometry(0.1, 0.13, 6.1), mat("#92734c"));
  bar.position.z = 3.05;
  gate.add(bar);
  // Directional turnstile: visible swinging leaves, blocks entry from outside.
  rects.push({ x: mazeExit.x, z: mazeExit.z, w: 0.2, d: 6.4, exitEast: true });
  rects.push(...mazeWalls.map((r) => ({ ...r })));
  const stalkMatrices: T.Matrix4[] = [],
    leafMatrices: T.Matrix4[] = [],
    cobMatrices: T.Matrix4[] = [];
  const o = new T.Object3D();
  const place = (
    list: T.Matrix4[],
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    ry = 0,
  ) => {
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.rotation.set(0, ry, 0);
    o.updateMatrix();
    list.push(o.matrix.clone());
  };
  for (const wall of mazeWalls) {
    const count = Math.ceil(Math.max(wall.w, wall.d) / 0.42);
    for (let i = 0; i < count; i++)
      for (const side of [-1, 0, 1]) {
        const t = (i + 0.5) / count - 0.5,
          x = wall.x + (wall.w > wall.d ? t * wall.w : side * 0.24),
          z = wall.z + (wall.d > wall.w ? t * wall.d : side * 0.24),
          h = 4.7 + (i % 5) * 0.18;
        place(stalkMatrices, x, h / 2, z, 0.055, h, 0.055);
        for (let j = 0; j < 6; j++)
          place(
            leafMatrices,
            x + Math.sin(j * 2.4 + i) * 0.26,
            1.25 + j * 0.61,
            z + Math.cos(j * 2.4 + i) * 0.26,
            0.85,
            0.22,
            0.22,
            j * 2.4 + i,
          );
        place(cobMatrices, x + 0.11, 2.4, z, 0.095, 0.35, 0.095);
      }
  }
  const batch = (
    geo: T.BufferGeometry,
    color: string,
    list: T.Matrix4[],
    name: string,
  ) => {
    const tiles = new Map<string, T.Matrix4[]>();
    for (const matrix of list) {
      const key = name.startsWith("corn-")
        ? `${Math.floor(matrix.elements[12] / 12)},${Math.floor(matrix.elements[14] / 12)}`
        : "all";
      const tile = tiles.get(key) ?? [];
      tile.push(matrix);
      tiles.set(key, tile);
    }
    for (const tile of tiles.values()) {
      const m = new T.InstancedMesh(geo, mat(color), tile.length);
      m.name = name;
      tile.forEach((v, i) => m.setMatrixAt(i, v));
      m.castShadow = m.receiveShadow = true;
      m.computeBoundingSphere();
      root.add(m);
    }
  };
  // A tapered leaf is two triangles instead of a flattened sphere (36).
  // Thousands of plants remain detailed without costly invisible back geometry.
  const cornLeaf = new T.BufferGeometry();
  cornLeaf.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [-1, 0, 0, 0, 0.5, -1, 1, 0.9, 0, 0, 0.5, 1],
      3,
    ),
  );
  cornLeaf.setIndex([0, 1, 2, 0, 2, 3]);
  cornLeaf.computeVertexNormals();
  mat("#5c873c").side = T.DoubleSide;
  batch(
    new T.CylinderGeometry(0.75, 1, 1, 4, 1, true),
    "#90a44f",
    stalkMatrices,
    "corn-stalks",
  );
  batch(cornLeaf, "#5c873c", leafMatrices, "corn-leaves");
  batch(new T.SphereGeometry(1, 4, 2), "#dfc65f", cobMatrices, "corn-cobs");
  // Two orderly carrot plots beside the farmhouse, with orange shoulders.
  const carrots: T.Matrix4[] = [],
    tops: T.Matrix4[] = [];
  for (const px of [-82, -56]) {
    box(px, 0.025, -19, 8, 0.05, 8, "#7b5b3a");
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 11; col++) {
        const cx = px - 3.2 + col * 0.64,
          cz = -22 + row * 1.4;
        place(carrots, cx, 0.08, cz, 0.12, 0.2, 0.12);
        for (let j = 0; j < 3; j++)
          place(tops, cx, 0.35, cz, 0.08, 0.45, 0.35, j * 2.1);
      }
  }
  batch(new T.ConeGeometry(1, 1, 6), "#e3953d", carrots, "farm-carrots");
  batch(new T.SphereGeometry(1, 5, 3), "#4d8139", tops, "carrot-tops");
  const gourds: T.Matrix4[] = [],
    cabbages: T.Matrix4[] = [],
    stalks: T.Matrix4[] = [],
    petals: T.Matrix4[] = [];
  for (const [index, px] of [-118, -105, -92].entries()) {
    box(px, 0.025, -18, 9, 0.05, 7, "#7b5b3a");
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 6; col++) {
        const cx = px - 3.4 + col * 1.35,
          cz = -20.5 + row * 1.6;
        if (index === 0) {
          place(gourds, cx, 0.32, cz, 0.48, 0.38, 0.43, col);
          place(stalks, cx, 0.73, cz, 0.045, 0.28, 0.045);
        } else if (index === 1) {
          for (let k = 0; k < 5; k++)
            place(
              cabbages,
              cx + Math.sin(k * 2.4) * 0.14,
              0.24,
              cz + Math.cos(k * 2.4) * 0.14,
              0.28,
              0.27,
              0.18,
              k * 2.4,
            );
        } else {
          place(stalks, cx, 0.9, cz, 0.035, 1.8, 0.035);
          for (let k = 0; k < 7; k++)
            place(
              petals,
              cx + Math.sin(k * 0.9) * 0.19,
              1.8 + Math.cos(k * 0.9) * 0.19,
              cz,
              0.13,
              0.19,
              0.06,
              k * 0.9,
            );
        }
      }
  }
  batch(new T.SphereGeometry(1, 8, 5), "#d67c32", gourds, "farm-pumpkins");
  batch(new T.SphereGeometry(1, 6, 4), "#709852", cabbages, "farm-cabbages");
  batch(
    new T.CylinderGeometry(1, 1, 1, 5),
    "#4e713a",
    stalks,
    "farm-crop-stems",
  );
  batch(new T.SphereGeometry(1, 5, 3), "#e7bc43", petals, "farm-sunflowers");
  const seed = makeSeedPacket();
  seed.position.set(mazePacket.x, 0.2, mazePacket.z);
  seed.name = "maze-seed-packet";
  root.add(seed);
  targets.push({
    id: "maze-seeds",
    ...mazePacket,
    label: "Collect the corn maze seed packet",
  });
  // Batch static cottage pieces by material to keep the expansion inexpensive.
  const groups = new Map<T.Material, T.BufferGeometry[]>();
  root.updateMatrixWorld(true);
  for (const child of [...root.children])
    if (
      child instanceof T.Mesh &&
      !(child instanceof T.InstancedMesh) &&
      child.geometry instanceof T.BoxGeometry
    ) {
      const m = child.material as T.Material;
      const list = groups.get(m) ?? [];
      list.push(child.geometry.clone().applyMatrix4(child.matrix));
      groups.set(m, list);
      child.geometry.dispose();
      root.remove(child);
    }
  for (const [m, geos] of groups) {
    const mesh = new T.Mesh(mergeGeometries(geos)!, m);
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    geos.forEach((g) => g.dispose());
  }
  // Static meshes retain their already-computed transforms. The gate stays dynamic.
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o !== root && o !== gate && o.parent !== gate) {
      o.matrixAutoUpdate = false;
      o.matrixWorldAutoUpdate = false;
    }
  });
  return {
    root,
    seed,
    update(p: { x: number; z: number }) {
      const open =
        p.x < mazeExit.x + 0.8 &&
        Math.hypot(p.x - mazeExit.x, p.z - mazeExit.z) < 3;
      gate.rotation.y = open ? Math.PI / 2 : 0;
    },
  };
}
