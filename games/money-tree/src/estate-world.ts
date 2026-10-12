import { fitWindow } from "./architecture";
import * as T from "three";
import type { State, Rect } from "./game";
import type { Target } from "./world";
import type { WallSpace } from "./furnishings";
import { mansionLot, marvelsLot } from "./housing";
import { makeEstate } from "./estate-models";
import { makeFurnishing } from "./furnishing-models";
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
  return {
    group,
    walls,
    update(s: State) {
      const key = `${s.housing?.style}:${s.housing?.status}:${s.housing?.storeOpened}`;
      if (key === version) {
        const roof = group.getObjectByName("estate-roof");
        if (roof)
          roof.visible =
            Math.abs(s.position.x - mansionLot.x) > 16 ||
            Math.abs(s.position.z - mansionLot.z) > 11;
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
      group.clear();
      const h = s.housing;
      if (!h) return;
      const model = makeEstate(h.style);
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
        const store = new T.Group();
        store.name = "Mansion Marvels";
        store.position.set(marvelsLot.x, 0, marvelsLot.z);
        group.add(store);
        const mat = new T.MeshStandardMaterial({ color: "#ede0bd" });
        for (const [x, z, w, d] of [
          [-10, 0, 0.3, 18],
          [10, 0, 0.3, 18],
          [0, -9, 20, 0.3],
        ]) {
          const mesh = new T.Mesh(new T.BoxGeometry(w, 4, d), mat);
          mesh.position.set(x, 2, z);
          store.add(mesh);
          const r = { x: x + marvelsLot.x, z: z + marvelsLot.z, w, d };
          ownedRects.push(r);
          rects.push(r);
        }
        const display = [
          "royal-bed",
          "gilded-chair",
          "marble-planter",
          "palace-rug",
        ] as const;
        display.forEach((id, i) => {
          const item = makeFurnishing(id);
          item.position.set(-6 + i * 4, 0, -4);
          store.add(item);
        });
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 192;
        const c = canvas.getContext("2d")!;
        c.fillStyle = "#2c3442";
        c.fillRect(0, 0, 1024, 192);
        c.strokeStyle = c.fillStyle = "#eacb77";
        c.lineWidth = 6;
        c.strokeRect(10, 10, 1004, 172);
        c.font = "70px Georgia";
        c.textAlign = "center";
        c.fillText("Mansion Marvels", 512, 118);
        const sign = new T.Mesh(
          new T.PlaneGeometry(17, 3.1),
          new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas) }),
        );
        sign.position.set(0, 4.3, 8.8);
        store.add(sign);
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
