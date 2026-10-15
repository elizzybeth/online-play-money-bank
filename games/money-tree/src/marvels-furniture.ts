import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { ModernFurnitureId } from "./marvels-catalog";
export function makeModernFurniture(id: ModernFurnitureId) {
  const g = new T.Group();
  g.name = `furnishing-${id}`;
  const mats = new Map<string, T.MeshStandardMaterial>();
  function part(geo: T.BufferGeometry, c: string, x = 0, y = 0, z = 0) {
    let mat = mats.get(c);
    if (!mat) {
      mat = new T.MeshStandardMaterial({
        color: c,
        roughness: c === "#245846" ? 0.42 : 0.78,
      });
      mats.set(c, mat);
    }
    const m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
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
    part(
      ["#e6dfcf", "#f1ebdf", "#245846"].includes(c)
        ? new RoundedBoxGeometry(w, h, d, 3, Math.min(0.08, h * 0.25))
        : new T.BoxGeometry(w, h, d),
      c,
      x,
      y,
      z,
    );
  const ell = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: string,
  ) => {
    const m = part(new T.SphereGeometry(1, 16, 10), c, x, y, z);
    m.scale.set(w, h, d);
    return m;
  };
  const tube = (pts: T.Vector3[], r: number, c: string) =>
    part(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 32, r, 6, false), c);
  const leg = (x: number, z: number, h = 0.35) =>
    part(new T.CylinderGeometry(0.045, 0.065, h, 8), "#534534", x, h / 2, z);
  if (id === "linen-sectional" || id === "chesterfield") {
    const green = id === "chesterfield",
      c = green ? "#245846" : "#e6dfcf",
      w = green ? 3.3 : 3.5;
    box(0, 0.37, 0, w, 0.26, 1.15, green ? "#245846" : "#897052");
    for (const x of [-w / 2 + 0.18, w / 2 - 0.18])
      for (const z of [-0.4, 0.4]) leg(x, z);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.96;
      box(x, 0.63, 0.06, 0.92, 0.26, 1, c);
    }
    box(0, 1.02, -0.48, w, 0.74, 0.28, c);
    for (const x of [-w / 2 + 0.13, w / 2 - 0.13]) {
      if (green) {
        const arm = part(
          new T.CylinderGeometry(0.22, 0.22, 1.15, 20),
          c,
          x,
          0.99,
          0,
        );
        arm.rotation.x = Math.PI / 2;
        box(x, 0.68, 0, 0.32, 0.6, 1.15, c);
      } else box(x, 0.86, 0, 0.15, 0.58, 1.15, "#897052");
    }
    if (green) {
      for (let row = 0; row < 3; row++)
        for (let i = 0; i < 10; i++) {
          const x = -1.28 + i * 0.28 + (row % 2) * 0.05,
            y = 0.79 + row * 0.2;
          ell(x, y, -0.318, 0.026, 0.026, 0.018, "#123e30");
          for (const d of [-1, 1])
            tube(
              [
                new T.Vector3(x - 0.1, y + d * 0.08, -0.32),
                new T.Vector3(x, y, -0.327),
                new T.Vector3(x + 0.1, y - d * 0.08, -0.32),
              ],
              0.006,
              "#366d56",
            );
        }
      for (const x of [-1.53, 1.53])
        for (let i = 0; i < 12; i++)
          ell(x, 0.45 + i * 0.04, 0.585, 0.013, 0.013, 0.012, "#b4a469");
    } else {
      box(-1.1, 0.4, 1, 0.95, 0.25, 1.4, "#897052");
      box(-1.1, 0.64, 1, 0.95, 0.25, 1.4, c);
      leg(-1.4, 1.55);
      leg(-0.8, 1.55);
      for (const x of [-0.9, 0, 0.9]) {
        const pillow = box(x, 1.04, -0.24, 0.66, 0.52, 0.2, "#f1ebdf");
        pillow.rotation.z = x * 0.1;
      }
    }
  }
  if (id === "petal-chair") {
    part(new T.CylinderGeometry(0.52, 0.55, 0.07, 32), "#8d9190", 0, 0.035, 0);
    part(new T.CylinderGeometry(0.065, 0.085, 0.48, 16), "#8d9190", 0, 0.28, 0);
    const vertices: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      for (let j = 0; j <= 14; j++) {
        const r = j / 14,
          back = (1 - Math.cos(a)) * 0.5;
        const fold = Math.sin(a * 35 + r * 3) * 0.023 * r;
        const radius = r * (0.73 + fold);
        vertices.push(
          Math.sin(a) * radius,
          0.55 + 0.19 * r * r + back * 0.85 * r * r + fold,
          Math.cos(a) * radius,
        );
        uv.push(i / 64, r);
        if (i < 64 && j < 14) {
          const k = i * 15 + j;
          indices.push(k, k + 1, k + 15, k + 1, k + 16, k + 15);
        }
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const shell = part(geo, "#bd815a");
    shell.material.side = T.DoubleSide;
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      const pts = Array.from({ length: 12 }, (_, j) => {
        const r = 0.25 + (j / 11) * 0.75;
        return new T.Vector3(
          Math.sin(a) * r * 0.73,
          0.555 +
            0.19 * r * r +
            (1 - Math.cos(a)) * 0.425 * r * r +
            Math.sin(a * 35 + r * 3) * 0.023 * r,
          Math.cos(a) * r * 0.73,
        );
      });
      tube(pts, 0.008, i % 2 ? "#a16b49" : "#d2976b");
    }
  }
  if (id === "arc-lamp") {
    part(
      new T.CylinderGeometry(0.39, 0.42, 0.055, 32),
      "#34312b",
      0.55,
      0.03,
      0,
    );
    const curve = new T.CubicBezierCurve3(
      new T.Vector3(0.55, 0.05, 0),
      new T.Vector3(1.6, 1.65, 0),
      new T.Vector3(0.8, 2.7, 0),
      new T.Vector3(-0.72, 2.55, 0),
    );
    const beam = part(
      new T.TubeGeometry(curve, 48, 0.055, 8, false),
      "#8a5e37",
    );
    beam.scale.z = 0.55;
    part(
      new T.CylinderGeometry(0.38, 0.4, 0.4, 40, 1, true),
      "#e4ddcb",
      -0.72,
      2.29,
      0,
    ).material.side = T.DoubleSide;
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      box(
        -0.72 + Math.sin(a) * 0.392,
        2.29,
        Math.cos(a) * 0.392,
        0.008,
        0.38,
        0.008,
        "#cfc5b2",
      );
    }
    part(
      new T.CylinderGeometry(0.39, 0.39, 0.015, 40),
      "#fff0c5",
      -0.72,
      2.09,
      0,
    );
  }
  if (id === "oval-table") {
    const top = part(
      new T.CylinderGeometry(1, 1, 0.075, 40),
      "#795b3e",
      0,
      0.54,
      0,
    );
    top.scale.set(0.9, 1, 0.52);
    for (const x of [-0.65, 0.65])
      for (const z of [-0.32, 0.32]) leg(x, z, 0.51);
  }
  if (id === "woven-ottoman") {
    part(new T.CylinderGeometry(0.47, 0.49, 0.55, 32), "#bda580", 0, 0.28, 0);
    for (let i = 0; i < 16; i++) {
      const ring = part(
        new T.TorusGeometry(0.485, 0.012, 5, 32),
        i % 2 ? "#d0bb96" : "#a78f6e",
        0,
        0.04 + i * 0.031,
        0,
      );
      ring.rotation.x = Math.PI / 2;
    }
  }
  if (id === "linen-rug") {
    box(0, 0.018, 0, 4.5, 0.035, 3.2, "#d7cdbc");
    for (let i = 0; i < 46; i++)
      box(-2.2 + i * 0.096, 0.038, 0, 0.008, 0.003, 3.1, "#eee5d5");
  }
  if (id === "olive-planter") {
    part(new T.CylinderGeometry(0.32, 0.27, 0.62, 24), "#bcb6a7", 0, 0.31, 0);
    part(new T.CylinderGeometry(0.3, 0.3, 0.018, 24), "#564c3b", 0, 0.63, 0);
    tube(
      [
        new T.Vector3(0, 0.6, 0),
        new T.Vector3(-0.04, 1.1, 0),
        new T.Vector3(0.08, 1.8, 0),
      ],
      0.035,
      "#756044",
    );
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        h = 1 + i * 0.13;
      const end = new T.Vector3(Math.sin(a) * 0.4, h + 0.35, Math.cos(a) * 0.4);
      tube([new T.Vector3(0, h, 0), end], 0.013, "#756044");
      for (let j = 0; j < 9; j++) {
        const b = a + j * 2.4;
        const leaf = ell(
          end.x + Math.sin(b) * 0.14,
          end.y + (j % 3) * 0.07,
          end.z + Math.cos(b) * 0.14,
          0.1,
          0.025,
          0.038,
          j % 2 ? "#6f8055" : "#96a477",
        );
        leaf.rotation.y = b;
      }
    }
  }
  if (id === "wire-chair") {
    for (const x of [-0.4, 0.4])
      for (const z of [-0.35, 0.35])
        part(
          new T.CylinderGeometry(0.022, 0.022, 0.45, 8),
          "#b69a5a",
          x,
          0.225,
          z,
        );
    part(new T.CylinderGeometry(0.47, 0.47, 0.15, 32), "#e9e1d1", 0, 0.52, 0);
    for (let i = 0; i < 23; i++) {
      const a = Math.PI / 2 + (i / 22) * Math.PI;
      const x = Math.sin(a) * 0.49,
        z = Math.cos(a) * 0.49;
      part(new T.CylinderGeometry(0.009, 0.009, 0.53, 5), "#9e8956", x, 0.8, z);
    }
    tube(
      Array.from({ length: 25 }, (_, i) => {
        const a = Math.PI / 2 + (i / 24) * Math.PI;
        return new T.Vector3(Math.sin(a) * 0.49, 1.065, Math.cos(a) * 0.49);
      }),
      0.024,
      "#a58c53",
    );
  }
  if (id === "linen-sectional")
    for (const child of g.children) child.position.z -= 0.45;
  // Static furnishings use one draw per material, including the many tufts and folds.
  g.updateMatrixWorld(true);
  for (const mat of mats.values()) {
    const meshes = g.children.filter(
      (o): o is T.Mesh => o instanceof T.Mesh && o.material === mat,
    );
    if (meshes.length < 2) continue;
    const geo = mergeGeometries(
      meshes.map((m) => {
        const geo = m.geometry.index
          ? m.geometry.toNonIndexed()
          : m.geometry.clone();
        return geo.applyMatrix4(m.matrix);
      }),
    );
    if (!geo) continue;
    for (const m of meshes) {
      m.geometry.dispose();
      g.remove(m);
    }
    const merged = new T.Mesh(geo, mat);
    merged.castShadow = merged.receiveShadow = true;
    g.add(merged);
  }
  return g;
}
