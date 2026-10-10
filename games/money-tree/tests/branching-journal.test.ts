import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, sleep, decode } from "../src/game";
import { journalContext } from "../src/journal";
import {
  constructJournal,
  newNarrativeMemory,
  validNarrativeMemory,
} from "../src/branching-journal";
import { passages } from "../src/journal-passages";
function context(events: string[] = [], day = 1) {
  const s = fresh();
  s.day = day;
  s.events = events;
  return journalContext(s);
}
test("reviewed corpus contains at least 250 alternatives and safe slots", () => {
  assert(Object.values(passages).flat().length >= 250);
  for (const text of Object.values(passages).flat()) {
    assert(
      !/[—–]|drop in the bucket|glimmer of hope|heavy heart|one step closer|silver lining|journey|tapestry|bittersweet/i.test(
        text,
      ),
    );
    for (const slot of text.matchAll(/\{(\w+)\}/g))
      assert(
        ["income", "total", "planted", "watered", "fed", "neighbors"].includes(
          slot[1],
        ),
      );
  }
});
test("health transitions use yesterday only when observed yesterday; emotions carry forward", () => {
  const tired = constructJournal(
    context(["Mom was exhausted on the couch when I came home."], 1),
    newNarrativeMemory(43),
  );
  assert(tired.memory.emotions.worry > 45);
  const good = constructJournal(
    context(["Mom had energy for painting today."], 2),
    tired.memory,
  );
  assert(good.selections.some((id) => id.startsWith("relief:")));
  assert(good.entry.includes("paint"));
  assert(good.memory.emotions.worry < tired.memory.emotions.worry);
  assert(good.memory.emotions.worry > 0);
  const missed = constructJournal(context([], 3), good.memory);
  assert(
    !missed.selections.some((x) =>
      /^(cooking|painting|reading|tired|cough|garden|birdhouses):/.test(x),
    ),
  );
  const later = constructJournal(
    context(["Mom was exhausted on the couch when I checked on her."], 5),
    missed.memory,
  );
  assert(!later.selections.some((id) => id.startsWith("setback:")));
  const next = constructJournal(
    context(["Mom had energy for reading a book today."], 6),
    later.memory,
  );
  assert(next.selections.some((x) => x.startsWith("relief:")));
});
test("Mom gratitude is recorded dialogue, not inferred from a garden visit", () => {
  const c = context(["Mom had energy for looking at the garden today."]);
  assert(!constructJournal(c).entry.includes("thanked"));
  c.events.push(
    "Heard Mom: Those money trees are ugly, but thank you for your work.",
  );
  assert(constructJournal(c).selections.some((x) => x.startsWith("ugly:")));
});
test("milestones, exact arithmetic, purchases, and used hats remain grounded", () => {
  const s = fresh();
  s.cash = 733;
  s.bank = 0;
  s.events = ["Harvested $7.00 from a money tree.", "Bought the Whirligig."];
  s.hats = ["propeller"];
  const first = constructJournal(journalContext(s), newNarrativeMemory(44));
  assert(first.entry.includes("$9992.67"));
  assert(first.entry.includes("1,428 more days"));
  assert(first.entry.includes("walk and run faster"));
  s.day = 2;
  s.harvestReflected = true;
  s.events = ["Harvested $2.00 from a money tree."];
  const later = constructJournal(journalContext(s), first.memory);
  assert(!later.selections.some((x) => x.startsWith("first:")));
  assert(!later.entry.includes("more days"));
  const none = constructJournal(context());
  assert(!/\bhat\b/.test(none.entry));
  assert(!none.entry.includes("cough"));
});
test("construction is deterministic, stable after reload, and corrupt optional metadata preserves progress", () => {
  const c = context(["Planted a money seed."]);
  const m = newNarrativeMemory(92);
  const before = structuredClone(m);
  assert.deepEqual(constructJournal(c, m), constructJournal(c, m));
  assert.deepEqual(m, before);
  const s = fresh();
  s.journalNarrative = m;
  sleep(s);
  const restored = decode(JSON.stringify(s))!;
  assert.deepEqual(restored.journal, s.journal);
  assert.deepEqual(restored.journalNarrative, s.journalNarrative);
  const bad: any = {
    ...s,
    journalNarrative: { ...m, emotions: { worry: Infinity } },
  };
  const fixed = decode(JSON.stringify(bad))!;
  assert(fixed);
  assert(!fixed.journalNarrative);
  assert.equal(fixed.bank, s.bank);
  assert.deepEqual(fixed.journal, s.journal);
});
test("10000 simulated nights stay bounded, grounded, fresh, and narratively coherent", () => {
  const seen = new Set<string>();
  for (let run = 1; run <= 100; run++) {
    const s = fresh();
    s.journalNarrative = newNarrativeMemory(run);
    s.boughtSeeds = true;
    for (let day = 1; day <= 100; day++) {
      s.day = day;
      s.events = [];
      const activity = [
        "cooking",
        "building birdhouses",
        "painting",
        "reading a book",
        "looking at the garden",
      ][day % 5];
      if (day % 4 === 0)
        s.events.push(
          "Mom was exhausted on the couch when I came home.",
          "Heard Mom coughing when I got home.",
        );
      else if (day % 4 !== 1)
        s.events.push(`Mom had energy for ${activity} today.`);
      if (day > 1 && day % 3 !== 0) {
        s.events.push(`Harvested $${2 + (day % 6)}.00 from a money tree.`);
        s.cash += 200 + (day % 6) * 100;
      }
      if (day % 2 === 0)
        s.events.push("Planted a money seed.", "Watered a money tree.");
      const c = journalContext(s),
        r = constructJournal(c, s.journalNarrative);
      assert(validNarrativeMemory(r.memory));
      assert(!/[—–]|\{\w+\}|undefined|NaN/.test(r.entry));
      if (day % 4 !== 0)
        assert(!r.entry.includes("coughed") && !r.entry.includes("coughing"));
      if (!c.earned) assert(!/I harvested \$[1-9]/.test(r.entry));
      if (s.harvestReflected)
        assert(!r.selections.some((x) => x.startsWith("first:")));
      assert(r.entry.split(/\s+/).length < 260);
      seen.add(r.entry.replace(/^Day \d+/, "Day"));
      s.journalNarrative = r.memory;
      s.journal.push(r.entry);
      if (c.firstHarvest) s.harvestReflected = true;
    }
  }
  assert(seen.size > 7000, `Only ${seen.size} distinct entries`);
});

test("all Mom activity families and hat powers are reachable without inventing purchases", () => {
  for (const [activity, family] of [
    ["cooking", "cooking"],
    ["building birdhouses", "birdhouses"],
    ["painting", "painting"],
    ["reading a book", "reading"],
    ["looking at the garden", "garden"],
  ]) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const result = constructJournal(
        context([`Mom had energy for ${activity} today.`]),
        newNarrativeMemory(seed * 104729),
      );
      result.selections
        .filter((id) => id.startsWith(family + ":"))
        .forEach((id) => seen.add(id));
    }
    assert.equal(seen.size, 8);
  }
  for (const [name, power] of [
    ["Whirligig", "walk and run faster"],
    ["Spring Hare", "jump"],
    ["Garden Inspector", "see how all my trees are growing"],
  ]) {
    const result = constructJournal(
      context([`Used my ${name} to help today.`]),
    );
    assert(result.entry.includes(power));
    assert(!result.entry.includes(`I bought the ${name}`));
  }
});
test("spending reflection requires a recorded purchase and a lower observed balance", () => {
  const c = context(["Bought soil to fill a garden bed for $10.00."], 2);
  c.history = [{ day: 1, events: [], earned: 0, available: 1433 }];
  assert(
    constructJournal(c).selections.some((id) => id.startsWith("spending:")),
  );
  c.events = [];
  assert(
    !constructJournal(c).selections.some((id) => id.startsWith("spending:")),
  );
});
test("later unproven nights do not rediscover buying seeds and repeated optional subjects cool down", () => {
  const s = fresh();
  s.boughtSeeds = true;
  s.seeds = 5;
  s.day = 2;
  const r = constructJournal(journalContext(s));
  assert(r.selections.some((id) => id.startsWith("unstarted:")));
  assert(!r.selections.some((id) => id.startsWith("unproven:")));
  s.events = ["Mom had energy for painting today."];
  const first = constructJournal(journalContext(s));
  s.day = 3;
  s.journal.push(first.entry);
  const second = constructJournal(journalContext(s), first.memory);
  assert(!second.selections.some((id) => first.selections.includes(id)));
});
test("reaching the surgery goal is a one-time event and does not invent a conversation", () => {
  const s = fresh();
  s.harvestReflected = true;
  s.day = 300;
  s.bank = 1000000;
  s.cash = 0;
  s.events = ["Harvested $7.00 from a money tree."];
  const r = constructJournal(journalContext(s));
  assert(r.selections.some((x) => x.startsWith("goal:")));
  assert(r.memory.goalWritten);
  assert(!/I told|Mom said/.test(r.entry));
  s.day++;
  const next = constructJournal(journalContext(s), r.memory);
  assert(!next.selections.some((x) => x.startsWith("goal:")));
});
test("hat reflections describe the current fertilizer and harvest powers", () => {
  const wizard = constructJournal(
    context(["Used my Moonrise Wizard to make my fertilizer last longer."]),
  );
  assert.match(wizard.entry, /save a fertilizer dose/);
  assert.doesNotMatch(wizard.entry, /grow faster/);
  const banker = constructJournal(
    context(["Used my Lucky Tallboy to get an extra dollar from a harvest."]),
  );
  assert.match(banker.entry, /nine if I fertilized it/);
});
