import * as T from "three";
import type { Crop } from "./garden-crops";
export function makeCrop(crop: Crop, ready: boolean) {
  const root = new T.Group();
  root.name = `crop-${crop}`;
  const part = (
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => {
    const m = new T.Mesh(
      g,
      new T.MeshStandardMaterial({ color: c, roughness: 0.8 }),
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    root.add(m);
    return m;
  };
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.35,
      z = i % 2 ? 0.3 : -0.2,
      h = ready ? 0.9 : 0.25;
    part(new T.CylinderGeometry(0.018, 0.026, h, 6), "#477343", x, h / 2, z);
    for (let j = 0; j < 3; j++) {
      const leaf = part(
        new T.SphereGeometry(1, 8, 5),
        "#55874c",
        x + (j % 2 ? 0.12 : -0.12),
        h * (0.3 + j * 0.18),
        z,
      );
      leaf.scale.set(0.15, 0.035, 0.065);
    }
    if (!ready) continue;
    if (crop === "iris")
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3;
        const petal = part(
          new T.SphereGeometry(1, 10, 6),
          j % 2 ? "#8062bd" : "#b099de",
          x + Math.sin(a) * 0.1,
          h + (j % 2 ? 0.07 : -0.06),
          z + Math.cos(a) * 0.1,
        );
        petal.scale.set(0.08, 0.14, 0.055);
        petal.rotation.z = Math.sin(a) * 0.7;
      }
    else
      for (let j = 0; j < 3; j++) {
        const fruit = part(
          new T.SphereGeometry(0.09, 10, 8),
          crop === "tomato" ? "#d7553f" : "#dba841",
          x + Math.sin(j * 2.1) * 0.13,
          h * (0.5 + j * 0.13),
          z + Math.cos(j * 2.1) * 0.13,
        );
        if (crop === "pepper") fruit.scale.set(0.75, 1.6, 0.8);
      }
  }
  return root;
}
