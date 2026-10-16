import { makeMeteorCrater } from "./meteor-crater";
import * as T from "three";
import type { State } from "./game";
import type { Meteor } from "./adventure";
import {
  advanceAdventure,
  landMeteor,
  meteorPacketPosition,
} from "./adventure";
import { terrainHeight, setCraterSites } from "./millionaire-land";
import { makeSeedPacket } from "./seed-packet";
import type { Target } from "./world";
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
export function createMeteorWorld(
  scene: T.Scene,
  onImpact: () => void,
  targets: Target[] = [],
) {
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
  const packets = new T.Group();
  packets.name = "meteor-seed-packets";
  group.add(packets);
  const packetTemplate = makeSeedPacket();
  let packetSnapshot: number[] = [];
  let craterSnapshot: number[] = [];
  let craterSyncs = 0;
  let packetSyncs = 0;
  // Compare primitive fields without building JSON, arrays or strings each frame.
  function changed(snapshot: number[], meteors: Meteor[], packets: boolean) {
    if (snapshot.length !== meteors.length * 5) return true;
    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i],
        at = i * 5;
      if (
        snapshot[at] !== m.id ||
        snapshot[at + 1] !== +m.landed ||
        snapshot[at + 2] !== m.x ||
        snapshot[at + 3] !== m.z ||
        snapshot[at + 4] !== (packets ? (m.seedPackets ?? 0) : 0)
      )
        return true;
    }
    return false;
  }
  function capture(meteors: Meteor[], packets: boolean) {
    return meteors.flatMap((m) => [
      m.id,
      +m.landed,
      m.x,
      m.z,
      packets ? (m.seedPackets ?? 0) : 0,
    ]);
  }
  let packetTargets: Target[] = [];
  let terrainActive = false;
  const craters = new Map<number, T.Group>();
  const flights = new Map<number, { t: number; mesh: T.Mesh }>();

  function crater(x: number, z: number) {
    const root = makeMeteorCrater(x, z);
    group.add(root);
    return root;
  }
  let currentState: State | undefined;
  const dispose = (object: T.Object3D) => {
    object.removeFromParent();
    object.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        for (const material of Array.isArray(o.material)
          ? o.material
          : [o.material])
          material.dispose();
      }
    });
  };
  return {
    group,
    stats: () => ({ craterSyncs, packetSyncs }),
    update(s: State, dt: number) {
      if (currentState !== s) {
        flights.forEach((flight) => dispose(flight.mesh));
        craters.forEach(dispose);
        flights.clear();
        craters.clear();
        craterSnapshot = [-1];
        packetSnapshot = [-1];
        packets.clear();
        for (const target of packetTargets) {
          const i = targets.indexOf(target);
          if (i >= 0) targets.splice(i, 1);
        }
        packetTargets = [];
        currentState = s;
        terrainActive = false;
        setCraterSites([]);
      }
      const born = dt > 0 ? advanceAdventure(s, dt) : null;
      group.visible = !!s.millionaire?.unlocked;
      if (!group.visible) {
        if (terrainActive) setCraterSites([]);
        terrainActive = false;
        return;
      }
      if (born) {
        {
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
        }
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
        if (m.landed && m.plot !== undefined) {
          m.harvested = s.plots[m.plot]?.stage === "harvested";
        }
      }
      const meteors = s.adventure?.meteors ?? [];
      if (!terrainActive || changed(craterSnapshot, meteors, false)) {
        terrainActive = true;
        craterSnapshot = capture(meteors, false);
        craterSyncs++;
        setCraterSites(meteors.filter((m) => m.landed));
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
        disks.forEach(
          (disk, i) =>
            (disk.visible = !s.adventure?.meteors?.some(
              (m) =>
                m.landed &&
                m.x === meteorSites[i][0] &&
                m.z === meteorSites[i][1],
            )),
        );
      }
      if (changed(packetSnapshot, meteors, true)) {
        packetSnapshot = capture(meteors, true);
        packetSyncs++;
        packets.clear();
        for (const target of packetTargets) {
          const i = targets.indexOf(target);
          if (i >= 0) targets.splice(i, 1);
        }
        packetTargets = [];
        for (const m of s.adventure?.meteors ?? [])
          for (let i = 0; i < 10; i++) {
            if (!m.landed || !((m.seedPackets ?? 0) & (1 << i))) continue;
            const p = meteorPacketPosition(m, i);
            const packet = packetTemplate.clone(true);
            packet.position.set(p.x, terrainHeight(p.x, p.z) + 0.3, p.z);
            packet.rotation.y = i * 2.4;
            packets.add(packet);
            const target = {
              id: `meteor-seed-${m.id}-${i}`,
              ...p,
              label: "Pick up seed packet · 5 money seeds",
            };
            targets.push(target);
            packetTargets.push(target);
          }
      }

      return born;
    },
  };
}
