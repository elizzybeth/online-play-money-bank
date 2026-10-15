import * as T from "three";
import type { Rect, State } from "./game";
import type { Target } from "./world";
import { mountainHats } from "./hats";
import { makeHat } from "./hat-models";
import { flatPath } from "./flat-path";
import { signCanvas } from "./signage";
import { makeComposter } from "./town-life-world";
import { terraceBoutique } from "./terrace-boutique";
export { mountainRetailOpen as mountainShopOpen } from "./millionaire";
import { mountainRetailOpen as mountainShopOpen } from "./millionaire";
export function createMountainShop(
  scene: T.Scene,
  rects: Rect[],
  targets: Target[],
  occluders: T.Object3D[],
) {
  const root = new T.Group();
  root.name = "terrace-threads";
  scene.add(root);
  const obstacles: Rect[] = [];
  const walls: T.Mesh[] = [];
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
    const m = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      new T.MeshStandardMaterial({ color, roughness: 0.8 }),
    );
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    root.add(m);
    if (solid) {
      obstacles.push({ x, z, w, d, clearHeight: y + h / 2 });
      walls.push(m);
    }
    return m;
  };
  const approach = new T.Mesh(
    flatPath(
      [
        { x: -12, z: -307.5, w: 4, d: 7 },
        { x: 9, z: -304, w: 46, d: 4 },
      ],
      0.065,
    ),
    new T.MeshStandardMaterial({ color: "#c5b48d" }),
  );
  approach.name = "terrace-threads-approach";
  approach.userData.depthAudit = true;
  approach.receiveShadow = true;
  root.add(approach);
  const { roof } = terraceBoutique(root, obstacles, walls);
  const label = (text: string, x: number, y: number, z: number, w: number) => {
    const texture = new T.CanvasTexture(signCanvas(text));
    texture.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(w, text === "Terrace Threads" ? w / 6 : w / 4),
      new T.MeshBasicMaterial({ map: texture }),
    );
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  mountainHats.forEach((hat, i) => {
    const x = -21 + (i % 5) * 4.5,
      z = i < 5 ? -321 : -315;
    box(x, 0.5, z, 1.1, 1, 1.1, "#eee8da", true);
    box(x, 1.015, z, 1.35, 0.07, 1.35, "#b39257");
    const h = makeHat(hat.id);
    if (hat.id === "seedkeeper") {
      const stand = new T.Mesh(
        new T.CylinderGeometry(0.16, 0.12, 0.46, 16),
        new T.MeshStandardMaterial({ color: "#eee8da", roughness: 0.8 }),
      );
      stand.position.set(x, 1.27, z);
      stand.castShadow = stand.receiveShadow = true;
      root.add(stand);
    }
    h.position.set(x, hat.id === "seedkeeper" ? 1.5 : 1.05, z);
    root.add(h);
    label(hat.name, x, 0.7, z + 0.62, 2.6);
    targets.push({
      id: `hat-${hat.id}`,
      x,
      z: z + 1.4,
      label: `Inspect ${hat.name}`,
    });
  });
  box(-3, 1.1, -307, 1.8, 2.2, 1.3, "#43675f", true);
  box(-3, 1.5, -306.32, 1.3, 0.75, 0.05, "#bde1b1");
  box(-3, 0.45, -306.29, 1.1, 0.2, 0.1, "#263d38");
  label("Seed ATM", -3, 2.6, -306.25, 2.7);
  const composter = makeComposter();
  composter.position.set(-22, 0, -307);
  root.add(composter);
  obstacles.push({ x: -22, z: -307, w: 1.55, d: 1.55, clearHeight: 1.4 });
  label("COMPOST", -22, 2.65, -306.9, 2.2).material.side = T.DoubleSide;
  label("25 scraps → Soil", -22, 1.9, -306.9, 2.2).material.side = T.DoubleSide;
  targets.push(
    { id: "mountain-seed-atm", x: -3, z: -304.8, label: "Buy garden seeds" },
    { id: "mountain-composter", x: -22, z: -305.6, label: "Use the composter" },
  );
  let visible = false;
  return {
    root,
    update(s: State) {
      const open = mountainShopOpen(s) && !!s.millionaire?.unlocked;
      root.visible = open;
      roof.visible = !(
        s.position.x > -24 &&
        s.position.x < 0 &&
        s.position.z > -325 &&
        s.position.z < -311
      );
      if (open === visible) return;
      visible = open;
      for (const wall of walls) {
        if (open) occluders.push(wall);
        else {
          const i = occluders.indexOf(wall);
          if (i >= 0) occluders.splice(i, 1);
        }
      }
      for (const r of obstacles) {
        if (open) rects.push(r);
        else {
          const i = rects.indexOf(r);
          if (i >= 0) rects.splice(i, 1);
        }
      }
    },
  };
}
