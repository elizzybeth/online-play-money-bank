import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { depthAudit } from "../src/depth-audit";
import { flatPath } from "../src/flat-path";
import { makeMeteorCrater } from "../src/meteor-crater";
function plane(x: number, y: number, w = 2) {
  const m = new T.Mesh(
    new T.PlaneGeometry(w, 2).rotateX(-Math.PI / 2),
    new T.MeshBasicMaterial(),
  );
  m.position.set(x, y, 0);
  return m;
}
test("depth audit catches exact and near coplanar overlap, including transformed geometry, but not touching edges or safely spaced layers", () => {
  const root = new T.Group();
  root.add(plane(0, 0), plane(0, 0.005));
  assert.ok(depthAudit(root).length > 0);
  root.children[1].position.y = 0.04;
  assert.equal(depthAudit(root).length, 0);
  root.children[1].position.set(2, 0, 0);
  assert.equal(depthAudit(root).length, 0);
  const child = new T.Group();
  child.position.y = -0.04;
  child.add(plane(0, 0.04));
  root.add(child);
  assert.ok(depthAudit(root).length > 0);
  (child.children[0] as T.Mesh).material = new T.MeshBasicMaterial({
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  assert.equal(depthAudit(root).length, 0);
});
test("joined paths have no duplicate faces at crossings, unlike independently drawn overlapping rectangles", () => {
  const root = new T.Group();
  const m = new T.Mesh(
    flatPath(
      [
        { x: 0, z: 0, w: 8, d: 2 },
        { x: 0, z: 0, w: 2, d: 8 },
      ],
      0.055,
    ),
    new T.MeshBasicMaterial(),
  );
  root.add(m);
  assert.equal(depthAudit(root).length, 0);
  root.add(plane(0, 0.055));
  assert.ok(depthAudit(root).length > 0);
});
test("impact crater keeps a low draw count, a depressed center, finite rock transforms and visible meteor debris", () => {
  const root = makeMeteorCrater(0, 0);
  assert.equal(root.children.length, 3);
  assert.ok(root.getObjectByName("embedded-meteorite"));
  root.updateMatrixWorld(true);
  assert.ok(new T.Box3().setFromObject(root).min.y <= -2.5);
  const debris = root.getObjectByName(
    "jagged-rim-and-ejecta",
  ) as T.InstancedMesh;
  assert.equal(debris.count, 112);
  for (const value of debris.instanceMatrix.array)
    assert.ok(Number.isFinite(value));
});

test("depth audit ignores Float32 edge slivers while detecting millimetre overlaps and duplicate faces", () => {
  const root = new T.Group();
  const a = plane(0, 0, 100),
    b = plane(100 - 0.00001, 0, 100);
  a.position.z = b.position.z = -140;
  root.add(a, b);
  assert.equal(depthAudit(root).length, 0);
  b.position.x = 100 - 0.001;
  assert.ok(depthAudit(root).length > 0);
  b.position.x = 0;
  assert.ok(depthAudit(root).length > 0);
});
