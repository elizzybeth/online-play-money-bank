import * as T from "three";
import { hatById, type HatId } from "./hats";
// Shared geometry for shop stock, bag portraits, and the worn hat.
export function makeHat(id: HatId) {
  const g = new T.Group();
  g.name = `hat-${id}`;
  const color = hatById(id)!.color;
  const material = (c: string) =>
    new T.MeshStandardMaterial({ color: c, roughness: 0.78 });
  function mesh(geo: T.BufferGeometry, c: string, x = 0, y = 0, z = 0) {
    const m = new T.Mesh(geo, material(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  }
  const ell = (
    x: number,
    y: number,
    z: number,
    a: number,
    b: number,
    c: number,
    col: string,
  ) => {
    const m = mesh(new T.SphereGeometry(1, 20, 12), col, x, y, z);
    m.scale.set(a, b, c);
    return m;
  };
  const cyl = (r: number, h: number, col: string, y: number, top = r) =>
    mesh(new T.CylinderGeometry(top, r, h, 24), col, 0, y);
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    col: string,
  ) => mesh(new T.BoxGeometry(w, h, d), col, x, y, z);
  const brim = (r: number, col = color) => cyl(r, 0.055, col, 0.025);
  const band = (r: number, y: number, col: string) => cyl(r, 0.09, col, y);
  function stitches(r: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const t = box(
        Math.sin(a) * r,
        y,
        Math.cos(a) * r,
        0.035,
        0.015,
        0.07,
        "#efe4c9",
      );
      t.rotation.y = a;
    }
  }
  if (id === "cap" || id === "propeller") {
    ell(0, 0.16, 0, 0.46, 0.28, 0.45, color);
    ell(0, 0.04, 0.4, 0.43, 0.04, 0.32, id === "cap" ? "#397766" : "#3f79a3");
    stitches(0.43, 0.13);
    band(0.455, 0.07, "#efe4c9");
    if (id === "cap") {
      box(0, 0.19, 0.437, 0.16, 0.13, 0.025, "#e7ce82");
      box(0, 0.2, 0.455, 0.025, 0.09, 0.02, "#437548");
      ell(0.045, 0.24, 0.455, 0.045, 0.025, 0.02, "#437548");
    } else {
      cyl(0.035, 0.18, "#e7cb66", 0.46);
      const blade = box(0, 0.56, 0, 0.9, 0.035, 0.14, "#e5cd68");
      blade.name = "propeller";
      ell(0, 0.58, 0, 0.065, 0.04, 0.065, "#3f79a3");
    }
  } else if (id === "rabbit") {
    ell(0, 0.14, 0, 0.46, 0.27, 0.43, color);
    band(0.46, 0.03, "#a68485");
    for (const x of [-0.23, 0.23]) {
      const ear = ell(x, 0.64, 0, 0.11, 0.48, 0.085, color);
      ear.rotation.z = x > 0 ? -0.2 : 0.2;
      const inner = ell(x, 0.66, 0.075, 0.06, 0.34, 0.02, "#d68f97");
      inner.rotation.z = ear.rotation.z;
    }
    ell(0, 0.14, -0.43, 0.12, 0.12, 0.12, color);
  } else if (id === "inspector") {
    ell(0, 0.15, 0, 0.47, 0.22, 0.43, color);
    ell(0, 0.03, 0.4, 0.48, 0.045, 0.34, "#3e5949");
    band(0.47, 0.06, "#b7b47f");
    for (const x of [-0.22, 0.22]) {
      const ring = mesh(
        new T.TorusGeometry(0.14, 0.035, 8, 24),
        "#c9ad5c",
        x,
        0.15,
        0.44,
      );
      const lens = mesh(
        new T.CircleGeometry(0.11, 20),
        "#7ab4b8",
        x,
        0.15,
        0.447,
      );
      (lens.material as T.MeshStandardMaterial).metalness = 0.5;
      ring.rotation.x = 0.1;
    }
    box(0, 0.15, 0.47, 0.18, 0.025, 0.025, "#c9ad5c");
  } else if (id === "hardhat") {
    brim(0.55);
    ell(0, 0.18, 0, 0.46, 0.32, 0.44, color);
    box(0, 0.4, 0, 0.1, 0.13, 0.62, "#ffda71");
    band(0.465, 0.1, "#8d6641");
    for (const x of [-0.3, 0.3])
      for (let z = -0.2; z <= 0.2; z += 0.1)
        box(x, 0.25, z, 0.04, 0.07, 0.045, "#a97e35");
    box(0, 0.16, 0.45, 0.2, 0.12, 0.03, "#fff1c2");
  } else if (id === "wizard") {
    brim(0.67);
    const cone = mesh(new T.ConeGeometry(0.43, 0.95, 24), color, 0, 0.49);
    cone.rotation.z = -0.15;
    band(0.43, 0.1, "#d3aa54");
    for (let i = 0; i < 7; i++) {
      const y = 0.18 + i * 0.09;
      const r = 0.39 * (1 - y / 0.98);
      const a = i * 2.4;
      const star = mesh(
        new T.OctahedronGeometry(0.055),
        "#f6dd84",
        Math.sin(a) * r,
        y,
        Math.cos(a) * r,
      );
      star.rotation.z = 0.4;
    }
    ell(-0.12, 1, 0, 0.06, 0.07, 0.06, "#f6dd84");
  } else if (id === "rain") {
    ell(0, 0.18, 0, 0.44, 0.28, 0.43, color);
    const rim = ell(0, 0.01, -0.1, 0.67, 0.06, 0.65, color);
    rim.rotation.x = 0.12;
    band(0.445, 0.12, "#b48336");
    stitches(0.43, 0.12);
    for (const x of [-0.25, 0.25]) box(x, -0.13, -0.35, 0.17, 0.25, 0.1, color);
  } else if (id === "banker") {
    brim(0.62);
    cyl(0.39, 0.8, color, 0.43, 0.43);
    cyl(0.45, 0.05, color, 0.85);
    band(0.405, 0.2, "#75a481");
    stitches(0.4, 0.13);
    box(0, 0.2, 0.41, 0.19, 0.12, 0.025, "#e4c470");
    box(0, 0.2, 0.428, 0.13, 0.075, 0.025, color);
    const feather = ell(0.36, 0.68, 0.05, 0.07, 0.32, 0.02, "#86ba87");
    feather.rotation.z = -0.5;
  } else if (id === "beekeeper") {
    brim(0.65);
    cyl(0.4, 0.3, color, 0.19, 0.34);
    band(0.4, 0.11, "#aa8846");
    const veil = mesh(
      new T.CylinderGeometry(0.6, 0.6, 0.65, 24, 1, true),
      "#d4e1ce",
      0,
      -0.24,
    );
    const vm = veil.material as T.MeshStandardMaterial;
    vm.transparent = true;
    vm.opacity = 0.36;
    vm.side = T.DoubleSide;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      box(
        Math.sin(a) * 0.6,
        -0.24,
        Math.cos(a) * 0.6,
        0.012,
        0.65,
        0.012,
        "#8a9275",
      );
    }
    band(0.6, -0.55, "#aa8846");
    ell(0.25, 0.4, 0, 0.085, 0.045, 0.055, "#eabf42");
    box(0.25, 0.405, 0, 0.025, 0.06, 0.12, "#3d4237");
    ell(0.2, 0.44, 0, 0.07, 0.025, 0.04, "#d4e1ce");
  } else {
    brim(0.56);
    cyl(0.4, 0.32, color, 0.19, 0.32);
    band(0.405, 0.12, "#3f4340");
    const lamp = mesh(
      new T.CylinderGeometry(0.11, 0.11, 0.12, 20),
      "#e4c887",
      0,
      0.21,
      0.43,
    );
    lamp.rotation.x = Math.PI / 2;
    const lens = mesh(
      new T.CircleGeometry(0.09, 20),
      "#fff5ba",
      0,
      0.21,
      0.495,
    );
    (lens.material as T.MeshStandardMaterial).emissive.set("#efd584");
    (lens.material as T.MeshStandardMaterial).emissiveIntensity = 1.5;
    const light = new T.PointLight("#ffe5a8", 1.5, 5);
    light.position.set(0, 0.21, 0.6);
    g.add(light);
    box(0.4, 0.18, 0, 0.09, 0.18, 0.22, "#3f4340");
    stitches(0.38, 0.28);
  }
  return g;
}
