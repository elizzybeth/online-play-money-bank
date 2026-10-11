import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
function batch(root: T.Group) {
  const groups = new Map<T.Material, T.BufferGeometry[]>();
  root.userData.modeledParts = root.children.length;
  for (const child of [...root.children]) {
    const mesh = child as T.Mesh<T.BufferGeometry, T.Material>;
    mesh.updateMatrix();
    const geometry = mesh.geometry
      .clone()
      .applyMatrix4(mesh.matrix)
      .toNonIndexed();
    const list = groups.get(mesh.material) ?? [];
    list.push(geometry);
    groups.set(mesh.material, list);
    root.remove(mesh);
    mesh.geometry.dispose();
  }
  for (const [material, pieces] of groups) {
    const mesh = new T.Mesh(mergeGeometries(pieces)!, material);
    if (
      (material as T.MeshStandardMaterial).color.getHexString() === "bec5c9" &&
      root.name === "mansion-yacht"
    )
      mesh.name = "yacht-railing";
    root.add(mesh);
    pieces.forEach((p) => p.dispose());
  }
  return root;
}
function maker(root: T.Group) {
  const mats = new Map<string, T.MeshStandardMaterial>();
  const mesh = (g: T.BufferGeometry, c: string, x = 0, y = 0, z = 0) => {
    let m = mats.get(c);
    if (!m) {
      m = new T.MeshStandardMaterial({
        color: c,
        roughness: c === "#182d38" ? 0.14 : 0.45,
        metalness: c === "#bec5c9" ? 0.8 : 0.2,
      });
      mats.set(c, m);
    }
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    root.add(o);
    return o;
  };
  return {
    mesh,
    box: (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      c: string,
    ) => mesh(new T.BoxGeometry(w, h, d), c, x, y, z),
    ball: (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      c: string,
    ) => {
      const o = mesh(new T.SphereGeometry(1, 24, 12), c, x, y, z);
      o.scale.set(w, h, d);
      return o;
    },
  };
}
// Rounded 911-inspired coupe: pronounced wheel arches, sloping roof and oval lamps.
export function makeSportsCar() {
  const root = new T.Group();
  root.name = "mansion-car";
  const m = maker(root);
  m.ball(0, 0.65, 0, 1.8, 0.55, 3.25, "#b33137");
  m.box(0, 0.36, 0, 3.5, 0.18, 5.6, "#25272c");
  m.ball(0, 1.31, -0.36, 1.25, 0.59, 1.7, "#182d38");
  m.ball(0, 1.75, -0.55, 1.05, 0.16, 1.05, "#b33137");
  for (const x of [-1.75, 1.75])
    for (const z of [-1.95, 1.95]) {
      const tire = m.mesh(
        new T.CylinderGeometry(0.59, 0.59, 0.34, 32),
        "#202124",
        x,
        0.35,
        z,
      );
      tire.rotation.z = Math.PI / 2;
      const hub = m.mesh(
        new T.CylinderGeometry(0.4, 0.4, 0.355, 24),
        "#bec5c9",
        x,
        0.35,
        z,
      );
      hub.rotation.z = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const spoke = m.box(
          x + Math.sign(x) * 0.19,
          0.35 + Math.sin((i * Math.PI * 2) / 5) * 0.17,
          z + Math.cos((i * Math.PI * 2) / 5) * 0.17,
          0.025,
          0.05,
          0.38,
          "#434b53",
        );
        spoke.rotation.x = (-i * Math.PI * 2) / 5;
      }
      m.ball(x * 0.92, 0.86, z, 0.35, 0.23, 0.7, "#b33137");
    }
  for (const x of [-1.08, 1.08]) {
    m.ball(x, 0.85, 2.86, 0.3, 0.18, 0.12, "#f5f4de");
    m.box(x, 0.44, 2.99, 0.6, 0.12, 0.045, "#1d262d");
    m.ball(x * 1.5, 1.31, 0.15, 0.24, 0.1, 0.14, "#b33137");
    m.box(x, 0.76, -3.09, 0.8, 0.08, 0.05, "#d7404a");
    m.mesh(
      new T.CylinderGeometry(0.09, 0.09, 0.2, 14).rotateX(Math.PI / 2),
      "#bec5c9",
      x * 0.7,
      0.36,
      -3.07,
    );
  }
  m.box(0, 0.78, -3.07, 2.55, 0.035, 0.035, "#f56768");
  for (let i = 0; i < 8; i++)
    m.box(-0.5 + i * 0.14, 1.02, -2.37, 0.055, 0.02, 0.5, "#292e33");
  root.userData.reference = "Porsche 911 Carrera";
  return batch(root);
}
function hullGeometry(depth = 1.7) {
  const shape = new T.Shape();
  shape.moveTo(-2.25, 6);
  shape.lineTo(2.25, 6);
  shape.bezierCurveTo(2.65, 2, 2.1, -4, 0, -7);
  shape.bezierCurveTo(-2.1, -4, -2.65, 2, -2.25, 6);
  const g = new T.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: depth < 1 ? 0.025 : 0.16,
    bevelThickness: depth < 1 ? 0.02 : 0.2,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}
// Manhattan-inspired motor yacht: pointed bow, stepped decks and sweeping dark glass.
export function makeYacht() {
  const root = new T.Group();
  root.name = "mansion-yacht";
  const m = maker(root);
  m.mesh(hullGeometry(), "#f4eee0", 0, -0.8, 0);
  m.mesh(hullGeometry(0.1).scale(0.94, 1, 0.97), "#c99e68", 0, 0.86, 0);
  for (let i = 0; i < 20; i++) {
    const x = -2 + i * 0.21,
      end = 6.55 - Math.abs(x) * 2.1;
    m.box(x, 0.965, (end - 5.65) / 2, 0.013, 0.008, end + 5.65, "#795e40");
  }
  m.ball(0, 1.74, -0.3, 1.88, 1.05, 3.15, "#f4eee0");
  m.ball(0, 1.87, -0.3, 1.94, 0.59, 3.2, "#182d38");
  m.box(0, 2.52, -0.6, 4.15, 0.17, 5.8, "#f4eee0");
  m.box(0, 2.68, -1.25, 2.9, 0.3, 3.1, "#c99e68");
  m.box(0, 3, -2, 2.8, 0.46, 0.6, "#f3e9da");
  m.box(0, 3, 0.15, 2.8, 0.46, 0.6, "#f3e9da");
  m.box(0, 1.2, 3.85, 2.6, 0.28, 2.1, "#eee1ca");
  m.box(0, 0.92, -6.5, 4, 0.12, 0.95, "#b78b57");
  for (const side of [-1, 1]) {
    const points: T.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const z = -5.6 + i * 1.08,
        x = side * (2.15 - Math.max(0, z - 2) * 0.3);
      points.push(new T.Vector3(x, 1.48, z));
      const rail = m.mesh(
        new T.CylinderGeometry(0.021, 0.021, 0.52, 6),
        "#bec5c9",
        x,
        1.22,
        z,
      );
      rail.name = "yacht-railing";
    }
    m.mesh(
      new T.TubeGeometry(new T.CatmullRomCurve3(points), 36, 0.025, 6, false),
      "#bec5c9",
    );
    for (let i = 0; i < 4; i++) {
      const p = m.mesh(
        new T.SphereGeometry(1, 16, 8),
        "#182d38",
        side * 2.23,
        0.18,
        -3 + i * 1.4,
      );
      p.scale.set(0.03, 0.12, 0.35);
    }
  }
  m.box(0, 3.1, -1, 0.13, 1.05, 0.13, "#bec5c9");
  m.box(0, 3.61, -1, 1.3, 0.11, 0.25, "#f4eee0");
  m.mesh(new T.SphereGeometry(0.21, 16, 10), "#f4eee0", 0.65, 3.55, -1.2);
  for (const x of [-1.5, 1.5]) m.box(x, -0.45, 0, 0.18, 0.85, 5, "#3c4346");
  root.userData.reference = "Sunseeker Manhattan 55";
  return batch(root);
}
