import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh, decode, move } from "../src/game";
import {
  groceryStock,
  ingredients,
  buyGrocery,
  startMeal,
  finishMeal,
} from "../src/meals";
import { farmFields } from "../src/farm-fields";
import { isFlower } from "../src/garden-crops";
import { makeHat } from "../src/hat-models";
import { fittedPortraitCamera } from "../src/product-portrait";
import { marketShops } from "../src/market-world";
import { furnishingCatalog } from "../src/furnishings";
import { makeFurnishing } from "../src/furnishing-models";
import { createRiverWorld } from "../src/river-world";
import {
  riverBridges,
  bridgeHeight,
  riverTravelFactor,
  splitRiverBoundary,
} from "../src/river-land";
import { withinPlayableBounds } from "../src/world-bounds";
test("market groceries include every edible field crop and distinct beans, cook and reload without changing old meals", () => {
  for (const f of farmFields.filter((f) => !isFlower(f.crop)))
    assert((ingredients as readonly string[]).includes(f.crop), f.crop);
  assert(!groceryStock.includes("beans" as any));
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
    "everyday-sofa",
    "everyday-bed",
    "oak-sideboard",
    "coffee-table",
    "open-bookcase",
    "writing-desk",
    "bedside-table",
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
  s.position = { x: 70, z: -18 };
  assert(withinPlayableBounds(s));
  assert.equal(s.position.z, -18);
});

test("east-bank shops fit the map box and the river bridge has clear, level connected approaches", () => {
  for (const shop of marketShops) {
    assert(shop.x - shop.w / 2 > 50 && shop.x + shop.w / 2 < 130);
    assert(shop.z - shop.d / 2 >= -40 && shop.z + shop.d / 2 <= 2);
    const s = fresh();
    s.position = { x: shop.x, z: shop.z };
    assert(withinPlayableBounds(s));
  }
  const bridge = riverBridges.find((b) => b.id === "market")!;
  assert.equal(bridge.axis, "x");
  const hedge = splitRiverBoundary({ x: 39, z: 0, w: 1, d: 90 });
  const rects = [...hedge];
  const world = createRiverWorld(new T.Scene(), rects, []);
  const p = { x: 34, z: -20 };
  move(p, 21, 0, rects);
  assert(Math.abs(p.x - 55) < 1e-7);
  move(p, -21, 0, rects);
  assert(Math.abs(p.x - 34) < 1e-7);
  assert(world.root.getObjectByName("river-bridge-market"));
  for (let x = 36; x <= 50; x += 0.25) {
    assert.equal(bridgeHeight(x, -20), 0.14);
    assert.equal(riverTravelFactor(x, -20), 1);
  }
  assert(Math.abs(bridgeHeight(35, -20)! - (0.14 - 0.08 / 2.8)) < 1e-9);
  assert(Math.abs(bridgeHeight(51, -20)! - (0.14 - 0.08 / 2.8)) < 1e-9);
  assert.equal(bridgeHeight(31.5, -20), 0.06);
  assert.equal(bridgeHeight(54.5, -20), 0.06);
  const old = fresh();
  old.position = { x: 3, z: -60 };
  assert.equal(withinPlayableBounds(old), false);
});
