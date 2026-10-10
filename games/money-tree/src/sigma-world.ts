import * as T from "three";
import { surfaceMaterial } from "./textures";
import type { Rect } from "./game";
import type { Target } from "./world";
// Original miniature sculptures, borrowing the meme silhouettes rather than flat signs.
export function createSigmaWorld(
  scene: T.Scene,
  rects: Rect[],
  occluders: T.Object3D[],
  targets: Target[],
  speakers: { id: string; name: string; object: T.Object3D }[],
) {
  const town = new T.Group();
  scene.add(town);
  town.name = "Sigma Town";
  const roofs: T.Mesh[] = [];
  function mesh(
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = town,
  ) {
    const m = new T.Mesh(
      g,
      new T.MeshStandardMaterial({ color: c, roughness: 0.9 }),
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
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
    parent: T.Object3D = town,
  ) => mesh(new T.BoxGeometry(w, h, d), c, x, y, z, parent);
  const ball = (
    x: number,
    y: number,
    z: number,
    r: number,
    c: string,
    parent: T.Object3D = town,
  ) => mesh(new T.SphereGeometry(r, 12, 8), c, x, y, z, parent);
  function sign(text: string, x: number, y: number, z: number, w = 5) {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 192;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#252a31";
    ctx.fillRect(0, 0, 768, 192);
    ctx.strokeStyle = "#c8af64";
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 752, 176);
    ctx.fillStyle = "#ecdba7";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 70px Georgia";
    ctx.fillText(text, 384, 100, 710);
    const m = new T.Mesh(
      new T.PlaneGeometry(w, w / 4),
      new T.MeshBasicMaterial({
        map: new T.CanvasTexture(c),
        side: T.DoubleSide,
      }),
    );
    m.position.set(x, y, z);
    town.add(m);
    return m;
  }
  // One union mesh, lifted above the grass: no coplanar seams or overlapping tiles.
  const paths = [
    { x: 30, z: -44, w: 11, d: 3 },
    { x: 26, z: -63, w: 22, d: 3 },
    { x: 26, z: -61, w: 3, d: 40 },
    { x: 23, z: -66, w: 10, d: 11 },
  ];
  const xs = [
    ...new Set(paths.flatMap((p) => [p.x - p.w / 2, p.x + p.w / 2])),
  ].sort((a, b) => a - b);
  const zs = [
    ...new Set(paths.flatMap((p) => [p.z - p.d / 2, p.z + p.d / 2])),
  ].sort((a, b) => a - b);
  const vertices: number[] = [],
    uv: number[] = [];
  for (let i = 0; i < xs.length - 1; i++)
    for (let j = 0; j < zs.length - 1; j++) {
      const [a, b, c, d] = [xs[i], xs[i + 1], zs[j], zs[j + 1]];
      if (
        !paths.some(
          (p) =>
            (a + b) / 2 >= p.x - p.w / 2 &&
            (a + b) / 2 <= p.x + p.w / 2 &&
            (c + d) / 2 >= p.z - p.d / 2 &&
            (c + d) / 2 <= p.z + p.d / 2,
        )
      )
        continue;
      for (const [x, z] of [
        [a, c],
        [a, d],
        [b, d],
        [a, c],
        [b, d],
        [b, c],
      ]) {
        vertices.push(x, 0.04, z);
        uv.push(x / 2, z / 2);
      }
    }
  const pavement = new T.BufferGeometry();
  pavement.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  pavement.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  pavement.computeVertexNormals();
  const walkway = new T.Mesh(
    pavement,
    surfaceMaterial("#d7cba9", "path", 1, 1),
  );
  walkway.name = "sigma-continuous-sidewalk";
  walkway.receiveShadow = true;
  town.add(walkway);
  sign("Sigma Town", 34, 2.8, -43, 5);
  box(31.7, 1.25, -43, 0.12, 2.5, 0.12, "#6c5940");
  box(36.3, 1.25, -43, 0.12, 2.5, 0.12, "#6c5940");
  // Stylized grayscale Chads: slick hair, angular jaw, broad shoulders and little legs.
  function chad(id: string, x: number, z: number, apron = false) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    town.add(g);
    g.userData.isNPC = true;
    const torso = ball(0, 0.85, 0, 0.45, "#9f9f9f", g);
    torso.scale.set(1.35, 1, 0.7);
    const head = box(0, 1.55, 0, 0.73, 0.78, 0.64, "#b4b4b4", g);
    head.name = "head";
    const hair = ball(0, 1.93, -0.06, 0.4, "#282b2c", g);
    hair.scale.set(1, 0.42, 0.9);
    hair.material = surfaceMaterial("#282b2c", "hair", 2, 1);
    box(0, 1.32, 0.29, 0.7, 0.29, 0.1, "#3d4143", g);
    box(0, 1.44, 0.35, 0.35, 0.05, 0.05, "#222426", g);
    for (const side of [-1, 1]) {
      ball(side * 0.56, 0.96, 0, 0.23, "#999999", g).scale.set(0.9, 1.4, 0.9);
      ball(side * 0.25, 0.96, 0.24, 0.23, "#b7b7b7", g).scale.set(
        1,
        0.75,
        0.55,
      );
      box(side * 0.16, 1.65, 0.34, 0.2, 0.04, 0.035, "#242629", g);
      ball(side * 0.18, 1.59, 0.337, 0.035, "#212121", g);
      ball(side * 0.19, 0.18, 0.04, 0.18, "#34383b", g).scale.set(1, 1, 1.4);
    }
    for (let y = 0.53; y < 0.81; y += 0.13)
      for (const x of [-0.1, 0.1])
        box(x, y, 0.3, 0.17, 0.09, 0.04, "#8a8c8c", g);
    if (apron)
      box(0, 0.77, 0.34, 0.65, 0.68, 0.07, "#534633", g).material =
        surfaceMaterial("#534633", "cloth");
    rects.push({ x, z, w: 1.1, d: 1 });
    targets.push({ id, x: x + 1.3, z, label: "Talk to Chad" });
    speakers.push({ id, name: "Chad", object: g });
    return g;
  }
  const locations = [
    [27, -48],
    [15, -66],
    [30, -72],
    [21, -80],
    [34, -59],
    [21, -60],
  ];
  locations.forEach(([x, z], i) => chad(`sigma-chad-${i}`, x, z));
  // Three walk-in meme houses. Open doorway in front, no bushes obstruct it.
  const houseBounds: Rect[] = [];
  function shell(x: number, z: number, c: string) {
    houseBounds.push({ x, z, w: 7, d: 7 });
    for (const r of [
      { x: x - 3.5, z, w: 0.3, d: 7 },
      { x: x + 3.5, z, w: 0.3, d: 7 },
      { x, z: z - 3.5, w: 7, d: 0.3 },
      { x: x - 2.3, z: z + 3.5, w: 2.4, d: 0.3 },
      { x: x + 2.3, z: z + 3.5, w: 2.4, d: 0.3 },
    ]) {
      const m = box(r.x, 1.45, r.z, r.w, 2.9, r.d, c);
      m.material = surfaceMaterial(c, "plaster", 2, 2);
      rects.push(r);
      occluders.push(m);
    }
    box(x, -0.005, z, 7, 0.1, 7, "#a78963").material = surfaceMaterial(
      "#a78963",
      "wood",
      3,
      3,
    );
    box(x, 1.15, z + 3.35, 1.9, 2.3, 0.04, "#c7b88f").visible = false;
    return { x, z };
  }
  const dog = shell(-3, -49, "#c9a369");
  const dogHead = ball(dog.x, 3.6, dog.z, 4, "#c49653");
  dogHead.scale.set(1, 0.8, 0.9);
  roofs.push(dogHead);
  for (const side of [-1, 1]) {
    const ear = mesh(
      new T.ConeGeometry(1.1, 2.7, 3),
      "#9e7546",
      dog.x + side * 2.7,
      6,
      dog.z,
    );
    ear.rotation.z = -side * 0.28;
    roofs.push(ear);
    ball(dog.x + side * 1.3, 4.25, dog.z + 2.5, 0.28, "#272b28");
  }
  ball(dog.x, 3.9, dog.z + 3, 0.7, "#edcf91").scale.set(1.8, 0.8, 0.65);
  ball(dog.x, 4.16, dog.z + 3.4, 0.24, "#272b28");
  const frog = shell(-3, -66, "#609758");
  const frogRoof = ball(frog.x, 3.6, frog.z, 4, "#609758");
  frogRoof.scale.set(1, 0.6, 0.9);
  roofs.push(frogRoof);
  for (const side of [-1, 1]) {
    const eye = ball(frog.x + side * 1.5, 5.15, frog.z + 1.3, 1, "#73a565");
    roofs.push(eye);
    ball(frog.x + side * 1.5, 5.2, frog.z + 2.13, 0.45, "#e3d8ab");
    ball(frog.x + side * 1.5, 5.2, frog.z + 2.53, 0.18, "#272b28");
  }
  box(frog.x, 3.85, frog.z + 3.45, 3.2, 0.16, 0.1, "#42593a");
  const hawk = shell(-3, -81, "#e4bea1");
  const face = ball(hawk.x, 3.7, hawk.z, 3.8, "#e4bea1");
  face.scale.set(1, 0.7, 1);
  roofs.push(face);
  const cap = ball(hawk.x, 5.55, hawk.z - 0.3, 3.5, "#507898");
  cap.scale.set(1, 0.4, 0.95);
  roofs.push(cap);
  const brim = ball(hawk.x, 5.22, hawk.z + 2.6, 2.4, "#41637b");
  brim.scale.set(1.2, 0.09, 0.7);
  roofs.push(brim);
  const patch = box(hawk.x, 5.65, hawk.z + 2.65, 2, 0.7, 0.08, "#ece4c8");
  roofs.push(patch);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const lock = ball(
        hawk.x + side * (2.6 + i * 0.18),
        4.2 - i * 0.6,
        hawk.z + 1,
        1,
        "#d9bd71",
      );
      lock.scale.set(0.6, 1.4, 0.9);
      roofs.push(lock);
    }
    roofs.push(ball(hawk.x + side * 0.95, 4.35, hawk.z + 3.1, 0.23, "#353a3e"));
  }
  const smile = box(hawk.x, 3.6, hawk.z + 3.4, 1.5, 0.14, 0.1, "#a87363");
  roofs.push(smile);
  sign("Hawk Tuah", -3, 2.4, -77.35, 3.6);
  sign("Doge", -3, 2.4, -45.35, 3);
  sign("Pepe", -3, 2.4, -62.35, 3);
  // Coffee kiosk with an open counter, striped canopy and oversized mug.
  box(32, 1.15, -79, 8, 2.3, 3, "#544638").material = surfaceMaterial(
    "#544638",
    "wood",
    4,
    2,
  );
  rects.push({ x: 32, z: -79, w: 8, d: 3 });
  for (const side of [-1, 1])
    box(32 + side * 3.8, 2.65, -77, 0.15, 3, 0.15, "#3a3430");
  for (let i = 0; i < 8; i++)
    box(28.5 + i, 4.2, -79, 1, 0.15, 5, i % 2 ? "#d6c391" : "#3b4442");
  sign("Grindset", 32, 3.55, -76.45, 6);
  const mug = mesh(
    new T.CylinderGeometry(0.85, 0.7, 1.3, 12),
    "#efe3bd",
    32,
    4.85,
    -79,
  );
  const handle = mesh(
    new T.TorusGeometry(0.48, 0.12, 8, 16),
    "#efe3bd",
    33,
    4.9,
    -79,
  );
  handle.rotation.y = 0;
  chad("grindset", 32, -76, true);
  // Lone wolf sculpture, upturned snout and moon, $1 means nothing.
  const plinth = mesh(
    new T.CylinderGeometry(1.7, 2, 1, 12),
    "#787c7b",
    23,
    0.5,
    -67,
  );
  rects.push({ x: 23, z: -67, w: 4, d: 4 });
  occluders.push(plinth);
  const wolf = new T.Group();
  wolf.position.set(23, 1, -67);
  town.add(wolf);
  ball(0, 0.8, 0, 0.63, "#8b9295", wolf).scale.set(0.7, 1.5, 0.7);
  for (const side of [-1, 1])
    ball(side * 0.3, 0.22, 0.3, 0.27, "#7c8487", wolf);
  const head = ball(0, 1.65, 0.15, 0.42, "#929a9d", wolf);
  head.scale.set(0.85, 1, 0.8);
  const snout = ball(0, 1.95, 0.4, 0.27, "#929a9d", wolf);
  snout.scale.set(0.65, 1.5, 0.7);
  snout.rotation.x = 0.5;
  for (const side of [-1, 1])
    mesh(
      new T.ConeGeometry(0.17, 0.5, 3),
      "#757d80",
      side * 0.25,
      2,
      0.04,
      wolf,
    );
  const tail = mesh(
    new T.ConeGeometry(0.25, 1.2, 8),
    "#7b8284",
    0.5,
    0.65,
    -0.45,
    wolf,
  );
  tail.rotation.z = -0.65;
  ball(0, 2.17, 0.52, 0.11, "#31383c", wolf);
  mesh(new T.CylinderGeometry(0.045, 0.045, 2.4, 6), "#747c80", 23, 3.2, -67.8);
  ball(23, 4.65, -67.8, 0.65, "#e0d9bb");
  sign("Lone Wolf · $1 for luck", 23, 1, -65.1, 3.7);
  targets.push({ id: "wolf", x: 23, z: -64.4, label: "Toss $1 for luck" });
  sign("Community Garden", 10, 1.5, -55.7, 6);
  // Visible perimeter and a gap aligned with the lane entrance.
  for (const r of [
    { x: -39, z: -62, w: 1, d: 44 },
    { x: 39, z: -62, w: 1, d: 44 },
    { x: 0, z: -85, w: 80, d: 1 },
  ]) {
    const hedge = box(r.x, 1.05, r.z, r.w, 2.1, r.d, "#658464");
    hedge.material = surfaceMaterial("#658464", "leaf", 8, 2);
    rects.push(r);
    occluders.push(hedge);
  }
  return {
    town,
    houseBounds,
    walkway,
    paths,
    roofs,
    setUnlocked(value: boolean) {
      town.visible = value;
    },
    updateRoofs(x: number, z: number) {
      roofs.forEach((r) => {
        const near = houseBounds.some(
          (h) =>
            Math.abs(x - h.x) < 3.6 &&
            Math.abs(z - h.z) < 3.6 &&
            Math.abs(r.position.x - h.x) < 7 &&
            Math.abs(r.position.z - h.z) < 7,
        );
        const m = r.material as T.MeshStandardMaterial;
        m.transparent = true;
        m.opacity = near ? 0.12 : 1;
        m.depthWrite = !near;
      });
    },
  };
}
