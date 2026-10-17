import * as T from "three";
import type { Rect } from "./game";
import type { Target } from "./world";
export const wackyLines = [
  "Good clean fun!",
  "Legal fun!",
  "Illegal fun!",
  "Sexy fun!",
  "Inflatable fun!",
] as const;
export function createMrWacky(
  parent: T.Group,
  rects: Rect[],
  targets: Target[],
  speakers: { id: string; name: string; object: T.Object3D }[],
) {
  const root = new T.Group();
  root.name = "mr-wacky";
  root.position.set(-18, 0, -65);
  root.visible = false;
  parent.add(root);
  const green = new T.MeshStandardMaterial({
      color: "#a8dd52",
      roughness: 0.47,
    }),
    pink = new T.MeshStandardMaterial({ color: "#e64baa", roughness: 0.55 }),
    dark = new T.MeshStandardMaterial({ color: "#203d32" }),
    white = new T.MeshStandardMaterial({ color: "#fff7df" });
  const part = (
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    p: T.Object3D,
  ) => {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    p.add(o);
    return o;
  };
  part(
    new T.CylinderGeometry(0.58, 0.65, 0.28, 16),
    new T.MeshStandardMaterial({ color: "#5271a7", roughness: 0.7 }),
    0,
    0.14,
    0,
    root,
  );
  const joints: T.Group[] = [];
  let previous: T.Object3D = root;
  for (let i = 0; i < 4; i++) {
    const joint = new T.Group();
    joint.position.y = i === 0 ? 0.28 : 0.65;
    previous.add(joint);
    joints.push(joint);
    part(
      new T.CylinderGeometry(0.43, 0.43, 0.68, 16),
      green,
      0,
      0.34,
      0,
      joint,
    );
    previous = joint;
  }
  const head = joints[3];
  head.name = "head";
  for (const side of [-1, 1]) {
    const eye = part(
      new T.SphereGeometry(1, 12, 8),
      white,
      side * 0.18,
      0.47,
      0.392,
      head,
    );
    eye.scale.set(0.135, 0.17, 0.035);
    const pupil = part(
      new T.SphereGeometry(1, 10, 8),
      dark,
      side * 0.18 + 0.025,
      0.46,
      0.427,
      head,
    );
    pupil.scale.set(0.06, 0.085, 0.02);
  }
  const smile = new T.Shape();
  smile.moveTo(-0.23, 0.02);
  smile.quadraticCurveTo(0, -0.29, 0.23, 0.02);
  smile.quadraticCurveTo(0, -0.035, -0.23, 0.02);
  const mouth = part(new T.ShapeGeometry(smile), dark, 0, 0.27, 0.435, head);
  mouth.name = "mr-wacky-smile";
  for (let i = -2; i <= 2; i++) {
    const strand = part(
      new T.CapsuleGeometry(0.045, 0.22 + Math.abs(i) * 0.03, 3, 6),
      pink,
      i * 0.1,
      0.85,
      0.01,
      head,
    );
    strand.rotation.z = -i * 0.32;
  }
  const arms: { shoulder: T.Group; elbow: T.Group; side: number }[] = [];
  for (const side of [-1, 1]) {
    const shoulder = new T.Group();
    shoulder.position.set(side * 0.36, 0.48, 0);
    joints[1].add(shoulder);
    const upper = part(
      new T.CapsuleGeometry(0.145, 0.62, 4, 10),
      green,
      side * 0.36,
      0,
      0,
      shoulder,
    );
    upper.rotation.z = Math.PI / 2;
    const elbow = new T.Group();
    elbow.position.x = side * 0.75;
    shoulder.add(elbow);
    const fore = part(
      new T.CapsuleGeometry(0.13, 0.65, 4, 10),
      green,
      side * 0.38,
      0,
      0,
      elbow,
    );
    fore.rotation.z = Math.PI / 2;
    for (let i = -1; i <= 1; i++)
      part(
        new T.CapsuleGeometry(0.035, 0.2, 3, 6),
        pink,
        side * 0.87,
        i * 0.07,
        0,
        elbow,
      ).rotation.z = (side * Math.PI) / 2 + i * 0.3;
    arms.push({ shoulder, elbow, side });
  }
  const target = {
      id: "mr-wacky",
      x: -18,
      z: -63.5,
      label: "Dance with Mr Wacky",
    },
    collider = { x: -18, z: -65, w: 1.2, d: 1.2 };
  speakers.push({ id: "mr-wacky", name: "Mr Wacky", object: root });
  let visible = false,
    time = 0,
    remaining = 0,
    next = 0;
  const pose = (t: number, amplitude: number) => {
    joints.forEach((j, i) => {
      j.rotation.z = Math.sin(t * 5 - i * 0.95) * 0.25 * amplitude;
      j.rotation.x = Math.sin(t * 3.7 + i) * 0.11 * amplitude;
    });
    for (const { shoulder, elbow, side } of arms) {
      shoulder.rotation.z =
        side * (0.45 + Math.sin(t * 6 + side) * 0.7 * amplitude);
      elbow.rotation.z =
        side * (0.3 + Math.cos(t * 7 - side) * 0.8 * amplitude);
    }
    root.position.y = Math.abs(Math.sin(t * 6)) * 0.12 * amplitude;
  };
  pose(0, 0);
  return {
    root,
    stats: () => ({
      visible,
      remaining,
      time,
      line: next,
      body: joints.map((j) => j.rotation.z),
    }),
    interact(x: number, z: number) {
      if (!visible) return "";
      time = 0;
      remaining = 9;
      root.rotation.y = Math.atan2(x - root.position.x, z - root.position.z);
      return wackyLines[next++ % wackyLines.length];
    },
    update(popped: boolean, dt: number, reduced: boolean) {
      if (popped !== visible) {
        visible = popped;
        root.visible = popped;
        if (popped) {
          rects.push(collider);
          targets.push(target);
        } else {
          rects.splice(rects.indexOf(collider), 1);
          targets.splice(targets.indexOf(target), 1);
          remaining = time = next = 0;
          pose(0, 0);
        }
      }
      if (!visible || remaining <= 0 || dt <= 0) return;
      time += dt;
      remaining = Math.max(0, remaining - dt);
      pose(time, reduced ? 0.15 : Math.min(1, remaining));
      if (!remaining) pose(0, 0);
    },
  };
}
