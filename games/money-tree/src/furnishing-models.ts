import { makeModernFurniture } from "./marvels-furniture";
import { modernFurniture, type ModernFurnitureId } from "./marvels-catalog";
import * as T from "three";
import { furnitureById, type FurnishingId } from "./furnishings";
export function makeFurnishing(id: FurnishingId, seed = 0) {
  if (modernFurniture.some((f) => f.id === id))
    return makeModernFurniture(id as ModernFurnitureId);
  const root = new T.Group();
  root.name = `furnishing-${id}`;
  const materials = new Map<string, T.MeshStandardMaterial>();
  const add = (g: T.BufferGeometry, c: string, x = 0, y = 0, z = 0) => {
    let mat = materials.get(c);
    if (!mat) {
      mat = new T.MeshStandardMaterial({ color: c, roughness: 0.8 });
      materials.set(c, mat);
    }
    const m = new T.Mesh(g, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => add(new T.BoxGeometry(w, h, d), c, x, y, z);
  if (
    id === "royal-bed" ||
    id === "gilded-chair" ||
    id === "marble-planter" ||
    id === "palace-rug"
  ) {
    const gold = "#cba34b",
      wood = "#694429",
      velvet = "#853b61";
    const ball = (x: number, y: number, z: number, r: number) =>
      add(new T.SphereGeometry(r, 12, 8), gold, x, y, z);
    if (id === "royal-bed") {
      box(2.4, 0.4, 3.2, wood, 0, 0.3, 0);
      box(2.2, 0.3, 3, "#f1dfbc", 0, 0.65, 0);
      box(2.15, 0.13, 2.3, velvet, 0, 0.87, 0.32);
      box(2.3, 1.35, 0.18, wood, 0, 0.95, -1.5);
      box(1.5, 0.12, 0.55, "#fff1d4", 0, 0.92, -1.08);
      for (const x of [-1.08, 1.08])
        for (const z of [-1.47, 1.47]) {
          add(new T.CylinderGeometry(0.09, 0.12, 2.9, 12), wood, x, 1.45, z);
          ball(x, 3, z, 0.14);
        }
      box(2.45, 0.15, 3.3, gold, 0, 2.86, 0);
      for (let i = -4; i <= 4; i++) ball(i * 0.23, 1.43, -1.62, 0.055);
    }
    if (id === "gilded-chair") {
      box(1.15, 0.24, 1.25, wood, 0, 0.5, 0);
      box(1.05, 0.2, 1.1, velvet, 0, 0.72, 0);
      box(1.15, 1.55, 0.18, gold, 0, 1.25, -0.5);
      box(0.92, 1.35, 0.12, velvet, 0, 1.25, -0.38);
      for (const x of [-0.5, 0.5]) {
        box(0.12, 0.9, 1.1, gold, x, 0.78, 0);
        for (const z of [-0.45, 0.45])
          add(new T.CylinderGeometry(0.065, 0.11, 0.5, 10), wood, x, 0.25, z);
        ball(x, 1.3, -0.4, 0.1);
      }
      for (const y of [0.9, 1.2, 1.5])
        for (const x of [-0.25, 0, 0.25]) ball(x, y, -0.3, 0.035);
    }
    if (id === "marble-planter") {
      add(
        new T.LatheGeometry(
          [
            new T.Vector2(0.4, 0),
            new T.Vector2(0.4, 0.14),
            new T.Vector2(0.25, 0.25),
            new T.Vector2(0.3, 0.55),
            new T.Vector2(0.52, 0.95),
            new T.Vector2(0.48, 1.1),
            new T.Vector2(0.54, 1.15),
          ],
          24,
        ),
        "#e8ddc8",
      );
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        add(
          new T.CylinderGeometry(0.025, 0.025, 0.52, 6),
          gold,
          Math.cos(a) * 0.36,
          0.7,
          Math.sin(a) * 0.36,
        );
      }
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4;
        const leaf = add(
          new T.SphereGeometry(0.3, 10, 6),
          "#4b7741",
          Math.cos(a) * 0.35,
          1.2 + i * 0.08,
          Math.sin(a) * 0.35,
        );
        leaf.scale.set(1, 0.18, 0.6);
      }
    }
    if (id === "palace-rug") {
      box(4, 0.025, 3, "#723958", 0, 0.015, 0);
      for (const x of [-1.8, 1.8]) box(0.12, 0.028, 2.8, gold, x, 0.03, 0);
      for (const z of [-1.3, 1.3]) box(3.7, 0.028, 0.12, gold, 0, 0.03, z);
      for (let i = -3; i <= 3; i++)
        for (let j = -2; j <= 2; j++) {
          const ornament = add(
            new T.CylinderGeometry(0.16, 0.16, 0.015, 4),
            "#d1a853",
            i * 0.5,
            0.035,
            j * 0.48,
          );
          ornament.rotation.y = Math.PI / 4;
        }
    }
    return root;
  }
  if (furnitureById(id).wall) {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 320;
    const c = canvas.getContext("2d")!;
    const palette = ["#e3a524", "#ab3373", "#007d83", "#f2783e", "#274b67"];
    c.fillStyle = palette[seed % 5];
    c.fillRect(0, 0, 384, 320);
    if (id === "sunset" || id === "seascape") {
      for (let i = 0; i < 7; i++) {
        c.fillStyle = palette[(i + seed) % 5];
        c.beginPath();
        c.moveTo(0, 160 + i * 25);
        for (let x = 0; x <= 384; x += 12)
          c.lineTo(x, 160 + i * 25 + Math.sin(x * 0.025 + seed + i) * 15);
        c.lineTo(384, 320);
        c.lineTo(0, 320);
        c.fill();
      }
      c.fillStyle = "#ffe09b";
      c.beginPath();
      c.arc(80 + ((seed * 37) % 210), 85, 32, 0, Math.PI * 2);
      c.fill();
    } else if (id === "botanical") {
      for (let i = 0; i < 9; i++) {
        let x = 30 + i * 40,
          y = 130 + ((i * 53 + seed * 17) % 140);
        c.strokeStyle = "#183e37";
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(x, 320);
        c.lineTo(x, y);
        c.stroke();
        for (let j = 0; j < 4; j++) {
          c.fillStyle = palette[(i + j + seed) % 5];
          c.beginPath();
          c.ellipse(
            x + (j % 2 ? 15 : -15),
            y + j * 25,
            22,
            10,
            j % 2 ? 0.7 : -0.7,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
      }
    } else
      for (let i = 0; i < 12; i++) {
        c.fillStyle = palette[(i + seed) % 5];
        c.beginPath();
        c.arc(
          (i * 73 + seed * 31) % 384,
          (i * 97 + seed * 23) % 320,
          20 + ((i * 13 + seed) % 65),
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    box(1.2, 1, 0.065, "#b98743", 0, 0, 0);
    const map = new T.CanvasTexture(canvas);
    map.colorSpace = T.SRGBColorSpace;
    const pic = new T.Mesh(
      new T.PlaneGeometry(1.06, 0.86),
      new T.MeshBasicMaterial({ map }),
    );
    pic.position.z = 0.039;
    root.add(pic);
  } else if (id === "chair") {
    for (const x of [-0.4, 0.4])
      for (const z of [-0.4, 0.4])
        box(0.075, 0.45, 0.075, "#925b30", x, 0.225, z);
    box(0.95, 0.23, 0.95, "#ac3478", 0, 0.58, 0);
    box(1.05, 0.95, 0.16, "#84335f", 0, 1.02, 0.43);
    for (const x of [-0.5, 0.5]) box(0.17, 0.32, 1.05, "#ac3478", x, 0.82, 0);
    for (const x of [-0.28, 0, 0.28])
      for (const y of [0.85, 1.12])
        add(new T.SphereGeometry(0.018, 8, 6), "#dc9b52", x, y, 0.335);
  } else if (id === "pouf") {
    add(new T.CylinderGeometry(0.53, 0.53, 0.68, 20), "#b93b75", 0, 0.42, 0);
    add(new T.SphereGeometry(1, 20, 12), "#d95286", 0, 0.76, 0).scale.set(
      0.53,
      0.11,
      0.53,
    );
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      add(
        new T.CylinderGeometry(0.02, 0.02, 0.015, 8),
        "#8e2a59",
        Math.cos(a) * 0.32,
        0.85,
        Math.sin(a) * 0.32,
      );
    }
  } else if (id === "rug") {
    box(2.4, 0.025, 1.6, "#743552", 0, 0.018, 0);
    for (let i = 0; i < 9; i++)
      box(
        0.09,
        0.002,
        1.45,
        ["#edbf48", "#0d787e", "#da6634"][i % 3],
        -1.05 + i * 0.26,
        0.033,
        0,
      );
    for (const z of [-0.85, 0.85])
      for (let i = 0; i < 22; i++)
        box(0.02, 0.008, 0.13, "#f0d29b", -1.1 + i * 0.1, 0.02, z);
  } else {
    const potY = id === "pothos" ? 0.65 : 0;
    if (potY)
      for (const x of [-0.18, 0.18])
        for (const z of [-0.18, 0.18])
          box(0.04, 0.65, 0.04, "#aa7445", x, 0.325, z);
    add(
      new T.CylinderGeometry(0.23, 0.17, 0.4, 20),
      id === "snake" ? "#c8683a" : "#008789",
      0,
      0.2 + potY,
      0,
    );
    add(
      new T.CylinderGeometry(0.2, 0.2, 0.025, 20),
      "#513327",
      0,
      0.405 + potY,
      0,
    );
    for (let i = 0; i < (id === "snake" ? 9 : 14); i++) {
      const a = i * 2.399,
        y = 0.5 + potY + (id === "snake" ? 0 : i * 0.045),
        r = id === "snake" ? 0.12 : 0.17;
      if (id === "snake") {
        const shape = new T.Shape();
        shape.moveTo(-0.045, 0);
        shape.quadraticCurveTo(-0.09, 0.55, 0, 0.8 + (i % 3) * 0.15);
        shape.quadraticCurveTo(0.09, 0.55, 0.045, 0);
        const leaf = add(
          new T.ShapeGeometry(shape),
          i % 2 ? "#426832" : "#819745",
          Math.cos(a) * r,
          y,
          Math.sin(a) * r,
        );
        leaf.rotation.y = a;
        (leaf.material as T.MeshStandardMaterial).side = T.DoubleSide;
      } else {
        const shape = new T.Shape();
        shape.moveTo(0, -0.2);
        shape.bezierCurveTo(-0.34, 0.04, -0.22, 0.32, 0, 0.16);
        shape.bezierCurveTo(0.22, 0.32, 0.34, 0.04, 0, -0.2);
        if (id === "monstera")
          for (let j = 0; j < 3; j++) {
            const hole = new T.Path();
            hole.absellipse(
              (j % 2 ? 1 : -1) * 0.1,
              0.01 + j * 0.042,
              0.02,
              0.03,
              0,
              Math.PI * 2,
              false,
              0.3,
            );
            shape.holes.push(hole);
          }
        const leaf = add(
          new T.ShapeGeometry(shape),
          i % 3 ? "#16774d" : "#86a649",
          Math.cos(a) * 0.32,
          y,
          Math.sin(a) * 0.32,
        );
        leaf.rotation.set(-0.7, a, 0.1);
        (leaf.material as T.MeshStandardMaterial).side = T.DoubleSide;
        const stem = add(
          new T.CylinderGeometry(0.008, 0.01, 0.48, 5),
          "#375f30",
          Math.cos(a) * 0.14,
          y - 0.15,
          Math.sin(a) * 0.14,
        );
        stem.rotation.z = Math.cos(a) * 0.7;
        if (id === "pothos") {
          leaf.position.y = 0.9 - i * 0.065;
          leaf.position.x = Math.sin(i * 0.5) * 0.15 + 0.2;
        }
      }
    }
  }
  return root;
}
