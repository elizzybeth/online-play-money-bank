import * as T from "three";
import type { Rect } from "./game";
import { surfaceMaterial } from "./textures";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function canvasTexture(
  width: number,
  height: number,
  draw: (c: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}

export function terraceBoutique(
  root: T.Group,
  obstacles: Rect[],
  walls: T.Mesh[],
) {
  const materials = new Map<string, T.MeshStandardMaterial>();
  const material = (color: string) => {
    if (!materials.has(color))
      materials.set(
        color,
        new T.MeshStandardMaterial({ color, roughness: 0.72 }),
      );
    return materials.get(color)!;
  };
  const add = (
    geometry: T.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = root,
  ) => {
    const m = new T.Mesh(geometry, material(color));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    solid = false,
  ) => {
    const m = add(new T.BoxGeometry(w, h, d), color, x, y, z);
    if (solid) {
      obstacles.push({ x, z, w, d, clearHeight: y + h / 2 });
      walls.push(m);
    }
    return m;
  };
  const brass = "#b39257",
    teal = "#348b87",
    cream = "#eee8da";
  material(brass).metalness = 0.65;
  material(brass).roughness = 0.32;
  box(-12, 0.025, -318, 24, 0.05, 14, "#9f9180");
  // Whitewashed floorboards, with actual shallow seams rather than coplanar decals.
  const floorMat = surfaceMaterial("#dfd9c9", "wood", 3, 1);
  for (let i = 0; i < 19; i++) {
    const plank = box(-12, 0.065, -324.6 + i * 0.72, 23.65, 0.04, 0.705, cream);
    plank.material = floorMat;
  }
  box(-12, 3.5, -325, 24, 7, 0.35, teal, true);
  for (const x of [-24, 0]) {
    box(x, 3.5, -318, 0.35, 7, 14, cream, true);
    box(x + (x < -12 ? 0.19 : -0.19), 0.65, -318, 0.05, 1.2, 13.6, "#b7c8bc");
  }
  for (let i = 0; i < 8; i++)
    box(-12, 1.7 + i * 0.36, -324.79, 23.6, 0.035, 0.035, "#7bb1a7");
  const roof = box(-12, 7.2, -318, 25, 0.4, 15, "#294747");
  roof.name = "terrace-threads-roof";
  // Glazed shopfront, fluted turquoise pilasters, deep cornice and brass lanterns.
  for (const x of [-20, -4]) {
    box(x, 0.65, -311, 8, 1.3, 0.4, teal, true);
    box(x, 5.4, -311, 8, 3.2, 0.4, teal, true);
    obstacles.push({ x, z: -311, w: 8, d: 0.4, clearHeight: 7 });
    const glass = box(x, 2.55, -311, 7, 2.45, 0.055, "#b7dcd4");
    glass.material = new T.MeshStandardMaterial({
      color: "#c6e4dc",
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      roughness: 0.15,
    });
    glass.castShadow = false;
    for (const edge of [-1, 1]) {
      box(x + edge * 3.55, 2.55, -310.94, 0.12, 2.6, 0.14, "#203b39");
      box(x, 2.55 + edge * 1.3, -310.94, 7.2, 0.12, 0.14, "#203b39");
    }
    box(x, 2.55, -310.92, 0.06, 2.5, 0.12, brass);
    for (const side of [-1, 1])
      box(x + side * 2.8, 0.7, -310.73, 0.04, 0.8, 0.02, "#9bc8bb");
  }
  for (const x of [-24, -16, -8, 0]) {
    box(x, 2.7, -310.7, 0.65, 5.4, 0.75, "#72b4aa");
    for (let i = -2; i <= 2; i++)
      box(x + i * 0.105, 2.75, -310.29, 0.035, 4.65, 0.045, "#b6d9c9");
    for (const y of [0.3, 5.15]) {
      box(x, y, -310.65, 0.95, 0.22, 0.95, "#9bcabc");
      box(x, y + 0.15, -310.65, 0.8, 0.08, 0.85, cream);
    }
    add(new T.OctahedronGeometry(0.2), brass, x, 5.55, -310.6);
  }
  for (const y of [5.85, 6.95])
    box(-12, y, -310.7, 24.7, 0.18, 0.95, "#6ba99e");
  // The entrance remains fully open, with a checkerboard threshold.
  for (let ix = 0; ix < 8; ix++)
    for (let iz = 0; iz < 2; iz++)
      box(
        -15.5 + ix,
        0.11,
        -311.3 + iz,
        0.99,
        0.035,
        0.99,
        (ix + iz) % 2 ? "#253b39" : "#f3eddb",
      );
  box(-12, 6.2, -310.2, 14.9, 2.8, 0.55, "#293b40");
  const sign = canvasTexture(1800, 500, (c) => {
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (const [text, y, size] of [
      ["TERRACE", 143, 165],
      ["THREADS", 360, 211],
    ] as const) {
      c.font = `500 ${size}px Arial, sans-serif`;
      c.lineJoin = "round";
      c.shadowColor = "#ffd58b";
      c.shadowBlur = 45;
      c.lineWidth = 7;
      c.strokeStyle = "#f4ce8b";
      c.strokeText(text, 900, y);
      c.strokeText(text, 900, y);
      c.shadowBlur = 0;
      c.fillStyle = "#c3a06a";
      c.fillText(text, 903, y + 4);
      c.fillStyle = "#292c2a";
      c.fillText(text, 900, y);
    }
  });
  const lettering = new T.Mesh(
    new T.PlaneGeometry(14.1, 3.1),
    new T.MeshBasicMaterial({
      map: sign,
      transparent: true,
      depthWrite: false,
    }),
  );
  lettering.position.set(-12, 6.2, -309.9);
  lettering.name = "terrace-threads-backlit-lettering";
  root.add(lettering);
  for (const x of [-16, -8]) {
    box(x, 3.5, -310.1, 0.13, 0.7, 0.15, brass);
    const lantern = add(
      new T.CylinderGeometry(0.22, 0.15, 0.56, 6),
      cream,
      x,
      3.35,
      -309.85,
    );
    lantern.material = new T.MeshStandardMaterial({
      color: "#ffe8b6",
      emissive: "#ffcf78",
      emissiveIntensity: 0.6,
      roughness: 0.35,
    });
    for (const y of [3.02, 3.68])
      add(new T.ConeGeometry(0.28, 0.18, 6), brass, x, y, -309.85);
  }
  // A woven teal rug with the geometric brass lattice from the reference boutique.
  const rug = canvasTexture(1024, 256, (c) => {
    c.fillStyle = "#28676c";
    c.fillRect(0, 0, 1024, 256);
    c.strokeStyle = "#b5a87a";
    c.lineWidth = 5;
    for (let x = -80; x < 1150; x += 130)
      for (let y = -70; y < 350; y += 110) {
        c.strokeRect(x, y, 90, 75);
        c.strokeRect(x + 28, y + 26, 90, 75);
      }
    c.strokeStyle = "#e4d4a6";
    c.lineWidth = 9;
    c.strokeRect(13, 13, 998, 230);
  });
  const carpet = new T.Mesh(
    new T.PlaneGeometry(19.8, 3.25),
    new T.MeshStandardMaterial({ map: rug, roughness: 1 }),
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(-12, 0.105, -318.2);
  carpet.name = "terrace-threads-woven-rug";
  root.add(carpet);
  // A small pink velvet seat and whitewashed display cabinet flank the aisle.
  const velvet = "#bd5386";
  box(-22.3, 0.54, -318.4, 1.25, 0.22, 1.15, velvet, true);
  const back = add(
    new T.SphereGeometry(1, 16, 12),
    velvet,
    -22.3,
    1.15,
    -318.85,
  );
  back.scale.set(0.68, 0.7, 0.18);
  for (const x of [-22.78, -21.82])
    for (const z of [-318.82, -317.98])
      box(x, 0.26, z, 0.055, 0.5, 0.055, brass);
  box(-1.25, 0.65, -318.4, 1.4, 1.25, 3, cream, true);
  box(-1.25, 1.32, -318.4, 1.6, 0.1, 3.2, "#baab8f");
  for (let i = 0; i < 3; i++) {
    box(-2, 0.8, -319.35 + i * 0.95, 0.035, 0.5, 0.82, "#d2c8b3");
    add(
      new T.SphereGeometry(0.055, 8, 6),
      brass,
      -2.04,
      0.83,
      -319.35 + i * 0.95,
    );
    for (let j = 0; j < 3; j++)
      box(
        -1.3,
        1.44 + j * 0.12,
        -319.35 + i * 0.95,
        1.1,
        0.1,
        0.75,
        ["#dba3b4", "#b3cdd1", "#c7b6d9"][i],
      );
  }
  // Timber slat-wall shelves hold folded linens and ribbon spools, keeping stock clear.
  for (const x of [-23.7, -0.3])
    for (const y of [2, 2.9, 3.8]) {
      box(x, y, -321.2, 0.65, 0.08, 4.7, "#c5b396");
      for (let i = 0; i < 4; i++) {
        const spool = add(
          new T.CylinderGeometry(0.16, 0.16, 0.35, 12),
          ["#d6a0ac", "#c6b6d8", "#8fb7a3", "#d9c68b"][i],
          x,
          y + 0.22,
          -323 + i * 1.1,
        );
        spool.rotation.z = Math.PI / 2;
      }
    }
  const mirror = add(
    new T.CircleGeometry(0.85, 40),
    "#bad5ce",
    -23.78,
    3,
    -317.8,
  );
  mirror.rotation.y = Math.PI / 2;
  mirror.scale.set(0.75, 1.25, 1);
  const frame = add(
    new T.TorusGeometry(0.87, 0.045, 6, 40),
    brass,
    -23.75,
    3,
    -317.8,
  );
  frame.rotation.y = Math.PI / 2;
  frame.scale.set(0.75, 1.25, 1);
  const board = canvasTexture(768, 512, (c) => {
    c.fillStyle = "#b79a70";
    c.fillRect(0, 0, 768, 512);
    c.fillStyle = "#253b38";
    c.fillRect(22, 22, 724, 468);
    c.strokeStyle = "#394a43";
    c.lineWidth = 3;
    for (let y = 32; y < 490; y += 13) {
      c.beginPath();
      c.moveTo(24, y);
      c.lineTo(744, y);
      c.stroke();
    }
    c.textAlign = "center";
    c.fillStyle = "#f5efdf";
    c.font = "32px monospace";
    [
      "LIFE ISN’T PERFECT.",
      "BUT YOUR HAT",
      "CAN BE.",
      "TERRACE THREADS",
    ].forEach((t, i) => c.fillText(t, 384, 120 + i * 90));
  });
  const boardMesh = new T.Mesh(
    new T.PlaneGeometry(4.2, 2.8),
    new T.MeshBasicMaterial({ map: board }),
  );
  boardMesh.position.set(-12, 3.6, -324.75);
  root.add(boardMesh);
  // Beads share one instanced draw call per chandelier; no animated lights or per-frame work.
  for (const x of [-18, -6]) {
    const beads: T.Vector3[] = [];
    for (let strand = 0; strand < 12; strand++)
      for (let i = 0; i <= 18; i++) {
        const t = i / 18,
          a = (strand * Math.PI) / 6;
        const radius =
          t < 0.58
            ? 0.1 + t * 1.25
            : 0.825 * Math.sin((((1 - t) / 0.42) * Math.PI) / 2);
        beads.push(
          new T.Vector3(
            x + Math.cos(a) * radius,
            6.55 - t * 1.8,
            -318.15 + Math.sin(a) * radius,
          ),
        );
      }
    const pearls = new T.InstancedMesh(
      new T.SphereGeometry(0.05, 7, 5),
      material("#e6e8d9"),
      beads.length,
    );
    const matrix = new T.Matrix4();
    beads.forEach((p, i) => {
      matrix.makeTranslation(p.x, p.y, p.z);
      pearls.setMatrixAt(i, matrix);
      pearls.setColorAt(i, new T.Color(i % 3 ? "#efead8" : "#8fa89f"));
    });
    pearls.name = "terrace-threads-beaded-chandelier";
    root.add(pearls);
    box(x, 6.82, -318.15, 0.035, 0.7, 0.035, brass);
    const ring = add(
      new T.TorusGeometry(0.83, 0.025, 6, 40),
      brass,
      x,
      5.5,
      -318.15,
    );
    ring.rotation.x = Math.PI / 2;
    const bulb = add(new T.SphereGeometry(0.16, 12, 8), cream, x, 5.7, -318.15);
    bulb.material = new T.MeshStandardMaterial({
      color: "#fff2d3",
      emissive: "#ffd99b",
      emissiveIntensity: 0.65,
    });
  }
  // Feathered palm silhouettes, built as one leaf mesh per planter.
  for (const x of [-17.2, -6.8]) {
    add(
      new T.CylinderGeometry(0.48, 0.38, 0.8, 4),
      "#334342",
      x,
      0.42,
      -309.15,
    ).rotation.y = Math.PI / 4;
    obstacles.push({ x, z: -309.15, w: 0.8, d: 0.8, clearHeight: 0.85 });
    const verts: number[] = [],
      index: number[] = [];
    for (let j = 0; j < 9; j++) {
      const a = (j * Math.PI * 2) / 9;
      const axis = new T.Vector3(Math.cos(a), 0, Math.sin(a));
      const across = new T.Vector3(-Math.sin(a), 0, Math.cos(a));
      const point = (t: number) =>
        new T.Vector3(
          x + axis.x * t * 1.35,
          0.8 + Math.sin(t * 2.0) * 1.55,
          -309.15 + axis.z * t * 1.35,
        );
      for (let k = 1; k <= 11; k++)
        for (const side of [-1, 1]) {
          const t = k / 12,
            p = point(t),
            q = point(t + 0.045),
            tip = point(t - 0.07).addScaledVector(
              across,
              side * Math.sin(t * Math.PI) * 0.38,
            );
          const n = verts.length / 3;
          verts.push(...p.toArray(), ...q.toArray(), ...tip.toArray());
          index.push(n, n + 1, n + 2);
        }
    }
    const leaves = new T.BufferGeometry();
    leaves.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
    leaves.setIndex(index);
    leaves.computeVertexNormals();
    const palm = add(leaves, "#488358", 0, 0, 0);
    palm.material.side = T.DoubleSide;
  }
  // Bake static ornament into material batches. Keep roofs and collision walls
  // separate because camera occlusion changes those meshes independently.
  const groups = new Map<T.Material, T.Mesh[]>();
  for (const child of root.children) {
    if (
      !(child instanceof T.Mesh) ||
      child instanceof T.InstancedMesh ||
      child === roof ||
      walls.includes(child) ||
      Array.isArray(child.material) ||
      !(child.material instanceof T.MeshStandardMaterial) ||
      child.material.transparent
    )
      continue;
    const list = groups.get(child.material) ?? [];
    list.push(child);
    groups.set(child.material, list);
  }
  for (const [mat, meshes] of groups) {
    if (meshes.length < 2) continue;
    const pieces = meshes.map((m) => {
      m.updateMatrix();
      return m.geometry.clone().applyMatrix4(m.matrix);
    });
    const geometry = mergeGeometries(pieces);
    pieces.forEach((g) => g.dispose());
    if (!geometry) continue;
    for (const m of meshes) {
      root.remove(m);
      m.geometry.dispose();
    }
    const batch = new T.Mesh(geometry, mat);
    batch.castShadow = batch.receiveShadow = true;
    root.add(batch);
  }
  return { roof };
}
