import test from "node:test";
import assert from "node:assert/strict";
import { fresh, plantingBatch } from "../src/game";
import { gardenBatch } from "../src/town-life";
import { createRoosterCharge } from "../src/rooster-charge";
import { makeCookingPan } from "../src/cooking-pan";
import { Box3 } from "three";
test("twin planter chooses nearest eligible tree on the same terrace even diagonally, never another tier", () => {
  const s = fresh();
  s.seeds = 10;
  s.hats = ["inspector"];
  s.equippedHat = "inspector";
  s.equippedHats = ["inspector"];
  s.plots = [
    { ...s.plots[0], mountain: true, x: 41, z: -336, stage: "harvested" },
    { ...s.plots[0], mountain: true, x: 41, z: -351, stage: "harvested" },
    { ...s.plots[0], mountain: true, x: 47, z: -334, stage: "harvested" },
  ];
  assert.deepEqual(plantingBatch(s, 0), [0, 2]);
  s.plots.forEach((p) => (p.stage = "ready"));
  assert.deepEqual(gardenBatch(s, 0, "harvest"), [0, 2]);
  s.plots[2].stage = "growing";
  assert.deepEqual(gardenBatch(s, 0, "harvest"), [0]);
});
test("rooster charges only occasional front crossings, stops at obstacles and kicks once before cooldown", () => {
  const r = createRoosterCharge();
  let pos = { x: 0, z: 0 };
  r.update(9, pos, 0, { x: 0, z: 8 }, 0, false, () => true);
  let result = r.update(0.016, pos, 0, { x: 0, z: 2 }, 0, true, () => true);
  assert.equal(r.phase, "charge");
  for (let i = 0; i < 80; i++) {
    result = r.update(
      0.016,
      result.position,
      result.heading,
      { x: 0, z: 2 },
      0,
      false,
      () => true,
    );
  }
  assert.equal(r.kicks, 1);
  assert.equal(r.phase, "idle");
  r.update(0.016, result.position, 0, { x: 0, z: 8 }, 0, true, () => true);
  r.update(0.016, result.position, 0, { x: 0, z: 2 }, 0, true, () => true);
  assert.equal(r.phase, "idle");
  const blocked = createRoosterCharge();
  blocked.update(9, pos, 0, { x: 0, z: 8 }, 0, false, () => true);
  blocked.update(0.016, pos, 0, { x: 0, z: 2 }, 0, true, () => false);
  assert.equal(blocked.phase, "idle");
  assert.equal(blocked.kicks, 0);
});
test("red-grip skillet has open geometry and a long connected handle", () => {
  const pan = makeCookingPan();
  const b = new Box3().setFromObject(pan);
  assert(b.max.x > 1.2);
  assert(b.min.x < -0.5);
  assert(
    pan.children.some(
      (o: any) => o.material?.color?.getHexString() === "d61937",
    ),
  );
});

test("rooster can catch a walking player but a running player can escape", () => {
  for (const speed of [4, 7]) {
    const r = createRoosterCharge();
    let rooster = { x: 0, z: 0 },
      player = { x: 0, z: 3 };
    r.update(9, rooster, 0, { x: 0, z: 8 }, 0, false, () => true);
    let result = r.update(0.016, rooster, 0, player, 0, true, () => true);
    rooster = result.position;
    for (let i = 0; i < 170; i++) {
      player = { x: 0, z: player.z + speed * 0.016 };
      result = r.update(
        0.016,
        rooster,
        result.heading,
        player,
        0,
        true,
        () => true,
      );
      rooster = result.position;
    }
    assert.equal(r.kicks, speed === 4 ? 1 : 0);
  }
});
