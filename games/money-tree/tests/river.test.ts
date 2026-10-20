import {
  fresh,
  move,
  movementSpeed,
  canPlaceBed,
  type Rect,
} from "../src/game";
import {
  riverBankDistance,
  riverTravelFactor,
  riverGroundHeight,
} from "../src/river-land";
import { terrainHeight } from "../src/millionaire-land";
import { createRiverWorld } from "../src/river-world";
import { makeRiverPlantGeometry, type RiverPlant } from "../src/river-plants";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import {
  riverPoints,
  riverSections,
  riverDistance,
  riverBridges,
  splitRiverBoundary,
  riverBoundaryGaps,
  groveApproachPaths,
} from "../src/river-land";
import { carveRiver } from "../src/river-carve";
test("river stays outside the home and Mabel footprints and has smooth continuous banks", () => {
  for (let i = 1; i < riverPoints.length; i++) {
    const p = riverPoints[i],
      a = riverPoints[i - 1];
    assert(Math.hypot(p.x - a.x, p.z - a.z) < 2.2);
    assert(Number.isFinite(riverSections[i].nx));
  }
  for (const [x, z, w, d] of [
    [-15, 6, 12, 16],
    [-5, 10, 8, 8],
    [-39, -25, 7, 6],
    [12, 1, 7, 6],
    [12, 15, 7, 6],
  ])
    for (let a = x - w / 2; a <= x + w / 2; a += 0.5)
      for (let b = z - d / 2; b <= z + d / 2; b += 0.5)
        assert(riverDistance(a, b) > 3.4, `${a},${b} intrudes on a house`);
  assert.equal(riverBridges.length, 3);
});
test("river terrain carving removes the channel instead of layering over the ground", () => {
  const mesh = new T.Mesh(
    new T.PlaneGeometry(300, 250).rotateX(-Math.PI / 2),
    new T.MeshBasicMaterial(),
  );
  mesh.position.z = -90;
  carveRiver(mesh);
  const p = mesh.geometry.getAttribute("position");
  assert(p.count > 6 && p.count < 100000);
  for (let i = 0; i < p.count; i++)
    assert(Number.isFinite(p.getX(i)) && Number.isFinite(p.getZ(i)));
  function contains(x: number, z: number, i: number) {
    const cross = (a: number, b: number) =>
      (p.getX(b) - p.getX(a)) * (z - p.getZ(a)) -
      (p.getZ(b) - p.getZ(a)) * (x - p.getX(a));
    const c = [cross(i, i + 1), cross(i + 1, i + 2), cross(i + 2, i)];
    return c.every((v) => v > 1e-6) || c.every((v) => v < -1e-6);
  }
  for (let i = 3; i < riverPoints.length - 3; i += 7) {
    const point = {
      x: (riverPoints[i].x + riverPoints[i + 1].x) / 2,
      z: (riverPoints[i].z + riverPoints[i + 1].z) / 2,
    };
    for (let j = 0; j < p.count; j += 3)
      assert(
        !contains(point.x, point.z + 90, j),
        `channel covered at sample ${i}`,
      );
  }
});
test("river outlet cuts split perimeter hedges without losing their collision height", () => {
  const parts = splitRiverBoundary({
    x: -39,
    z: 0,
    w: 1,
    d: 90,
    clearHeight: 2.3,
  });
  assert.equal(parts.length, 2);
  assert(parts.every((p) => p.clearHeight === 2.3 && p.d > 0));
  assert(parts.every((p) => Math.abs(p.z + 4.5) > p.d / 2));
});

test("legacy beds beside the new river retain crops and move to dry lawn only once", async () => {
  const { fresh, decode } = await import("../src/game");
  const { relocateRiverBeds } = await import("../src/river-gardens");
  const s = fresh();
  s.plots.push({
    ...s.plots[0],
    x: -26,
    z: -4,
    stage: "ready",
    soilFilled: true,
    crop: "iris",
    fertilized: true,
  });
  const bed = s.plots.at(-1)!;
  const before = { ...bed };
  assert.equal(relocateRiverBeds(s, []), 1);
  assert(riverDistance(bed.x!, bed.z!) > 5);
  assert.deepEqual({ ...bed, x: before.x, z: before.z }, before);
  assert.equal(relocateRiverBeds(s, []), 0);
  assert(decode(JSON.stringify(s)));
});

test("new garden beds cannot extend into the visible river water", async () => {
  const { createRiverWorld } = await import("../src/river-world");
  const { fresh, canPlaceBed } = await import("../src/game");
  const rects: import("../src/game").Rect[] = [];
  createRiverWorld(new T.Scene(), rects, []);
  const s = fresh();
  for (let x = -30; x <= -9; x += 0.5)
    for (let z = -4; z < 3; z += 0.5)
      if (canPlaceBed(s, x, z, rects))
        for (const [dx, dz] of [
          [-0.8, -1.4],
          [0.8, -1.4],
          [-0.8, 1.4],
          [0.8, 1.4],
        ])
          assert(riverDistance(x + dx, z + dz) >= 2.4, `wet bed at ${x},${z}`);
});

test("removing the east-road crossing restores its hedge and retains approach rails", () => {
  const pieces = splitRiverBoundary({ x: 39, z: -25, w: 1, d: 80 });
  const covers = (z: number) =>
    pieces.some((r) => z > r.z - r.d / 2 && z < r.z + r.d / 2);
  assert.equal(covers(-25), true);
});

test("grove bridge continues straight along the approach and the riverside turn is fenced", async () => {
  const { createRiverWorld } = await import("../src/river-world");
  const g = riverBridges.find((b) => b.id === "grove")!;
  assert.equal(g.axis, "z");
  assert.equal(g.x, 46);
  for (let z = -90; z >= -112; z -= 0.5)
    assert(
      groveApproachPaths.some(
        (r) => Math.abs(46 - r.x) <= r.w / 2 && Math.abs(z - r.z) <= r.d / 2,
      ),
    );
  const rects: import("../src/game").Rect[] = [];
  const world = createRiverWorld(new T.Scene(), rects, []);
  assert(!world.root.getObjectByName("river-bridge-east-road"));
  assert(
    !rects.some(
      (r) => Math.abs(43 - r.x) < r.w / 2 && Math.abs(-16 - r.z) < r.d / 2,
    ),
  );
  const rail = { x: 49.1, z: -73.55, w: 0.8, d: 32.1 };
  const spans = [...splitRiverBoundary(rail), ...riverBoundaryGaps(rail)];
  assert(riverBoundaryGaps(rail).length > 0);
  for (let z = -89.5; z < -57.5; z += 0.25)
    assert(spans.some((r) => Math.abs(z - r.z) <= r.d / 2));
});

test("walkers and wheels can cross the riverbed slowly, climb both banks and use bridges at full speed", () => {
  const rects: Rect[] = [];
  const world = createRiverWorld(new T.Scene(), rects, []);
  assert.deepEqual(world.colliders, []);
  const s = fresh();
  s.position = { x: -25, z: -1 };
  const dry = movementSpeed(s, false);
  move(s.position, 0, -5, rects);
  assert(s.position.z < -5.9);
  assert(movementSpeed(s, false) < dry * 0.4);
  assert(Math.abs(terrainHeight(s.position.x, s.position.z) + 0.9) < 0.05);
  assert.equal(riverTravelFactor(-25, -6), 0.35);
  move(s.position, 0, -5, rects);
  assert(s.position.z < -10.9);
  assert.equal(movementSpeed(s, false), dry);
  move(s.position, 0, 10, rects);
  assert(Math.abs(s.position.z + 1) < 0.01);
  for (const bridge of riverBridges) {
    assert.equal(riverTravelFactor(bridge.x, bridge.z), 1);
    assert.equal(terrainHeight(bridge.x, bridge.z), 0.14);
  }
  assert.equal(canPlaceBed(s, -25, -5.5, []), false);
});
test("indexed river queries agree with exact distance near the bank and have continuous heights", () => {
  for (let i = 3; i < riverSections.length - 3; i += 13) {
    const p = riverSections[i];
    for (const d of [-4, -3.3, -2.4, 0, 2.4, 3.3, 4]) {
      const x = p.x + p.nx * d,
        z = p.z + p.nz * d,
        exact = riverDistance(x, z),
        indexed = riverBankDistance(x, z);
      if (exact <= 3.4) assert(Math.abs(exact - indexed) < 1e-7);
      else assert.equal(indexed, Infinity);
    }
  }
  let previous = 0;
  for (let z = -1; z >= -11; z -= 0.025) {
    const y = riverGroundHeight(-25, z) ?? 0;
    assert(Math.abs(y - previous) < 0.04);
    previous = y;
  }
});
test("river planting contains abundant actual fern fronds, all heliconias and passionflowers with shared bounded geometry", () => {
  const scene = new T.Scene();
  const world = createRiverWorld(scene, [], []);
  const totals = world.vegetation.userData.plants;
  assert(totals.fern > 150);
  assert(totals.rush > 100);
  assert(totals.passionflower > 10);
  const meshes = world.vegetation.children as T.InstancedMesh[];
  for (const kind of [
    "heliconia-red",
    "heliconia-pendant",
    "heliconia-gold",
    "heliconia-orange",
    "passionflower",
    "fern",
    "fern-ostrich",
    "fern-maidenhair",
    "fern-strap",
    "fern-silver",
    "sedge",
    "rush",
    "daisy",
    "moss-rock",
  ] as RiverPlant[]) {
    assert(totals[kind] > 0, kind);
    const same = meshes.filter((m) => m.userData.riverPlant === kind);
    assert(same.every((m) => m.geometry === same[0].geometry));
    const g = makeRiverPlantGeometry(kind),
      p = g.attributes.position;
    assert(p.count > 100 && p.count < 12000, `${kind}: ${p.count}`);
    assert.equal(p.count, g.attributes.color.count);
    for (const value of p.array) assert(Number.isFinite(value));
    g.dispose();
  }
  const before = meshes.map((m) => [m.geometry, m.material, m.count]);
  world.setDrought(true);
  world.setDrought(false);
  assert.deepEqual(
    meshes.map((m) => [m.geometry, m.material, m.count]),
    before,
  );
});

test("whole plant bounds stay outside rooms and span shallow water through upper banks", () => {
  const room = { x: -25, z: -1, w: 10, d: 12 };
  const world = createRiverWorld(new T.Scene(), [], [], [room]);
  const matrix = new T.Matrix4(),
    bounds = new T.Box3(),
    root = new T.Vector3();
  const bands = new Set<string>();
  for (const mesh of world.vegetation.children as T.InstancedMesh[]) {
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix);
      bounds.copy(mesh.geometry.boundingBox!).applyMatrix4(matrix);
      assert(
        !(
          bounds.min.x < room.x + room.w / 2 &&
          bounds.max.x > room.x - room.w / 2 &&
          bounds.min.z < room.z + room.d / 2 &&
          bounds.max.z > room.z - room.d / 2
        ),
        mesh.userData.riverPlant,
      );
      if (!mesh.userData.riverPlant.startsWith("fern")) continue;
      root.setFromMatrixPosition(matrix);
      const d = riverDistance(root.x, root.z);
      bands.add(d < 2.4 ? "water" : d < 3.4 ? "slope" : "bank");
      if (d < 2.4)
        assert(bounds.max.y > -0.32, "water fern emerges above surface");
    }
  }
  assert.deepEqual([...bands].sort(), ["bank", "slope", "water"]);
});
