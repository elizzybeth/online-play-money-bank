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
  resolution = 512,
) {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const c = canvas.getContext("2d")!;
  c.scale(resolution / 512, resolution / 512);
  draw(c);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
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
      c.fillStyle = "#171714";
      c.font = "96px Gaegu, cursive";
      c.textAlign = "center";
      const text = "Serious Hat";
      const widths = [...text].map((letter) => c.measureText(letter).width);
      let x = (512 - widths.reduce((sum, n) => sum + n, 0)) / 2;
      [...text].forEach((letter, i) => {
        c.save();
        c.translate(x + widths[i] / 2, 290 + Math.sin(i * 2) * 10);
        c.rotate(Math.sin(i * 3) * 0.045);
        c.fillText(letter, 0, 0);
        c.restore();
        x += widths[i];
      });
    },
    0.94,
    0.44,
    0,
    0.226,
    0.128,
  );
  lettering.rotation.x = -Math.atan(0.25 / 0.45);
  const back = lettering.clone();
  back.position.z *= -1;
  back.rotation.set(Math.atan(0.25 / 0.45), Math.PI, 0);
  g.add(back);
  const ends = document.createElement("canvas");
  ends.width = ends.height = 512;
  const ink = ends.getContext("2d")!;
  ink.fillStyle = "#e6ddcb";
  ink.fillRect(0, 0, 512, 512);
  ink.fillStyle = "#171714";
  ink.textAlign = "center";
  ink.font = "96px Gaegu, cursive";
  ink.fillText("Serious", 256, 365);
  ink.font = "120px Gaegu, cursive";
  ink.fillText("Hat", 256, 475);
  const endTexture = new T.CanvasTexture(ends);
  endTexture.colorSpace = T.SRGBColorSpace;
  const endMaterial = new T.MeshStandardMaterial({
    map: endTexture,
    roughness: 1,
  });
  const endGeometry = new T.ShapeGeometry(shape);
  const positions = endGeometry.attributes.position;
  endGeometry.setAttribute(
    "uv",
    new T.Float32BufferAttribute(
      Array.from({ length: positions.count }, (_, i) => [
        positions.getX(i) / 0.5 + 0.5,
        positions.getY(i) / 0.45,
      ]).flat(),
      2,
    ),
  );
  for (const side of [-1, 1]) {
    const end = new T.Mesh(endGeometry, endMaterial);
    end.position.x = side * 0.535;
    end.rotation.y = (side * Math.PI) / 2;
    g.add(end);
  }
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
    2048,
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
