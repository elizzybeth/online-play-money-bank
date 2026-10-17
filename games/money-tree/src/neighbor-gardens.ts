import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
import { makeGardenTool } from "./tool-models";
import type { Rect } from "./game";
import type { Target } from "./world";
export function createNeighborGardens(
  scene: T.Scene,
  speakers: { id: string; object: T.Object3D }[],
  targets: Target[],
  rects: Rect[],
  player: T.Object3D,
) {
  const flowers = new T.Group();
  scene.add(flowers);
  const gardeners = [
    { id: "npc1", x: 12, z: 21.2 },
    { id: "npc2", x: 12, z: 7.2 },
    { id: "npc3", x: -23, z: -13 },
  ].map((site, i) => {
    const actor = speakers.find((n) => n.id === site.id)!.object,
      collider = rects.find(
        (r) =>
          Math.abs(r.x - actor.position.x) < 0.1 &&
          Math.abs(r.z - actor.position.z) < 0.1,
      );
    const can = makeGardenTool("can");
    can.scale.setScalar(0.48);
    can.position.set(0.52, 0.85, 0.3);
    actor.add(can);
    const bag = new T.Mesh(
      new T.CylinderGeometry(0.12, 0.14, 0.34, 8),
      new T.MeshStandardMaterial({ color: "#baa468" }),
    );
    bag.position.set(0.5, 0.9, 0.35);
    actor.add(bag);
    const droplets = new T.Group();
    actor.add(droplets);
    for (let j = 0; j < 7; j++) {
      const drop = new T.Mesh(
        new T.SphereGeometry(0.025, 5, 4),
        new T.MeshBasicMaterial({ color: "#8bcecf" }),
      );
      droplets.add(drop);
    }
    const beds = [-2, 2].map((dx) => new T.Vector3(site.x + dx, 0, site.z));
    for (const bed of beds) {
      const soil = new T.Mesh(
        new T.BoxGeometry(1.5, 0.1, 0.8),
        new T.MeshStandardMaterial({ color: "#6c5238" }),
      );
      soil.position.copy(bed).add(new T.Vector3(0, 0.06, 0));
      flowers.add(soil);
      for (let flower = 0; flower < 4; flower++) {
        const stem = new T.Mesh(
          new T.CylinderGeometry(0.024, 0.024, 0.34, 5),
          new T.MeshStandardMaterial({ color: "#51764a" }),
        );
        stem.position
          .copy(bed)
          .add(new T.Vector3(-0.5 + flower * 0.33, 0.24, 0));
        flowers.add(stem);
        const bloom = new T.Mesh(
          new T.SphereGeometry(0.11, 7, 5),
          new T.MeshStandardMaterial({
            color: i === 2 ? "#e5a1c1" : "#e6ce79",
          }),
        );
        bloom.position.copy(stem.position).add(new T.Vector3(0, 0.2, 0));
        flowers.add(bloom);
      }
    }
    return { site, actor, collider, can, bag, droplets, beds, clock: i * 7 };
  });
  const batches = new Map<
    string,
    { material: T.Material; geometry: T.BufferGeometry[] }
  >();
  flowers.updateMatrixWorld(true);
  for (const child of [...flowers.children]) {
    const mesh = child as T.Mesh;
    const material = mesh.material as T.MeshStandardMaterial;
    const key = material.color.getHexString();
    const batch = batches.get(key) ?? { material, geometry: [] };
    batch.geometry.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    batches.set(key, batch);
    mesh.geometry.dispose();
    if (batch.material !== material) material.dispose();
  }
  flowers.clear();
  for (const batch of batches.values()) {
    flowers.add(new T.Mesh(mergeGeometries(batch.geometry)!, batch.material));
    batch.geometry.forEach((g) => g.dispose());
  }
  return {
    update(dt: number, speaking?: string, beaBusy = false) {
      gardeners.forEach((g) => {
        if (g.site.id === speaking || (g.site.id === "npc1" && beaBusy)) {
          g.can.visible = g.bag.visible = g.droplets.visible = false;
          return;
        }
        g.clock += dt;
        const cycle = Math.floor(g.clock / 12),
          phase = g.clock % 12,
          bed = g.beds[cycle % 2],
          destination = bed.clone().add(new T.Vector3(0, 0, 0.8));
        const delta = destination.clone().sub(g.actor.position);
        delta.y = 0;
        const walking = delta.length() > 0.1;
        const nearby = g.actor.position.distanceTo(player.position) < 3;
        if (walking && !nearby) {
          const step = Math.min(delta.length(), dt * 0.7);
          g.actor.position.add(delta.setLength(step));
          g.actor.rotation.y = Math.atan2(delta.x, delta.z);
        } else g.actor.rotation.y = Math.PI;
        g.actor.position.y = 0;
        g.actor.rotation.x =
          !walking && cycle % 3 === 2
            ? Math.sin((Math.min(1, phase / 2) * Math.PI) / 2) * 0.4
            : 0;
        g.can.visible = !walking && cycle % 3 === 0;
        g.can.rotation.z = -0.5 - Math.sin(phase * 2) * 0.07;
        g.bag.visible = !walking && cycle % 3 === 1;
        g.bag.rotation.z = Math.sin(phase * 3) * 0.25;
        g.droplets.visible = g.can.visible;
        g.droplets.children.forEach((d, i) =>
          d.position.set(
            0.7 + i * 0.025,
            0.75 - ((phase * 1.8 + i * 0.13) % 1) * 0.6,
            0.6 + i * 0.03,
          ),
        );
        if (g.collider) {
          g.collider.x = g.actor.position.x;
          g.collider.z = g.actor.position.z;
        }
        const target = targets.find((t) => t.id === g.site.id);
        if (target) {
          target.x = g.actor.position.x;
          target.z = g.actor.position.z;
        }
      });
    },
  };
}
