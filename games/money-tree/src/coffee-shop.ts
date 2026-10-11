import * as T from "three";
import { surfaceMaterial } from "./textures";
export function makeCoffeeShop() {
  const g = new T.Group();
  g.name = "Grindset coffee interior";
  g.position.set(32, 0, -79);
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    wood = false,
  ) {
    const m = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      wood
        ? surfaceMaterial(color, "wood", 3, 2)
        : new T.MeshStandardMaterial({ color, roughness: 0.7 }),
    );
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  }
  function cylinder(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    color: string,
  ) {
    const m = new T.Mesh(
      new T.CylinderGeometry(r, r, h, 12),
      new T.MeshStandardMaterial({ color, roughness: 0.45 }),
    );
    m.position.set(x, y, z);
    g.add(m);
    return m;
  }
  const wall = box(0, 2, -2.4, 8, 0.15 + 3.8, 0.16, "#e8e0d5");
  wall.userData.cameraWall = true;
  const bricks = document.createElement("canvas");
  bricks.width = 512;
  bricks.height = 256;
  const bg = bricks.getContext("2d")!;
  bg.fillStyle = "#bcb4a8";
  bg.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 8; row++)
    for (let col = -1; col < 9; col++) {
      bg.fillStyle = (row + col) % 3 ? "#ede6dc" : "#e3dbd0";
      bg.fillRect(col * 64 + (row % 2) * 32, row * 32, 61, 29);
    }
  const brickTexture = new T.CanvasTexture(bricks);
  brickTexture.colorSpace = T.SRGBColorSpace;
  (wall.material as T.MeshStandardMaterial).map = brickTexture;
  (wall.material as T.MeshStandardMaterial).color.set("#ffffff");
  for (const y of [1.5, 2.45]) {
    box(0, y, -1.94, 7.1, 0.12, 0.75, "#b08862", true);
    for (let i = 0; i < 7; i++) {
      const x = -2.7 + i * 0.9;
      if (y > 2) {
        cylinder(
          x,
          y + 0.17,
          -1.85,
          0.13,
          0.22,
          ["#e7d7bf", "#98b8b3", "#394b49"][i % 3],
        );
        const handle = new T.Mesh(
          new T.TorusGeometry(0.09, 0.025, 5, 12),
          new T.MeshStandardMaterial({ color: "#e7d7bf" }),
        );
        handle.position.set(x + 0.15, y + 0.17, -1.85);
        g.add(handle);
      } else {
        box(x, y + 0.25, -1.83, 0.35, 0.5, 0.21, i % 2 ? "#3c4542" : "#ba9d7b");
        box(x, y + 0.25, -1.71, 0.23, 0.18, 0.012, "#eadab9");
      }
    }
  }
  box(0, 1.13, 1.8, 8, 0.16, 0.9, "#ab805a", true);
  for (let i = 0; i < 20; i++)
    box(
      -3.8 + i * 0.4,
      0.55,
      1.95,
      0.32,
      1,
      0.13,
      i % 2 ? "#be966d" : "#c5a27e",
      true,
    );
  // Espresso machine: two group heads, drip tray, knobs and steam wand.
  const machine = box(-2.35, 1.65, -0.8, 1.65, 0.7, 0.65, "#76837f");
  (machine.material as T.MeshStandardMaterial).metalness = 0.65;
  box(-2.35, 1.24, -0.35, 1.8, 0.08, 0.6, "#303a38");
  for (const x of [-2.75, -2]) {
    cylinder(x, 1.43, -0.45, 0.11, 0.2, "#c9c9b9");
    box(x + 0.15, 1.42, -0.1, 0.36, 0.06, 0.09, "#303a38");
    cylinder(x, 1.86, -0.45, 0.055, 0.08, "#e5debf");
  }
  box(-1.48, 1.43, -0.34, 0.045, 0.45, 0.045, "#d1c9b4");
  box(2.65, 1.5, -0.9, 0.55, 0.6, 0.5, "#303b39");
  cylinder(2.65, 2, -0.9, 0.22, 0.45, "#a2aea3");
  cylinder(2.65, 1.68, -0.9, 0.2, 0.12, "#493b30");
  for (const x of [-1.2, 0, 1.2]) {
    box(x, 4.05, 0, 0.06, 0.25, 3.8, "#3d423e");
    cylinder(x, 3.6, 0.15, 0.015, 0.7, "#303735");
    cylinder(x, 3.22, 0.15, 0.2, 0.08, "#6b6253");
    const bulb = new T.Mesh(
      new T.SphereGeometry(0.1, 10, 8),
      new T.MeshStandardMaterial({
        color: "#ffdf9a",
        emissive: "#e3a751",
        emissiveIntensity: 0.7,
      }),
    );
    bulb.position.set(x, 3.1, 0.15);
    g.add(bulb);
  }
  for (const x of [-3.3, 3.3]) {
    cylinder(x, 3.35, -0.5, 0.23, 0.32, "#ac8d65");
    for (let i = 0; i < 14; i++) {
      const leaf = box(
        x + Math.sin(i * 2.4) * 0.16,
        3.22 - i * 0.075,
        -0.5 + Math.cos(i * 2.4) * 0.13,
        0.12,
        0.19,
        0.035,
        i % 2 ? "#718d62" : "#91a978",
      );
      leaf.rotation.z = Math.sin(i) * 0.7;
    }
  }
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 480;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#233c37";
  ctx.fillRect(0, 0, 768, 480);
  ctx.fillStyle = "#f0e4c5";
  ctx.font = "110px Gaegu";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Drinks", c.width / 2, c.height / 2);
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  const menu = new T.Mesh(
    new T.PlaneGeometry(3.2, 2),
    new T.MeshStandardMaterial({ map: texture }),
  );
  menu.name = "grindset-drinks-board";
  menu.userData.text = "Drinks";
  menu.position.set(0.1, 2.7, -2.19);
  g.add(menu);
  return g;
}
