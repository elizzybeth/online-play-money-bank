import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createMrWacky, wackyLines } from "../src/mr-wacky";
import type { Rect } from "../src/game";
import type { Target } from "../src/world";
test("Mr Wacky appears once after Pepe pops, dances on interaction, pauses, and cycles all five lines", () => {
  const rects: Rect[] = [],
    targets: Target[] = [],
    speakers: { id: string; name: string; object: T.Object3D }[] = [];
  const w = createMrWacky(new T.Group(), rects, targets, speakers);
  assert.equal(w.root.visible, false);
  assert.equal(targets.length, 0);
  w.update(false, 1, false);
  assert.equal(w.interact(0, 0), "");
  w.update(true, 0, false);
  w.update(true, 0, false);
  assert.equal(targets.length, 1);
  assert.equal(rects.length, 1);
  assert.equal(w.interact(-18, -61), wackyLines[0]);
  const rest = w.stats();
  w.update(true, 0.25, false);
  assert.notDeepEqual(w.stats().body, rest.body);
  const frozen = w.stats();
  w.update(true, 0, false);
  assert.deepEqual(w.stats(), frozen);
  for (const line of wackyLines.slice(1))
    assert.equal(w.interact(-18, -61), line);
  assert.equal(w.interact(-18, -61), wackyLines[0]);
  w.update(false, 0, false);
  assert.equal(targets.length, 0);
  assert.equal(rects.length, 0);
  assert.equal(w.root.visible, false);
});
