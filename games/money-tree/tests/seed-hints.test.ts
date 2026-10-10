import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh } from "../src/game";
import { SeedSearchClock, seedHint } from "../src/seed-hints";
import { makeHat } from "../src/hat-models";
test("seed hints begin after three active minutes and advance every thirty seconds", () => {
  const s = fresh(),
    clock = new SeedSearchClock();
  assert.equal(clock.update(s, 999), null);
  s.boughtSeeds = true;
  assert.equal(clock.update(s, 179), null);
  assert.equal(clock.update(s, 1), seedHint(s, 0));
  assert.equal(clock.update(s, 29), null);
  assert.equal(clock.update(s, 1), seedHint(s, 1));
  assert.equal(clock.update(s, 30), seedHint(s, 2));
  assert.equal(clock.update(s, 30), seedHint(s, 3));
  s.foundCapSeeds = true;
  assert.equal(clock.update(s, 0), null);
  assert.equal(clock.update(s, 180), seedHint(s, 0));
  assert(!seedHint(s, 3)!.includes("cap"));
  s.foundForestSeeds =
    s.foundStoreSeeds =
    s.foundGardenSeeds =
    s.foundTVSeeds =
      true;
  s.foundMeditationSeeds = true;
  s.foundStacySeeds = true;
  assert.equal(clock.update(s, 999), null);
});
test("beekeeper stacking surface excludes its hanging veil", () => {
  const bounds = new T.Box3().setFromObject(makeHat("beekeeper"));
  assert(bounds.min.y < -0.5);
  assert(bounds.max.y < 0.5);
  assert(bounds.getSize(new T.Vector3()).y - bounds.max.y > 0.5);
});
import { airborneRects, blocked } from "../src/game";
test("jump clearance removes low obstacles while retaining building walls", () => {
  const rects = [
    { x: 0, z: 0, w: 1, d: 1, clearHeight: 2.3 },
    { x: 5, z: 0, w: 1, d: 1 },
  ];
  assert(blocked(0, 0, airborneRects(rects, 2)));
  assert(!blocked(0, 0, airborneRects(rects, 3)));
  assert(blocked(5, 0, airborneRects(rects, 4)));
});
