import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import {
  riverPoints,
  riverSections,
  riverDistance,
  riverBridges,
  splitRiverBoundary,
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
    [-14, -13, 7, 6],
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
