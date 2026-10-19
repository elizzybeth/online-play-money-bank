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
  roughness: 0.08,
  metalness: 0.12,
});
const handGeometry = new Map<number, T.BufferGeometry>();
const gemGeometry = new T.BufferGeometry();
const vertices: number[] = [],
  colors: number[] = [];
// A brilliant-cut solid: octagonal table, crown, thin girdle and pointed pavilion.
const facets = [
  "#f2fcff",
  "#bdeaff",
  "#72c9ee",
  "#ddf8ff",
  "#91dcf5",
  "#e8fbff",
  "#66b9e2",
  "#c4efff",
];
function face(points: number[][], shade: string) {
  const c = new T.Color(shade);
  for (const p of points) {
    vertices.push(...p);
    colors.push(c.r, c.g, c.b);
  }
}
const ring = (i: number, r: number, y: number) => {
  const a = (i * Math.PI) / 4 + Math.PI / 8;
  return [Math.cos(a) * r, y, 0.15 + Math.sin(a) * r];
};
for (let i = 0; i < 8; i++) {
  const j = (i + 1) % 8;
  const top = ring(i, 0.09, 0.25),
    nextTop = ring(j, 0.09, 0.25);
  const edge = ring(i, 0.18, 0.13),
    nextEdge = ring(j, 0.18, 0.13);
  const low = ring(i, 0.18, 0.11),
    nextLow = ring(j, 0.18, 0.11);
  face([[0, 0.25, 0.15], nextTop, top], "#effbff");
  face([top, nextTop, nextEdge], facets[i]);
  face([top, nextEdge, edge], facets[(i + 3) % 8]);
  face([edge, nextEdge, nextLow], "#dff9ff");
  face([edge, nextLow, low], "#c0e9ff");
  face([low, nextLow, [0, -0.17, 0.15]], facets[(i + 2) % 8]);
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
