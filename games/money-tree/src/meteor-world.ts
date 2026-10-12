import { makeMeteorCrater } from "./meteor-crater";
import * as T from "three";
import type { State } from "./game";
import { advanceAdventure, landMeteor } from "./adventure";
import { setCraterSites } from "./millionaire-land";
export const meteorSites = [
  [-80, -180],
  [142, -220],
  [-77, -255],
  [150, -270],
  [-80, -460],
  [150, -460],
];
export function desertGround() {
  const shape = new T.Shape();
  shape.moveTo(-105, -480);
  shape.lineTo(165, -480);
  shape.lineTo(165, -90);
  // The town's grass already covers this strip. Cut it out rather than stack
  // another ground plane at exactly y=0 across the Level 3 transition.
  shape.lineTo(50, -90);
  shape.lineTo(50, -95);
  shape.lineTo(-50, -95);
  shape.lineTo(-50, -90);
  shape.lineTo(-105, -90);
  shape.closePath();
  for (const [x, z] of meteorSites) {
    const hole = new T.Path();
    hole.absarc(x, z, 10, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new T.ShapeGeometry(shape, 32);
  geometry.rotateX(Math.PI / 2);
  const mesh = new T.Mesh(
    geometry,
    new T.MeshStandardMaterial({ color: "#b4a47e", side: T.DoubleSide }),
  );
  mesh.name = "desert-ground";
  mesh.userData.depthAudit = true;
  mesh.receiveShadow = true;
  return mesh;
}
export function createMeteorWorld(scene: T.Scene, onImpact: () => void) {
  const group = new T.Group();
  group.name = "meteor-craters";
  scene.add(group);
  const disks = meteorSites.map(([x, z]) => {
    const disk = new T.Mesh(
      new T.CircleGeometry(10, 64),
      new T.MeshStandardMaterial({ color: "#b4a47e", side: T.DoubleSide }),
    );
    disk.name = "inactive-crater-ground";
    disk.userData.depthAudit = true;
    disk.rotation.x = -Math.PI / 2;
    disk.position.set(x, 0, z);
    group.add(disk);
    return disk;
  });
  const craters = new Map<number, T.Group>();
  const flights = new Map<number, { t: number; mesh: T.Mesh }>();
  let previous = "";
  function crater(x: number, z: number) {
    const root = makeMeteorCrater(x, z);
    group.add(root);
    return root;
  }
  return {
    group,
    update(s: State, dt: number) {
      const born = dt > 0 ? advanceAdventure(s, dt) : null;
      group.visible = !!s.millionaire?.unlocked;
      if (!group.visible) {
        setCraterSites([]);
        return;
      }
      if (born) {
        const near =
          Math.hypot(s.position.x - born.x, s.position.z - born.z) < 70;
        if (near) {
          const mesh = new T.Mesh(
            new T.IcosahedronGeometry(0.9, 1),
            new T.MeshStandardMaterial({
              color: "#d96828",
              emissive: "#ff8833",
              emissiveIntensity: 2,
            }),
          );
          group.add(mesh);
          flights.set(born.id, { t: 0, mesh });
        } else if (landMeteor(s, born.id)) onImpact();
      }
      for (const m of s.adventure?.meteors ?? []) {
        if (!m.landed && !flights.has(m.id)) {
          if (landMeteor(s, m.id)) onImpact();
        }
        const flight = flights.get(m.id);
        if (flight) {
          flight.t += dt;
          const progress = Math.min(1, flight.t / 3);
          flight.mesh.position.set(
            m.x - 40 * (1 - progress),
            35 * (1 - progress),
            m.z - 25 * (1 - progress),
          );
          flight.mesh.rotation.x += dt * 4;
          if (progress === 1) {
            group.remove(flight.mesh);
            flight.mesh.geometry.dispose();
            (flight.mesh.material as T.Material).dispose();
            flights.delete(m.id);
            if (landMeteor(s, m.id)) onImpact();
          }
        }
        if (m.landed) {
          if (m.plot === undefined) {
            m.plot = s.plots.length;
            s.plots.push({
              x: m.x,
              z: m.z,
              mountain: false,
              soilFilled: true,
              stage: "ready",
              remaining: 0,
              fertilized: false,
              yield: 700,
            });
          } else if (born?.id === m.id) {
            s.plots[m.plot] = {
              x: m.x,
              z: m.z,
              soilFilled: true,
              stage: "ready",
              remaining: 0,
              fertilized: false,
              yield: 700,
            };
          }
          m.harvested = s.plots[m.plot]?.stage === "harvested";
        }
      }
      const current = JSON.stringify(
        (s.adventure?.meteors ?? []).filter((m) => m.landed).map((m) => m.id),
      );
      if (current !== previous) {
        previous = current;
        for (const [id, mesh] of craters)
          if (!s.adventure?.meteors?.some((m) => m.id === id)) {
            group.remove(mesh);
            mesh.traverse((o) => {
              if (o instanceof T.Mesh) {
                o.geometry.dispose();
                for (const m of Array.isArray(o.material)
                  ? o.material
                  : [o.material])
                  m.dispose();
              }
            });
            craters.delete(id);
          }
        for (const m of s.adventure?.meteors ?? [])
          if (m.landed && !craters.has(m.id))
            craters.set(m.id, crater(m.x, m.z));
      }
      disks.forEach(
        (disk, i) =>
          (disk.visible = !s.adventure?.meteors?.some(
            (m) =>
              m.landed &&
              m.x === meteorSites[i][0] &&
              m.z === meteorSites[i][1],
          )),
      );
      setCraterSites((s.adventure?.meteors ?? []).filter((m) => m.landed));
      return born;
    },
  };
}
