import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fitWindow } from "../src/architecture";
test("windows cut through the wall and fit transparent glass inside its thickness on both axes", () => {
  for (const alongX of [true, false]) {
    const wall = new T.Mesh(
      new T.BoxGeometry(alongX ? 8 : 0.3, 7.2, alongX ? 0.3 : 8),
      new T.MeshStandardMaterial(),
    );
    wall.position.y = 3.6;
    fitWindow(wall, alongX, 8, 7.2, 0.3);
    wall.updateMatrixWorld(true);
    const origin = alongX
      ? new T.Vector3(0.6, 1.95, 3)
      : new T.Vector3(3, 1.95, -0.6);
    const direction = alongX
      ? new T.Vector3(0, 0, -1)
      : new T.Vector3(-1, 0, 0);
    const ray = new T.Raycaster(origin, direction);
    assert.equal(ray.intersectObject(wall, false).length, 0);
    const glass = wall.getObjectByName("translucent-glass") as T.Mesh;
    assert.ok(ray.intersectObject(glass, false).length > 0);
    const m = glass.material as T.MeshStandardMaterial;
    assert.ok(m.transparent && m.opacity < 0.3 && !m.depthWrite);
    const glassBounds = new T.Box3().setFromObject(glass);
    assert.ok(
      alongX
        ? glassBounds.max.z < 0.15 && glassBounds.min.z > -0.15
        : glassBounds.max.x < 0.15 && glassBounds.min.x > -0.15,
    );
  }
});

test("doorway lintels never sprout a window below the wall", () => {
  const wall = new T.Mesh(
    new T.BoxGeometry(5, 4.1, 0.25),
    new T.MeshStandardMaterial(),
  );
  wall.position.y = 5.15;
  fitWindow(wall, true, 5, 4.1, 0.25);
  assert.equal(wall.children.length, 0);
});
