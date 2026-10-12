import * as T from "three";
export function makeChickenFeather() {
  const root = new T.Group();
  root.name = "chicken-feather";
  const vertices: number[] = [];
  const edge = (row: number, side: number) => {
    const t = row / 20;
    return [
      0.025 * t + side * 0.13 * Math.pow(Math.sin(t * Math.PI), 0.7),
      -0.16 + t * 0.59,
      Math.sin(t * Math.PI) * 0.018,
    ];
  };
  for (let row = 0; row < 20; row++) {
    const a = edge(row, -1),
      b = edge(row, 1),
      c = edge(row + 1, -1),
      d = edge(row + 1, 1);
    vertices.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  const vane = new T.Mesh(
    geometry,
    new T.MeshStandardMaterial({
      color: "#eee4ce",
      side: T.DoubleSide,
      roughness: 0.95,
    }),
  );
  vane.name = "feather-vane";
  root.add(vane);
  const quill = new T.Mesh(
    new T.CylinderGeometry(0.007, 0.011, 0.7, 8),
    new T.MeshStandardMaterial({ color: "#c7aa78", roughness: 0.9 }),
  );
  quill.position.set(0.005, 0.07, 0.006);
  quill.rotation.z = -0.045;
  root.add(quill);
  const barbs: number[] = [];
  for (let i = 0; i < 15; i++) {
    const y = -0.12 + i * 0.034;
    const width = Math.sin(((i + 1) / 17) * Math.PI) * 0.12;
    for (const side of [-1, 1]) {
      barbs.push(
        0,
        y,
        0.024,
        side * width,
        y + 0.055,
        0.024,
        0,
        y + 0.003,
        0.024,
      );
    }
  }
  const barbGeometry = new T.BufferGeometry();
  barbGeometry.setAttribute("position", new T.Float32BufferAttribute(barbs, 3));
  barbGeometry.computeVertexNormals();
  root.add(
    new T.Mesh(
      barbGeometry,
      new T.MeshStandardMaterial({
        color: "#bda886",
        side: T.DoubleSide,
        roughness: 0.95,
      }),
    ),
  );
  return root;
}
