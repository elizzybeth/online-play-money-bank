import { test } from "node:test";
import assert from "node:assert/strict";
import { stepWanderer, type Wanderer } from "../src/wandering";
test("wanderers explore both axes, choose fresh destinations, pause and obey collision constraints", () => {
  const w: Wanderer = {
    position: { x: 20, z: -60 },
    home: { x: 20, z: -60 },
    speed: 0.9,
    pause: 0,
    seed: 41,
    journeys: 0,
  };
  let moved = 0,
    paused = 0;
  const points = [];
  const allowed = (p: { x: number; z: number }) =>
    Math.hypot(p.x - 24, p.z + 60) > 2;
  for (let i = 0; i < 1600; i++) {
    if (stepWanderer(w, 0.1, allowed)) moved++;
    else paused++;
    points.push({ ...w.position });
    assert(allowed(w.position));
  }
  assert(moved > 500);
  assert(paused > 20);
  assert(w.journeys > 8);
  for (const axis of ["x", "z"] as const)
    assert(
      Math.max(...points.map((p) => p[axis])) -
        Math.min(...points.map((p) => p[axis])) >
        3,
    );
  const before = structuredClone(w);
  stepWanderer(w, 1, allowed, true);
  assert.deepEqual(w, before);
});
test("two wanderers retain personal space and never tunnel through blocked points", () => {
  const a: Wanderer = {
    position: { x: 20, z: -60 },
    home: { x: 20, z: -60 },
    speed: 1,
    pause: 0,
    seed: 21,
    journeys: 0,
  };
  const b: Wanderer = {
    position: { x: 23, z: -60 },
    home: { x: 23, z: -60 },
    speed: 0.8,
    pause: 0,
    seed: 121,
    journeys: 0,
  };
  for (let i = 0; i < 1000; i++)
    for (const [w, other] of [
      [a, b],
      [b, a],
    ]) {
      stepWanderer(
        w,
        0.1,
        (p) =>
          Math.hypot(p.x - other.position.x, p.z - other.position.z) >= 1.8,
      );
      assert(
        Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z) >=
          1.8,
      );
    }
});
