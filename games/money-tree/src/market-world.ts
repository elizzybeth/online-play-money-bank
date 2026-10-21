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
  occluders: T.Object3D[],
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
      if (wall) {
        m.userData.cameraWall = true;
        occluders.push(m);
      }
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
      box(
        x,
        shop.id === "green-basket" && z === 8 ? 0.3 : 2.8,
        z,
        w,
        shop.id === "green-basket" && z === 8 ? 0.6 : 5.6,
        d,
        "#f2dfb7",
        true,
        true,
      );
    box(0, 5, 8, 6, 1.6, 0.22, "#f2dfb7", false, true);
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
    sign(shop.name, 0, 5, 8.34, 9);
    targets.push({
      id: shop.id,
      x: shop.x,
      z: shop.z + 6,
      label: `Browse ${shop.name}`,
    });
    if (shop.id === "bright-side-home") {
      // Four furnished rooms around a generous cross aisle; no isolated pedestals.
      const rooms = [
        {
          x: -6,
          z: -4,
          color: "#be694e",
          rug: "#c99a64",
          title: "Warm & gathered",
        },
        {
          x: 6,
          z: -4,
          color: "#7c9fa7",
          rug: "#cbd6ce",
          title: "Restful blue",
        },
        {
          x: -6,
          z: 3,
          color: "#e9b348",
          rug: "#d4af80",
          title: "Sunny suppers",
        },
        {
          x: 6,
          z: 3,
          color: "#9e88b1",
          rug: "#b7c7b2",
          title: "Small space, big ideas",
        },
      ];
      for (const room of rooms) {
        box(room.x, 0.075, room.z, 8.7, 0.05, 5.4, room.rug);
        for (let n = 0; n < (room.x < 0 ? 12 : 2); n++)
          box(
            room.x - 4 + n * (room.x < 0 ? 0.72 : 8),
            0.105,
            room.z,
            0.06,
            0.012,
            5.35,
            "#f7e9ce",
          );
        box(room.x, 1.3, room.z - 2.75, 9, 2.6, 0.14, room.color, true, true);
        box(
          room.x - 4.5,
          0.95,
          room.z - 1.8,
          0.14,
          1.9,
          1.9,
          room.color,
          true,
          true,
        );
        sign(room.title, room.x, 2.18, room.z - 2.65, 3.3);
      }
      const place = (
        id: import("./furnishings").FurnishingId,
        x: number,
        z: number,
        y = 0.12,
        rotation = 0,
      ) => {
        const item = furnishingCatalog.find((f) => f.id === id)!;
        const model = makeFurnishing(id);
        model.position.set(x, y, z);
        model.rotation.y = rotation;
        model.userData.product = id;
        fixtures.add(model);
        if (!item.wall && !id.includes("rug") && y < 0.3)
          rects.push({
            x: shop.x + x,
            z: shop.z + z,
            w:
              Math.abs(Math.cos(rotation)) * item.w +
              Math.abs(Math.sin(rotation)) * item.d,
            d:
              Math.abs(Math.sin(rotation)) * item.w +
              Math.abs(Math.cos(rotation)) * item.d,
            clearHeight: 1.5,
          });
        targets.push({
          id: `home-display-${id}`,
          x: shop.x + x,
          z: shop.z + z + Math.min(1.3, item.d / 2 + 0.6),
          label: `Browse ${item.name}`,
        });
      };
      place("everyday-sofa", -6, -5.6);
      place("coffee-table", -6, -3.5);
      place("chair", -8.8, -3.6, 0.12, 0.5);
      place("pouf", -3.5, -3.4);
      place("woven-pendant", -9.6, -5.5);
      place("monstera", -2.5, -5.8);
      place("sunset", -6, -6.64, 1.65);
      place("botanical", -8, -6.64, 1.65);
      place("everyday-bed", 5.4, -4.4);
      place("bedside-table", 7, -5.4);
      place("jewel-lamp", 7, -5.4, 0.79);
      place("oak-sideboard", 9.1, -5.9);
      place("seascape", 9, -6.64, 1.8);
      place("snake", 9.5, -3.2);
      place("tulip-table", -6, 3.2);
      place("yellow-chair", -7.5, 3.1, 0.12, -Math.PI / 2);
      place("yellow-chair", -4.5, 3.1, 0.12, Math.PI / 2);
      place("pink-locker", -8.8, 0.9);
      place("striped-vase", -6, 3.2, 1.1);
      place("balloon-dog", -8.8, 0.9, 1.8);
      place("color-gallery", -5.5, 0.35, 1.6);
      place("writing-desk", 5.1, 1.1);
      place("yellow-chair", 5.1, 2.4, 0.12, Math.PI);
      place("open-bookcase", 8.8, 1);
      place("pothos", 9.3, 4.4);
      place("rug", 6, 4.6);
      place("geometric", 6, 0.35, 1.7);
      sign(
        "Explore four rooms · everything is for your home",
        0,
        4.5,
        -7.84,
        9,
      );
    } else {
      // Modern grocery frontage: panel cladding, warm timber fascia and glazed doors.
      for (const x of [-7.5, 7.5]) {
        box(x, 0.3, 8.13, 8.7, 0.55, 0.04, "#d2d7d8", false, true);
        for (const dx of [-4, -2, 0, 2, 4])
          box(x + dx, 2, 8.19, 0.06, 3.6, 0.05, "#d2d7d8", false, true);
      }
      box(0, 4.1, 8.2, 24, 0.7, 0.25, "#ad7951", false, true);
      box(0, 3.65, 8.7, 24, 0.16, 1.8, "#e0e2dc", false, true);
      for (const x of [-2.95, 2.95])
        box(x, 1.8, 8.16, 0.1, 3.6, 0.15, "#d2d7d8", false, true);
      const glass = new T.MeshPhysicalMaterial({
        color: "#a7cfce",
        transparent: true,
        opacity: 0.33,
        roughness: 0.12,
        metalness: 0.05,
      });
      for (const x of [-7.5, 7.5]) {
        const pane = new T.Mesh(new T.BoxGeometry(8.5, 3.3, 0.035), glass);
        pane.position.set(x, 1.9, 8.24);
        pane.userData.cameraWall = true;
        root.add(pane);
        occluders.push(pane);
      }
      sign("FRESH PRODUCE", -5, 3.8, -7.83, 6);
      sign("PANTRY & EVERYDAY", 6, 3.8, -7.83, 6);
      const produce = ingredients.filter(
        (item) =>
          ![
            "eggs",
            "rice",
            "beans",
            "tortillas",
            "black beans",
            "red beans",
            "pinto beans",
          ].includes(item),
      );
      produce.forEach((item, i) => {
        const x = -10.2 + (i % 7) * 3.4,
          z = i < 7 ? -6.65 : -3.6;
        // Three stepped shelves, filled crates and small shelf-edge labels.
        box(x, 0.16, z, 3.15, 0.22, 1.5, "#8b6545");
        box(x, 1, z - 0.68, 3.15, 1.9, 0.1, "#8b6545");
        rects.push({
          x: shop.x + x,
          z: shop.z + z,
          w: 3.15,
          d: 1.5,
          clearHeight: 1.7,
        });
        for (let tier = 0; tier < 3; tier++) {
          const shelfZ = z + 0.5 - tier * 0.45,
            y = 0.55 + tier * 0.55;
          box(x, y, shelfZ, 3.1, 0.1, 0.65, "#c69b64");
          for (const dx of [-1.48, 1.48])
            box(x + dx, y + 0.18, shelfZ, 0.06, 0.32, 0.65, "#ae8052");
          for (let n = 0; n < 6; n++) {
            const m = makeGrocery(item);
            m.scale.setScalar(0.68);
            m.position.set(x - 1.15 + n * 0.46, y + 0.06, shelfZ);
            fixtures.add(m);
          }
        }
        sign(`${item} · $1`, x, 0.95, z + 0.78, 2.2);
        targets.push({
          id: `grocery-display-${item}`,
          x: shop.x + x,
          z: shop.z + z + 1.55,
          label: `Browse ${item}`,
        });
      });
      const pantry = ingredients.filter((item) => !produce.includes(item));
      pantry.forEach((item, i) => {
        const x = -9 + (i % 4) * 5.7,
          z = i < 4 ? 0.2 : 3.7;
        box(x, 0.95, z - 0.45, 3.6, 1.9, 0.08, "#364d51");
        rects.push({
          x: shop.x + x,
          z: shop.z + z,
          w: 3.6,
          d: 0.95,
          clearHeight: 1.9,
        });
        for (let tier = 0; tier < 4; tier++) {
          const y = 0.25 + tier * 0.48;
          box(x, y, z + 0.05, 3.7, 0.08, 1.1, "#d5c7ad");
          for (let n = 0; n < 14; n++) {
            const m = makeGrocery(item);
            m.scale.setScalar(0.6);
            m.position.set(
              x - 1.45 + (n % 7) * 0.48,
              y + 0.05,
              z - 0.12 + Math.floor(n / 7) * 0.42,
            );
            fixtures.add(m);
          }
        }
        sign(`${item} · $1`, x, 1.9, z + 0.56, 2.6);
        targets.push({
          id: `grocery-display-${item}`,
          x: shop.x + x,
          z: shop.z + z + 1.2,
          label: `Browse ${item}`,
        });
      });
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
