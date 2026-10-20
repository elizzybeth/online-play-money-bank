import { plantRiverBanks } from "./river-vegetation";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
import type { Rect } from "./game";
import {
  riverSections,
  riverHalfWidth,
  riverBankWidth,
  riverBridges,
  bridgeApproachHalfWidth,
  riverDistance,
} from "./river-land";
import { carveRiver } from "./river-carve";

export function createRiverWorld(
  scene: T.Scene,
  rects: Rect[],
  paths: Rect[],
  buildings: Rect[] = [],
) {
  const root = new T.Group();
  root.name = "willow-river";
  const vegetation = new T.Group();
  vegetation.name = "riverbank-vegetation";
  root.add(vegetation);
  const channel = new T.Group();
  channel.name = "river-channel";
  root.add(channel);
  scene.add(root);
  // Carve every terrain and road surface the route passes through, before water.
  for (const name of [
    "town-ground",
    "desert-ground",
    "millionaire-east-verge",
    "continuous-sidewalk",
    "sigma-continuous-sidewalk",
    "millionaire-town-path-connection",
  ]) {
    const mesh = scene.getObjectByName(name);
    if (mesh instanceof T.Mesh) carveRiver(mesh);
  }
  const mat = (color: string) =>
    new T.MeshStandardMaterial({ color, roughness: 0.88 });
  const ribbon = (
    inner: number,
    outer: number,
    y1: number,
    y2: number,
    material: T.Material,
    name: string,
  ) => {
    const vertices: number[] = [];
    for (let i = 1; i < riverSections.length; i++) {
      const a = riverSections[i - 1],
        b = riverSections[i];
      const p = [a.x + a.nx * inner, y1, a.z + a.nz * inner],
        q = [b.x + b.nx * inner, y1, b.z + b.nz * inner],
        r = [b.x + b.nx * outer, y2, b.z + b.nz * outer],
        s = [a.x + a.nx * outer, y2, a.z + a.nz * outer];
      vertices.push(...p, ...q, ...r, ...p, ...r, ...s);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    material.side = T.DoubleSide;
    const mesh = new T.Mesh(g, material);
    mesh.name = name;
    mesh.receiveShadow = true;
    channel.add(mesh);
    return mesh;
  };
  ribbon(
    -riverHalfWidth,
    riverHalfWidth,
    -0.9,
    -0.9,
    mat("#716a49"),
    "riverbed",
  );
  const waterMaterial = new T.MeshStandardMaterial({
    color: "#527f78",
    roughness: 0.24,
    metalness: 0.18,
    side: T.DoubleSide,
  });
  const water = ribbon(
    -riverHalfWidth,
    riverHalfWidth,
    -0.32,
    -0.32,
    waterMaterial,
    "river-water",
  );
  const ripples: number[] = [];
  for (let i = 3; i < riverSections.length - 3; i += 7) {
    const a = riverSections[i],
      b = riverSections[i + 1],
      offset = Math.sin(i * 1.7) * 1.2;
    ripples.push(
      a.x + a.nx * offset,
      -0.303,
      a.z + a.nz * offset,
      b.x + b.nx * offset,
      -0.303,
      b.z + b.nz * offset,
    );
  }
  const rippleGeometry = new T.BufferGeometry();
  rippleGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(ripples, 3),
  );
  const highlights = new T.LineSegments(
    rippleGeometry,
    new T.LineBasicMaterial({
      color: "#b7ddd0",
      transparent: true,
      opacity: 0.4,
    }),
  );
  highlights.name = "river-ripples";
  channel.add(highlights);
  const bankGrass = mat("#788b58");
  for (const side of [-1, 1])
    ribbon(
      side * riverBankWidth,
      side * 5.3,
      0.018,
      0.018,
      bankGrass,
      "lush-bank-grass",
    );
  const bankMaterial = mat("#8d8354");
  for (const side of [-1, 1])
    ribbon(
      side * riverHalfWidth,
      side * riverBankWidth,
      -0.9,
      0.005,
      bankMaterial,
      "sloping-riverbank",
    );
  const wood = mat("#9c8059"),
    stone = mat("#b9b5a0");
  const part = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: T.Material,
    parent: T.Object3D = root,
  ) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  for (const b of riverBridges) {
    const bridge = new T.Group();
    bridge.name = `river-bridge-${b.id}`;
    root.add(bridge);
    part(b.x, 0.03, b.z, b.w, 0.22, b.d, wood, bridge);
    const alongZ = b.axis === "z",
      length = alongZ ? b.d : b.w;
    for (const side of [-1, 1]) {
      const x = b.x + (alongZ ? side * (b.w / 2 + 0.12) : 0),
        z = b.z + (alongZ ? 0 : side * (b.d / 2 + 0.12));
      part(
        x,
        1.04,
        z,
        alongZ ? 0.14 : length,
        0.16,
        alongZ ? length : 0.14,
        wood,
        bridge,
      );
      part(
        x,
        0.18,
        z,
        alongZ ? 0.14 : length,
        0.08,
        alongZ ? length : 0.14,
        wood,
        bridge,
      );
      rects.push({
        x,
        z,
        w: alongZ ? 0.2 : length,
        d: alongZ ? length : 0.2,
        clearHeight: 1.1,
      });
      for (let j = 0; j <= Math.ceil(length / 2); j++) {
        const offset = -length / 2 + (j * length) / Math.ceil(length / 2);
        part(
          x + (alongZ ? 0 : offset),
          0.545,
          z + (alongZ ? offset : 0),
          0.2,
          1.09,
          0.2,
          stone,
          bridge,
        );
      }
    }
    const crossHalf = (alongZ ? b.w : b.d) / 2;
    const point = (across: number, y: number, along: number) => [
      b.x + (alongZ ? across : along),
      y,
      b.z + (alongZ ? along : across),
    ];
    for (const side of [-1, 1]) {
      const end = (side * length) / 2;
      const endHalf = bridgeApproachHalfWidth(b, side);
      const vertices = [
        ...point(-crossHalf, 0.14, end),
        ...point(crossHalf, 0.14, end),
        ...point(endHalf, 0, end + side * 2.8),
        ...point(-crossHalf, 0.14, end),
        ...point(endHalf, 0, end + side * 2.8),
        ...point(-endHalf, 0, end + side * 2.8),
      ];
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
      geo.computeVertexNormals();
      const material = wood.clone();
      material.side = T.DoubleSide;
      const ramp = new T.Mesh(geo, material);
      ramp.name = "bridge-flared-ramp";
      ramp.receiveShadow = true;
      bridge.add(ramp);
      const landing = point(0, -0.06, end + side * 3.8);
      part(
        landing[0],
        landing[1],
        landing[2],
        alongZ ? endHalf * 2 : 2,
        0.12,
        alongZ ? 2 : endHalf * 2,
        wood,
        bridge,
      ).name = "bridge-level-landing";
      if (b.id === "village" || b.id === "market") continue;
      for (const edge of [-1, 1])
        for (let i = 0; i < 7; i++) {
          const t = (i + 0.5) / 7;
          const [x, y, z] = point(
            edge * (bridgeApproachHalfWidth(b, side, t) + 0.12),
            1.04 - 0.14 * t,
            end + side * 2.8 * t,
          );
          const rail = part(
            x,
            y,
            z,
            alongZ ? 0.14 : 0.5,
            0.16,
            alongZ ? 0.5 : 0.14,
            wood,
            bridge,
          );
          rail.rotation.y = edge * side * Math.atan2(endHalf - crossHalf, 2.8);
          rects.push({ x, z, w: alongZ ? 0.3 : 0.5, d: alongZ ? 0.5 : 0.3 });
        }
    }
    // Individual plank seams are narrow vertical faces, not overlapping decals.
    for (let j = 1; j < Math.floor(length / 0.6); j++) {
      const offset = -length / 2 + j * 0.6;
      part(
        b.x + (alongZ ? 0 : offset),
        0.145,
        b.z + (alongZ ? offset : 0),
        alongZ ? b.w : 0.018,
        0.012,
        alongZ ? 0.018 : b.d,
        wood,
        bridge,
      );
    }
    const batches = new Map<T.Material, T.BufferGeometry[]>();
    for (const child of [...bridge.children])
      if (child instanceof T.Mesh) {
        child.updateMatrix();
        const material = child.material as T.Material;
        const geometries = batches.get(material) ?? [];
        // Non-indexed vertices unify ramp triangles and box attributes.
        const source = child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone();
        source.deleteAttribute("uv");
        geometries.push(source.applyMatrix4(child.matrix));
        batches.set(material, geometries);
        child.geometry.dispose();
        bridge.remove(child);
      }
    for (const [material, geometries] of batches) {
      const mesh = new T.Mesh(mergeGeometries(geometries)!, material);
      mesh.castShadow = mesh.receiveShadow = true;
      bridge.add(mesh);
      geometries.forEach((g) => g.dispose());
    }
  }
  // Water slows movement through riverTravelFactor; it is not a solid wall.
  const colliders: Rect[] = [];
  const planting = plantRiverBanks(vegetation, rects, paths, buildings);
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    o.matrixAutoUpdate = false;
    o.matrixWorldAutoUpdate = false;
  });
  let dry = false;
  return {
    root,
    water,
    vegetation,
    bridges: riverBridges,
    colliders,
    // Reserved for the water-restrictions storyline; the current world is lush.
    setDrought(value: boolean) {
      if (value === dry) return;
      dry = value;
      water.visible = highlights.visible = !dry;
      bankGrass.color.set(dry ? "#a19565" : "#788b58");
      planting.setDrought(dry);
    },
  };
}
