import { test } from "node:test";
import assert from "node:assert/strict";
import { sceneRoute, routeLength, alongRoute } from "../src/scene-route";
import { blocked, type Rect } from "../src/game";

test("clear scene routes avoid the grid search and route length avoids array copies", () => {
  let collisionReads = 0;
  const far = {
    get x() {
      collisionReads++;
      return 32;
    },
    z: 32,
    w: 1,
    d: 1,
  };
  const route = sceneRoute({ x: -20, z: 10 }, { x: -10, z: 20 }, [far]);
  assert.equal(route.length, 2);
  assert(
    collisionReads <= 150,
    `clear route took ${collisionReads} collision reads`,
  );
  route.slice = () => {
    throw Error("Route traversal must not copy the route array");
  };
  for (let i = 0; i < 300; i++)
    assert.equal(routeLength(route), Math.hypot(10, 10));
  console.log(
    "clear route collision reads",
    collisionReads,
    "route length copies",
    0,
  );
});
test("a clear path near an obstacle remains reachable even when rounding its start lands in the obstacle", () => {
  const rects = [{ x: 0, z: 0, w: 1, d: 1 }];
  assert(!blocked(0.99, 0.1, rects, 0.48));
  assert(blocked(0.8, 0, rects, 0.48));
  assert.deepEqual(
    sceneRoute({ x: 0.99, z: 0.1 }, { x: 0.99, z: 3.1 }, rects),
    [
      { x: 0.99, z: 0.1 },
      { x: 0.99, z: 3.1 },
    ],
  );
});
test("obstructed routes still go around walls and never cross a solid object", () => {
  const rects: Rect[] = [{ x: 0, z: 0, w: 1, d: 2 }];
  const route = sceneRoute({ x: -3, z: 0 }, { x: 3, z: 0 }, rects);
  assert(route.length > 2);
  for (let i = 0; i <= 200; i++) {
    const p = alongRoute(route, i / 200);
    assert(!blocked(p.x, p.z, rects, 0.48));
  }
});
