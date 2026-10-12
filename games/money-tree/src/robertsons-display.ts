import * as T from "three";
import { makeFurnishing } from "./furnishing-models";
import { signCanvas } from "./signage";
import { surfaceMaterial } from "./textures";
export function makeRobertsonsDisplay() {
  const root = new T.Group();
  root.name = "robertsons-groceries-and-furnishings";
  const wood = surfaceMaterial("#c6a073", "wood"),
    cream = new T.MeshStandardMaterial({ color: "#efe3be" });
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: T.Material,
  ) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
    return m;
  };
  const sign = (text: string, z: number, y: number, width: number) => {
    const texture = new T.CanvasTexture(signCanvas(text));
    texture.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(width, width / 4),
      new T.MeshBasicMaterial({ map: texture }),
    );
    m.rotation.y = Math.PI / 2;
    m.position.set(-2.95, y, z);
    root.add(m);
  };
  // Central z=-30 window remains clear, including its sight line and sill.
  for (const z of [-35, -25]) {
    box(-3.65, 1.7, z, 0.12, 3.3, 5.5, cream);
    for (let y = 0.25; y < 3.3; y += 0.19)
      box(-3.56, y, z, 0.035, 0.027, 5.4, wood);
    for (const y of [0.24, 1.22, 2.3]) box(-3.05, y, z, 1.05, 0.1, 5.5, wood);
  }
  const grocery = new T.Group();
  grocery.name = "grocery-wall-display";
  root.add(grocery);
  for (let i = 0; i < 4; i++) {
    const z = -37 + i * 1.35;
    for (const y of [0.3, 1.28]) {
      for (const side of [-1, 1])
        box(-3.04, y + 0.12, z + side * 0.51, 0.9, 0.24, 0.055, wood);
      for (let j = 0; j < 4; j++) {
        const item = new T.Group();
        item.name = ["egg-carton", "rice-bag", "bean-jar", "tortilla-stack"][i];
        item.position.set(-3.0, y + 0.05, z - 0.34 + j * 0.22);
        grocery.add(item);
        const add = (
          geometry: T.BufferGeometry,
          color: string,
          px: number,
          py: number,
          pz: number,
        ) => {
          const m = new T.Mesh(
            geometry,
            new T.MeshStandardMaterial({ color, roughness: 0.65 }),
          );
          m.position.set(px, py, pz);
          item.add(m);
          return m;
        };
        if (i === 0) {
          add(new T.BoxGeometry(0.5, 0.05, 0.18), "#c9b88d", 0, 0.025, 0);
          for (let k = 0; k < 4; k++)
            add(
              new T.SphereGeometry(0.055, 10, 8),
              "#f7ead5",
              -0.18 + k * 0.12,
              0.087,
              0,
            ).scale.set(0.85, 1.3, 0.85);
        } else if (i === 1) {
          add(new T.BoxGeometry(0.28, 0.31, 0.15), "#ecdba4", 0, 0.155, 0);
          add(new T.BoxGeometry(0.01, 0.15, 0.115), "#5c7e48", 0.146, 0.16, 0);
        } else if (i === 2) {
          const jar = add(
            new T.CylinderGeometry(0.083, 0.083, 0.25, 16),
            "#8a5037",
            0,
            0.125,
            0,
          );
          add(
            new T.CylinderGeometry(0.088, 0.088, 0.028, 16),
            "#c1a96c",
            0,
            0.26,
            0,
          );
          add(new T.BoxGeometry(0.008, 0.11, 0.11), "#f5e2b4", 0.085, 0.125, 0);
        } else {
          for (let k = 0; k < 6; k++)
            add(
              new T.CylinderGeometry(0.18, 0.18, 0.013, 24),
              k % 2 ? "#e3bf7d" : "#edce95",
              0,
              0.009 + k * 0.018,
              0,
            );
        }
      }
    }
    sign(["Eggs", "Rice", "Beans", "Tortillas"][i], z, 1.02, 1.12);
  }
  sign("Groceries", -35, 4.05, 4.1);
  const furnishings = new T.Group();
  furnishings.name = "furnishing-wall-display";
  root.add(furnishings);
  for (const [id, z, y, scale] of [
    ["chair", -26.8, 0.29, 0.64],
    ["pouf", -25.0, 0.29, 0.65],
    ["monstera", -23.2, 0.29, 0.55],
    ["snake", -26.7, 1.27, 0.4],
    ["pothos", -25, 1.27, 0.5],
  ] as const) {
    const f = makeFurnishing(id);
    f.position.set(-3.0, y, z);
    f.rotation.y = Math.PI / 2;
    f.scale.setScalar(scale);
    furnishings.add(f);
  }
  for (let i = 0; i < 4; i++) {
    const z = -27 + i * 1.3;
    // Brass and jewel-glass display lamps, inspired by the reference shelving.
    const brass = new T.MeshStandardMaterial({
      color: i % 2 ? "#b88b48" : "#b6bac3",
      metalness: 0.65,
      roughness: 0.3,
    });
    box(-3.02, 2.65, z, 0.045, 0.55, 0.045, brass);
    const base = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), brass);
    base.scale.set(1, 0.65, 1);
    base.position.set(-3.02, 2.45, z);
    furnishings.add(base);
    const shade = new T.Mesh(
      new T.CylinderGeometry(0.2, 0.24, 0.3, 24, 1, true),
      new T.MeshStandardMaterial({
        color: i % 2 ? "#f0dfb3" : "#8e4573",
        side: T.DoubleSide,
      }),
    );
    shade.position.set(-3.02, 2.94, z);
    furnishings.add(shade);
  }
  sign("Home Furnishings", -25, 4.2, 4.9);
  root.userData.windowClear = { minZ: -32.1, maxZ: -27.9 };
  return root;
}
