import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  move,
  blocked,
  movementSpeed,
  water,
  growOvernight,
} from "../src/game";
import { farmFields, forageFarm } from "../src/farm-fields";
import { plantCrop, harvestCrop } from "../src/garden-crops";
import { SaveStore } from "../src/save-store";

test("field discovery flows through planting, daily growth, harvest and save restoration without a renderer", () => {
  const s = fresh(),
    field = farmFields.find((f) => f.crop === "beet")!;
  s.position = { x: field.x - 9, z: field.z };
  forageFarm(s, 0.1, true);
  for (let i = 0; i < 40; i++) {
    s.position.x += i < 20 ? 0.5 : -0.5;
    forageFarm(s, 0.1, true);
  }
  assert.equal(s.cropSeeds?.beet, 5);
  s.can = s.shovel = true;
  assert(plantCrop(s, 0, "beet"));
  assert(water(s, 0));
  growOvernight(s);
  assert(harvestCrop(s, 0));
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
  assert(new SaveStore(storage).write(s));
  const loaded = new SaveStore(storage).read();
  assert.equal(loaded.cropSeeds?.beet, 4);
  assert.equal(loaded.farmProduce?.beet, 3);
  assert(loaded.farmForage!.cooldowns.beet! > 0);
  assert.equal(loaded.plots[0].stage, "harvested");
});

test("real movement integration preserves the run ratio and prevents tunneling at varied frame steps", () => {
  const s = fresh();
  for (const dt of [1 / 60, 1 / 20, 0.125]) {
    const walk = { x: 3, z: 25 },
      run = { ...walk };
    for (let i = 0; i < 16; i++) {
      move(walk, 0, -movementSpeed(s, false) * dt, []);
      move(run, 0, -movementSpeed(s, true) * dt, []);
    }
    assert(Math.abs((25 - run.z) / (25 - walk.z) - 1.75) < 1e-8);
    const p = { x: 3, z: 25 },
      wall = [{ x: 3, z: 20, w: 8, d: 1 }];
    move(p, 0, -20, wall);
    assert(p.z > 20.9);
    assert(!blocked(p.x, p.z, wall));
  }
});
