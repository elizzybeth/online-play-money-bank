import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  buy,
  plant,
  water,
  tick,
  harvest,
  sleep,
  load,
  decode,
  withdraw,
  deposit,
  recover,
  move,
  blocked,
  fertilize,
} from "../src/game";
test("opening economy and complete renewable crop loop", () => {
  const s = fresh();
  assert.equal(s.bank, 433);
  withdraw(s);
  for (const item of ["seeds", "shovel", "can"] as const) assert(buy(s, item));
  assert.equal(s.cash, 33);
  assert.equal(s.seeds, 5);
  assert(!buy(s, "fertilizer"));
  for (let i = 0; i < 5; i++) {
    assert(plant(s, i));
    assert(water(s, i));
  }
  tick(s, 89);
  assert(s.plots.every((p) => p.stage === "growing"));
  tick(s, 1);
  for (let i = 0; i < 5; i++) {
    const n = harvest(s, i);
    assert(n >= 200 && n <= 700);
    assert.equal(harvest(s, i), 0);
    assert(water(s, i));
  }
  deposit(s);
  assert(s.bank >= 1033);
  sleep(s);
  assert.equal(s.day, 2);
  assert(s.journal[1].includes("Harvested"));
  assert(s.plots.every((p) => p.stage === "ready"));
  assert.deepEqual(load(JSON.stringify(s)), s);
});
test("tools, transaction atomicity, fertilizer and recovery", () => {
  const s = fresh();
  assert(!buy(s, "seeds"));
  assert(!plant(s, 0));
  s.seeds = 1;
  assert(plant(s, 0));
  assert(!plant(s, 0));
  assert(!water(s, 0));
  s.bank = 0;
  assert(recover(s));
  assert(!recover(s));
  assert(water(s, 0));
  s.fertilizer = 1;
  assert(fertilize(s, 0));
  assert.equal(s.plots[0].remaining, 60);
  assert(!fertilize(s, 0));
  tick(s, 60);
  assert(s.plots[0].yield >= 400);
  const before = JSON.stringify(s);
  assert(!buy(s, "fertilizer"));
  assert.equal(JSON.stringify(s), before);
});
test("malformed saves and invalid time are safe", () => {
  for (const raw of [
    "oops",
    "{}",
    JSON.stringify({ ...fresh(), cash: -1 }),
    JSON.stringify({ ...fresh(), position: { x: "x", z: 0 } }),
  ])
    assert.deepEqual(load(raw), fresh());
  const s = fresh();
  tick(s, NaN);
  assert.deepEqual(s, fresh());
});
test("swept movement cannot tunnel, can slide and traverse doors", () => {
  const wall = [{ x: 0, z: 0, w: 1, d: 8 }];
  const p = { x: -2, z: 0 };
  move(p, 20, 0, wall);
  assert(p.x < -0.79);
  assert(!blocked(p.x, p.z, wall));
  move(p, 2, 2, wall);
  assert(p.z > 1.9);
  const doorway = [
    { x: -2, z: 0, w: 2, d: 0.25 },
    { x: 2, z: 0, w: 2, d: 0.25 },
  ];
  const q = { x: 0, z: 3 };
  move(q, 0, -6, doorway);
  assert(q.z < -2.9);
});
test("random actions preserve nonnegative inventory and bounded yields", () => {
  const s = fresh();
  s.cash = 100000;
  let seed = 17;
  for (let k = 0; k < 5000; k++) {
    seed = (seed * 16807) % 2147483647;
    const i = seed % 5;
    switch (seed % 7) {
      case 0:
        buy(s, "seeds");
        break;
      case 1:
        buy(s, "can");
        break;
      case 2:
        plant(s, i);
        break;
      case 3:
        water(s, i);
        break;
      case 4:
        tick(s, 15);
        break;
      case 5:
        harvest(s, i);
        break;
      case 6:
        buy(s, "fertilizer");
        fertilize(s, i);
    }
    assert(s.cash >= 0 && s.seeds >= 0 && s.fertilizer >= 0);
    assert(s.plots.every((p) => p.yield >= 0 && p.yield <= 700));
  }
  assert.deepEqual(load(JSON.stringify(s)), s);
});

test("import decoder accepts formatted fresh saves and rejects invalid data", () => {
  assert.deepEqual(decode(JSON.stringify(fresh(), null, 2)), fresh());
  assert.equal(decode("{}"), null);
  assert.equal(decode("bad"), null);
});
