import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { buildGeiselMansion } from "../src/geisel-mansion";
import { createTownLife } from "../src/town-life-world";
import { blocked, type Rect } from "../src/game";
import type { Target } from "../src/world";
test("Geisel estate has a suspended stepped silhouette and an operable entrance", () => {
  const home = new T.Group();
  buildGeiselMansion(home);
  const box = new T.Box3().setFromObject(home),
    size = box.getSize(new T.Vector3());
  assert.equal(size.x, 44);
  assert(size.y > 24);
  assert(size.z <= 32);
  assert.deepEqual(home.userData.cantileverWidths, [19, 31, 44, 37, 29, 21]);
  assert(home.getObjectByName("geisel-glass"));
  assert(home.getObjectByName("geisel-concrete"));
  assert(
    home.getObjectByName("roof-gardens") ??
      home.getObjectByName("geisel-roof-gardens"),
  );
  const door = home.getObjectByName("mansion-door")!;
  assert(door);
  door.visible = false;
  assert.equal(home.getObjectByName("geisel-glass")!.visible, true);
});
test("five named hens and Fancy Chicken have a reachable cuddle and chair lifecycle", () => {
  const scene = new T.Scene(),
    rects: Rect[] = [],
    targets: Target[] = [],
    speakers: { id: string; name: string; object: T.Object3D }[] = [];
  const player = new T.Group(),
    mom = new T.Group();
  for (const actor of [player, mom]) {
    const head = new T.Group();
    head.name = "head";
    actor.add(head);
    scene.add(actor);
  }
  const life = createTownLife(scene, rects, targets, speakers, player, mom);
  assert.deepEqual(
    life.chickens.map((c) => c.name),
    ["Tuck", "Cluck", "Pluck", "Luck", "Fuck", "Fancy Chicken"],
  );
  const distantHen = life.chickens[4].object;
  assert(distantHen.position.x >= 29 && distantHen.position.z <= -22);
  const rooster = life.chickens[5].object;
  assert(rooster.userData.rooster);
  assert(
    rooster.children.filter((c) => c.name === "oversized-wattle").length === 2,
  );
  rooster.updateMatrixWorld(true);
  for (const flap of rooster.children.filter(
    (c) => c.name === "oversized-wattle",
  )) {
    const b = new T.Box3()
      .setFromObject(flap)
      .applyMatrix4(rooster.matrixWorld.clone().invert());
    assert(b.max.y < 0.78, "wattle clears eye height");
    assert(b.max.x - b.min.x < 0.2, "wattle is a narrow flap");
    assert(b.max.z - b.min.z < 0.05, "wattle is thin rather than a solid oval");
  }
  const chair = targets.find((t) => t.id === "mom-chair")!;
  assert(!blocked(chair.x, chair.z, rects));
  assert(life.cuddle(0));
  life.update(0.6, 1);
  assert.equal(life.chickens[0].object.parent, player);
  assert.equal(life.cuddle(1), false);
  life.update(2.5, 3);
  assert.equal(life.busy, true);
  life.putDown();
  life.update(0.1, 3.1);
  assert.equal(life.chickens[0].object.parent, scene);
  assert.equal(life.busy, false);
});
