import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// World props share static geometry/materials; every Chad gets two real 3D hands.
const gold = new T.MeshStandardMaterial({ color: "#ffda61", roughness: 0.65 });
const crease = new T.MeshStandardMaterial({
  color: "#e7a44d",
  roughness: 0.75,
});
const jewel = new T.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.17,
  metalness: 0.12,
});
const handGeometry = new Map<number, T.BufferGeometry>();
const gemGeometry = new T.BufferGeometry();
const vertices: number[] = [],
  colors: number[] = [];
const corners = [
  [-0.14, 0.13, 0.09],
  [-0.08, 0.23, 0.09],
  [0.08, 0.23, 0.09],
  [0.14, 0.13, 0.09],
  [0, -0.12, 0.13],
  [0, 0.13, 0.23],
];
for (const [indices, color] of [
  [[0, 1, 5], "#bce5fa"],
  [[1, 2, 5], "#87cfee"],
  [[2, 3, 5], "#50ace0"],
  [[0, 5, 4], "#72c4ed"],
  [[5, 3, 4], "#3d96ce"],
  [[0, 4, 3], "#5cb2dd"],
] as const) {
  const c = new T.Color(color);
  for (const i of indices) {
    vertices.push(...corners[i]);
    colors.push(c.r, c.g, c.b);
  }
}
gemGeometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
gemGeometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
gemGeometry.computeVertexNormals();
export function makeDiamondHand(side: number) {
  if (!handGeometry.has(side)) {
    const pieces: T.BufferGeometry[] = [];
    pieces.push(new T.SphereGeometry(1, 12, 8).scale(0.22, 0.23, 0.085));
    for (let i = 0; i < 4; i++) {
      const height = [0.27, 0.36, 0.39, 0.31][i],
        x = (i - 1.5) * 0.105;
      pieces.push(
        new T.CapsuleGeometry(0.054, height, 3, 8).translate(
          x,
          0.18 + height / 2,
          0,
        ),
      );
    }
    const thumb = new T.CapsuleGeometry(0.068, 0.21, 3, 8)
      .rotateZ(-side * 0.58)
      .translate(-side * 0.23, 0.04, 0.015);
    pieces.push(thumb);
    handGeometry.set(side, mergeGeometries(pieces)!);
    pieces.forEach((g) => g.dispose());
  }
  const root = new T.Group();
  root.name = `diamond-hand-${side}`;
  const palm = new T.Mesh(handGeometry.get(side)!, gold);
  palm.castShadow = true;
  root.add(palm);
  const gem = new T.Mesh(gemGeometry, jewel);
  gem.name = "palm-diamond";
  gem.castShadow = true;
  root.add(gem);
  // One warm curved crease gives the palm the familiar emoji silhouette.
  const curve = new T.CatmullRomCurve3([
    new T.Vector3(-side * 0.16, -0.12, 0.08),
    new T.Vector3(-side * 0.19, 0.01, 0.085),
    new T.Vector3(-side * 0.1, 0.12, 0.085),
  ]);
  const line = new T.Mesh(
    new T.TubeGeometry(curve, 8, 0.012, 4, false),
    crease,
  );
  root.add(line);
  return root;
}
