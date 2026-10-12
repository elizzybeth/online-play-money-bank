import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { debugActions, applyDebugAction } from "../src/debug-menu";
test("every debug tool produces reloadable progress individually and together", () => {
  const all = fresh();
  for (const action of debugActions) {
    const s = fresh();
    applyDebugAction(s, action.id);
    assert.ok(decode(JSON.stringify(s)), action.id);
    applyDebugAction(all, action.id);
    assert.ok(decode(JSON.stringify(all)), `combined ${action.id}`);
  }
});
test("Level 3 unlock preserves existing progress and remains unlocked after reload", () => {
  const s = fresh();
  s.cash = 12345;
  s.day = 17;
  applyDebugAction(s, "level3");
  const loaded = decode(JSON.stringify(s))!;
  assert.equal(loaded.millionaire?.unlocked, true);
  assert.equal(loaded.cash, 12345);
  assert.equal(loaded.day, 17);
  assert.equal(loaded.foundTVSeeds, true);
});
