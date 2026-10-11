import { stepWanderer, type Wanderer } from "./wandering";
import { makeGardenSign } from "./garden-sign";
import { sigmaPlots } from "./sigma";
import { makeCoffeeShop } from "./coffee-shop";
import { pepeScatter } from "./pepe-scatter";
import { makeSeedPacket } from "./seed-packet";
import { signCanvas } from "./signage";
import * as T from "three";
import { surfaceMaterial } from "./textures";
import { blocked, type Rect } from "./game";
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
    m.name = `sigma-sign-${text}`;
    if (["Doge", "Pepe", "Hawk Tuah"].includes(text)) {
      m.userData.houseSign = true;
      // A solid framed plaque on spacers, with lettering above its front face.
      const backing = new T.Mesh(
        new T.BoxGeometry(w + 0.12, w / 4 + 0.12, 0.18),
        new T.MeshStandardMaterial({ color: "#473e32", roughness: 0.8 }),
      );
      backing.position.z = -0.115;
      backing.castShadow = true;
      m.add(backing);
      for (const side of [-1, 1]) {
        const spacer = new T.Mesh(
          new T.BoxGeometry(0.1, 0.16, 0.35),
          new T.MeshStandardMaterial({ color: "#756b58" }),
        );
        spacer.position.set(side * w * 0.35, 0, -0.35);
        m.add(spacer);
      }
    }
    return m;
  }
  // One union mesh, lifted above the grass: no coplanar seams or overlapping tiles.
  const paths = [
    { x: 7.5, z: -49, w: 37, d: 3 },
    { x: -7.5, z: -65, w: 3, d: 35 },
    { x: -9.5, z: -65, w: 6, d: 3 },
    { x: -9.5, z: -81, w: 6, d: 3 },
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
  const entranceSign = sign("Sigma Town", 34, 4.8, -43, 5);
  box(31.7, 2.35, -43, 0.18, 4.7, 0.18, "#6c5940");
  box(36.3, 2.35, -43, 0.18, 4.7, 0.18, "#6c5940");
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
      const foot = ball(side * 0.19, 0.18, 0.04, 0.18, "#34383b", g);
      foot.name = `walking-foot-${side}`;
      foot.scale.set(1, 1, 1.4);
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
    [35, -67],
    [21, -80],
    [34, -59],
    [21, -60],
  ];
  const walkers = locations.map(([x, z], i) => {
    const id = `sigma-chad-${i}`;
    const object = chad(id, x, z);
    return {
      id,
      object,
      collider: rects.at(-1)!,
      target: targets.at(-1)!,
      x,
      z,
      walk: 0,
      roaming: {
        position: { x, z },
        home: { x, z },
        speed: 0.65 + i * 0.09,
        pause: i * 0.12,
        seed: 41 + i * 811,
        journeys: 0,
      } as Wanderer,
    };
  });
  function updateWalkers(
    dt: number,
    playerX: number,
    playerZ: number,
    speaker?: string,
  ) {
    for (const walker of walkers) {
      const distance = Math.hypot(
        walker.object.position.x - playerX,
        walker.object.position.z - playerZ,
      );
      const waiting = dt <= 0 || distance < 3.2 || speaker === walker.id;
      const previous = {
        x: walker.object.position.x,
        z: walker.object.position.z,
      };
      const allowed = (p: { x: number; z: number }) =>
        !blocked(
          p.x,
          p.z,
          rects.filter((r) => r !== walker.collider),
          0.65,
        ) &&
        Math.hypot(p.x - playerX, p.z - playerZ) > 2 &&
        Math.hypot(p.x - 32, p.z + 74.7) > 7.5 &&
        walkers.every(
          (other) =>
            other === walker ||
            Math.hypot(
              p.x - other.object.position.x,
              p.z - other.object.position.z,
            ) >= 1.8,
        );
      const moved = stepWanderer(walker.roaming, dt, allowed, waiting);
      if (moved) {
        const { x, z } = walker.roaming.position;
        walker.object.position.set(x, 0, z);
        walker.collider.x = x;
        walker.collider.z = z;
        walker.target.x = x + 1.3;
        walker.target.z = z;
        walker.object.rotation.y = Math.atan2(x - previous.x, z - previous.z);
        walker.walk += dt * 7;
      } else if (distance < 3.2)
        walker.object.rotation.y = Math.atan2(
          playerX - previous.x,
          playerZ - previous.z,
        );
      for (const side of [-1, 1]) {
        const foot = walker.object.getObjectByName(`walking-foot-${side}`)!;
        foot.position.z = !moved
          ? 0.04
          : 0.04 + Math.sin(walker.walk) * side * 0.13;
        foot.position.y = !moved
          ? 0.18
          : 0.18 + Math.max(0, Math.sin(walker.walk) * side) * 0.07;
      }
    }
  }
  // Three walk-in meme houses. Open doorway in front, no bushes obstruct it.
  const houseBounds: Rect[] = [];
  function shell(
    x: number,
    z: number,
    c: string,
    entrance: "south" | "east" = "south",
  ) {
    houseBounds.push({ x, z, w: 7, d: 7 });
    for (const r of [
      { x: x - 3.5, z, w: 0.3, d: 7 },
      ...(entrance === "east"
        ? [
            { x: x + 3.5, z: z - 2.3, w: 0.3, d: 2.4 },
            { x: x + 3.5, z: z + 2.3, w: 0.3, d: 2.4 },
          ]
        : [{ x: x + 3.5, z, w: 0.3, d: 7 }]),
      { x, z: z - 3.5, w: 7, d: 0.3 },
      ...(entrance === "east"
        ? [{ x, z: z + 3.5, w: 7, d: 0.3 }]
        : [
            { x: x - 2.3, z: z + 3.5, w: 2.4, d: 0.3 },
            { x: x + 2.3, z: z + 3.5, w: 2.4, d: 0.3 },
          ]),
    ]) {
      const m = box(r.x, 1.45, r.z, r.w, 2.9, r.d, c);
      m.userData.cameraWall = true;
      m.material = surfaceMaterial(c, "plaster", 2, 2);
      rects.push(r);
      occluders.push(m);
    }
    box(x, -0.005, z, 7, 0.1, 7, z === -81 ? "#302d37" : "#a78963").material =
      surfaceMaterial(z === -81 ? "#302d37" : "#a78963", "wood", 3, 3);
    if (entrance === "east")
      box(x + 3.35, 1.15, z, 0.04, 2.3, 1.9, "#c7b88f").visible = false;
    else box(x, 1.15, z + 3.35, 1.9, 2.3, 0.04, "#c7b88f").visible = false;
    return { x, z };
  }
  const memeStart = town.children.length,
    memeRectStart = rects.length;
  const dog = shell(-3, -49, "#c9a369", "east");
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
  const frog = shell(-3, -66, "#609758", "east");
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
  const hawk = shell(-3, -81, "#e4bea1", "east");
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
  // The east wall's outer face is x=.65 before scaling. Signs need a
  // physical standoff, and must sit below the cowboy hat's broad brim.
  sign("Hawk Tuah", 1.4, 2, -81, 3.6).rotation.y = Math.PI / 2;
  sign("Doge", 1.4, 2, -49, 3).rotation.y = Math.PI / 2;
  sign("Pepe", 1.4, 2, -66, 3).rotation.y = Math.PI / 2;
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
  const pepeGateRect = { x: -11, z: -65, w: 0.35, d: 4.4 };
  rects.push(pepeGateRect);
  const pepeGate = box(-11, 2.9, -65, 0.35, 5.8, 4.4, "#507749");
  occluders.push(pepeGate);
  targets.push({ id: "pepe-door", x: -9.7, z: -65, label: "Enter Pepe" });
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
  const scatter = pepeScatter((x, z) => blocked(x, z, rects, 1));
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
    const { x, z } = scatter[i];
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
    [-15, -51],
    [-21, -51],
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
  Object.assign(
    targets.find((t) => t.id === "stacy")!,
    { x: -16.3, z: -82, label: "Talk with Stacy" },
  );
  function chair(x: number, z: number, facing: number) {
    const seat = new T.Group();
    seat.position.set(x, 0, z);
    seat.rotation.y = facing;
    town.add(seat);
    box(0, 0.55, 0, 1.35, 0.18, 1.2, "#805653", seat);
    box(0, 1.12, -0.55, 1.35, 1.25, 0.16, "#805653", seat);
    for (const side of [-1, 1]) {
      box(side * 0.63, 0.82, 0, 0.13, 0.13, 1.1, "#b78a68", seat);
      for (const end of [-1, 1])
        box(side * 0.53, 0.26, end * 0.46, 0.13, 0.52, 0.13, "#b78a68", seat);
    }
    rects.push({ x, z, w: 1.35, d: 1.2 });
    return seat;
  }
  const stacyChair = chair(-18, -82, 0),
    guestChair = chair(-18, -79.5, Math.PI);
  stacy.position.y = 0.52;
  stacy.children
    .filter((o) => o.position.y < 0.4)
    .forEach((o) => {
      o.position.y = 0.28;
      o.position.z = 0.38;
    });
  targets.push({
    id: "stacy-chair",
    x: -16.6,
    z: -79.5,
    label: "Sit with Stacy",
  });
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
  const handoffPacket = makeSeedPacket();
  handoffPacket.visible = false;
  town.add(handoffPacket);
  let handoff:
    | {
        start: T.Vector3;
        receiver: T.Vector3;
        time: number;
        hand?: T.Object3D;
        rest?: T.Vector3;
      }
    | undefined;
  function endHandoff() {
    if (handoff?.hand && handoff.rest) handoff.hand.position.copy(handoff.rest);
    handoff = undefined;
    handoffPacket.visible = false;
  }
  // Open-front neighborhood cafe, keeping the service point clear.
  town.add(makeCoffeeShop());
  rects.push({ x: 32, z: -77.2, w: 8, d: 0.9, clearHeight: 1.25 });
  rects.push({ x: 32, z: -81.4, w: 8, d: 0.2 });
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
  chad("grindset", 32, -78.4, true);
  // Keep the customer point in front of the counter, clear of other Chads.
  Object.assign(
    targets.find((t) => t.id === "grindset")!,
    {
      x: 32,
      z: -74.7,
      label: "Talk to Grindset Chad",
    },
  );
  // A coin terminal appears only after the player establishes their coin.
  const atm = new T.Group();
  atm.name = "coin-atm-model";
  atm.position.set(36, 0, -74);
  town.add(atm);
  box(0, 1.15, 0, 1.5, 2.3, 1.1, "#263b43", atm);
  box(0, 1.6, 0.57, 1.08, 0.7, 0.06, "#92d7cb", atm);
  box(0, 0.93, 0.58, 0.85, 0.09, 0.08, "#0d2028", atm);
  for (let i = 0; i < 6; i++)
    box(
      -0.25 + (i % 3) * 0.25,
      1.1 - Math.floor(i / 3) * 0.14,
      0.59,
      0.13,
      0.09,
      0.07,
      "#ddd7c2",
      atm,
    );
  const giantCoin = mesh(
    new T.CylinderGeometry(0.95, 0.95, 0.2, 32),
    "#efbd4a",
    0,
    3.4,
    0,
    atm,
  );
  giantCoin.rotation.x = Math.PI / 2;
  const emblem = document.createElement("canvas");
  emblem.width = emblem.height = 256;
  const ink = emblem.getContext("2d")!;
  ink.fillStyle = "#efbd4a";
  ink.beginPath();
  ink.arc(128, 128, 123, 0, Math.PI * 2);
  ink.fill();
  ink.strokeStyle = "#a77320";
  ink.lineWidth = 8;
  ink.beginPath();
  ink.arc(128, 128, 108, 0, Math.PI * 2);
  ink.stroke();
  ink.fillStyle = "#6d501e";
  ink.font = "bold 164px serif";
  ink.textAlign = "center";
  ink.fillText("$", 128, 185);
  const stamp = new T.CanvasTexture(emblem);
  stamp.colorSpace = T.SRGBColorSpace;
  const medallion = new T.Mesh(
    new T.PlaneGeometry(1.85, 1.85),
    new T.MeshBasicMaterial({ map: stamp, transparent: true }),
  );
  medallion.position.set(0, 3.4, 0.12);
  atm.add(medallion);
  const coinLabel = sign("Coin ATM", 36, 2.63, -73.35, 2.6);
  atm.attach(coinLabel);
  const atmRect = { x: 36, z: -74, w: 1.5, d: 1.1 };
  targets.push({ id: "coin-atm", x: 36, z: -72.9, label: "Use coin ATM" });
  atm.visible = false;
  let atmName = "";
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
  const gardenSign = makeGardenSign();
  town.add(gardenSign);
  rects.push({ x: 10, z: -80.5, w: 12.6, d: 0.25, clearHeight: 4.5 });
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
  // Place debris after every permanent collider has been registered.
  const finalScatter = pepeScatter(
    (x, z) =>
      blocked(x, z, rects, 1) ||
      sigmaPlots.some(
        (p) => Math.abs(x - p.x) < 1.5 && Math.abs(z - p.z) < 2,
      ) ||
      walkers.some((w) => Math.abs(x - w.x) < 3 && Math.abs(z - w.z) < 3) ||
      (Math.abs(x - 36) < 1.5 && Math.abs(z + 74) < 2),
  );
  debris.forEach((d, i) => {
    Object.assign(d, finalScatter[i]);
    d.object.position.set(d.x, i < 25 ? 0.3 : 0.15, d.z);
    if (i < 25)
      Object.assign(
        targets.find((t) => t.id === `pepe-seed-${i}`)!,
        finalScatter[i],
      );
  });
  return {
    town,
    entranceSign,
    walkers,
    updateWalkers,
    houseBounds,
    meditators,
    updatePepe,
    stacyChair,
    guestChair,
    handoffPacket,
    handSeeds(id: string, x: number, z: number, height = 1.1) {
      endHandoff();
      const npc = speakers.find((n) => n.id === id)?.object;
      if (!npc) return;
      const hand = npc.children.find(
        (o) =>
          Math.abs(o.position.x - 0.25) < 0.01 &&
          Math.abs(o.position.z - 0.24) < 0.01,
      );
      const start = npc.localToWorld(new T.Vector3(0.25, 1.02, 0.55));
      handoff = {
        start,
        receiver: new T.Vector3(x, height, z),
        time: 0,
        hand,
        rest: hand?.position.clone(),
      };
      handoffPacket.position.copy(start);
      handoffPacket.visible = true;
    },
    updateHandoff(dt: number, reduced: boolean) {
      if (!handoff) return;
      handoff.time += dt;
      const t = Math.min(1, handoff.time / (reduced ? 0.5 : 1.8));
      const reach = Math.sin((Math.min(1, t * 2) * Math.PI) / 2);
      if (handoff.hand && handoff.rest)
        handoff.hand.position
          .copy(handoff.rest)
          .add(new T.Vector3(0, 0.06, reach * 0.4));
      const travel = T.MathUtils.smoothstep(t, 0.25, 0.95);
      handoffPacket.position.lerpVectors(
        handoff.start,
        handoff.receiver,
        travel,
      );
      if (!reduced)
        handoffPacket.position.y += Math.sin(travel * Math.PI) * 0.2;
      if (t >= 1) endHandoff();
    },
    cancelHandoff: endHandoff,
    updateATM(name?: string) {
      const present = rects.includes(atmRect);
      if (!!name !== present) {
        if (name) rects.push(atmRect);
        else rects.splice(rects.indexOf(atmRect), 1);
      }
      atm.visible = !!name;
      if (name && name !== atmName) {
        atmName = name;
        const material = coinLabel.material as T.MeshBasicMaterial;
        material.map?.dispose();
        // Canvas text is data, so even imported names cannot create markup.
        const canvas = document.createElement("canvas");
        canvas.width = 768;
        canvas.height = 192;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#263b43";
        ctx.fillRect(0, 0, 768, 192);
        ctx.fillStyle = "#efbd4a";
        ctx.font = "bold 54px Nunito";
        ctx.textAlign = "center";
        ctx.fillText(name, 384, 78, 720);
        ctx.font = "bold 56px Nunito";
        ctx.fillText("COIN ATM", 384, 153);
        material.map = new T.CanvasTexture(canvas);
        material.map.colorSpace = T.SRGBColorSpace;
        material.needsUpdate = true;
      }
    },
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
