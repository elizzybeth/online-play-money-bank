import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { bikes, bikeFeatures } from "../src/bikes";
import { createBikeFeatures } from "../src/bike-features";
import { makeBikeRack } from "../src/bike-rack";

test("rack keeps every owned bicycle and excludes only the bicycle out riding", () => {
  const rack = makeBikeRack();
  const ids = bikes.map((b) => b.id);
  rack.sync(ids, "road");
  assert.deepEqual(
    rack.displays.filter((b) => b.visible).map((b) => b.userData.bikeId),
    ids.filter((id) => id !== "road"),
  );
  rack.sync(ids);
  assert.equal(rack.displays.filter((b) => b.visible).length, 7);
  rack.sync(["penny", "bmx"]);
  assert.deepEqual(
    rack.displays.filter((b) => b.visible).map((b) => b.userData.bikeId),
    ["penny", "bmx"],
  );
});
test("all seven bike features activate, expire and enforce individual cooldowns", () => {
  assert.equal(new Set(Object.values(bikeFeatures).map((f) => f.name)).size, 7);
  const pos = new T.Vector3();
  for (const bike of bikes) {
    const fx = createBikeFeatures(new T.Scene());
    assert(fx.activate(bike.id, pos, 0, 2.1));
    assert.equal(fx.active, bike.id);
    assert(!fx.activate(bike.id, pos, 0, 2.1));
    for (let i = 0; i < 400; i++) fx.update(0.05, pos, 0, 2.1, true);
    assert.equal(fx.active, undefined);
    assert.equal(fx.particles, 0);
    assert.equal(fx.speedMultiplier, 1);
    assert.equal(fx.lift, 0);
    assert(fx.activate(bike.id, pos, 0, 2.1));
    fx.update(0.01, pos, 0, 2.1, false);
    assert.equal(fx.active, undefined);
  }
});
test("turbo gives a temporary speed increase and BMX hop rises then lands", () => {
  const fx = createBikeFeatures(new T.Scene()),
    pos = new T.Vector3();
  fx.activate("road", pos, 0, 2.1);
  assert.equal(fx.speedMultiplier, 1.5);
  fx.update(5, pos, 0, 2.1, true);
  assert.equal(fx.speedMultiplier, 1);
  fx.activate("bmx", pos, 0, 2.1);
  fx.update(0.5, pos, 0, 2.1, true);
  assert.equal(fx.lift, 0.7);
  fx.update(0.5, pos, 0, 2.1, true);
  assert.equal(fx.lift, 0);
  fx.reset();
  assert.equal(fx.particles, 0);
  assert.equal(fx.cooldown("road"), 0);
});
