import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Rect } from "./game";
import type { Target } from "./world";
import { furnishingCatalog } from "./furnishings";
import { makeFurnishing } from "./furnishing-models";
import { ingredients } from "./meals";
import { makeGrocery } from "./grocery-models";
import { signCanvas } from "./signage";
import { grocerySignCanvas } from "./grocery-signs";
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
        shop.id === "green-basket" && (z === 8 || x === -12) ? 0.15 : 2.8,
        z,
        w,
        shop.id === "green-basket" && (z === 8 || x === -12) ? 0.3 : 5.6,
        d,
        "#f2dfb7",
        true,
        true,
      );
    box(
      0,
      shop.id === "green-basket" ? 4.97 : 5,
      8,
      shop.id === "green-basket" ? 24 : 6,
      shop.id === "green-basket" ? 1.24 : 1.6,
      0.22,
      shop.id === "green-basket" ? "#e0e2dc" : "#f2dfb7",
      false,
      true,
    );
    if (shop.id === "green-basket") {
      const roof = box(0, 5.76, 0, 25.1, 0.32, 17.1, "#e0e2dc", false, true);
      roof.name = "green-basket-roof";
      roof.userData.roof = true;
      const fascia = roof.material;
      const top = new T.MeshStandardMaterial({
        color: "#626c6b",
        roughness: 0.9,
      });
      (roof as T.Mesh<T.BufferGeometry, T.Material | T.Material[]>).material = [
        fascia,
        fascia,
        top,
        fascia,
        fascia,
        fascia,
      ];
    }

    const sign = (text: string, x: number, y: number, z: number, w: number) => {
      const column = labelIndex % 4,
        row = Math.floor(labelIndex++ / 4);
      context.drawImage(
        shop.id === "green-basket"
          ? grocerySignCanvas(text, 512, 128)
          : signCanvas(text, 512, 128),
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
      return mesh;
    };
    if (shop.id === "green-basket") {
      const logo = new T.TextureLoader().load(
        new URL("./assets/green-basket-logo.webp", import.meta.url).href,
      );
      logo.colorSpace = T.SRGBColorSpace;
      const plaque = new T.Mesh(
        new T.PlaneGeometry(4.5, 1.5),
        new T.MeshBasicMaterial({ map: logo }),
      );
      plaque.name = "green-basket-logo";
      plaque.position.set(0, 4.65, 8.37);
      root.add(plaque);
    } else sign(shop.name, 0, 5, 8.34, 9);
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
        if (room.z < 0) {
          // Tall backdrops belong at the perimeter, leaving the middle open.
          box(room.x, 1.3, -6.95, 8.4, 2.6, 0.14, room.color, true, true);
          sign(room.title, room.x + 2.6, 2.2, -6.85, 2.2);
        } else {
          const side = room.x < 0 ? -1 : 1;
          box(side * 10.8, 1.3, room.z, 0.14, 2.6, 5.4, room.color, true, true);
          const title = sign(room.title, side * 10.68, 2.15, room.z, 2.7);
          title.rotation.y = (-side * Math.PI) / 2;
        }
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
      place("everyday-sofa", -6.2, -5.7);
      place("coffee-table", -6.2, -3.55);
      place("chair", -8.8, -3.8, 0.12, -1.2);
      place("pouf", -4.1, -3.1);
      place("woven-pendant", -9.3, -5.9);
      place("monstera", -2.8, -5.9);
      place("sunset", -6.2, -6.84, 1.65);
      place("botanical", -8, -6.84, 1.65);
      place("everyday-bed", 5.6, -4.6);
      place("bedside-table", 7.1, -5.6);
      place("jewel-lamp", 7.1, -5.6, 0.79);
      place("oak-sideboard", 9.25, -5.9);
      place("seascape", 5.6, -6.84, 1.8);
      place("snake", 9.5, -3.2);
      // Dining is an open island, with its storage and art against the side wall.
      place("tulip-table", -6, 3);
      place("yellow-chair", -6, 1.55, 0.12, Math.PI);
      place("yellow-chair", -6, 4.45, 0.12, 0);
      place("pink-locker", -10.2, 2.6, 0.12, Math.PI / 2);
      place("striped-vase", -6, 3, 1.1);
      place("balloon-dog", -10.2, 2.6, 1.8, Math.PI / 2);
      place("color-gallery", -10.68, 4.2, 1.55, Math.PI / 2);
      // Tall shelving at the east edge keeps the bedroom visible from the door.
      place("writing-desk", 10, 3.5, 0.12, -Math.PI / 2);
      place("yellow-chair", 8.75, 3.5, 0.12, -Math.PI / 2);
      place("open-bookcase", 10.35, 0.8, 0.12, -Math.PI / 2);
      place("pothos", 9.4, 5.3);
      place("rug", 6, 3.5);
      place("chair", 5.7, 2.2, 0.12, -2.7);
      place("pouf", 6.5, 4.5);
      place("geometric", 10.68, 4.5, 1.75, -Math.PI / 2);
      sign("Make room for living", 0, 4.3, -7.84, 7);
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
        opacity: 0.17,
        depthWrite: false,
        side: T.DoubleSide,
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
      const riverWindow = new T.Mesh(new T.PlaneGeometry(15.65, 5.05), glass);
      riverWindow.name = "grocery-river-window";
      riverWindow.position.set(-12, 2.875, 0);
      riverWindow.rotation.y = -Math.PI / 2;
      riverWindow.userData.cameraWall = true;
      root.add(riverWindow);
      occluders.push(riverWindow);
      box(-12, 5.5, 0, 0.22, 0.2, 16, "#e0e2dc", false, true);
      for (const z of [-7.9, -4, 0, 4, 7.9])
        box(-12, 2.9, z, 0.1, 5.2, 0.07, "#d2d7d8", false, true);
      sign("FRESH PRODUCE", -5, 4.6, -7.83, 6);
      sign("PANTRY & EVERYDAY", 6, 4.6, -7.83, 6);
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
      const towers: (typeof ingredients)[number][][] = [
        ["tomato", "pepper", "strawberry"],
        ["carrot", "radish", "beet"],
        ["onion", "potato", "eggplant"],
        ["corn", "tomato", "pepper"],
      ];
      const crate = (
        item: (typeof ingredients)[number],
        x: number,
        y: number,
        z: number,
        w: number,
        d: number,
        scale: number,
      ) => {
        box(x, y, z, w, 0.08, d, "#c69b64");
        for (const dx of [-w / 2, w / 2])
          box(x + dx, y + 0.13, z, 0.055, 0.24, d, "#ae8052");
        // Shallow lips and labels sit below the produce instead of covering it.
        box(x, y + 0.06, z + d / 2, w, 0.12, 0.05, "#ae8052");
        sign(`${item} · $1`, x, y - 0.09, z + d / 2 + 0.035, 1.35);
        const columns = ["tomato", "pepper", "strawberry"].includes(item)
            ? 11
            : 9,
          rows = 3;
        const template = makeGrocery(item);
        const bounds = new T.Box3().setFromObject(template);
        for (let row = 0; row < rows; row++)
          for (let col = 0; col < columns; col++) {
            const m = template.clone();
            const varied = scale * (0.94 + ((col + row * 3) % 4) * 0.04);
            m.scale.setScalar(varied);
            m.rotation.y = ((col * 5 + row * 3) % 7) * 0.17;
            m.position.set(
              x -
                w * 0.39 +
                (col * w * 0.78) / (columns - 1) +
                (row % 2) * 0.035,
              y + 0.05 - bounds.min.y * varied + row * 0.025,
              z + d * 0.29 - row * d * 0.29,
            );
            fixtures.add(m);
          }
        targets.push({
          id: `grocery-display-${item}`,
          x: shop.x + x,
          z: shop.z + z + d / 2 + 0.75,
          label: `Browse ${item}`,
        });
      };
      // Taller rear shelves use the wall height; compact low islands preserve views.
      towers.forEach((items, i) => {
        const x = -8.7 + i * 5.8,
          step = [0.91, 1.04, 0.96, 1.09][i];
        box(x, 1.85, -7.48, 4.8, 3.6, 0.1, "#8b6545");
        rects.push({
          x: shop.x + x,
          z: shop.z - 6.65,
          w: 4.9,
          d: 2,
          clearHeight: 3.8,
        });
        items.forEach((item, tier) =>
          crate(
            item,
            x,
            0.65 + tier * step,
            -5.95 - tier * 0.55,
            4.7,
            0.94,
            ["tomato", "pepper", "strawberry"].includes(item) ? 1.25 : 1.05,
          ),
        );
      });
      (["cabbage", "pumpkin", "lettuce"] as const).forEach((item, i) => {
        const x = [-5.8, 0, 5.8][i],
          y = [0.42, 0.64, 0.5][i],
          z = -3;
        box(x, y / 2, z, 3.8, y, 1.1, "#8b6545");
        rects.push({
          x: shop.x + x,
          z: shop.z + z,
          w: 3.9,
          d: 1.2,
          clearHeight: y + 0.65,
        });
        crate(item, x, y, z, 3.8, 1.1, 1.04);
      });
      const pantry = ingredients.filter((item) => !produce.includes(item));
      pantry.forEach((item, i) => {
        const alongWall = i >= 4;
        const x = [-8.5, -3.1, 2.3, -5.5][i % 4],
          z = i === 3 ? 3.7 : 0.2;
        const start = fixtures.children.length;
        const displayX = alongWall ? 10.95 : x,
          displayZ = alongWall ? -4.8 + (i - 4) * 4.8 : z;
        box(x, 0.95, z - 0.45, 3.6, 1.9, 0.08, "#364d51");
        rects.push({
          x: shop.x + displayX,
          z: shop.z + displayZ,
          w: alongWall ? 0.95 : 3.6,
          d: alongWall ? 3.6 : 0.95,
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
        if (alongWall) {
          const transform = new T.Matrix4()
            .makeTranslation(displayX, 0, displayZ)
            .multiply(new T.Matrix4().makeRotationY(-Math.PI / 2))
            .multiply(new T.Matrix4().makeTranslation(-x, 0, -z));
          for (const object of fixtures.children.slice(start))
            object.applyMatrix4(transform);
        }
        targets.push({
          id: `grocery-display-${item}`,
          x: shop.x + displayX - (alongWall ? 1.2 : 0),
          z: shop.z + displayZ + (alongWall ? 0 : 1.2),
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
