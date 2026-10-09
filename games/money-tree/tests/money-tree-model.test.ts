import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { moneySkeleton } from "../src/money-tree-model";
test("spindly money trees stay within usable canopy bounds and retain their saved silhouettes", () => {
  const material = new T.MeshBasicMaterial();
  const shapes = new Set<string>();
  for (let i = 0; i < 5; i++)
    for (const withered of [false, true]) {
      const model = moneySkeleton(i, withered ? 1.35 : 2.4, material, withered),
        group = new T.Group();
      group.add(model.trunk, model.branches);
      const bounds = new T.Box3().setFromObject(group);
      assert(bounds.min.y > -0.04);
      assert(bounds.max.y < 4.1);
      assert(bounds.min.x > -1.5 && bounds.max.x < 1.5);
      assert(bounds.min.z > -1.5 && bounds.max.z < 1.5);
      assert(model.tips.every((v) => v.toArray().every(Number.isFinite)));
      const shape = JSON.stringify(
        Array.from(model.branches.geometry.attributes.position.array),
      );
      if (!withered) {
        shapes.add(shape);
        const again = moneySkeleton(i, 2.4, material);
        assert.equal(
          JSON.stringify(
            Array.from(again.branches.geometry.attributes.position.array),
          ),
          shape,
        );
        again.trunk.geometry.dispose();
        again.branches.geometry.dispose();
      }
      model.trunk.geometry.dispose();
      model.branches.geometry.dispose();
    }
  assert.equal(shapes.size, 5);
  material.dispose();
});
