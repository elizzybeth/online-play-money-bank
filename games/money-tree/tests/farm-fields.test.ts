import test from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { farmFields, forageFarm } from "../src/farm-fields";
import { crops, plantCrop, harvestCrop, isFlower } from "../src/garden-crops";
import { riverDistance } from "../src/river-land";
import { makeCrop } from "../src/crop-model";
import * as T from "three";
test("farm sections never repeat crops and south-bank fields stay clear of the river and boundary", () => {
  assert.equal(new Set(farmFields.map((f) => f.crop)).size, farmFields.length);
  const south = farmFields.filter((f) => f.z > 0);
  assert.equal(south.length, 9);
  for (const f of south)
    for (const x of [f.x - f.w / 2, f.x + f.w / 2])
      for (const z of [f.z - f.d / 2, f.z + f.d / 2]) {
        assert(riverDistance(x, z) > 5);
        assert(x > -129 && x < -39 && z > 0 && z < 38);
      }
});
test("walking through a field finds its own seeds, saves cooldowns, and cannot pay for standing, teleporting or cycling", () => {
  const s = fresh(),
    f = farmFields.find((f) => f.crop === "beet")!;
  s.position = { x: f.x - 9, z: f.z };
  forageFarm(s, 0.1, true);
  for (let i = 0; i < 100; i++) forageFarm(s, 0.1, true);
  assert(!s.cropSeeds?.beet);
  s.position.x = f.x + 9;
  forageFarm(s, 0.1, true);
  assert(!s.cropSeeds?.beet);
  for (let i = 0; i < 40; i++) {
    s.position.x += i < 20 ? -0.5 : 0.5;
    forageFarm(s, 0.1, true);
  }
  assert.equal(s.cropSeeds?.beet, 5);
  const restored = decode(JSON.stringify(s))!;
  assert(restored);
  assert.equal(
    restored.farmForage!.cooldowns.beet,
    s.farmForage!.cooldowns.beet,
  );
  for (let i = 0; i < 40; i++) {
    restored.position.x += i < 20 ? -0.5 : 0.5;
    forageFarm(restored, 0.1, true);
  }
  assert.equal(restored.cropSeeds?.beet, 5);
  restored.farmForage!.cooldowns = {};
  for (let i = 0; i < 40; i++) {
    restored.position.x += i < 20 ? -0.5 : 0.5;
    forageFarm(restored, 0.1, false);
  }
  assert.equal(restored.cropSeeds?.beet, 5);
  const bad = structuredClone(s);
  bad.farmForage!.cooldowns.beet = Infinity;
  assert.equal(decode(JSON.stringify(bad)), null);
});
test("new crop seeds can be planted, harvested and reloaded without expanding recipe combinations", () => {
  for (const crop of crops.filter(
    (c) => !["iris", "pepper", "tomato", "corn"].includes(c),
  )) {
    const s = fresh();
    s.cropSeeds = { [crop]: 1 };
    assert(plantCrop(s, 0, crop));
    s.plots[0].stage = "ready";
    assert.equal(harvestCrop(s, 0), !isFlower(crop));
    if (!isFlower(crop)) assert.equal(s.farmProduce?.[crop], 3);
    assert(decode(JSON.stringify(s)));
    const model = makeCrop(crop, true);
    const box = new T.Box3().setFromObject(model);
    assert(!box.isEmpty());
    assert(box.max.y > 0);
    model.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        (o.material as T.Material).dispose();
      }
    });
  }
});

test("instanced field crops retain their bounds with fewer triangles than close-up previews", () => {
  for (const crop of farmFields.filter((f) => !f.existing).map((f) => f.crop)) {
    const preview = makeCrop(crop, true),
      field = makeCrop(crop, true, true);
    const triangles = (root: T.Group) => {
      let n = 0;
      root.traverse((o) => {
        if (o instanceof T.Mesh)
          n +=
            (o.geometry.index?.count ?? o.geometry.attributes.position.count) /
            3;
      });
      return n;
    };
    assert(triangles(field) < triangles(preview) * 0.6, crop);
    const a = new T.Box3().setFromObject(preview),
      b = new T.Box3().setFromObject(field);
    assert(Math.abs(a.max.y - b.max.y) < 0.03, crop);
    for (const root of [preview, field])
      root.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose();
          (o.material as T.Material).dispose();
        }
      });
  }
});
