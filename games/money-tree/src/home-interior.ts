import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
import type { Rect } from "./game";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
/** Furnishings sit against the walls, leaving doorways and Mom's activity stations clear. */
export function decorateHome(scene: T.Scene, rects: Rect[]) {
  const root = new T.Group();
  root.name = "jewel-tone-home-interior";
  scene.add(root);
  const mats = new Map<string, T.MeshStandardMaterial>();
  const material = (color: string) => {
    if (!mats.has(color))
      mats.set(color, new T.MeshStandardMaterial({ color, roughness: 0.8 }));
    return mats.get(color)!;
  };
  function mesh(
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
  ) {
    const m = new T.Mesh(g, material(c));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
    return m;
  }
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
  ) =>
    mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.15),
      c,
      x,
      y,
      z,
    );
  const cyl = (
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    c: string,
  ) => mesh(new T.CylinderGeometry(r, r, h, 16), c, x, y, z);
  const colors = [
    "#ed6b35",
    "#ebbf2d",
    "#0d7478",
    "#bd326d",
    "#5e388a",
    "#ee9b9f",
  ];
  function bookcase(x: number, z: number, width: number) {
    box(x, 1.25, z, width, 2.5, 0.42, "#12717b");
    for (let row = 0; row < 4; row++) {
      const y = 0.19 + row * 0.57;
      box(x, y, z + 0.24, width, 0.06, 0.52, "#edbd62");
      for (let j = 0; j < Math.floor(width / 0.13) - 1; j++) {
        const bx = x - width / 2 + 0.14 + j * 0.13,
          h = 0.3 + ((j * 7 + row * 3) % 5) * 0.04;
        const spine = box(
          bx,
          y + h / 2 + 0.04,
          z + 0.275,
          0.105,
          h,
          0.24,
          colors[(j + row * 3) % 6],
        );
        spine.rotation.z = j % 7 === 0 ? 0.09 : 0;
        for (const line of [0.09, h - 0.06])
          box(bx, y + line, z + 0.402, 0.07, 0.014, 0.01, "#f9e2a7");
      }
    }
    box(x, 2.55, z, width + 0.08, 0.1, 0.5, "#12717b");
  }
  bookcase(-12.1, 6.42, 2.6);

  function plant(x: number, z: number, h: number, c: string) {
    cyl(x, 0.06, z, 0.32, 0.08, "#b87143");
    mesh(
      new T.CylinderGeometry(0.31, 0.25, 0.5, 24),
      "#efc480",
      x,
      0.29,
      z,
    ).name = "glazed-houseplant-pot";
    cyl(x, 0.54, z, 0.32, 0.055, "#d39052");
    cyl(x, 0.55, z, 0.27, 0.025, "#54362c");
    cyl(x, 0.55 + h / 2, z, 0.025, h, "#315a3d");
    for (let j = 0; j < 12; j++) {
      const a = j * 2.399,
        y = 0.6 + (h * j) / 14;
      const leaf = mesh(
        new T.SphereGeometry(1, 10, 6),
        j % 3 ? "#16734c" : "#429749",
        x + Math.cos(a) * 0.23,
        y,
        z + Math.sin(a) * 0.23,
      );
      leaf.scale.set(0.14, 0.035, 0.33);
      leaf.rotation.set(-0.3, a, 0.3);
      const stem = mesh(
        new T.CylinderGeometry(0.008, 0.012, 0.32, 4),
        "#315a3d",
        x + Math.cos(a) * 0.1,
        y - 0.06,
        z + Math.sin(a) * 0.1,
      );
      stem.rotation.z = -Math.cos(a) * 0.8;
      stem.rotation.x = Math.sin(a) * 0.8;
    }
  }
  plant(-20.35, 7, 1.45, "#dd7b35");
  plant(-9.65, 13.3, 1.15, "#49388a");
  plant(-20.2, -1, 1.25, "#0d7478");
  plant(-1.65, 13.2, 1.3, "#bd326d");
  for (const z of [8.45, 11.55]) box(-19, 1.03, z, 2.2, 0.65, 0.26, "#ae3c2c");
  for (const z of [9.05, 10.8]) {
    const cushion = mesh(
      new T.SphereGeometry(1, 18, 12),
      z < 10 ? "#e7ae20" : "#ad347c",
      -19.73,
      1.27,
      z,
    );
    cushion.scale.set(0.18, 0.37, 0.36);
    cushion.rotation.z = -0.15;
    for (const dy of [-0.1, 0, 0.1])
      mesh(new T.SphereGeometry(0.016, 8, 6), "#f5dc9b", -19.552, 1.27 + dy, z);
  }
  box(-19.1, 1, 10, 1.42, 0.035, 0.68, "#166b78");
  for (let j = 0; j < 8; j++)
    box(-18.41, 0.95, 9.71 + j * 0.08, 0.12, 0.018, 0.025, "#efbf6b");
  const rugCanvas = document.createElement("canvas");
  rugCanvas.width = rugCanvas.height = 512;
  const c = rugCanvas.getContext("2d")!;
  c.fillStyle = "#72344f";
  c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5; i++) {
    c.strokeStyle = ["#e9b539", "#e96633", "#163f50"][i % 3];
    c.lineWidth = 6;
    c.strokeRect(12 + i * 9, 12 + i * 9, 488 - i * 18, 488 - i * 18);
  }
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 5; col++) {
      const x = 88 + col * 84,
        y = 88 + row * 84;
      c.fillStyle = colors[(row + col) % 6];
      c.beginPath();
      c.moveTo(x, y - 24);
      c.lineTo(x + 24, y);
      c.lineTo(x, y + 24);
      c.lineTo(x - 24, y);
      c.fill();
      c.fillStyle = "#f5dba4";
      c.fillRect(x - 3, y - 3, 6, 6);
    }
  const rugMap = new T.CanvasTexture(rugCanvas);
  rugMap.colorSpace = T.SRGBColorSpace;
  const rug = new T.Mesh(
    new T.PlaneGeometry(5.2, 5.8),
    new T.MeshStandardMaterial({ map: rugMap, roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-16.1, 0.066, 10.1);
  rug.name = "woven-jewel-rug";
  root.add(rug);
  cyl(-18, 0.8, 7.4, 0.55, 0.1, "#ba7541");
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const leg = box(
      -18 + Math.cos(a) * 0.28,
      0.39,
      7.4 + Math.sin(a) * 0.28,
      0.08,
      0.75,
      0.08,
      "#764f31",
    );
    leg.rotation.z = Math.cos(a) * 0.13;
  }
  cyl(-18, 0.91, 7.4, 0.27, 0.035, "#dfbc62");
  mesh(new T.SphereGeometry(0.15, 16, 10), "#0d7478", -18, 1.03, 7.4).scale.y =
    0.8;
  cyl(-18, 1.16, 7.4, 0.09, 0.03, "#edbf64");
  mesh(
    new T.CylinderGeometry(0.025, 0.05, 0.2, 10),
    "#0d7478",
    -17.83,
    1.06,
    7.4,
  ).rotation.z = -0.9;
  mesh(
    new T.TorusGeometry(0.09, 0.02, 6, 16),
    "#edbf64",
    -18.16,
    1.04,
    7.4,
  ).rotation.y = Math.PI / 2;
  for (const dx of [-0.32, 0.32]) {
    cyl(-18 + dx, 0.94, 7.55, 0.08, 0.13, "#f4d790");
    cyl(-18 + dx, 1.01, 7.55, 0.061, 0.007, "#824421");
  }
  const art = document.createElement("canvas");
  art.width = 256;
  art.height = 384;
  const a = art.getContext("2d")!;
  a.fillStyle = "#ee9b9f";
  a.fillRect(0, 0, 256, 384);
  for (let j = 0; j < 4; j++) {
    a.strokeStyle = colors[j];
    a.lineWidth = 25;
    a.beginPath();
    a.moveTo(35 + j * 24, 384);
    a.lineTo(35 + j * 24, 160);
    a.arc(128, 160, 93 - j * 24, Math.PI, 0);
    a.lineTo(221 - j * 24, 384);
    a.stroke();
  }
  const map = new T.CanvasTexture(art);
  map.colorSpace = T.SRGBColorSpace;
  box(-8.81, 2.05, 11.6, 0.06, 1.58, 1.12, "#dcad4b");
  const picture = new T.Mesh(
    new T.PlaneGeometry(0.98, 1.44),
    new T.MeshBasicMaterial({ map }),
  );
  picture.name = "moms-wall-painting";
  picture.rotation.y = Math.PI / 2;
  picture.position.set(-8.77, 2.05, 11.6);
  root.add(picture);
  for (const z of [7.7, 12.3])
    for (let j = 0; j < 6; j++)
      cyl(
        -20.77,
        1.55,
        z + j * 0.1,
        0.075,
        2.45,
        j % 2 ? "#e7aa2e" : "#c88422",
      );
  const chairStart = root.children.length;
  box(-6.6, 0.6, 10.2, 1.05, 0.25, 1.05, "#0a667a");
  mesh(new T.SphereGeometry(1, 18, 12), "#11506d", -6.6, 1.1, 10.66).scale.set(
    0.57,
    0.62,
    0.16,
  );
  for (const side of [-1, 1]) {
    mesh(
      new T.SphereGeometry(1, 18, 12),
      "#146b79",
      -6.6 + side * 0.51,
      0.82,
      10.2,
    ).scale.set(0.14, 0.22, 0.52);
    for (const z of [9.85, 10.55])
      cyl(-6.6 + side * 0.37, 0.24, z, 0.045, 0.42, "#b88642");
  }
  mesh(new T.SphereGeometry(1, 18, 12), "#e8b125", -6.6, 0.98, 10.48).scale.set(
    0.34,
    0.33,
    0.12,
  );
  const chairCenter = new T.Vector3(-6.6, 0, 10.2);
  for (const child of root.children.slice(chairStart)) {
    child.position
      .sub(chairCenter)
      .applyAxisAngle(new T.Vector3(0, 1, 0), -Math.PI / 2)
      .add(chairCenter);
    child.rotation.y -= Math.PI / 2;
  }
  rects.push({ x: -6.6, z: 10.2, w: 1.25, d: 1.35, clearHeight: 1.72 });
  // Batch decorative solids by material so the extra books do not add hundreds of draw calls.
  root.updateMatrixWorld(true);
  for (const mat of mats.values()) {
    const pieces = root.children.filter(
      (o): o is T.Mesh => o instanceof T.Mesh && o.material === mat,
    );
    const geometry = mergeGeometries(
      pieces.map((o) => {
        const geometry = o.geometry.clone().applyMatrix4(o.matrix);
        return geometry.index ? geometry.toNonIndexed() : geometry;
      }),
    );
    if (geometry) {
      const batch = new T.Mesh(geometry, mat);
      batch.castShadow = true;
      batch.receiveShadow = true;
      root.add(batch);
    }
    pieces.forEach((o) => {
      o.removeFromParent();
      o.geometry.dispose();
    });
  }
  return root;
}
