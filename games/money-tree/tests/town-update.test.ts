import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  buyHat,
  equipHat,
  removeHat,
  wornHats,
  movementSpeed,
  decode,
  findHiddenSeeds,
  momReply,
  momStatus,
} from "../src/game";
import { momThoughtLibrary, chooseMomThought } from "../src/mom-thoughts";
import { momDialogue } from "../src/mom-dialogue";
import { constructJournal, newNarrativeMemory } from "../src/branching-journal";
import { journalContext } from "../src/journal";
test("three hat powers stack, fourth stays on rack, removal frees a slot and legacy saves migrate", () => {
  const s = fresh();
  s.cash = 100000;
  buyHat(s, "cap");
  buyHat(s, "propeller");
  buyHat(s, "rabbit");
  buyHat(s, "inspector");
  assert.deepEqual(wornHats(s), ["cap", "propeller", "rabbit"]);
  assert.equal(movementSpeed(s, true), 8.75);
  assert(!equipHat(s, "inspector"));
  removeHat(s, "cap");
  assert(equipHat(s, "inspector"));
  assert.deepEqual(decode(JSON.stringify(s))!.equippedHats, [
    "propeller",
    "rabbit",
    "inspector",
  ]);
  const legacy = fresh();
  legacy.hats = ["cap"];
  legacy.equippedHat = "cap";
  assert.deepEqual(decode(JSON.stringify(legacy))!.equippedHats, ["cap"]);
  assert.equal(
    decode(JSON.stringify({ ...s, equippedHats: ["cap", "cap"] })),
    null,
  );
});
test("hidden seed sequence continues through neighbor flowerbed and home TV once each", () => {
  const s = fresh();
  assert(!findHiddenSeeds(s, "garden"));
  assert(!findHiddenSeeds(s, "tv"));
  s.foundCapSeeds = true;
  for (const place of ["forest", "store", "garden", "tv"] as const) {
    assert(findHiddenSeeds(s, place));
    assert(!findHiddenSeeds(s, place));
  }
  assert.equal(s.seeds, 20);
  assert.equal(decode(JSON.stringify(s))!.foundTVSeeds, true);
});
test("200 distinct thoughts respect health, activity, finances and recent selection", () => {
  assert.equal(momThoughtLibrary.length, 200);
  assert.equal(new Set(momThoughtLibrary.map((t) => t.text)).size, 200);
  const s = fresh();
  const seen = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const line = chooseMomThought(s);
    assert(!seen.has(line));
    seen.add(line);
    const item = momThoughtLibrary.find((t) => t.text === line)!;
    assert(["resting", "noSeeds", "smallSavings"].includes(item.group));
  }
  s.day = 2;
  s.cash = 1000000;
  for (let i = 0; i < 30; i++) {
    const line = chooseMomThought(s);
    const item = momThoughtLibrary.find((t) => t.text === line)!;
    assert(["good", "cooking", "noSeeds", "goal"].includes(item.group));
  }
  assert.equal(decode(JSON.stringify(s))!.momThoughts!.length, 60);
});
test("Mom has 200 additional activity-compatible replies before repeats", () => {
  assert.equal(Object.values(momDialogue).flat().length, 200);
  for (const day of [1, 2, 4, 6, 8, 10]) {
    const s = fresh();
    s.day = day;
    const set = new Set<string>();
    const activity = momStatus(day).activity;
    for (
      let i = 0;
      i <
      4 + (momDialogue as Record<string, readonly string[]>)[activity].length;
      i++
    ) {
      const reply = momReply(s);
      assert(!set.has(reply), reply);
      set.add(reply);
    }
  }
});
test("journal avoids repeating I liked that across Mom activity and health transition", () => {
  for (let seed = 1; seed < 200; seed++) {
    const s = fresh();
    s.day = 2;
    s.events = ["Mom had energy for cooking today."];
    const prior = newNarrativeMemory(seed);
    prior.lastMom = "tired";
    prior.lastMomDay = 1;
    const text = constructJournal(journalContext(s), prior).entry.toLowerCase();
    assert((text.match(/i liked that/g) ?? []).length <= 1, text);
  }
});
test("Mom has ten good-day activities, occasional bed days, and finished birdhouses persist", async () => {
  const { sleep } = await import("../src/game");
  const s = fresh();
  s.day = 4;
  sleep(s);
  assert.equal(s.birdhousesBuilt, 1);
  assert.equal(decode(JSON.stringify(s))!.birdhousesBuilt, 1);
  assert.equal(
    new Set(
      Array.from({ length: 10 }, (_, i) => momStatus((i + 1) * 2).activity),
    ).size,
    10,
  );
  assert.equal(momStatus(3).activity, "bedrest");
  assert.equal(momStatus(1).activity, "resting");
  for (const [day, event] of [
    [3, "Mom was exhausted in bed when I checked on her."],
    [12, "Mom had energy for mending clothes today."],
    [14, "Mom had energy for doing a jigsaw puzzle today."],
    [16, "Mom had energy for playing music today."],
    [18, "Mom had energy for writing a letter today."],
    [20, "Mom had energy for feeding birds today."],
  ] as const) {
    const st = fresh();
    st.day = day;
    st.events = [event];
    const result = constructJournal(journalContext(st));
    assert(
      result.selections.some((id) =>
        id.startsWith(day === 3 ? "momBed:" : `${momStatus(day).activity}:`),
      ),
    );
  }
});
