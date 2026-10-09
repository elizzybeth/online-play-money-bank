import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, buy, withdraw, sleep, harvest, decode } from "../src/game";
test("first night before harvest questions seeds and the housing fallback", () => {
  const s = fresh();
  withdraw(s);
  buy(s, "seeds");
  sleep(s);
  const entry = s.journal[1];
  assert(!entry.includes("—"));
  assert(entry.startsWith("Day 1\n\n"));
  assert(entry.includes("almost half my $4.33"));
  assert(entry.includes("This better work"));
  assert(entry.includes("Auntie"));
  assert(entry.includes("What on earth"));
  assert(!s.harvestReflected);
});
test("first harvested night calculates remaining surgery days once, even after day one", () => {
  const s = fresh();
  s.boughtSeeds = true;
  s.cash = 33;
  s.bank = 0;
  sleep(s);
  s.plots[0] = { stage: "ready", remaining: 0, fertilized: false, yield: 500 };
  harvest(s, 0);
  s.plots[1] = { stage: "ready", remaining: 0, fertilized: false, yield: 200 };
  harvest(s, 1);
  sleep(s);
  const entry = s.journal[2];
  assert(entry.includes("It really grew money"));
  assert(entry.includes("$7.00"));
  assert(entry.includes("$9,992.67") === false);
  assert(entry.includes("$9992.67"));
  assert(entry.includes("1,428 more days"));
  assert(s.harvestReflected);
  assert(!entry.includes("—"));
  assert(decode(JSON.stringify(s))!.harvestReflected);
  s.events.push("Harvested $7.00 from a money tree.");
  sleep(s);
  assert(!s.journal[3].includes("It really grew money"));
});
test("legacy diary pages shed em dashes and reflection flag migrates", () => {
  const legacy: any = fresh();
  delete legacy.harvestReflected;
  legacy.journal.push("Day 1 — I talked — and planted.");
  const s = decode(JSON.stringify(legacy))!;
  assert(s.journal.every((p) => !p.includes("—")));
  assert(!s.harvestReflected);
});

test("a day without earnings does not celebrate financial progress", () => {
  const s = fresh();
  sleep(s);
  assert(s.journal[1].includes("haven’t earned anything"));
  assert(!s.journal[1].includes("drop in the bucket"));
  assert(!s.journal[1].includes("beginning"));
  const seeded = fresh();
  withdraw(seeded);
  buy(seeded, "seeds");
  sleep(seeded);
  assert(seeded.journal[1].includes("This better work"));
  assert(!seeded.journal[1].includes("drop in the bucket"));
});
test("saved zero-income prose is corrected without changing progress", () => {
  for (const comparison of [
    "what Mom’s surgery will cost",
    "the $10,000.00 Mom’s surgery will cost",
  ]) {
    const old = fresh();
    old.journal.push(
      `Day 1 — I planted five seeds. I made $0.00 today. It’s only a drop in the bucket compared to ${comparison}. Still, it’s a beginning. I have to keep going.`,
    );
    const restored = decode(JSON.stringify(old))!;
    assert(restored.journal[1].includes("I planted five seeds."));
    assert(restored.journal[1].includes("haven’t earned anything"));
    assert(!restored.journal[1].includes("drop in the bucket"));
    assert(!restored.journal[1].includes("beginning"));
    assert.equal(restored.bank, old.bank);
    assert.equal(restored.day, old.day);
    assert.deepEqual(restored.plots, old.plots);
    assert.deepEqual(decode(JSON.stringify(restored)), restored);
  }
});
