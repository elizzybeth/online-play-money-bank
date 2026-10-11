import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { blocked, type Rect } from "./game";
import { stepWanderer, type Wanderer } from "./wandering";
import type { Target } from "./world";
function maker(parent: T.Object3D) {
  const materials = new Map<string, T.MeshStandardMaterial>();
  const mesh = (
    g: T.BufferGeometry,
    c: string,
    x: number,
    y: number,
    z: number,
  ) => {
    if (!materials.has(c))
      materials.set(
        c,
        new T.MeshStandardMaterial({ color: c, roughness: 0.8 }),
      );
    const m = new T.Mesh(g, materials.get(c)!);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  return {
    box: (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      c: string,
    ) => mesh(new T.BoxGeometry(w, h, d), c, x, y, z),
    ball: (x: number, y: number, z: number, r: number, c: string) =>
      mesh(new T.SphereGeometry(r, 12, 8), c, x, y, z),
    mesh,
  };
}
export function makeSpanakopita() {
  const g = new T.Group();
  g.name = "spanakopita";
  const shape = new T.Shape();
  shape.moveTo(-0.22, -0.16);
  shape.lineTo(0.22, -0.16);
  shape.lineTo(0, 0.24);
  shape.closePath();
  const { mesh, box } = maker(g);
  const pastry = mesh(
    new T.ExtrudeGeometry(shape, {
      depth: 0.085,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.01,
    }),
    "#d7a24c",
    0,
    0,
    0,
  );
  pastry.rotation.x = -Math.PI / 2;
  for (let j = 0; j < 5; j++)
    box(
      0,
      0.025 + j * 0.014,
      0.07,
      0.3 - j * 0.035,
      0.006,
      0.02,
      j % 2 ? "#f1cf7c" : "#a97932",
    );
  for (let j = 0; j < 4; j++)
    box(
      -0.07 + j * 0.045,
      0.08,
      0.14,
      0.018,
      0.035,
      0.025,
      j % 2 ? "#e7dec1" : "#486c31",
    );
  return g;
}
function batch(g: T.Group) {
  const colors = new Map<T.Material, T.BufferGeometry[]>();
  g.updateMatrixWorld(true);
  for (const o of [...g.children])
    if (o instanceof T.Mesh && o.material instanceof T.Material) {
      const geometry = o.geometry.clone().applyMatrix4(o.matrix);
      if (!colors.has(o.material)) colors.set(o.material, []);
      colors.get(o.material)!.push(geometry);
      g.remove(o);
      o.geometry.dispose();
    }
  for (const [material, geometries] of colors) {
    const geometry = mergeGeometries(geometries);
    geometries.forEach((g) => g.dispose());
    if (geometry) {
      const m = new T.Mesh(geometry, material);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
  }
}
export function makeComposter() {
  const g = new T.Group();
  g.name = "community-composter";
  const { box, ball } = maker(g);
  // Scale the plan's square 32-inch footprint to the miniature world.
  for (const x of [-0.65, 0.65])
    for (const z of [-0.65, 0.65]) box(x, 0.67, z, 0.12, 1.34, 0.12, "#92704b");
  for (let j = 0; j < 9; j++) {
    const y = 0.072 + j * 0.145;
    for (const side of [-1, 1]) {
      box(0, y, side * 0.7, 1.52, 0.125, 0.075, "#bf9869");
      box(side * 0.7, y, 0, 0.075, 0.125, 1.38, "#b48b5c");
    }
  }
  for (const side of [-1, 1]) {
    box(0, 1.35, side * 0.7, 1.55, 0.075, 0.12, "#805f3e");
    box(side * 0.7, 1.35, 0, 0.12, 0.075, 1.48, "#805f3e");
  }
  for (let i = -6; i <= 6; i++) {
    box(i * 0.1, 1.36, 0, 0.007, 0.007, 1.3, "#626f61");
    box(0, 1.365, i * 0.1, 1.3, 0.007, 0.007, "#626f61");
  }
  for (const x of [-0.4, 0.4])
    box(x, 1.39, -0.71, 0.16, 0.045, 0.12, "#515f59");
  box(0, 0.4, 0, 1.25, 0.7, 1.25, "#53402d");
  for (let i = 0; i < 18; i++) {
    const leaf = ball(
      Math.sin(i * 2.4) * 0.48,
      0.79,
      Math.cos(i * 2.4) * 0.48,
      0.08,
      i % 2 ? "#92784d" : "#5c7242",
    );
    leaf.scale.set(1, 0.2, 1.5);
  }
  batch(g);
  g.userData.slatsToGround = true;
  g.userData.screenLid = true;
  return g;
}
export function makeWolfFountain() {
  const g = new T.Group();
  g.name = "howling-wolf-fountain";
  const { box, ball, mesh } = maker(g),
    stone = "#8b999e";
  const pool = mesh(
    new T.CylinderGeometry(1.8, 1.85, 0.24, 32),
    "#7f8985",
    0,
    0.12,
    0,
  );
  const rim = mesh(new T.TorusGeometry(1.7, 0.12, 8, 40), stone, 0, 0.26, 0);
  rim.rotation.x = Math.PI / 2;
  const water = mesh(new T.CircleGeometry(1.57, 40), "#73b6c2", 0, 0.265, 0);
  water.rotation.x = -Math.PI / 2;
  (water.material as T.MeshStandardMaterial).transparent = true;
  (water.material as T.MeshStandardMaterial).opacity = 0.75;
  mesh(new T.CylinderGeometry(0.48, 0.62, 0.4, 12), "#6e7d80", 0, 0.48, -0.25);
  ball(0, 1.08, -0.35, 0.44, stone).scale.set(1, 1.2, 1.1);
  ball(0, 1.68, -0.3, 0.38, stone).scale.set(0.82, 1.6, 0.8);
  for (const side of [-1, 1]) {
    const leg = box(side * 0.23, 1.1, 0.05, 0.16, 0.95, 0.18, stone);
    leg.rotation.x = -0.1;
    ball(side * 0.23, 0.66, 0.2, 0.17, "#7b8b91").scale.set(1, 0.55, 1.6);
    ball(side * 0.38, 0.82, -0.42, 0.26, "#7b8b91").scale.set(0.9, 1.1, 1.3);
    const ear = mesh(
      new T.ConeGeometry(0.14, 0.35, 3),
      stone,
      side * 0.2,
      2.42,
      -0.4,
    );
    ear.rotation.x = -0.3;
    ball(side * 0.16, 2.24, 0.0, 0.03, "#253a42");
  }
  const head = ball(0, 2.2, -0.2, 0.29, stone);
  head.rotation.x = -0.5;
  head.scale.set(0.8, 1, 1.35);
  const muzzle = ball(0, 2.43, 0.04, 0.17, "#9aa9aa");
  muzzle.scale.set(0.75, 1.4, 1.2);
  muzzle.rotation.x = -0.5;
  ball(0, 2.6, 0.11, 0.07, "#334952");
  const tailCurve = new T.CatmullRomCurve3([
    new T.Vector3(0, 0.9, -0.58),
    new T.Vector3(0.5, 0.62, -0.8),
    new T.Vector3(0.72, 0.63, -0.35),
    new T.Vector3(0.55, 0.68, 0.05),
  ]);
  mesh(new T.TubeGeometry(tailCurve, 12, 0.13, 7, false), stone, 0, 0, 0);
  const jet = new T.CatmullRomCurve3([
    new T.Vector3(0, 2.59, 0.12),
    new T.Vector3(0, 3.05, 0.6),
    new T.Vector3(0, 2.25, 1.25),
    new T.Vector3(0, 0.28, 1.35),
  ]);
  const stream = mesh(
    new T.TubeGeometry(jet, 24, 0.035, 6, false),
    "#9bdde7",
    0,
    0,
    0,
  );
  stream.name = "fountain-stream";
  const drops = Array.from({ length: 12 }, () =>
    mesh(new T.SphereGeometry(0.04, 6, 4), "#c6f0ef", 0, 0, 0),
  );
  const ripple = mesh(
    new T.TorusGeometry(0.3, 0.018, 5, 24),
    "#cff2ef",
    0,
    0.278,
    1.35,
  );
  ripple.rotation.x = Math.PI / 2;
  g.userData.pool = true;
  return {
    object: g,
    update(time: number) {
      drops.forEach((d, i) =>
        d.position.copy(jet.getPoint((time * 0.55 + i / 12) % 1)),
      );
      const t = (time * 0.8) % 1;
      ripple.scale.setScalar(0.5 + t * 1.8);
    },
  };
}
export function createTownLife(
  scene: T.Scene,
  rects: Rect[],
  targets: Target[],
  speakers: { id: string; name: string; object: T.Object3D }[],
  player: T.Group,
  mom: T.Group,
) {
  const chair = new T.Group();
  chair.name = "moms-bedroom-chair";
  chair.position.set(-6.6, 0, 10.2);
  const c = maker(chair);
  c.box(0, 0.65, 0, 0.85, 0.17, 0.8, "#af3970");
  c.box(0, 1.1, -0.35, 0.9, 0.85, 0.15, "#682451");
  for (const x of [-0.33, 0.33])
    for (const z of [-0.3, 0.3]) c.box(x, 0.3, z, 0.085, 0.6, 0.085, "#8f622f");
  scene.add(chair);
  rects.push({ x: -6.6, z: 10.2, w: 0.9, d: 0.85, clearHeight: 1.5 });
  targets.push({ id: "mom-chair", x: -6.6, z: 11.4, label: "Sit nearby Mom" });
  const names = ["Tuck", "Cluck", "Pluck", "Luck", "Fuck", "Fancy Chicken"];
  const chickens = names.map((name, i) => {
    const object = new T.Group();
    object.name = `chicken-${name}`;
    const m = maker(object),
      color = [
        "#eee2bd",
        "#a56636",
        "#e9d2a0",
        "#59372e",
        "#d9a455",
        "#be7431",
      ][i];
    m.ball(0, 0.45, 0, 0.3, color).scale.set(1, 1, 1.3);
    for (const side of [-1, 1]) {
      m.ball(side * 0.23, 0.46, 0, 0.18, color).scale.set(0.3, 1, 1.25);
      m.box(side * 0.11, 0.13, 0.05, 0.027, 0.2, 0.027, "#d79a37");
      m.box(side * 0.11, 0.04, 0.13, 0.14, 0.02, 0.18, "#d79a37");
    }
    const head = m.ball(0, 0.79, 0.25, 0.17, color);
    head.name = "head";
    m.mesh(
      new T.ConeGeometry(0.07, 0.18, 3).rotateX(Math.PI / 2),
      "#dc9a2e",
      0,
      0.79,
      0.46,
    );
    for (const side of [-1, 1])
      m.ball(side * 0.13, 0.83, 0.34, 0.018, "#242829");
    for (let j = 0; j < 3; j++)
      m.ball(0, 0.96 + j * 0.025, 0.16 + j * 0.07, 0.055, "#b93037");
    m.ball(0, 0.7, 0.39, 0.05, "#b93037");
    for (let j = 0; j < 3; j++) {
      const tail = m.mesh(
        new T.ConeGeometry(0.1, 0.45, 5),
        color,
        (j - 1) * 0.07,
        0.68,
        -0.29,
      );
      tail.rotation.x = -0.7;
    }
    if (i === 5) {
      object.userData.rooster = true;
      for (const side of [-1, 1]) {
        const wattle = m.ball(side * 0.09, 0.56, 0.43, 0.17, "#c52431");
        wattle.scale.set(0.65, 2.15, 0.9);
        wattle.name = "oversized-wattle";
        m.ball(side * 0.23, 0.46, 0, 0.19, "#164c4e").scale.set(0.3, 1, 1.25);
      }
      for (let j = 0; j < 5; j++)
        m.mesh(
          new T.ConeGeometry(0.06, 0.22, 5),
          "#cf2534",
          0,
          1.04,
          0.08 + j * 0.065,
        );
      for (let j = 0; j < 5; j++) {
        const x = (j - 2) * 0.065;
        const curve = new T.CatmullRomCurve3([
          new T.Vector3(x, 0.65, -0.2),
          new T.Vector3(x, 1.3, -0.55),
          new T.Vector3(x, 1.5, -0.9),
          new T.Vector3(x * 2, 0.8, -1.2),
        ]);
        m.mesh(
          new T.TubeGeometry(curve, 16, 0.04, 5, false),
          j % 2 ? "#113f43" : "#22585a",
          0,
          0,
          0,
        );
      }
      object.scale.setScalar(1.15);
    }
    const x = [-26, -12, 14, 24, 5, -2][i],
      z = [24, 27, 22, 9, -12, 29][i];
    object.position.set(x, 0, z);
    scene.add(object);
    const target = { id: `chicken-${i}`, x, z, label: `Cuddle ${name}` };
    targets.push(target);
    speakers.push({ id: target.id, name, object });
    const roaming: Wanderer = {
      position: { x, z },
      home: { x, z },
      speed: 0.3 + i * 0.035,
      pause: i,
      seed: 1021 + i * 73,
      journeys: 0,
    };
    return { name, object, target, roaming };
  });
  let cuddle: { i: number; t: number; origin: T.Vector3 } | undefined;
  let sharing: { t: number; pieces: T.Group[] } | undefined;
  const pose = (actor: T.Group, time: number) => {
    for (const side of [-1, 1])
      actor
        .getObjectByName(`hand-${side}`)
        ?.position.set(side * 0.3, 1.3, 0.58);
    const head = actor.getObjectByName("head");
    if (head) head.rotation.z = Math.sin(time * 6) * 0.04;
  };
  const reset = (actor: T.Group) => {
    for (const side of [-1, 1])
      actor.getObjectByName(`hand-${side}`)?.position.set(side * 0.52, 1.0, 0);
    const head = actor.getObjectByName("head");
    if (head) head.rotation.z = 0;
  };
  return {
    chickens,
    chair,
    get busy() {
      return !!cuddle || !!sharing;
    },
    get cuddling() {
      return cuddle?.i;
    },
    get sharing() {
      return !!sharing;
    },
    cuddle(i: number) {
      if (cuddle || sharing || !chickens[i]) return false;
      cuddle = { i, t: 0, origin: chickens[i].object.position.clone() };
      return true;
    },
    share() {
      if (cuddle || sharing) return false;
      const pieces = [player, mom].map((actor) => {
        const p = makeSpanakopita();
        p.position.set(0, 1.43, 0.6);
        actor.add(p);
        return p;
      });
      sharing = { t: 0, pieces };
      return true;
    },
    update(dt: number, time: number) {
      chickens.forEach((ch, i) => {
        if (cuddle?.i === i) return;
        const previous = { ...ch.roaming.position };
        stepWanderer(
          ch.roaming,
          dt,
          (p) =>
            !blocked(p.x, p.z, rects, 0.4) &&
            !chickens.some(
              (other) =>
                other !== ch &&
                Math.hypot(
                  other.object.position.x - p.x,
                  other.object.position.z - p.z,
                ) < 0.75,
            ),
          false,
          { minX: -33, maxX: 33, minZ: -18, maxZ: 33 },
        );
        ch.object.position.set(ch.roaming.position.x, 0, ch.roaming.position.z);
        if (
          Math.hypot(
            previous.x - ch.roaming.position.x,
            previous.z - ch.roaming.position.z,
          ) > 0.001
        )
          ch.object.rotation.y = Math.atan2(
            ch.roaming.position.x - previous.x,
            ch.roaming.position.z - previous.z,
          );
        const scratching = ch.roaming.pause > 0;
        const head = ch.object.getObjectByName("head")!;
        head.rotation.x = scratching
          ? Math.max(0, Math.sin(time * 5 + i)) * 0.8
          : 0;
        ch.object.position.y = scratching
          ? 0
          : Math.abs(Math.sin(time * 7 + i)) * 0.025;
        ch.target.x = ch.object.position.x;
        ch.target.z = ch.object.position.z;
      });
      if (cuddle) {
        cuddle.t += dt;
        const ch = chickens[cuddle.i],
          t = Math.min(1, cuddle.t / 0.5);
        if (ch.object.parent !== player && t >= 1) {
          player.add(ch.object);
          ch.object.position.set(-0.28, 0.95, 0.48);
          ch.object.rotation.set(0, Math.PI / 2, 0);
        } else if (t < 1) {
          player.updateMatrixWorld(true);
          const end = player.localToWorld(new T.Vector3(-0.28, 0.95, 0.48));
          ch.object.position.lerpVectors(cuddle.origin, end, t);
          ch.object.position.y += Math.sin(t * Math.PI) * 0.35;
        }
        pose(player, time);
        player.getObjectByName("head")!.rotation.z = 0.22;
        ch.object.rotation.x = -0.1;
        if (cuddle.t >= 3) {
          scene.attach(ch.object);
          let x = player.position.x + 1,
            z = player.position.z + 1;
          if (blocked(x, z, rects, 0.4)) {
            x = cuddle.origin.x;
            z = cuddle.origin.z;
          }
          ch.object.position.set(x, 0, z);
          ch.roaming.position = { x, z };
          ch.roaming.pause = 1;
          ch.target.x = x;
          ch.target.z = z;
          reset(player);
          cuddle = undefined;
        }
      }
      if (sharing) {
        sharing.t += dt;
        pose(player, time);
        pose(mom, time);
        sharing.pieces.forEach((p, i) => {
          p.position.y = 1.4 + Math.sin(time * 5 + i) * 0.055;
          p.scale.setScalar(Math.max(0.15, 1 - sharing!.t / 4));
        });
        if (sharing.t >= 3.2) {
          sharing.pieces.forEach((p) => {
            p.removeFromParent();
            p.traverse((o) => {
              if (o instanceof T.Mesh) o.geometry.dispose();
            });
          });
          reset(player);
          reset(mom);
          sharing = undefined;
        }
      }
    },
  };
}
