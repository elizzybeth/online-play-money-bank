import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, buy, fertilize } from "../src/game";
import { inventoryChanges, inventorySnapshot } from "../src/inventory-events";
import { hats, hatPower } from "../src/hats";
test("purchases and applications report money and item deltas together", () => {
  const s = fresh();
  s.cash = 1000;
  let before = inventorySnapshot(s);
  buy(s, "fertilizer");
  assert.deepEqual(inventoryChanges(before, inventorySnapshot(s)), [
    "−$5.00 pocket money",
    "+5 fertilizer doses",
  ]);
  before = inventorySnapshot(s);
  s.plots[0].stage = "growing";
  fertilize(s, 0);
  assert.deepEqual(inventoryChanges(before, inventorySnapshot(s)), [
    "−1 fertilizer doses",
  ]);
  before = inventorySnapshot(s);
  s.equippedHats = ["inspector"];
  assert.deepEqual(inventoryChanges(before, inventorySnapshot(s)), []);
});
test("Garden Inspector has a distinct cobalt color", () => {
  const color = hats.find((h) => h.id === "inspector")!.color;
  assert.equal(color, "#2767ce");
  assert.equal(hats.filter((h) => h.color === color).length, 1);
});

test("Sprout Cap retires its brim hint after the seeds are found", () => {
  assert(hatPower("cap", false).includes("Check the brim"));
  assert(!hatPower("cap", true).includes("Check the brim"));
  assert(hatPower("cap", true).includes("50%"));
});
