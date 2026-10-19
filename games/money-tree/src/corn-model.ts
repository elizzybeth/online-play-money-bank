import * as T from "three";
/** Rounded ears and curled husks share low-poly meshes across the entire field. */
export function cornEarGeometry() {
  return new T.LatheGeometry(
    [
      new T.Vector2(0, -1),
      new T.Vector2(0.55, -0.95),
      new T.Vector2(0.9, -0.65),
      new T.Vector2(1, 0.25),
      new T.Vector2(0.85, 0.75),
      new T.Vector2(0.4, 1),
      new T.Vector2(0, 1.08),
    ],
    8,
  );
}
export function cornBladeGeometry(husk = false) {
  const vertices: number[] = [],
    uv: number[] = [];
  const sections = husk
    ? [
        [0.15, -1.08, 0],
        [0.85, -0.65, 0.62],
        [1.12, 0.02, 0.58],
        [1.3, 0.65, 0],
      ]
    : [
        [0, 0, 0],
        [0.45, 0.3, 0.2],
        [0.98, 0.2, 0.18],
        [1.6, -0.25, 0],
      ];
  for (let i = 1; i < sections.length; i++) {
    const [ax, ay, aw] = sections[i - 1],
      [bx, by, bw] = sections[i];
    vertices.push(
      ax,
      ay,
      -aw,
      bx,
      by,
      -bw,
      bx,
      by,
      bw,
      ax,
      ay,
      -aw,
      bx,
      by,
      bw,
      ax,
      ay,
      aw,
    );
    uv.push(
      0,
      (i - 1) / 3,
      0,
      i / 3,
      1,
      i / 3,
      0,
      (i - 1) / 3,
      1,
      i / 3,
      1,
      (i - 1) / 3,
    );
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
}
/** One procedural kernel texture doubles as a bump map: no per-kernel meshes. */
export function cornKernelMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#c78316";
  c.fillRect(0, 0, 256, 512);
  for (let row = 0; row < 10; row++)
    for (let col = -1; col < 7; col++) {
      const x = (col * 256) / 6 + ((row % 2) * 256) / 12,
        y = row * 51.2;
      const gradient = c.createRadialGradient(
        x + 17,
        y + 15,
        2,
        x + 21,
        y + 24,
        32,
      );
      gradient.addColorStop(0, "#fff39a");
      gradient.addColorStop(0.5, "#ffda45");
      gradient.addColorStop(1, "#e4a21a");
      c.fillStyle = gradient;
      c.beginPath();
      c.roundRect(x + 2, y + 2, 39, 47, 17);
      c.fill();
    }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.wrapS = T.RepeatWrapping;
  return new T.MeshStandardMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.045,
    roughness: 0.7,
  });
}
