import { makeSeedPacket } from "./seed-packet";
import { signCanvas } from "./signage";
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
    const c = signCanvas(text);
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(w, w / 4),
      new T.MeshBasicMaterial({
        map: texture,
        side: T.DoubleSide,
      }),
    );
    m.position.set(x, y, z);
    town.add(m);
    if (["Doge", "Pepe", "Hawk Tuah"].includes(text))
      m.userData.houseSign = true;
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
  const memeStart = town.children.length,
    memeRectStart = rects.length;
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
  const frogFaceStart = town.children.length;
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
  const frogParts = town.children.slice(frogFaceStart) as T.Mesh[];
  const hawk = shell(-3, -81, "#e4bea1");
  const cowboyBrim = ball(hawk.x, 3.1, hawk.z, 5.5, "#b58958");
  cowboyBrim.scale.set(1, 0.055, 0.72);
  roofs.push(cowboyBrim);
  const crown = mesh(
    new T.CylinderGeometry(2.15, 2.7, 3.2, 24),
    "#bc9365",
    hawk.x,
    4.65,
    hawk.z,
  );
  crown.material = surfaceMaterial("#bc9365", "cloth");
  roofs.push(crown);
  const hatBand = mesh(
    new T.CylinderGeometry(2.65, 2.7, 0.36, 24),
    "#5f4230",
    hawk.x,
    3.45,
    hawk.z,
  );
  roofs.push(hatBand);
  const buckle = box(hawk.x, 3.45, hawk.z + 2.68, 0.8, 0.4, 0.12, "#e5c477");
  roofs.push(buckle);
  sign("Hawk Tuah", -3, 2.4, -77.35, 3.6);
  sign("Doge", -3, 2.4, -45.35, 3);
  sign("Pepe", -3, 2.4, -62.35, 3);
  // Enlarge each house around its own center and move the row west for clear space.
  for (const object of town.children.slice(memeStart)) {
    const oldZ = object.position.z;
    const centerZ = oldZ > -57.5 ? -49 : oldZ > -73.5 ? -66 : -81;
    const newZ = centerZ === -66 ? -65 : centerZ;
    object.position.set(
      -18 + (object.position.x + 3) * 2,
      object.position.y * 2,
      newZ + (oldZ - centerZ) * 2,
    );
    object.scale.multiplyScalar(2);
  }
  for (const r of rects.slice(memeRectStart)) {
    const centerZ = r.z > -57.5 ? -49 : r.z > -73.5 ? -66 : -81;
    r.x = -18 + (r.x + 3) * 2;
    r.z = (centerZ === -66 ? -65 : centerZ) + (r.z - centerZ) * 2;
    r.w *= 2;
    r.d *= 2;
  }
  for (const [i, h] of houseBounds.entries()) {
    h.x = -18;
    h.z = [-49, -65, -81][i];
    h.w = h.d = 14;
  }
  const frogRest = frogParts.map((object) => ({
    object,
    position: object.position.clone(),
    scale: object.scale.clone(),
  }));
  const pepeGateRect = { x: -18, z: -58, w: 4.4, d: 0.35 };
  rects.push(pepeGateRect);
  const pepeGate = box(-18, 2.9, -58, 4.4, 5.8, 0.35, "#507749");
  occluders.push(pepeGate);
  targets.push({ id: "pepe-door", x: -18, z: -56.7, label: "Enter Pepe" });
  const presenter = chad("pepe-show", -18, -66);
  mesh(
    new T.CylinderGeometry(0.025, 0.025, 0.4, 8),
    "#30383d",
    0.45,
    0.95,
    0.45,
    presenter,
  );
  ball(0.45, 1.17, 0.45, 0.09, "#919b9d", presenter);
  const debris = Array.from({ length: 100 }, (_, i) => {
    const object =
      i < 25
        ? makeSeedPacket()
        : new T.Mesh(
            new T.SphereGeometry(0.28, 6, 4),
            new T.MeshStandardMaterial({
              color: i % 2 ? "#629e54" : "#84b56c",
              roughness: 0.45,
            }),
          );
    if (i >= 25) object.scale.set(1, 0.2, 0.8);
    const x = i < 25 ? -6 + (i % 5) * 9 : -8 + ((i * 13.7) % 44);
    const z = i < 25 ? (i === 24 ? -74 : -47 - Math.floor(i / 5) * 8) : -46 - ((i * 7.3) % 40);
    object.position.set(x, i < 25 ? 0.3 : 0.15, z);
    object.visible = false;
    town.add(object);
    if (i < 25)
      targets.push({
        id: `pepe-seed-${i}`,
        x,
        z,
        label: "Pick up money seeds",
      });
    return { object, x, z, phase: i * 2.399 };
  });
  let pepeOpen = false,
    burstTime = 0,
    wasPopped = false;
  function updatePepe(
    open: boolean,
    seconds: number,
    popped: boolean,
    collected: number[],
    dt: number,
    reduced: boolean,
  ) {
    if (open !== pepeOpen) {
      pepeOpen = open;
      pepeGate.visible = !open;
      const index = rects.indexOf(pepeGateRect);
      if (open && index >= 0) rects.splice(index, 1);
      else if (!open && index < 0) rects.push(pepeGateRect);
      const oi = occluders.indexOf(pepeGate);
      if (open && oi >= 0) occluders.splice(oi, 1);
      else if (!open && oi < 0) occluders.push(pepeGate);
    }
    const fraction = seconds / 12,
      factor = 1 + fraction * 2.5,
      pivot = new T.Vector3(-18, 7.2, -65);
    for (const r of frogRest) {
      r.object.visible = !popped;
      r.object.scale.copy(r.scale).multiplyScalar(factor);
      r.object.position
        .copy(r.position)
        .sub(pivot)
        .multiplyScalar(factor)
        .add(pivot);
      if (seconds > 0) {
        const material = r.object.material as T.MeshStandardMaterial;
        material.transparent = true;
        material.opacity = Math.max(0.12, 1 - fraction * 0.83);
        material.depthWrite = false;
      }
    }
    if (popped && !wasPopped) burstTime = 0;
    if (popped) burstTime = Math.min(2, burstTime + dt);
    wasPopped = popped;
    const progress = reduced ? 1 : Math.min(1, burstTime / 2);
    debris.forEach((d, i) => {
      d.object.visible = popped && (i >= 25 || !collected.includes(i));
      if (!popped) return;
      d.object.position.set(
        T.MathUtils.lerp(-18, d.x, progress),
        T.MathUtils.lerp(8, i < 25 ? 0.3 : 0.15, progress) +
          Math.sin(progress * Math.PI) * 5,
        T.MathUtils.lerp(-65, d.z, progress),
      );
      if (i >= 25)
        d.object.rotation.set(
          progress * d.phase,
          progress * 3,
          progress * d.phase * 0.4,
        );
    });
  }
  const meditators: T.Group[] = [];
  for (const [i, [x, z]] of [
    [-21, -51],
    [-15, -51],
    [-18, -53],
  ].entries()) {
    const cushion = ball(x, 0.16, z, 0.7, "#b57c96");
    cushion.scale.set(1, 0.25, 1);
    const npc = chad(`doge-meditator-${i}`, x, z);
    npc.position.y = 0.15;
    // Short folded legs with feet pointing forward on the cushion.
    npc.children
      .filter((o) => o.position.y < 0.4)
      .forEach((o) => {
        o.position.y = 0.22;
        o.position.z = 0.4;
      });
    meditators.push(npc);
  }
  ball(-18, 0.16, -47, 0.7, "#7ca493").scale.set(1, 0.25, 1);
  targets.push({
    id: "meditate",
    x: -18,
    z: -47,
    label: "Join the meditation",
  });
  const stacy = chad("stacy", -18, -82);
  speakers.find((s) => s.id === "stacy")!.name = "Stacy";
  targets.find((t) => t.id === "stacy")!.label = "Talk with Stacy";
  for (const side of [-1, 1]) {
    const lock = ball(side * 0.48, 1.35, 0.02, 0.25, "#e5c77c", stacy);
    lock.scale.set(0.7, 2.1, 0.9);
  }
  const brim = ball(0, 2.0, 0, 0.75, "#b58a57", stacy);
  brim.scale.set(1, 0.09, 0.8);
  const stacyCrown = mesh(
    new T.CylinderGeometry(0.32, 0.4, 0.48, 20),
    "#c9a16f",
    0,
    2.22,
    0,
    stacy,
  );
  stacyCrown.material = surfaceMaterial("#c9a16f", "cloth");
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
  sign("Community Garden", 10, 5.1, -80, 12);
  for (const x of [3.8, 16.2]) box(x, 3.1, -80, 0.18, 6.2, 0.18, "#a48162");
  // Visible perimeter and a gap aligned with the lane entrance.
  for (const r of [
    { x: -39, z: -67.25, w: 1, d: 44.5, clearHeight: 2.1 },
    { x: 39, z: -67.25, w: 1, d: 44.5, clearHeight: 2.1 },
    { x: 0, z: -90, w: 77, d: 1, clearHeight: 2.1 },
  ]) {
    const hedge = box(r.x, 1.05, r.z, r.w, 2.1, r.d, "#658464");
    hedge.material = surfaceMaterial("#658464", "leaf", 8, 2);
    rects.push(r);
    occluders.push(hedge);
  }
  return {
    town,
    houseBounds,
    meditators,
    updatePepe,
    debris,
    walkway,
    paths,
    roofs,
    setUnlocked(value: boolean) {
      town.visible = value;
    },
    updateRoofs(x: number, z: number) {
      const inside = houseBounds.find(
        (h) => Math.abs(x - h.x) < h.w / 2 && Math.abs(z - h.z) < h.d / 2,
      );
      for (const sign of town.children.filter((o) => o.userData.houseSign))
        sign.visible = !inside || Math.abs(sign.position.z - inside.z) > 10;
      roofs.forEach((r) => {
        const near = houseBounds.some(
          (h) =>
            Math.abs(x - h.x) < h.w / 2 + 0.1 &&
            Math.abs(z - h.z) < h.d / 2 + 0.1 &&
            Math.abs(r.position.x - h.x) < 14 &&
            Math.abs(r.position.z - h.z) < 14,
        );
        const m = r.material as T.MeshStandardMaterial;
        m.transparent = true;
        m.opacity = near ? 0.12 : 1;
        m.depthWrite = !near;
      });
    },
  };
}
