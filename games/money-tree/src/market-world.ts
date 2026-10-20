import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Rect } from "./game";
import type { Target } from "./world";
import { furnishingCatalog } from "./furnishings";
import { makeFurnishing } from "./furnishing-models";
import { ingredients } from "./meals";
import { makeGrocery } from "./grocery-models";
import { signCanvas } from "./signage";
export const marketShops = [
  {
    x: 104,
    z: -24,
    w: 24,
    d: 16,
    name: "Bright Side Home",
    id: "bright-side-home",
  },
  { x: 70, z: -24, w: 24, d: 16, name: "The Green Basket", id: "green-basket" },
] as const;
export const marketPaths: Rect[] = [
  { x: 55, z: -16, w: 5, d: 14 },
  { x: 87, z: -12, w: 64, d: 5 },
  { x: 70, z: -14, w: 5, d: 4 },
  { x: 104, z: -14, w: 5, d: 4 },
];
export function createMarketShops(
  scene: T.Scene,
  rects: Rect[],
  targets: Target[],
) {
  const roots: T.Group[] = [];
  const atlas = document.createElement("canvas");
  atlas.width = atlas.height = 2048;
  const context = atlas.getContext("2d")!;
  const map = new T.CanvasTexture(atlas);
  map.colorSpace = T.SRGBColorSpace;
  const signMaterial = new T.MeshBasicMaterial({ map });
  let labelIndex = 0;
  for (const shop of marketShops) {
    const root = new T.Group();
    root.name = shop.id;
    root.position.set(shop.x, 0, shop.z);
    scene.add(root);
    roots.push(root);
    const fixtures = new T.Group();
    root.add(fixtures);
    const materials = new Map<string, T.MeshStandardMaterial>();
    const box = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
      solid = false,
      wall = false,
    ) => {
      if (!materials.has(color))
        materials.set(
          color,
          new T.MeshStandardMaterial({ color, roughness: 0.8 }),
        );
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), materials.get(color));
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      (wall ? root : fixtures).add(m);
      if (wall) m.userData.cameraWall = true;
      if (solid)
        rects.push({
          x: shop.x + x,
          z: shop.z + z,
          w,
          d,
          ...(!wall ? { clearHeight: h } : {}),
        });
      return m;
    };
    box(
      0,
      0.025,
      0,
      24,
      0.05,
      16,
      shop.id === "bright-side-home" ? "#ead1a9" : "#c4c8b0",
    );
    for (const [x, z, w, d] of [
      [-12, 0, 0.22, 16],
      [12, 0, 0.22, 16],
      [0, -8, 24, 0.22],
      [-7.5, 8, 9, 0.22],
      [7.5, 8, 9, 0.22],
    ])
      box(x, 2.8, z, w, 5.6, d, "#f2dfb7", true, true);
    box(0, 5, 8, 6, 1.6, 0.22, "#f2dfb7", false, true);
    // Open roof keeps floor displays visible; thin beams give an airy showroom.
    for (const x of [-9, 0, 9]) box(x, 5.65, 0, 0.18, 0.18, 16, "#b98c69");
    const sign = (text: string, x: number, y: number, z: number, w: number) => {
      const column = labelIndex % 4,
        row = Math.floor(labelIndex++ / 4);
      context.drawImage(
        signCanvas(text, 512, 128),
        column * 512,
        row * 128,
        512,
        128,
      );
      const geometry = new T.PlaneGeometry(w, w / 4);
      const uv = geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          (column * 512 + 1 + uv.getX(i) * 510) / 2048,
          1 - (row * 128 + 127 - uv.getY(i) * 126) / 2048,
        );
      const mesh = new T.Mesh(geometry, signMaterial);
      mesh.position.set(x, y, z);
      fixtures.add(mesh);
    };
    sign(shop.name, 0, 5, 8.14, 12);
    targets.push({
      id: shop.id,
      x: shop.x,
      z: shop.z + 6,
      label: `Browse ${shop.name}`,
    });
    if (shop.id === "bright-side-home") {
      for (let n = 0; n < 40; n++)
        box(
          -11.7 + n * 0.6,
          2.8,
          -7.85,
          0.3,
          5.5,
          0.035,
          ["#f5bf50", "#f2969a", "#60b6ae", "#f4e1be"][n % 4],
        );
      const stock = furnishingCatalog.filter((f) => f.level < 4);
      stock.forEach((item, i) => {
        const x = -9 + (i % 4) * 6,
          z = -5.7 + Math.floor(i / 4) * 2.85;
        box(
          x,
          0.09,
          z,
          4.7,
          0.12,
          2.75,
          ["#f3c5b5", "#a2d2c2", "#eac15e", "#b4a4ce"][i % 4],
        );
        const model = makeFurnishing(item.id);
        model.position.set(x, 0.16, z);
        if (item.wall) {
          model.position.y = 1.25;
          box(x, 0.7, z + 0.1, 0.08, 1.4, 0.08, "#bc8f57");
        }
        model.userData.product = item.id;
        root.add(model);
        rects.push({
          x: shop.x + x,
          z: shop.z + z,
          w: Math.max(1, item.w),
          d: Math.max(0.7, item.d),
          clearHeight: 1.8,
        });
        targets.push({
          id: `home-display-${item.id}`,
          x: shop.x + x,
          z: shop.z + z + 1.7,
          label: `Browse ${item.name}`,
        });
        sign(`${item.name} · $${item.price / 100}`, x, 0.55, z + 1.45, 3.7);
      });
    } else {
      ingredients.forEach((item, i) => {
        const x = -9 + (i % 5) * 4.5,
          z = -5.7 + Math.floor(i / 5) * 3.3;
        box(x, 0.6, z, 3.3, 1.2, 2, "#a9855b", true);
        box(x, 1.23, z, 3.45, 0.08, 2.15, "#425e48");
        for (let j = 0; j < 12; j++) {
          const model = makeGrocery(item);
          model.position.set(
            x - 1.15 + (j % 4) * 0.77,
            1.29,
            z - 0.58 + Math.floor(j / 4) * 0.57,
          );
          fixtures.add(model);
        }
        sign(`${item} · $1`, x, 0.87, z + 1.025, 2.8);
        targets.push({
          id: `grocery-display-${item}`,
          x: shop.x + x,
          z: shop.z + z + 1.65,
          label: `Browse ${item}`,
        });
      });
      sign("Vegetarian produce & pantry", 0, 4, -7.84, 12);
    }
    // Bake static fixtures by appearance once, retaining product targets and walls.
    fixtures.updateWorldMatrix(true, true);
    const labels = fixtures.children.filter(
      (o): o is T.Mesh => o instanceof T.Mesh && o.material === signMaterial,
    );
    const labelGeometry = mergeGeometries(
      labels.map((m) => {
        const g = m.geometry.index
          ? m.geometry.toNonIndexed()
          : m.geometry.clone();
        return g.applyMatrix4(m.matrix);
      }),
    );
    for (const m of labels) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    if (labelGeometry) fixtures.add(new T.Mesh(labelGeometry, signMaterial));
    const batches = new Map<
      string,
      { material: T.MeshStandardMaterial; geometries: T.BufferGeometry[] }
    >();
    fixtures.traverse((o) => {
      if (
        !(o instanceof T.Mesh) ||
        !(o.material instanceof T.MeshStandardMaterial) ||
        o.material.map ||
        o.material.transparent
      )
        return;
      const key = `${o.material.color.getHex()}:${o.material.roughness}:${o.material.metalness}`;
      if (!batches.has(key))
        batches.set(key, { material: o.material, geometries: [] });
      const g = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      const matrix = new T.Matrix4()
        .copy(fixtures.matrixWorld)
        .invert()
        .multiply(o.matrixWorld);
      batches.get(key)!.geometries.push(g.applyMatrix4(matrix));
    });
    const remove: T.Mesh[] = [];
    fixtures.traverse((o) => {
      if (
        o instanceof T.Mesh &&
        o.material instanceof T.MeshStandardMaterial &&
        !o.material.map &&
        !o.material.transparent
      )
        remove.push(o);
    });
    for (const m of remove) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    for (const { material, geometries } of batches.values()) {
      const geometry = mergeGeometries(geometries);
      geometries.forEach((g) => g.dispose());
      if (geometry) {
        const m = new T.Mesh(geometry, material);
        m.castShadow = m.receiveShadow = true;
        fixtures.add(m);
      }
    }
  }
  map.needsUpdate = true;
  return roots;
}
