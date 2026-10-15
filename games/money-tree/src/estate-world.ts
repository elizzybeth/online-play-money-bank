import { makeMarvelsShowroom } from "./marvels-showroom";
import { fitWindow } from "./architecture";
import * as T from "three";
import type { State, Rect } from "./game";
import type { Target } from "./world";
import type { WallSpace } from "./furnishings";
import { mansionLot, marvelsLot } from "./housing";
import { makeEstate } from "./estate-models";
export function createEstateWorld(
  scene: T.Scene,
  rects: Rect[],
  occluders: T.Object3D[],
  targets: Target[],
) {
  const group = new T.Group();
  group.name = "player-estate-and-marvels";
  scene.add(group);
  let version = "",
    ownedRects: Rect[] = [],
    ownedTargets: Target[] = [],
    ownedWalls: T.Object3D[] = [];
  const walls: WallSpace[] = [];
  let estateRoof: T.Object3D | undefined, shopRoof: T.Object3D | undefined;
  return {
    group,
    walls,
    update(s: State) {
      const key = `${s.housing?.style}:${s.housing?.status}:${s.housing?.storeOpened}`;
      if (key === version) {
        if (estateRoof)
          estateRoof.visible =
            Math.abs(s.position.x - mansionLot.x) > 16 ||
            Math.abs(s.position.z - mansionLot.z) > 11;
        if (shopRoof)
          shopRoof.visible =
            Math.abs(s.position.x - marvelsLot.x) > 10 ||
            Math.abs(s.position.z - marvelsLot.z) > 9;
        return;
      }
      version = key;
      for (const r of ownedRects) {
        const i = rects.indexOf(r);
        if (i >= 0) rects.splice(i, 1);
      }
      for (const t of ownedTargets) {
        const i = targets.indexOf(t);
        if (i >= 0) targets.splice(i, 1);
      }
      for (const w of ownedWalls) {
        const i = occluders.indexOf(w);
        if (i >= 0) occluders.splice(i, 1);
      }
      ownedRects = [];
      ownedTargets = [];
      ownedWalls = [];
      walls.length = 0;
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>(),
        textures = new Set<T.Texture>();
      group.traverse((o) => {
        if (o instanceof T.Mesh) {
          geometries.add(o.geometry);
          for (const m of Array.isArray(o.material)
            ? o.material
            : [o.material]) {
            materials.add(m);
            const map = (m as T.MeshStandardMaterial).map;
            if (map) textures.add(map);
          }
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      group.clear();
      estateRoof = shopRoof = undefined;
      const h = s.housing;
      if (!h) return;
      const model = makeEstate(h.style);
      estateRoof = model.root.getObjectByName("estate-roof");
      model.root.position.set(mansionLot.x, 0, mansionLot.z);
      group.add(model.root);
      for (const wall of model.walls) {
        const dimensions = wall.userData.dims;
        wall.userData.cameraWall = true;
        wall.userData.boxDimensions = dimensions;
        wall.position.x += mansionLot.x;
        wall.position.z += mansionLot.z;
        if (dimensions.w > 20 || dimensions.d > 20)
          fitWindow(
            wall,
            dimensions.w > dimensions.d,
            Math.max(dimensions.w, dimensions.d),
            5.8,
            0.35,
            [
              { x: -7, y: -0.8, width: 2, height: 1.5 },
              { x: 7, y: -0.8, width: 2, height: 1.5 },
            ],
          );
        model.root.remove(wall);
        group.add(wall);
        occluders.push(wall);
        ownedWalls.push(wall);
        const r = {
          x: wall.position.x,
          z: wall.position.z,
          w: dimensions.w,
          d: dimensions.d,
        };
        rects.push(r);
        ownedRects.push(r);
        const axis = dimensions.w < dimensions.d ? "x" : "z",
          mid = axis === "x" ? wall.position.z : wall.position.x,
          length = Math.max(dimensions.w, dimensions.d);
        walls.push({
          axis,
          value:
            wall.position[axis] +
            (axis === "x"
              ? wall.position.x < mansionLot.x
                ? 0.25
                : -0.25
              : wall.position.z < mansionLot.z
                ? 0.25
                : -0.25),
          from: mid - length / 2,
          to: mid + length / 2,
          rotation:
            axis === "x"
              ? wall.position.x < mansionLot.x
                ? Math.PI / 2
                : -Math.PI / 2
              : wall.position.z < mansionLot.z
                ? 0
                : Math.PI,
          windows:
            dimensions.w > 20 || dimensions.d > 20
              ? [-7, 7].map((offset) => ({
                  from: mid + offset - 1,
                  to: mid + offset + 1,
                  bottom: 1.35,
                  top: 2.85,
                }))
              : [],
        });
      }
      const door: T.Object3D = new T.Mesh(
        new T.BoxGeometry(2.8, 4.2, 0.18),
        new T.MeshStandardMaterial({ color: "#735039" }),
      );
      door.position.set(mansionLot.x, 2.1, mansionLot.z + 11.5);
      door.visible = h.status !== "owned";
      group.add(door);
      if (h.status !== "owned") {
        const r = { x: mansionLot.x, z: mansionLot.z + 11.5, w: 3, d: 0.4 };
        rects.push(r);
        ownedRects.push(r);
      }
      const t = {
        id: "player-mansion",
        x: mansionLot.x,
        z: mansionLot.z + 13,
        label:
          h.status === "owned"
            ? "My mansion"
            : "Mansion repossessed: entry locked",
      };
      targets.push(t);
      ownedTargets.push(t);
      if (h.storeOpened) {
        const showroom = makeMarvelsShowroom();
        shopRoof = showroom.roof;
        showroom.root.position.set(marvelsLot.x, 0, marvelsLot.z);
        group.add(showroom.root);
        for (const local of showroom.obstacles) {
          const r = {
            ...local,
            x: local.x + marvelsLot.x,
            z: local.z + marvelsLot.z,
          };
          rects.push(r);
          ownedRects.push(r);
        }
        const target = {
          id: "mansion-marvels",
          x: marvelsLot.x,
          z: marvelsLot.z + 7,
          label: "Shop Mansion Marvels furnishings",
        };
        targets.push(target);
        ownedTargets.push(target);
      }
    },
  };
}
