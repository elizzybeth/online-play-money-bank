import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import {
  makeBikeShopStorefront,
  bikeShopEntrance,
  bikeShopWindow,
  bikeShopGold,
} from "../src/bike-shop-storefront";
import { blocked, move } from "../src/game";
test("open bike-shop glass doors leave a walkable entrance and the mounted bike clears the awning", () => {
  const shop = makeBikeShopStorefront();
  shop.updateMatrixWorld(true);
  assert.equal(bikeShopEntrance.height, 3.1 * 1.5);
  assert.equal(bikeShopWindow.height, bikeShopEntrance.height);
  assert.equal(bikeShopWindow.width, bikeShopEntrance.width);
  const rects = [-1, 1].map((side) => {
    const leaf = shop.getObjectByName(`open-glass-door-${side}`)!;
    const bounds = new T.Box3().setFromObject(leaf);
    return {
      x: (bounds.min.x + bounds.max.x) / 2,
      z: (bounds.min.z + bounds.max.z) / 2,
      w: bounds.max.x - bounds.min.x,
      d: bounds.max.z - bounds.min.z,
    };
  });
  const p = { x: bikeShopEntrance.x, z: -17 };
  move(p, 0, -7, rects);
  assert(Math.abs(p.z + 24) < 1e-6);
  assert(rects.every((r) => blocked(r.x, r.z, rects)));
  const awning = shop.getObjectByName("logo-gold-awning") as T.Mesh;
  const bike = shop.getObjectByName("gold-bicycle-shop-sign")!;
  const a = new T.Box3().setFromObject(awning),
    b = new T.Box3().setFromObject(bike);
  assert(b.min.y > a.max.y);
  assert(b.max.y < 7.3);
  assert.equal(
    (awning.material as T.MeshStandardMaterial).color.getHexString(),
    bikeShopGold.slice(1),
  );
});
