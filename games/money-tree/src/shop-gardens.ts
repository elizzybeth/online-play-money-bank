import * as T from "three";
import { riverDistance } from "./river-land";
/** Static low-cost curb gardens, with clear gaps for doors and crosswalks. */
export function addShopGardens(scene: T.Scene) {
  const root = new T.Group();
  root.name = "shop-sidewalk-flowerbeds";
  scene.add(root);
  const groups = new Map<string, T.Matrix4[]>();
  const o = new T.Object3D();
  const place = (
    color: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    ry = 0,
  ) => {
    const list = groups.get(color) ?? [];
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.rotation.set(0, ry, 0);
    o.updateMatrix();
    list.push(o.matrix.clone());
    groups.set(color, list);
  };
  for (const [a, b] of [
    [-29, -22],
    [-19, -12],
    [-9, -5],
    [10, 16],
    [19, 24],
    [27, 31],
  ]) {
    for (let x = a; x < b; x += 0.48) {
      const z = -12.3;
      if (riverDistance(x, z) < 5.2) continue;
      place("#705338", x, 0.035, z, 0.5, 0.08, 1.25);
      place("#a69777", x, 0.12, z + 0.66, 0.5, 0.18, 0.1);
      for (let j = 0; j < 3; j++) {
        const px = x + Math.sin(x * 3 + j) * 0.12,
          pz = z + (j - 1) * 0.38;
        const h = 0.45 + (Math.sin(x * 4 + j) + 1) * 0.3;
        place("#4d7950", px, h / 2, pz, 0.06, h, 0.06);
        place("#64844b", px, 0.3, pz, 0.34, 0.36, 0.22, j);
        const color = j === 0 ? "#e6bf55" : j === 1 ? "#9b7fbd" : "#cf7484";
        place(color, px, h, pz, 0.18, j === 0 ? 0.13 : 0.36, 0.18);
      }
    }
  }
  for (const [color, list] of groups) {
    const geo =
      color === "#705338" || color === "#a69777"
        ? new T.BoxGeometry(1, 1, 1)
        : new T.IcosahedronGeometry(0.6, 0);
    const mesh = new T.InstancedMesh(
      geo,
      new T.MeshStandardMaterial({ color, roughness: 0.9 }),
      list.length,
    );
    list.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
  }
  return root;
}
