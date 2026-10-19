import {
  cornEarGeometry,
  cornBladeGeometry,
  cornKernelMaterial,
} from "./corn-model";
import * as T from "three";
import type { Crop } from "./garden-crops";
export function makeCrop(crop: Crop, ready: boolean, field = false) {
  const radial = field ? 6 : 8,
    rings = field ? 3 : 5;
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
  const kernelMaterial =
    crop === "corn" && ready ? cornKernelMaterial() : undefined;
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.35,
      z = i % 2 ? 0.3 : -0.2,
      h = !ready
        ? 0.25
        : crop === "corn"
          ? 2.1
          : crop === "sunflower"
            ? 1.5
            : [
                  "carrot",
                  "beet",
                  "radish",
                  "onion",
                  "cabbage",
                  "lettuce",
                  "strawberry",
                  "potato",
                  "pumpkin",
                ].includes(crop)
              ? 0.3
              : 0.9;
    part(new T.CylinderGeometry(0.018, 0.026, h, 6), "#477343", x, h / 2, z);
    for (let j = 0; j < 3; j++) {
      const leaf = part(
        new T.SphereGeometry(1, radial, rings),
        "#55874c",
        x + (j % 2 ? 0.12 : -0.12),
        h * (0.3 + j * 0.18),
        z,
      );
      leaf.scale.set(0.15, 0.035, 0.065);
    }
    if (!ready) continue;
    if (!["iris", "pepper", "tomato"].includes(crop)) {
      const sphere = (
        color: string,
        y: number,
        sx: number,
        sy: number,
        sz: number,
        dx = 0,
        dz = 0,
      ) => {
        const m = part(
          new T.SphereGeometry(1, radial, rings),
          color,
          x + dx,
          y,
          z + dz,
        );
        m.scale.set(sx, sy, sz);
        return m;
      };
      if (crop === "corn") {
        const ear = new T.Mesh(cornEarGeometry(), kernelMaterial);
        ear.position.set(x + 0.12, 1.35, z);
        ear.scale.set(0.15, 0.36, 0.15);
        root.add(ear);
        for (let j = 0; j < 3; j++) {
          const husk = part(
            cornBladeGeometry(true),
            "#8dbb39",
            x + 0.12,
            1.35,
            z,
          );
          husk.scale.copy(ear.scale);
          husk.rotation.y = j * 2.1;
          (husk.material as T.MeshStandardMaterial).side = T.DoubleSide;
        }
      } else if (crop === "cabbage" || crop === "lettuce") {
        for (let j = 0; j < 7; j++) {
          const a = j * 2.4;
          const leaf = sphere(
            crop === "lettuce" ? "#80b94e" : "#86a06d",
            0.2 + (j % 2) * 0.04,
            0.22,
            0.16,
            0.12,
            Math.sin(a) * 0.12,
            Math.cos(a) * 0.12,
          );
          leaf.rotation.y = a;
        }
      } else if (crop === "carrot") {
        const carrot = part(
          new T.ConeGeometry(0.13, 0.4, 8),
          "#e58c32",
          x,
          0.05,
          z,
        );
        carrot.rotation.z = Math.PI;
      } else if (crop === "sunflower") {
        for (let j = 0; j < 10; j++) {
          const a = (j * Math.PI) / 5;
          const petal = sphere(
            "#f3c940",
            h + Math.cos(a) * 0.19,
            0.09,
            0.15,
            0.04,
            Math.sin(a) * 0.19,
          );
          petal.rotation.z = -a;
        }
        sphere("#684827", h, 0.14, 0.14, 0.065);
      } else if (crop === "lavender") {
        for (let j = 0; j < 6; j++)
          sphere(
            j % 2 ? "#9778bc" : "#7956a5",
            0.6 + j * 0.07,
            0.055,
            0.065,
            0.06,
            Math.sin(j * 2) * 0.04,
          );
      } else if (crop === "eggplant") sphere("#6c3c83", 0.58, 0.13, 0.28, 0.13);
      else if (crop === "pumpkin")
        for (let j = 0; j < 7; j++) {
          const a = (j * Math.PI * 2) / 7;
          sphere(
            "#dc8735",
            0.23,
            0.14,
            0.2,
            0.14,
            Math.sin(a) * 0.12,
            Math.cos(a) * 0.12,
          );
        }
      else if (crop === "strawberry")
        for (let j = 0; j < 3; j++)
          sphere(
            "#d9494c",
            0.13,
            0.08,
            0.11,
            0.08,
            Math.sin(j * 2.1) * 0.18,
            Math.cos(j * 2.1) * 0.18,
          );
      else if (crop === "potato")
        for (let j = 0; j < 3; j++)
          sphere(
            "#bca16b",
            0.08,
            0.12,
            0.08,
            0.09,
            Math.sin(j * 2.1) * 0.13,
            Math.cos(j * 2.1) * 0.13,
          );
      else {
        sphere(
          crop === "beet"
            ? "#9e365a"
            : crop === "radish"
              ? "#e95e79"
              : "#e6d8a0",
          0.1,
          0.15,
          0.17,
          0.15,
        );
        if (crop === "onion")
          for (let j = 0; j < 3; j++) {
            const blade = part(
              new T.ConeGeometry(0.035, 0.55, 5),
              "#54854a",
              x + (j - 1) * 0.06,
              0.45,
              z,
            );
            blade.rotation.z = (j - 1) * 0.18;
          }
      }
      continue;
    }
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
          new T.SphereGeometry(0.09, field ? 6 : 10, field ? 3 : 8),
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
