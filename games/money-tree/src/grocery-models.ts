import * as T from "three";
import type { Ingredient } from "./meals";
export function makeGrocery(id: Ingredient) {
  const root = new T.Group();
  root.name = `grocery-${id}`;
  const add = (
    geometry: T.BufferGeometry,
    color: string,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const m = new T.Mesh(
      geometry,
      new T.MeshStandardMaterial({ color, roughness: 0.65 }),
    );
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  if (id === "eggs") {
    add(new T.BoxGeometry(0.5, 0.05, 0.18), "#c9b88d", 0, 0.025);
    for (let k = 0; k < 4; k++)
      add(
        new T.SphereGeometry(0.055, 10, 8),
        "#f7ead5",
        -0.18 + k * 0.12,
        0.087,
      ).scale.set(0.85, 1.3, 0.85);
  } else if (id === "rice") {
    add(new T.BoxGeometry(0.28, 0.31, 0.15), "#ecdba4", 0, 0.155);
    add(new T.BoxGeometry(0.01, 0.15, 0.115), "#5c7e48", 0.146, 0.16);
  } else if (id === "beans") {
    add(new T.CylinderGeometry(0.083, 0.083, 0.25, 16), "#8a5037", 0, 0.125);
    add(new T.CylinderGeometry(0.088, 0.088, 0.028, 16), "#c1a96c", 0, 0.26);
    add(new T.BoxGeometry(0.008, 0.11, 0.11), "#f5e2b4", 0.085, 0.125);
  } else {
    for (let k = 0; k < 6; k++)
      add(
        new T.CylinderGeometry(0.18, 0.18, 0.013, 24),
        k % 2 ? "#e3bf7d" : "#edce95",
        0,
        0.009 + k * 0.018,
      );
  }
  return root;
}
