import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import {
  journalContext,
  validJournalContext,
  rememberDay,
} from "../src/journal";
test("journal facts snapshot exact money, garden counts and observed hat use", () => {
  const s = fresh();
  s.cash = 733;
  s.events = [
    "Harvested $7.00 from a money tree.",
    "Used my Whirligig to get around faster.",
  ];
  s.hats = ["propeller"];
  s.equippedHat = "propeller";
  const c = journalContext(s);
  assert(validJournalContext(c));
  assert.equal(c.earned, 700);
  assert.equal(c.remaining, 998834);
  assert.equal(c.daysNeeded, 1427);
  assert.equal(c.worn, "Whirligig");
  s.events.push("Planted a money seed.");
  assert.equal(c.events.length, 2);
  assert.equal(rememberDay(s).events.length, 3);
});
test("journal context rejects inconsistent sums, invalid dates and nonfinite counts", () => {
  const c = journalContext(fresh());
  for (const bad of [
    { ...c, earned: 100 },
    { ...c, remaining: 0 },
    { ...c, daysNeeded: 2 },
    { ...c, day: -1 },
    { ...c, garden: { ...c.garden, empty: NaN } },
  ])
    assert(!validJournalContext(bad));
  const expanded = { ...c, plotCount: 6, garden: { ...c.garden, empty: 6 } };
  assert(validJournalContext(expanded));
  assert(!validJournalContext({ ...expanded, plotCount: 5 }));
});
test("legacy pending model jobs retire without rewriting saved pages or losing resources", () => {
  const s = fresh();
  s.day = 2;
  s.journal.push("Day 1\n\nMy saved page.");
  s.journalDrafts = [journalContext(fresh())];
  const restored = decode(JSON.stringify(s))!;
  assert.deepEqual(restored.journal, s.journal);
  assert.deepEqual(restored.journalDrafts, []);
  assert.equal(restored.bank, 433);
  assert.deepEqual(restored.plots, s.plots);
});
