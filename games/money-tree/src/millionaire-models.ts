import * as T from "three";
import type { Fellowship } from "./millionaire";
const mat = (color: string, metalness = 0) =>
  new T.MeshStandardMaterial({
    color,
    roughness: metalness ? 0.28 : 0.8,
    metalness,
  });
function part(
  parent: T.Object3D,
  geometry: T.BufferGeometry,
  color: string,
  x: number,
  y: number,
  z: number,
  metalness = 0,
) {
  const o = new T.Mesh(geometry, mat(color, metalness));
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
const ball = (
  p: T.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  r: number,
) => part(p, new T.SphereGeometry(r, 12, 8), c, x, y, z);
const box = (
  p: T.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  metal = 0,
) => part(p, new T.BoxGeometry(w, h, d), c, x, y, z, metal);
function tube(p: T.Object3D, c: string, points: number[][], radius: number) {
  return part(
    p,
    new T.TubeGeometry(
      new T.CatmullRomCurve3(
        points.map((a) => new T.Vector3(...(a as [number, number, number]))),
      ),
      20,
      radius,
      7,
      false,
    ),
    c,
    0,
    0,
    0,
  );
}
function eyes(
  p: T.Object3D,
  y: number,
  z: number,
  spacing: number,
  size: number,
  alien = false,
) {
  for (const side of [-1, 1]) {
    const eye = ball(
      p,
      alien ? "#111b21" : "#fffcec",
      side * spacing,
      y,
      z,
      size,
    );
    if (alien) {
      eye.scale.set(1.1, 1.5, 0.35);
      eye.rotation.z = side * -0.25;
    } else
      ball(p, "#293430", side * spacing + 0.02, y, z + size * 0.83, size * 0.5);
    ball(
      p,
      "#f6f5e8",
      side * spacing - size * 0.2,
      y + size * 0.25,
      z + size * 0.98,
      size * 0.17,
    );
  }
}
function toy(parent: T.Object3D, index: number) {
  const g = new T.Group();
  parent.add(g);
  if (index === 0) {
    box(g, "#fff0cc", 0, 0.18, 0, 0.45, 0.35, 0.32);
    const roof = part(
      g,
      new T.ConeGeometry(0.36, 0.22, 4),
      "#bd7757",
      0,
      0.46,
      0,
    );
    roof.rotation.y = Math.PI / 4;
    box(g, "#a77c54", 0, 0.16, 0.17, 0.1, 0.21, 0.02);
  }
  if (index === 1) {
    box(g, "#5b9c61", 0, 0.2, 0, 0.6, 0.2, 0.3);
    box(g, "#a0d1d0", 0.16, 0.4, 0, 0.2, 0.3, 0.25);
    for (const x of [-0.22, 0.22])
      for (const z of [-0.19, 0.19])
        ball(g, "#313b34", x, 0.1, z, x > 0 ? 0.16 : 0.11);
  }
  if (index === 2) {
    box(g, "#e8d6b0", 0, 0.3, 0, 0.42, 0.6, 0.35);
    for (let i = 0; i < 3; i++)
      box(g, "#8aadb1", 0, 0.14 + i * 0.18, 0.19, 0.3, 0.08, 0.02);
  }
  if (index === 3) {
    box(g, "#aeaebb", 0, 0.2, 0, 0.6, 0.4, 0.3);
    box(g, "#725e54", 0.2, 0.54, 0, 0.1, 0.4, 0.1);
    for (const x of [-0.2, 0, 0.2])
      box(g, "#c7dfdf", x, 0.25, 0.16, 0.1, 0.1, 0.01);
  }
  if (index === 4) {
    box(g, "#dba454", 0, 0.2, 0, 0.4, 0.4, 0.2);
    part(g, new T.TorusGeometry(0.12, 0.025, 6, 12), "#825b39", 0, 0.43, 0);
  }
  if (index === 5) {
    const hull = ball(g, "#e3eee3", 0, 0.15, 0, 0.35);
    hull.scale.set(1.4, 0.35, 0.6);
    box(g, "#7299a4", 0, 0.35, 0, 0.32, 0.2, 0.2);
  }
  if (index === 6) {
    box(g, "#856544", 0, 0.18, 0, 0.07, 0.36, 0.07);
    ball(g, "#719458", 0, 0.44, 0, 0.23);
  }
  if (index === 7) {
    box(g, "#30465d", 0, 0.25, 0, 0.48, 0.33, 0.04);
    box(g, "#bfdcd9", 0, 0.25, 0.03, 0.38, 0.24, 0.01);
    box(g, "#6e8393", 0, 0.08, 0.15, 0.5, 0.03, 0.3);
  }
  return g;
}
export function makeMascot(id: Fellowship) {
  const g = new T.Group();
  g.name = `mascot-${id}`;
  if (id === "arms") {
    const head = ball(g, "#c78bc8", 0, 1.65, 0, 0.82);
    head.name = "head";
    head.scale.y = 1.1;
    eyes(g, 1.9, 0.69, 0.28, 0.15);
    tube(
      g,
      "#5e3864",
      [
        [-0.3, 1.48, 0.73],
        [0, 1.32, 0.8],
        [0.3, 1.48, 0.73],
      ],
      0.025,
    );
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        end = new T.Vector3(
          Math.sin(a) * 1.7,
          0.5 + (i % 3) * 0.18,
          Math.cos(a) * 1.7,
        );
      tube(
        g,
        i % 2 ? "#b97bbb" : "#dba4d9",
        [
          [0, 1, 0],
          [Math.sin(a) * 0.85, 0.2, Math.cos(a) * 0.85],
          [end.x, 0.28, end.z],
          [end.x, end.y, end.z],
        ],
        0.16,
      );
      for (let j = 0; j < 4; j++)
        ball(
          g,
          "#f1c5e7",
          Math.sin(a) * (0.8 + j * 0.18),
          0.23,
          Math.cos(a) * (0.8 + j * 0.18),
          0.065,
        );
      const holding = toy(g, i);
      holding.position.copy(end).add(new T.Vector3(0, 0.16, 0));
      holding.rotation.y = a;
    }
    const tie = part(
      g,
      new T.ConeGeometry(0.13, 0.52, 3),
      "#29506a",
      0,
      1.1,
      0.72,
    );
    tie.rotation.z = Math.PI;
  } else if (id === "bridge") {
    const head = ball(g, "#9faeac", 0, 2.32, 0, 0.51);
    head.name = "head";
    head.scale.set(1, 1.4, 0.8);
    const body = ball(g, "#879e99", 0, 1.25, 0, 0.44);
    body.scale.set(0.8, 1.5, 0.65);
    eyes(g, 2.37, 0.35, 0.23, 0.17, true);
    box(g, "#536b65", 0, 2.03, 0.37, 0.12, 0.014, 0.02);
    for (const side of [-1, 1]) {
      tube(
        g,
        "#95aaa5",
        [
          [side * 0.25, 0.8, 0],
          [side * 0.23, 0.35, 0],
          [side * 0.26, 0.1, 0.18],
        ],
        0.09,
      );
      tube(
        g,
        "#95aaa5",
        [
          [side * 0.36, 1.7, 0],
          [side * 0.6, 1.23, 0.1],
          [side * 0.5, 1.3, 0.6],
        ],
        0.08,
      );
    }
    const meter = box(g, "#202a29", 0, 1.2, 0.64, 0.85, 0.28, 0.55);
    meter.rotation.x = 0.22;
    meter.material = mat("#202a29", 0.25);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#f2eed6";
    c.fillRect(0, 0, 256, 128);
    c.strokeStyle = "#49715a";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(128, 110, 82, Math.PI, Math.PI * 2);
    c.stroke();
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI + (i * Math.PI) / 12;
      c.beginPath();
      c.moveTo(128 + Math.cos(a) * 70, 110 + Math.sin(a) * 70);
      c.lineTo(128 + Math.cos(a) * 81, 110 + Math.sin(a) * 81);
      c.stroke();
    }
    c.strokeStyle = "#aa4941";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(128, 110);
    c.lineTo(178, 48);
    c.stroke();
    c.fillStyle = "#354a3d";
    c.font = "bold 15px serif";
    c.fillText("SPIRIT METER", 70, 110);
    const dial = part(
      g,
      new T.PlaneGeometry(0.5, 0.25),
      "#ffffff",
      0,
      1.365,
      0.66,
    );
    dial.rotation.x = -Math.PI / 2;
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    dial.material.map = texture;
    dial.material.needsUpdate = true;
    for (const side of [-1, 1]) {
      part(
        g,
        new T.CylinderGeometry(0.06, 0.06, 0.23, 10),
        "#c5d3d0",
        side * 0.52,
        1.38,
        0.63,
        0.9,
      );
      tube(
        g,
        "#26322e",
        [
          [side * 0.52, 1.25, 0.63],
          [side * 0.35, 0.91, 0.8],
          [side * 0.22, 1.16, 0.8],
        ],
        0.013,
      );
    }
    for (const x of [-0.33, 0.33])
      part(
        g,
        new T.CylinderGeometry(0.055, 0.055, 0.06, 10),
        "#52605a",
        x,
        1.37,
        0.5,
      );
  } else {
    const stem = part(
      g,
      new T.CylinderGeometry(0.1, 0.13, 0.65, 8),
      "#658653",
      0,
      0.33,
      0,
    );
    for (let ring = 0; ring < 3; ring++)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + ring * 0.2;
        const petal = ball(
          g,
          ["#bf4385", "#df7ea7", "#f5bcce"][ring],
          Math.sin(a) * (0.65 - ring * 0.16),
          0.55 + ring * 0.15,
          Math.cos(a) * (0.65 - ring * 0.16),
          0.35,
        );
        petal.scale.set(0.6, 0.55, 1.7);
        petal.rotation.y = a;
        petal.rotation.x = -0.3 - ring * 0.18;
      }
    ball(g, "#eac45d", 0, 0.88, 0, 0.24);
    for (const side of [-1, 1]) {
      tube(
        g,
        "#719d78",
        [
          [side * 0.05, 0.7, 0],
          [side * 0.7, 1.2, 0],
          [side * 1.05, 1.9, 0],
          [side * 0.83, 2.55, 0.05],
        ],
        0.2,
      );
      const head = ball(g, "#9cbaa0", side * 0.83, 2.58, 0.13, 0.28);
      head.scale.set(1.1, 0.75, 1.4);
      if (side < 0) head.name = "head";
      for (let j = 0; j < 10; j++)
        for (const edge of [-1, 1])
          ball(
            g,
            "#aec9a0",
            side * (0.32 + j * 0.067) + edge * 0.06,
            1 + j * 0.12,
            0.17,
            0.045,
          );
      eyes(head, 0.06, 0.3, 0.14, 0.063, true);
      tube(
        g,
        "#435f47",
        [
          [side * 0.98, 2.52, 0.39],
          [side * 0.83, 2.49, 0.43],
          [side * 0.68, 2.52, 0.39],
        ],
        0.015,
      );
    }
    for (let i = 0; i < 5; i++) {
      const ray = part(
        g,
        new T.ConeGeometry(0.065, 0.24, 5),
        "#dcb659",
        (i - 2) * 0.12,
        3.03 - Math.abs(i - 2) * 0.045,
        0,
      );
      ray.rotation.z = (i - 2) * -0.25;
    }
    stem.name = "lotus-stem";
  }
  return g;
}
export function makeGuru() {
  const g = new T.Group();
  g.name = "willow-guru";
  part(g, new T.CylinderGeometry(1.25, 1.3, 0.25, 20), "#8d849a", 0, 0.12, 0);
  const robe = part(g, new T.ConeGeometry(0.72, 1.5, 16), "#e8a035", 0, 0.9, 0);
  robe.scale.z = 0.75;
  for (const side of [-1, 1]) {
    const leg = ball(g, "#f0ad32", side * 0.47, 0.42, 0.35, 0.4);
    leg.scale.set(1.45, 0.55, 0.7);
    tube(
      g,
      "#edab86",
      [
        [side * 0.4, 1.2, 0],
        [side * 0.66, 0.95, 0.15],
        [side * 0.8, side > 0 ? 1.32 : 0.63, 0.4],
      ],
      0.1,
    );
    ball(g, "#efb08b", side * 0.8, side > 0 ? 1.35 : 0.65, 0.4, 0.14);
  }
  const head = ball(g, "#e6a37f", 0, 1.78, 0, 0.39);
  head.name = "head";
  eyes(g, 1.85, 0.33, 0.14, 0.067);
  const hair = ball(g, "#fff8e6", 0, 1.98, -0.03, 0.4);
  hair.scale.set(1, 0.75, 1);
  ball(g, "#fff8e6", 0, 2.3, -0.02, 0.2);
  for (const side of [-1, 1]) {
    const brow = box(g, "#fff8e6", side * 0.14, 1.98, 0.35, 0.17, 0.035, 0.035);
    brow.rotation.z = side * 0.12;
    ball(g, "#fff8e6", side * 0.34, 1.84, -0.03, 0.16).scale.y = 1.6;
  }
  const beard = part(
    g,
    new T.ConeGeometry(0.32, 0.65, 12),
    "#fff8e6",
    0,
    1.31,
    0.23,
  );
  beard.rotation.z = Math.PI;
  beard.scale.z = 0.6;
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI) / 8;
    ball(
      g,
      "#6c4836",
      Math.cos(a) * 0.3,
      1.41 - Math.sin(a) * 0.2,
      0.32,
      0.045,
    );
  }
  for (let i = 0; i < 4; i++)
    ball(g, "#f9cd47", -0.8 + i * 0.065, 1.46, 0.43, 0.035);
  return g;
}
