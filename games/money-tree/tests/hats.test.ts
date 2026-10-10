import { test } from "node:test";
import assert from "node:assert/strict";
import { hats } from "../src/hats";
import {
  fresh,
  buyHat,
  equipHat,
  decode,
  plantingSeconds,
  movementSpeed,
  plant,
  tick,
  harvest,
  fertilize,
} from "../src/game";
import { makeHat } from "../src/hat-models";
test("ten distinct hats have detailed models, prices and powers", () => {
  assert.equal(hats.length, 10);
  assert.equal(new Set(hats.map((h) => h.id)).size, 10);
  assert.equal(Math.min(...hats.map((h) => h.price)), 200);
  assert.equal(Math.max(...hats.map((h) => h.price)), 10000);
  for (const hat of hats) {
    const model = makeHat(hat.id);
    assert(model.children.length >= 5);
    assert(hat.power.length > 0);
  }
});
test("hat shop charges once, ownership gates equip and saves migrate safely", () => {
  const s = fresh();
  assert(!buyHat(s, "cap"));
  assert(!equipHat(s, "wizard"));
  s.cash = 10000;
  assert(buyHat(s, "cap"));
  assert.equal(s.cash, 9800);
  assert(!buyHat(s, "cap"));
  assert.equal(s.equippedHat, "cap");
  assert.equal(decode(JSON.stringify(s))!.equippedHat, "cap");
  const legacy: any = fresh();
  delete legacy.hats;
  delete legacy.equippedHat;
  assert.deepEqual(decode(JSON.stringify(legacy))!.hats, []);
  assert.equal(decode(JSON.stringify({ ...s, equippedHat: "wizard" })), null);
  assert.equal(decode(JSON.stringify({ ...s, hats: ["bogus"] })), null);
  assert(equipHat(s, null));
  assert.equal(s.equippedHat, null);
});
test("hat powers change planting, movement, irrigation, growth and harvest", () => {
  const s = fresh();
  s.cash = 100000;
  s.seeds = 5;
  s.can = true;
  buyHat(s, "cap");
  assert.equal(plantingSeconds(s), 6.8);
  buyHat(s, "hardhat");
  assert.equal(plantingSeconds(s), 4);
  s.shovel = true;
  assert.equal(plantingSeconds(s), 1);
  buyHat(s, "propeller");
  assert.equal(movementSpeed(s, false), 5);
  assert.equal(movementSpeed(s, true), 8.75);
  equipHat(s, null);
  buyHat(s, "rain");
  assert(plant(s, 0));
  assert.equal(s.plots[0].stage, "growing");
  assert.equal(s.plots[0].remaining, 180);
  buyHat(s, "wizard");
  tick(s, 80);
  assert.equal(s.plots[0].remaining, 100);
  buyHat(s, "beekeeper");
  s.plots[0].fertilized = true;
  tick(s, 100);
  assert(s.plots[0].yield >= 600);
  equipHat(s, null);
  buyHat(s, "banker");
  const proceeds = harvest(s, 0);
  assert(proceeds >= 700 && proceeds <= 900);
  assert.equal(harvest(s, 0), 0);
  s.can = false;
  equipHat(s, "rain");
  plant(s, 1);
  assert.equal(s.plots[1].stage, "planted");
});

test("Sprout Cap recovers seeds on only half of harvests and never twice", () => {
  const s = fresh();
  s.cash = 200;
  buyHat(s, "cap");
  for (let i = 0; i < 10000; i++) {
    s.plots[0] = {
      stage: "ready",
      remaining: 0,
      fertilized: false,
      yield: 200,
    };
    harvest(s, 0);
    const count = s.seeds;
    harvest(s, 0);
    assert.equal(s.seeds, count);
  }
  assert(s.seeds > 4800 && s.seeds < 5200, `Got ${s.seeds} seeds`);
});

test("Moonrise Wizard conserves about half of fertilizer doses without speeding growth", () => {
  let saved = 0;
  for (let i = 1; i <= 100; i++) {
    const s = fresh();
    s.hats = ["wizard"];
    s.equippedHat = "wizard";
    s.fertilizer = 1;
    s.rng = i * 2147483;
    s.plots[0] = {
      stage: "growing",
      remaining: 180,
      fertilized: false,
      yield: 0,
    };
    assert(fertilize(s, 0));
    saved += s.fertilizer;
    assert(!fertilize(s, 0));
    tick(s, 10);
    assert.equal(s.plots[0].remaining, 110);
  }
  assert(saved >= 40 && saved <= 60);
});
