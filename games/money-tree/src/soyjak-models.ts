import * as T from "three";
import { surfaceMaterial } from "./textures";
function block(
  g: T.Group,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  c: string,
) {
  const m = new T.Mesh(
    new T.BoxGeometry(w, h, d),
    new T.MeshStandardMaterial({ color: c, roughness: 0.8 }),
  );
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
function face(
  g: T.Group,
  draw: (c: CanvasRenderingContext2D) => void,
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const c = canvas.getContext("2d")!;
  draw(c);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const m = new T.Mesh(
    new T.PlaneGeometry(w, h),
    new T.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.9,
    }),
  );
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
export function makeSeriousHat() {
  const g = new T.Group();
  g.name = "temporary-serious-hat";
  // A folded paper tent: triangular ends and two sloping paper faces.
  const shape = new T.Shape();
  shape.moveTo(-0.25, 0);
  shape.lineTo(0.25, 0);
  shape.lineTo(0, 0.45);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape, {
    depth: 1.06,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -0.53);
  geometry.rotateY(Math.PI / 2);
  const paper = new T.Mesh(
    geometry,
    new T.MeshStandardMaterial({ color: "#e6ddcb", roughness: 1 }),
  );
  g.add(paper);
  const lettering = face(
    g,
    (c) => {
      c.fillStyle = "#e6ddcb";
      c.fillRect(0, 0, 512, 512);
      c.strokeStyle = "#28251e";
      c.lineWidth = 9;
      c.strokeRect(5, 5, 502, 502);
      c.fillStyle = "#171714";
      c.font = "64px cursive";
      c.textAlign = "center";
      c.fillText("Serious hat", 256, 300);
    },
    0.94,
    0.44,
    0,
    0.226,
    0.128,
  );
  lettering.rotation.x = -Math.atan(0.25 / 0.45);
  return g;
}
export function makeSoyjakHead() {
  const g = new T.Group();
  g.name = "soyjak-crying-with-smug-mask";
  const skull = new T.Mesh(
    new T.SphereGeometry(0.4, 24, 20),
    new T.MeshStandardMaterial({ color: "#f4f1e7", roughness: 0.9 }),
  );
  skull.scale.set(1, 1.2, 0.8);
  g.add(skull);
  face(
    g,
    (c) => {
      c.strokeStyle = "#222";
      c.lineWidth = 9;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(90, 170);
      c.lineTo(190, 210);
      c.moveTo(310, 210);
      c.lineTo(420, 170);
      c.stroke();
      c.fillStyle = "#111";
      c.beginPath();
      c.ellipse(256, 350, 95, 70, 0, 0, 7);
      c.fill();
      c.fillStyle = "white";
      c.fillRect(188, 300, 136, 20);
      c.strokeStyle = "#73bfd7";
      c.lineWidth = 22;
      for (const x of [130, 380]) {
        c.beginPath();
        c.moveTo(x, 220);
        c.bezierCurveTo(x - 20, 300, x + 25, 350, x, 450);
        c.stroke();
      }
    },
    0.67,
    0.8,
    0,
    -0.02,
    0.326,
  );
  // Offset porcelain-like mask exposes the crying cheek and mouth behind it.
  const mask = new T.Mesh(
    new T.SphereGeometry(0.39, 24, 20, 0, Math.PI * 2, 0, Math.PI),
    new T.MeshStandardMaterial({ color: "#fffdf5", roughness: 0.78 }),
  );
  mask.scale.set(0.85, 1, 0.18);
  mask.position.set(0.25, 0.12, 0.4);
  g.add(mask);
  face(
    g,
    (c) => {
      c.strokeStyle = "#181916";
      c.lineWidth = 7;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(75, 200);
      c.quadraticCurveTo(145, 165, 205, 205);
      c.moveTo(305, 205);
      c.quadraticCurveTo(370, 165, 435, 195);
      c.stroke();
      c.fillStyle = "#171815";
      c.fillRect(135, 184, 24, 25);
      c.fillRect(355, 184, 24, 25);
      c.beginPath();
      c.moveTo(260, 220);
      c.lineTo(245, 285);
      c.lineTo(275, 287);
      c.moveTo(100, 322);
      c.bezierCurveTo(180, 395, 350, 375, 420, 310);
      c.moveTo(165, 110);
      c.quadraticCurveTo(250, 75, 340, 110);
      c.stroke();
    },
    0.54,
    0.62,
    0.25,
    0.12,
    0.478,
  );
  const strap = new T.Mesh(
    new T.TorusGeometry(0.39, 0.012, 6, 32),
    new T.MeshStandardMaterial({ color: "#282a27" }),
  );
  strap.rotation.x = Math.PI / 2;
  g.add(strap);
  return g;
}
export function makeSoyjakStall() {
  const g = new T.Group();
  g.name = "soyjak-party-stall";
  g.position.set(25.7, 0, -79.2);
  for (let i = 0; i < 13; i++)
    block(
      g,
      0,
      0.15 + i * 0.28,
      -1.7,
      3.8,
      0.255,
      0.12,
      i % 2 ? "#817668" : "#6d6254",
    ).material = surfaceMaterial(i % 2 ? "#817668" : "#6d6254", "wood");
  for (const x of [-1.95, 1.95])
    block(g, x, 1.9, -0.3, 0.12, 3.8, 3, "#30383a");
  block(g, 0, 3.85, -0.3, 4, 0.14, 3.2, "#30383a");
  block(g, 0, 0.55, 0.7, 3.8, 1.1, 0.8, "#777365");
  block(g, 0, 1.14, 0.7, 4, 0.12, 1, "#343c3d");
  face(
    g,
    (c) => {
      c.fillStyle = "#353e3e";
      c.fillRect(0, 0, 512, 512);
      c.fillStyle = "#fff8e7";
      c.textAlign = "center";
      c.font = "bold 180px Georgia";
      c.fillText("SOYJAK", 256, 230, 465);
      c.fillText("PARTY", 256, 445, 390);
    },
    3.4,
    1.2,
    0,
    2.9,
    -1.61,
  );
  for (const x of [-1.3, 1.3]) {
    block(g, x, 3.45, -0.4, 0.04, 0.6, 0.04, "#292f30");
    const lamp = new T.Mesh(
      new T.ConeGeometry(0.23, 0.18, 12),
      new T.MeshStandardMaterial({ color: "#303738" }),
    );
    lamp.position.set(x, 3.15, -0.4);
    g.add(lamp);
    block(g, x, 3.04, -0.4, 0.15, 0.04, 0.15, "#fff2c3");
  }
  for (const [y, r, c] of [
    [1.25, 0.25, "#c88c43"],
    [1.34, 0.27, "#4f2e20"],
    [1.4, 0.28, "#72a144"],
    [1.49, 0.26, "#dfa553"],
  ] as const) {
    const m = new T.Mesh(
      new T.CylinderGeometry(r, r, 0.09, 20),
      new T.MeshStandardMaterial({ color: c }),
    );
    m.position.set(-0.95, y, 0.7);
    g.add(m);
  }
  block(g, 1, 1.48, 0.7, 0.34, 0.62, 0.28, "#f0e8d5");
  face(
    g,
    (c) => {
      c.fillStyle = "#315548";
      c.font = "bold 90px Georgia";
      c.textAlign = "center";
      c.fillText("SOY", 256, 290);
    },
    0.28,
    0.35,
    1,
    1.47,
    0.846,
  );
  return g;
}
