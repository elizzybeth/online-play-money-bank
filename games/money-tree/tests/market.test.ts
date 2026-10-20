import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh, decode, move } from "../src/game";
import { ingredients, buyGrocery, startMeal, finishMeal } from "../src/meals";
import { farmFields } from "../src/farm-fields";
import { isFlower } from "../src/garden-crops";
import { makeHat } from "../src/hat-models";
import { fittedPortraitCamera } from "../src/product-portrait";
import { createMarketShops } from "../src/market-world";
import { furnishingCatalog } from "../src/furnishings";
import { makeFurnishing } from "../src/furnishing-models";
import { withinPlayableBounds } from "../src/world-bounds";
test("market groceries include every edible field crop and distinct beans, cook and reload without changing old meals", () => {
  for (const f of farmFields.filter((f) => !isFlower(f.crop)))
    assert((ingredients as readonly string[]).includes(f.crop), f.crop);
  const s = fresh();
  s.cash = 10000;
  for (const item of [
    "black beans",
    "red beans",
    "pinto beans",
    "beet",
    "potato",
  ] as const)
    assert(buyGrocery(s, item));
  assert.equal(s.cash, 9500);
  assert(decode(JSON.stringify(s)));
  assert.equal(startMeal(s), 64);
  finishMeal(s);
  assert.equal(decode(JSON.stringify(s))!.foodBuff?.recipe, 64);
  assert(Object.values(s.groceries!).every((n) => n === 0));
  const legacy = fresh();
  legacy.groceries = { eggs: 1, rice: 1, beans: 1 };
  assert.equal(startMeal(legacy), 7);
});
test("tall and asymmetrical hat portraits fit fully around the centered model", () => {
  for (const id of ["beekeeper", "seedkeeper", "alchemist"] as const) {
    const model = makeHat(id),
      b = new T.Box3().setFromObject(model),
      camera = fittedPortraitCamera(model);
    const center = b.getCenter(new T.Vector3()).project(camera);
    assert(Math.abs(center.x) < 1e-6 && Math.abs(center.y) < 1e-6);
    for (const x of [b.min.x, b.max.x])
      for (const y of [b.min.y, b.max.y])
        for (const z of [b.min.z, b.max.z]) {
          const p = new T.Vector3(x, y, z).project(camera);
          assert(Math.abs(p.x) < 0.95 && Math.abs(p.y) < 0.95, id);
        }
  }
});
test("new colorful furnishings are modeled, catalogued and persist in the furniture bag", () => {
  const s = fresh();
  for (const id of [
    "pink-locker",
    "tulip-table",
    "yellow-chair",
    "woven-pendant",
    "balloon-dog",
    "striped-vase",
    "color-gallery",
    "jewel-lamp",
  ] as const) {
    assert(furnishingCatalog.some((f) => f.id === id));
    const b = new T.Box3().setFromObject(makeFurnishing(id));
    assert(!b.isEmpty());
    assert(b.max.y - b.min.y > 0.2, id);
    (s.furnitureBag ??= []).push(id);
  }
  assert.deepEqual(decode(JSON.stringify(s))!.furnitureBag, s.furnitureBag);
  s.position = { x: 34, z: -38 };
  move(s.position, 0, -22, []);
  assert(withinPlayableBounds(s));
  assert(Math.abs(s.position.z + 60) < 1e-8);
});
