import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { MansionStyle } from "./housing";
export function makeEstate(style: MansionStyle) {
  const root = new T.Group();
  root.name = `player-${style}-mansion`;
  const walls: T.Mesh[] = [];
  const parts = new Map<string, T.BufferGeometry[]>();
  const add = (
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
    rotation = 0,
  ) => {
    if (g.index) {
      const original = g;
      g = g.toNonIndexed();
      original.dispose();
    }
    g.applyMatrix4(new T.Matrix4().makeRotationY(rotation));
    g.translate(x, y, z);
    (parts.get(c) ?? (parts.set(c, []), parts.get(c)!)).push(g);
  };
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
  ) => add(new T.BoxGeometry(w, h, d), c, x, y, z);
  const cylinder = (
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    c: string,
    n = 12,
  ) => add(new T.CylinderGeometry(r, r, h, n), c, x, y, z);
  const white = style === "hearst" ? "#d9c6a3" : "#eee8d7",
    roof = style === "hearst" ? "#a75b42" : "#a24732";
  box(0, 0.02, 0, 33, 0.08, 23, "#d4bd95");
  const wall = (x: number, z: number, w: number, d: number) => {
    const mesh = new T.Mesh(
      new T.BoxGeometry(w, 5.8, d),
      new T.MeshStandardMaterial({ color: white }),
    );
    mesh.position.set(x, 2.9, z);
    mesh.userData.dims = { w, h: 5.8, d };
    root.add(mesh);
    walls.push(mesh);
    return mesh;
  };
  wall(-16.5, 0, 0.35, 23);
  wall(16.5, 0, 0.35, 23);
  wall(0, -11.5, 33, 0.35);
  wall(-9, 11.5, 15, 0.35);
  wall(9, 11.5, 15, 0.35);
  box(0, 5, 11.5, 3, 1.6, 0.38, white);
  // Upper facade window recesses, mullions, sill caps and shutters.
  for (const x of [-14, -10, -6, 6, 10, 14])
    for (const y of [2, 4.6]) {
      box(x, y, 11.72, 1.35, 1.75, 0.07, "#52666b");
      box(x, y, 11.81, 0.06, 1.76, 0.07, "#efe6d3");
      box(x, y, 11.81, 1.4, 0.06, 0.07, "#efe6d3");
      box(x, y - 0.92, 11.81, 1.7, 0.13, 0.15, white);
      if (style === "vernon")
        for (const side of [-1, 1]) {
          box(x + side * 0.88, y, 11.76, 0.35, 1.8, 0.08, "#273e36");
          for (let slat = 0; slat < 9; slat++)
            box(
              x + side * 0.88,
              y - 0.72 + slat * 0.18,
              11.83,
              0.32,
              0.045,
              0.03,
              "#455349",
            );
        }
    }
  if (style === "vernon") {
    for (let line = 0; line < 28; line++)
      box(0, 0.12 + line * 0.2, -11.69, 33, 0.024, 0.02, "#d6d2c4");
    const roofGeometry = new T.BufferGeometry();
    roofGeometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [
          -17, 5.8, -12, 17, 5.8, -12, 17, 5.8, 12, -17, 5.8, 12, -10, 8.5, 0,
          10, 8.5, 0,
        ],
        3,
      ),
    );
    roofGeometry.setIndex([
      0, 4, 1, 1, 4, 5, 3, 2, 4, 2, 5, 4, 0, 3, 4, 1, 5, 2,
    ]);
    roofGeometry.computeVertexNormals();
    const roofMesh = new T.Mesh(
      roofGeometry,
      new T.MeshStandardMaterial({ color: roof, side: T.DoubleSide }),
    );
    roofMesh.name = "estate-roof";
    root.add(roofMesh);
    for (const x of [-13, -6, 6, 13]) {
      box(x, 8, 0, 0.8, 2.2, 0.9, "#ae7960");
      box(x, 9.14, 0, 1.05, 0.15, 1.15, "#d9c8af");
    }
    for (const x of [-7, -4, 0, 4, 7])
      cylinder(x, 2.6, 13, 0.18, 5.2, "#f5eddc");
    box(0, 5.25, 13, 16, 0.32, 3.5, white);
    const triangle = new T.Shape();
    triangle.moveTo(-8, 0);
    triangle.lineTo(8, 0);
    triangle.lineTo(0, 2.4);
    triangle.closePath();
    const pediment = new T.Mesh(
      new T.ExtrudeGeometry(triangle, { depth: 3.3, bevelEnabled: false }),
      new T.MeshStandardMaterial({ color: white }),
    );
    pediment.position.set(0, 5.4, 11.5);
    root.add(pediment);
    add(new T.TorusGeometry(0.35, 0.09, 6, 16), "#d0c4a6", 0, 6.6, 14.85);
    cylinder(0, 9.3, 0, 1.1, 2.1, white, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      box(
        Math.cos(a) * 1.04,
        9.5,
        Math.sin(a) * 1.04,
        0.35,
        1.2,
        0.08,
        "#52666b",
      );
    }
    add(new T.ConeGeometry(1.55, 1, 8), roof, 0, 10.85, 0);
    cylinder(0, 11.6, 0, 0.06, 0.8, "#f4e9d4");
  } else {
    const roofMesh = new T.Mesh(
      new T.BoxGeometry(33, 0.35, 23),
      new T.MeshStandardMaterial({ color: white }),
    );
    roofMesh.name = "estate-roof";
    roofMesh.position.y = 6;
    root.add(roofMesh);
    for (const x of [-10, 10]) {
      box(x, 8, 7, 5, 4.5, 5, white);
      for (let side = -1; side <= 1; side += 2) {
        box(x + side * 1.6, 9.1, 9.58, 0.9, 1.8, 0.1, "#34424a");
        add(
          new T.TorusGeometry(0.45, 0.08, 6, 16, Math.PI),
          "#eadcbd",
          x + side * 1.6,
          10,
          9.68,
        );
        cylinder(x + side * 1.6, 9.4, 9.48, 0.18, 0.6, "#bc9657");
      }
      for (const dx of [-2.4, 2.4])
        cylinder(x + dx, 8, 9.55, 0.15, 4.2, "#e9d8b8");
      add(new T.ConeGeometry(3.6, 2.3, 4), roof, x, 11.35, 7, Math.PI / 4);
      cylinder(x, 12.8, 7, 0.12, 1, "#d5b57c");
      for (const side of [-1, 1]) {
        box(x + side * 2.5, 10.3, 7, 0.24, 0.65, 5.3, "#e9d8b8");
        for (const dz of [-2.4, 2.4]) {
          cylinder(x + side * 2.4, 11, 7 + dz, 0.12, 1.1, "#d1ba96");
          add(
            new T.SphereGeometry(0.16, 8, 6),
            "#decba9",
            x + side * 2.4,
            11.55,
            7 + dz,
          );
        }
      }

      for (let j = 0; j < 5; j++)
        box(x, 7 + j * 0.7, 9.66, 5.2, 0.13, 0.17, "#bfa884");
    }
    for (let ornament = 0; ornament < 15; ornament++) {
      const x = -3.5 + ornament * 0.5;
      add(new T.SphereGeometry(0.11, 8, 6), "#bfa77f", x, 5.55, 11.9);
    }
    for (const x of [-4, -2, 2, 4]) cylinder(x, 2.9, 12, 0.16, 5.8, "#e7d4b4");
    for (let j = 0; j < 9; j++) {
      add(
        new T.TorusGeometry(1.6 - j * 0.09, 0.085, 6, 24, Math.PI),
        "#dcc8a4",
        0,
        3.8 + j * 0.05,
        11.8 + j * 0.04,
      );
    }
    for (const x of [-15, -12, -8, -5, 5, 8, 12, 15]) {
      cylinder(x, 5.5, 11.95, 0.09, 0.8, "#ad9974");
      add(new T.SphereGeometry(0.14, 8, 6), "#d9c3a3", x, 5.94, 11.95);
    }
    for (let j = 0; j < 9; j++)
      box(0, 0.05 + j * 0.045, 12.3 + j * 0.28, 7, 0.09, 0.28, "#cfbb98");
  }
  for (const [color, geometries] of parts) {
    const mesh = new T.Mesh(
      mergeGeometries(geometries)!,
      new T.MeshStandardMaterial({ color, roughness: 0.85 }),
    );
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    geometries.forEach((g) => g.dispose());
  }
  return { root, walls };
}
export function makeTruck(repo = false) {
  const root = new T.Group();
  root.name = repo ? "repo-man-pickup" : "moving-truck";
  const material = new T.MeshStandardMaterial({
    color: repo ? "#b84b35" : "#e8dcbd",
  });
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: T.Material = material,
  ) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    root.add(m);
  };
  box(0, 1.1, 0, 2.5, 0.8, 5);
  box(0, 1.85, 1.1, 2.3, 1.2, 2.1);
  const glass = new T.MeshStandardMaterial({
    color: "#729997",
    metalness: 0.15,
  });
  box(0, 2, 2.18, 2, 0.65, 0.03, glass);
  box(0, 1.9, -1.25, 2.4, repo ? 0.5 : 2.5, 2.7);
  const rubber = new T.MeshStandardMaterial({ color: "#2e302d" });
  for (const x of [-1.2, 1.2])
    for (const z of [-1.65, 1.65]) {
      const wheel = new T.Mesh(
        new T.CylinderGeometry(0.47, 0.47, 0.25, 16),
        rubber,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.48, z);
      root.add(wheel);
    }
  if (repo) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#f3e6c5";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#572319";
    c.font = "bold 70px sans-serif";
    c.textAlign = "center";
    c.fillText("REPO MAN", 256, 88);
    const texture = new T.CanvasTexture(canvas);
    const sign = new T.Mesh(
      new T.PlaneGeometry(2.3, 0.6),
      new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide }),
    );
    sign.position.set(0, 1.65, -2.61);
    root.add(sign);
    const side = sign.clone();
    side.position.set(1.26, 1.65, -1.25);
    side.rotation.y = Math.PI / 2;
    root.add(side);
  }
  return root;
}

export function makeRepoMan() {
  const root = new T.Group();
  root.name = "repo-man";
  const add = (
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => {
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ color: c }));
    m.position.set(x, y, z);
    root.add(m);
  };
  add(new T.CapsuleGeometry(0.3, 0.7, 5, 12), "#3b4d61", 0, 0.9, 0);
  add(new T.SphereGeometry(0.29, 12, 10), "#d5ad87", 0, 1.7, 0);
  for (const x of [-0.18, 0.18]) {
    add(new T.CapsuleGeometry(0.12, 0.5, 4, 10), "#283242", x, 0.35, 0);
    add(new T.SphereGeometry(0.13, 10, 8), "#d5ad87", x * 2.4, 1, 0);
  }
  add(new T.CylinderGeometry(0.34, 0.34, 0.1, 12), "#493e30", 0, 1.97, 0);
  return root;
}
