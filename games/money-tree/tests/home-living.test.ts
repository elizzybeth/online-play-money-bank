import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  plant,
  sleep,
  buy,
  harvest,
  plantingBatch,
} from "../src/game";
import {
  ingredients,
  meals,
  startMeal,
  finishMeal,
  tickFood,
  buyGrocery,
  purchasePrice,
} from "../src/meals";
import {
  canPlaceFurniture,
  homeLevel,
  type WallSpace,
} from "../src/furnishings";
import { gardenBatch } from "../src/town-life";
import { sigmaPlots } from "../src/sigma";
import { makeSportsCar, makeYacht } from "../src/wealth-models";
import * as T from "three";
test("all fifteen combinations consume one of each held ingredient and grant effects only after eating", () => {
  for (let mask = 1; mask < 16; mask++) {
    const s = fresh();
    s.groceries = {};
    ingredients.forEach((k, i) => {
      if (mask & (1 << i)) s.groceries![k] = 2;
    });
    assert.equal(startMeal(s), mask);
    assert.equal(s.foodBuff, undefined);
    assert.equal(startMeal(s), 0);
    assert(decode(JSON.stringify(s)));
    finishMeal(s);
    assert.equal(decode(JSON.stringify(s))!.foodBuff?.recipe, mask);
    assert.equal(
      decode(JSON.stringify(s))!.foodBuff?.remaining,
      meals[mask].seconds,
    );
    ingredients.forEach((k, i) => {
      if (mask & (1 << i)) assert.equal(s.groceries![k], 1);
    });
    tickFood(s, meals[mask].seconds);
    assert.equal(s.foodBuff, undefined);
  }
});
test("required recipes, gardening, shop discount and sleep expiry work without creating inventory", () => {
  const s = fresh();
  s.awake = true;
  s.cash = 500;
  s.groceries = { rice: 1 };
  startMeal(s);
  finishMeal(s);
  assert.equal(s.foodBuff?.remaining, 30);
  s.seeds = 1;
  assert(plant(s, 0));
  assert.equal(s.plots[0].stage, "growing");
  assert.equal(s.plots[0].fertilized, true);
  s.foodBuff = { recipe: 3, remaining: 60 };
  assert.equal(purchasePrice(s, 100), 75);
  assert(buyGrocery(s, "eggs"));
  assert.equal(s.cash, 425);
  assert(buy(s, "can"));
  assert.equal(s.cash, 350);
  sleep(s);
  assert.equal(s.foodBuff, undefined);
  assert.equal(meals[11].seconds, 60);
  assert.equal(meals[15].seconds, 180);
  assert.equal(meals[7].seconds, 60);
});
test("furnishings reject windows, occupied floor, outside walls and other paintings; levels unlock stock", () => {
  const wall: WallSpace = {
    axis: "z",
    value: 6.15,
    from: -9,
    to: -1,
    rotation: 0,
    windows: [{ from: -6, to: -4, bottom: 1.2, top: 2.7 }],
  };
  const p = { item: "sunset" as const, x: -5, y: 2, z: 6.15, rotation: 0 };
  assert.equal(canPlaceFurniture(p, [], [wall], []), false);
  assert(canPlaceFurniture({ ...p, x: -7.5 }, [], [wall], []));
  assert.equal(
    canPlaceFurniture({ ...p, x: -7.5 }, [], [wall], [{ ...p, x: -7.5 }]),
    false,
  );
  const chair = { item: "chair" as const, x: -15, y: 0, z: 3, rotation: 0 };
  assert(canPlaceFurniture(chair, [], [], []));
  assert.equal(
    canPlaceFurniture(chair, [{ x: -15, z: 3, w: 1, d: 1 }], [], []),
    false,
  );
  assert.equal(canPlaceFurniture({ ...chair, x: -21 }, [], [], []), false);
  const s = fresh();
  assert.equal(homeLevel(s), 1);
  s.foundTVSeeds = true;
  assert.equal(homeLevel(s), 2);
  assert.equal(decode(JSON.stringify({ ...s, groceries: { rice: -1 } })), null);
  assert.equal(
    decode(JSON.stringify({ ...s, furniture: [{ ...p, x: NaN }] })),
    null,
  );
});
test("all staggered Sigma beds have a Twin Planter partner for planting, water, feed and harvest", () => {
  const s = fresh();
  s.hats = ["inspector"];
  s.equippedHat = "inspector";
  s.seeds = 100;
  s.can = true;
  s.fertilizer = 100;
  s.plots = sigmaPlots.map((p) => ({
    ...p,
    community: true,
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  }));
  for (let i = 0; i < s.plots.length; i++)
    assert.equal(plantingBatch(s, i).length, 2);
  for (const job of ["water", "fertilize", "harvest"] as const) {
    s.plots.forEach((p) => (p.stage = job === "harvest" ? "ready" : "planted"));
    for (let i = 0; i < s.plots.length; i++)
      assert.equal(gardenBatch(s, i, job).length, 2);
  }
});
test("recognizable sports car and yacht details have finite geometry", () => {
  for (const object of [makeSportsCar(), makeYacht()]) {
    const b = new T.Box3().setFromObject(object);
    assert([b.min.x, b.max.y, b.max.z].every(Number.isFinite));
    assert(object.userData.modeledParts > 25);
    assert(object.children.length < 15);
    assert(object.userData.reference);
  }
  assert(makeYacht().getObjectByName("yacht-railing"));
});
