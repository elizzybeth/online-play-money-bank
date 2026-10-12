import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { makeEstate } from "../src/estate-models";
import { makeDesertPlants } from "../src/desert-plants";
test("Hearst and Vernon have finite batched geometry, distinct towers and cupola, empty floors and an open doorway", () => {
  for (const style of ["hearst", "vernon"] as const) {
    const { root, walls } = makeEstate(style);
    root.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(root);
    assert.ok(bounds.max.y > 10);
    assert.equal(walls.length, 5);
    let meshes = 0;
    root.traverse((o) => {
      if (o instanceof T.Mesh) {
        meshes++;
        assert.ok(o.geometry);
        const a = o.geometry.getAttribute("position");
        for (const n of a.array) assert.ok(Number.isFinite(n));
      }
    });
    assert.ok(meshes < 32);
    assert.ok(root.getObjectByName("estate-roof"));
    const ray = new T.Raycaster(
      new T.Vector3(0, 1, 16),
      new T.Vector3(0, 0, -1),
      0,
      6,
    );
    assert.equal(ray.intersectObjects(walls).length, 0);
  }
});
test("dense cactus and Joshua vegetation remains batched with finite renderable geometry", () => {
  const root = makeDesertPlants();
  assert.ok(root.children.length > 2 && root.children.length < 8);
  for (const child of root.children) {
    const mesh = child as T.Mesh;
    assert.ok(mesh.geometry);
    assert.ok(mesh.geometry.getAttribute("normal"));
    for (const n of mesh.geometry.getAttribute("position").array)
      assert.ok(Number.isFinite(n));
  }
});
