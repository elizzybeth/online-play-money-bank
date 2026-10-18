import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { CameraWalls } from "../src/camera-walls";
const point = (x: number, z = 0) => new T.Vector3(x, 1.5, z);
test("camera walls cut away across the boom and restore after moving clear", () => {
  const wall = new T.Mesh(new T.BoxGeometry(0.3, 3, 8));
  wall.position.set(2, 1.5, 0);
  wall.userData.cameraWall = true;
  wall.castShadow = true;
  const furniture = new T.Mesh(new T.BoxGeometry(1, 1, 1));
  const cuts = new CameraWalls();
  cuts.update([wall, furniture], point(0), point(4), point(5));
  assert.equal(wall.visible, false);
  assert.equal(wall.castShadow, false);
  assert.equal(cuts.visibleForInteraction(wall), true);
  const lockedArea = new T.Group();
  lockedArea.add(wall);
  lockedArea.visible = false;
  assert.equal(cuts.visibleForInteraction(wall), false);
  lockedArea.visible = true;
  assert.equal(furniture.visible, true);
  cuts.update([wall], point(-4), point(-6), point(-8));
  assert.equal(wall.visible, true);
  assert.equal(wall.castShadow, true);
});
test("camera movement through a wall cuts it away even when the new boom is clear", () => {
  const wall = new T.Mesh(new T.BoxGeometry(0.3, 3, 8));
  wall.position.y = 1.5;
  wall.userData.cameraWall = true;
  const cuts = new CameraWalls();
  cuts.update([wall], point(4), point(-2), point(6));
  assert.equal(wall.visible, false);
  cuts.restore();
  assert.equal(wall.visible, true);
  wall.visible = false;
  cuts.update([wall], point(4), point(-2), point(6));
  cuts.restore();
  assert.equal(wall.visible, false);
});

test("touching a wall does not cut it away while the camera remains on the same side", () => {
  const wall = new T.Mesh(new T.BoxGeometry(0.3, 3, 8));
  wall.position.set(2, 1.5, 0);
  wall.userData.cameraWall = true;
  const cuts = new CameraWalls();
  cuts.update([wall], point(1.7), point(-2), point(-3));
  assert.equal(wall.visible, true);
  cuts.update([wall], point(1.7), point(3), point(4));
  assert.equal(wall.visible, false);
});

test("cached leaf bounds reuse unchanged calculations and invalidate parent and vertex changes", () => {
  const walls = new CameraWalls(),
    parent = new T.Group(),
    mesh = new T.Mesh(new T.BoxGeometry(2, 2, 2));
  parent.add(mesh);
  const first = walls.bounds(mesh);
  for (let i = 0; i < 300; i++) assert.equal(walls.bounds(mesh), first);
  assert.equal(walls.stats().boundsBuilds, 1);
  parent.position.x = 5;
  assert.equal(walls.bounds(mesh).min.x, 4);
  const positions = mesh.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++)
    positions.setX(i, positions.getX(i) * 2);
  positions.needsUpdate = true;
  assert.equal(walls.bounds(mesh).min.x, 3);
  assert.equal(walls.stats().boundsBuilds, 3);
});
