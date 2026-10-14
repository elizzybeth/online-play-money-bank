import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, clearPosition } from "../src/game";
import { newMillionaire } from "../src/millionaire";
import { withinPlayableBounds } from "../src/world-bounds";
test("Level 3 import and collision recovery keep valid east-lane and desert locations", () => {
  const s = fresh();
  s.millionaire = { ...newMillionaire(), unlocked: true };
  for (const position of [
    { x: 45, z: -50 },
    { x: 150, z: -220 },
    { x: -80, z: -255 },
  ]) {
    s.position = position;
    assert.ok(withinPlayableBounds(s));
    assert.deepEqual(clearPosition(position, [], -470), position);
  }
  s.millionaire = undefined;
  s.position = { x: 150, z: -220 };
  assert.equal(withinPlayableBounds(s), false);
});
