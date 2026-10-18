import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
import type { Rect } from "./game";
import {
  riverSections,
  riverHalfWidth,
  riverBankWidth,
  riverBridges,
  riverDistance,
} from "./river-land";
import { carveRiver } from "./river-carve";

export function createRiverWorld(scene: T.Scene, rects: Rect[], paths: Rect[]) {
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
    color: "#3e9eaa",
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
  const bankGrass = mat("#6c985d");
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
      -0.65,
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
    for (const side of [-1, 1]) {
      const end = b.z + (side * b.d) / 2;
      const vertices = [
        b.x - b.w / 2,
        0.14,
        end,
        b.x + b.w / 2,
        0.14,
        end,
        b.x + b.w / 2 + 2,
        0,
        end + side * 2.8,
        b.x - b.w / 2,
        0.14,
        end,
        b.x + b.w / 2 + 2,
        0,
        end + side * 2.8,
        b.x - b.w / 2 - 2,
        0,
        end + side * 2.8,
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
      part(b.x, -0.06, end + side * 3.8, b.w + 4, 0.12, 2, wood, bridge).name =
        "bridge-level-landing";
      for (const edge of [-1, 1]) {
        for (let i = 0; i < 7; i++) {
          const t = (i + 0.5) / 7,
            x = b.x + edge * (b.w / 2 + 2 * t + 0.12),
            z = end + side * 2.8 * t;
          const rail = part(
            x,
            1.04 - 0.14 * t,
            z,
            0.14,
            0.16,
            0.5,
            wood,
            bridge,
          );
          rail.rotation.y = edge * side * Math.atan2(2, 2.8);
          rects.push({ x, z, w: 0.3, d: 0.5 });
        }
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
  // Ordinary rectangles keep existing movement, NPC route finding and airborne
  // checks consistent. Split them around each deck so bridges remain traversable.
  let colliders: Rect[] = [];
  // Clear the full ramp and landing corridor too. Water segment AABBs can
  // extend onto a bank just beyond a shortened deck.
  const openings = riverBridges.flatMap((b) => {
    const along = b.axis === "z" ? b.d : b.w;
    const width = b.axis === "z" ? b.w : b.d;
    const rect = (offset: number, span: number, breadth: number) => ({
      x: b.x + (b.axis === "x" ? offset : 0),
      z: b.z + (b.axis === "z" ? offset : 0),
      w: b.axis === "z" ? breadth : span,
      d: b.axis === "z" ? span : breadth,
    });
    return [rect(0, along + 9.6, width), ...[-1, 1].flatMap((side) => [
      ...Array.from({ length: 8 }, (_, i) =>
        rect(side * (along / 2 + (i + 0.5) * 0.35), 0.35, width + i * 0.5)),
      rect(side * (along / 2 + 3.8), 2, width + 4),
    ])];
  });
  for (let i = 1; i < riverSections.length; i++) {
    const a = riverSections[i - 1],
      b = riverSections[i],
      r = riverHalfWidth + 0.05;
    let pieces: Rect[] = [
      {
        x: (a.x + b.x) / 2,
        z: (a.z + b.z) / 2,
        w: Math.abs(b.x - a.x) + 2 * r,
        d: Math.abs(b.z - a.z) + 2 * r,
      },
    ];
    for (const bridge of openings) {
      pieces = pieces.flatMap((p) => {
        const l = p.x - p.w / 2,
          h = p.x + p.w / 2,
          t = p.z - p.d / 2,
          u = p.z + p.d / 2,
          bl = bridge.x - bridge.w / 2,
          bh = bridge.x + bridge.w / 2,
          bt = bridge.z - bridge.d / 2,
          bu = bridge.z + bridge.d / 2;
        if (h <= bl || l >= bh || u <= bt || t >= bu) return [p];
        const result: Rect[] = [];
        const add = (x1: number, x2: number, z1: number, z2: number) => {
          if (x2 > x1 && z2 > z1)
            result.push({
              x: (x1 + x2) / 2,
              z: (z1 + z2) / 2,
              w: x2 - x1,
              d: z2 - z1,
            });
        };
        add(l, Math.max(l, bl), t, u);
        add(Math.min(h, bh), h, t, u);
        add(Math.max(l, bl), Math.min(h, bh), t, Math.max(t, bt));
        add(Math.max(l, bl), Math.min(h, bh), Math.min(u, bu), u);
        return result;
      });
    }
    colliders.push(...pieces);
  }
  rects.push(...colliders);
  // Fixed-seed, shared instanced foliage: no per-frame generation or scene scans.
  let seed = 7419;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const grass: T.Matrix4[] = [],
    leaves: T.Matrix4[] = [],
    flowers: T.Matrix4[] = [],
    trunks: T.Matrix4[] = [],
    crowns: T.Matrix4[] = [];
  const transform = new T.Object3D();
  const place = (
    list: T.Matrix4[],
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    rotation = 0,
  ) => {
    transform.position.set(x, y, z);
    transform.rotation.set(0, rotation, 0);
    transform.scale.set(sx, sy, sz);
    transform.updateMatrix();
    list.push(transform.matrix.clone());
  };
  const reserved = [
    ...paths,
    ...riverBridges.map((b) => ({ ...b, w: b.w + 5, d: b.d + 10 })),
  ];
  for (let i = 2; i < riverSections.length - 2; i += 2) {
    const p = riverSections[i];
    for (const side of [-1, 1]) {
      const distance = 3.8 + random() * 1.7,
        x = p.x + p.nx * side * distance,
        z = p.z + p.nz * side * distance;
      if (
        reserved.some(
          (r) =>
            Math.abs(x - r.x) < r.w / 2 + 1.7 &&
            Math.abs(z - r.z) < r.d / 2 + 1.7,
        ) ||
        rects.some(
          (r) =>
            Math.abs(x - r.x) < r.w / 2 + 0.8 &&
            Math.abs(z - r.z) < r.d / 2 + 0.8,
        ) ||
        riverDistance(x, z) < 3.5
      )
        continue;
      for (let j = 0; j < 4; j++)
        place(
          grass,
          x + (random() - 0.5) * 1.1,
          0.3 + random() * 0.15,
          z + (random() - 0.5) * 1.1,
          0.16,
          0.6 + random() * 0.5,
          0.16,
          random() * 6.28,
        );
      place(leaves, x, 0.33, z, 0.7, 0.55, 0.65, random() * 6.28);
      if (i % 6 === 0)
        for (let j = 0; j < 3; j++)
          place(
            flowers,
            x + (random() - 0.5) * 0.8,
            0.72,
            z + (random() - 0.5) * 0.8,
            0.15,
            0.15,
            0.15,
          );
      if (i % 24 === 0 && z < -94) {
        place(trunks, x, 1.7, z, 0.22, 3.4, 0.22);
        for (let j = 0; j < 4; j++)
          place(
            crowns,
            x + (random() - 0.5) * 2,
            3.4 + random(),
            z + (random() - 0.5) * 2,
            1.6,
            1.5 + random(),
            1.6,
          );
      }
    }
  }
  const instances = (
    name: string,
    geometry: T.BufferGeometry,
    color: string,
    matrices: T.Matrix4[],
  ) => {
    const mesh = new T.InstancedMesh(geometry, mat(color), matrices.length);
    mesh.name = name;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.castShadow = mesh.receiveShadow = true;
    vegetation.add(mesh);
    return mesh;
  };
  const reeds = instances(
    "bank-reeds",
    new T.ConeGeometry(1, 1, 4),
    "#4c8a54",
    grass,
  );
  const shrubs = instances(
    "bank-ferns",
    new T.SphereGeometry(1, 7, 5),
    "#4c9669",
    leaves,
  );
  const blooms = instances(
    "bank-wildflowers",
    new T.IcosahedronGeometry(1, 0),
    "#e8c979",
    flowers,
  );
  instances(
    "bank-willow-trunks",
    new T.CylinderGeometry(1, 1, 1, 6),
    "#766346",
    trunks,
  );
  const canopy = instances(
    "bank-willow-leaves",
    new T.SphereGeometry(1, 8, 6),
    "#69a776",
    crowns,
  );
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
      bankGrass.color.set(dry ? "#a19565" : "#6c985d");
      blooms.visible = !dry;
      for (const mesh of [reeds, shrubs, canopy])
        mesh.material.color.set(
          dry
            ? "#9f925b"
            : mesh === reeds
              ? "#4c8a54"
              : mesh === shrubs
                ? "#4c9669"
                : "#69a776",
        );
    },
  };
}
