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
  if (
    [
      "corn",
      "carrot",
      "pumpkin",
      "cabbage",
      "beet",
      "lettuce",
      "radish",
      "onion",
      "eggplant",
      "strawberry",
      "potato",
    ].includes(id)
  ) {
    const colors: Record<string, string> = {
      corn: "#edc74b",
      carrot: "#e78736",
      pumpkin: "#e49032",
      cabbage: "#73a45d",
      beet: "#a63769",
      lettuce: "#83b659",
      radish: "#da5475",
      onion: "#d9bb7c",
      eggplant: "#6c3978",
      strawberry: "#df4d5d",
      potato: "#bfa47d",
    };
    const body = add(
      id === "carrot"
        ? new T.ConeGeometry(0.12, 0.45, 10)
        : new T.SphereGeometry(0.2, 12, 8),
      colors[id],
      0,
      0.22,
      0,
    );
    if (id === "carrot") body.rotation.z = Math.PI;
    if (id === "corn") body.scale.set(0.6, 1.6, 0.6);
    if (id === "eggplant") body.scale.set(0.75, 1.4, 0.75);
    if (id === "potato") body.scale.set(1.25, 0.7, 0.8);
    if (id === "strawberry") body.scale.set(0.8, 1, 0.8);
    if (["cabbage", "lettuce", "pumpkin"].includes(id))
      for (let n = 0; n < 7; n++) {
        const a = (n * Math.PI * 2) / 7;
        add(
          new T.SphereGeometry(0.12, 8, 6),
          colors[id],
          Math.cos(a) * 0.12,
          0.2,
          Math.sin(a) * 0.12,
        ).scale.set(1, 1.3, 1);
      }
    if (id !== "potato")
      for (let n = 0; n < 3; n++) {
        const leaf = add(
          new T.SphereGeometry(0.08, 8, 4),
          "#4f874c",
          Math.sin(n * 2.1) * 0.07,
          id === "corn" ? 0.25 : 0.41,
          Math.cos(n * 2.1) * 0.07,
        );
        leaf.scale.set(0.4, id === "corn" ? 3 : 0.35, 1.5);
      }
    return root;
  }
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
  } else if (id === "beans" || id.endsWith("beans")) {
    add(
      new T.CylinderGeometry(0.083, 0.083, 0.25, 16),
      id === "black beans"
        ? "#383444"
        : id === "red beans"
          ? "#a53d44"
          : id === "pinto beans"
            ? "#bf956d"
            : "#8a5037",
      0,
      0.125,
    );
    add(new T.CylinderGeometry(0.088, 0.088, 0.028, 16), "#c1a96c", 0, 0.26);
    add(new T.BoxGeometry(0.008, 0.11, 0.11), "#f5e2b4", 0.085, 0.125);
  } else if (id === "pepper" || id === "tomato") {
    const fruit = add(
      new T.SphereGeometry(0.13, 16, 10),
      id === "tomato" ? "#ce503c" : "#d6a632",
      0,
      0.14,
    );
    if (id === "pepper") fruit.scale.set(0.8, 1.5, 0.8);
    add(new T.CylinderGeometry(0.015, 0.02, 0.09, 6), "#407243", 0, 0.3);
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
