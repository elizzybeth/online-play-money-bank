import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { paintBikeShopFacade } from "../src/bike-shop-mural";
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

test("bike mural shares one map, preserves the real window hole and follows facade-wide UVs", () => {
  const wall = new T.Mesh(
    new T.BoxGeometry(15.1, 7.2, 0.25),
    new T.MeshStandardMaterial(),
  );
  wall.position.set(-20.45, 3.6, -21);
  wall.userData.cameraWall = true;
  fitWindow(wall, true, 15.1, 7.2, 0.25);
  const texture = new T.Texture();
  const pieces = paintBikeShopFacade([wall], texture);
  const m = pieces[0],
    p = m.geometry.attributes.position,
    uv = m.geometry.attributes.uv;
  const ray = new T.Raycaster();
  wall.updateMatrixWorld(true);
  ray.set(new T.Vector3(-20.45, 1.95, -19), new T.Vector3(0, 0, -1));
  assert.equal(ray.intersectObject(m).length, 0, "window remains open");
  ray.set(new T.Vector3(-20.45, 5.5, -19), new T.Vector3(0, 0, -1));
  assert(ray.intersectObject(m).length > 0, "lettering area covers solid wall");
  assert.equal(m.parent, wall);
  assert.equal(m.material.map, texture);
  for (let i = 0; i < p.count; i++) {
    assert(
      Math.abs(uv.getX(i) - (p.getX(i) + wall.position.x + 28) / 20) < 1e-6,
    );
    assert(Math.abs(uv.getY(i) - (p.getY(i) + wall.position.y) / 7.2) < 1e-6);
  }
});
