import * as T from "three";
import type { Rect, State } from "./game";
import type { Target } from "./world";
import { mountainHats } from "./hats";
import { makeHat } from "./hat-models";
import { flatPath } from "./flat-path";
import { signCanvas } from "./signage";
export const mountainShopOpen = (s: State) =>
  !!s.millionaire?.chats["visited-summit"];
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
  box(-12, 0.02, -318, 24, 0.04, 14, "#d9c6a1");
  box(-12, 2.2, -325, 24, 4.4, 0.35, "#819f9a", true);
  for (const x of [-24, 0]) box(x, 2.2, -318, 0.35, 4.4, 14, "#819f9a", true);
  for (const x of [-20, -4]) box(x, 2.2, -311, 8, 4.4, 0.35, "#819f9a", true);
  const roof = box(-12, 4.65, -318, 25, 0.5, 15, "#43675f");
  const label = (text: string, x: number, y: number, z: number, w: number) => {
    const texture = new T.CanvasTexture(signCanvas(text));
    texture.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(w, text === "Terrace Threads" ? w / 6 : w / 4),
      new T.MeshBasicMaterial({ map: texture }),
    );
    m.position.set(x, y, z);
    root.add(m);
  };
  label("Terrace Threads", -12, 4.1, -310.1, 11);
  mountainHats.forEach((hat, i) => {
    const x = -21 + (i % 5) * 4.5,
      z = i < 5 ? -321 : -315;
    box(x, 0.5, z, 1, 1, 1, "#b99367", true);
    const h = makeHat(hat.id);
    h.position.set(x, 1.05, z);
    root.add(h);
    label(hat.name, x, 0.7, z + 0.52, 2.6);
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
  box(-22, 0.6, -307, 2.6, 1.2, 2, "#876a48", true);
  box(-22, 1.25, -307, 2.7, 0.16, 2.1, "#354d3a");
  label("Compost", -22, 1.8, -305.9, 2.8);
  targets.push(
    { id: "mountain-seed-atm", x: -3, z: -304.8, label: "Buy garden seeds" },
    { id: "mountain-composter", x: -22, z: -304.8, label: "Use the composter" },
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
