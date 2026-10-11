import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, sleep, decode, momStatus } from "../src/game";
import {
  scheduleSurgery,
  tickSurgery,
  answerMomCall,
  canVisitBea,
  beginBeaWalk,
  acceptShopGoal,
  storyPhase,
  validFamilyStory,
} from "../src/family-story";
import { journalContext, validJournalContext } from "../src/journal";
import { constructJournal } from "../src/branching-journal";
test("surgery spends liquid funds once, waits for an awake phone call and survives saves", () => {
  const s = fresh();
  s.awake = true;
  s.cash = 600000;
  s.bank = 499999;
  assert(scheduleSurgery(s));
  assert.equal(s.cash + s.bank, 99999);
  assert(!scheduleSurgery(s));
  assert.equal(storyPhase(s), "scheduled");
  assert(sleep(s));
  s.awake = true;
  assert.equal(storyPhase(s), "surgery");
  assert(!sleep(s));
  assert.equal(s.day, 2);
  assert(!tickSurgery(s, NaN));
  s.awake = false;
  assert(!tickSurgery(s, 1000));
  s.awake = true;
  assert(!tickSurgery(s, 119));
  assert(!answerMomCall(s));
  assert(tickSurgery(s, 1));
  assert(answerMomCall(s));
  assert(!answerMomCall(s));
  assert.equal(storyPhase(s), "coming-home");
  assert.deepEqual(decode(JSON.stringify(s))?.familyStory, s.familyStory);
  assert(sleep(s));
  assert.equal(storyPhase(s), "recovery");
  assert(momStatus(s.day, s.familyStory).energetic);
  for (let day = 3; day < 40; day++)
    assert.notEqual(momStatus(day, s.familyStory).activity, "bedrest");
  assert(
    Array.from({ length: 12 }, (_, i) => momStatus(i + 3, s.familyStory)).some(
      (m) => !m.energetic,
    ),
  );
});
test("outing unlocks after five days and complete tea conversation changes the goal", () => {
  const s = fresh();
  s.cash = 1000000;
  assert(scheduleSurgery(s));
  s.day = 2;
  s.awake = true;
  tickSurgery(s, 120);
  answerMomCall(s);
  s.day = 6;
  assert(!canVisitBea(s));
  s.day = 7;
  assert(canVisitBea(s));
  assert(beginBeaWalk(s));
  assert(!acceptShopGoal(s));
  s.familyStory!.teaStep = 6;
  assert(acceptShopGoal(s));
  assert(!acceptShopGoal(s));
  assert.equal(storyPhase(s), "shop");
  const c = journalContext(s);
  assert.equal(c.remaining, 10000000 - s.cash - s.bank);
  assert(validJournalContext(c));
  assert.deepEqual(decode(JSON.stringify(s))?.familyStory, s.familyStory);
  const entry = constructJournal(c).entry;
  assert.match(entry, /Robertson/);
  assert(!/need.*surgery|operation.*money/i.test(entry));
  assert(!validFamilyStory({ ...s.familyStory, teaStep: 2 }, s.day));
});
test("post-operation journals use the current family phase instead of pre-operation worry", () => {
  const s = fresh();
  s.cash = 1000000;
  scheduleSurgery(s);
  for (const [day, called, phase] of [
    [1, false, "scheduled"],
    [2, false, "surgery"],
    [2, true, "coming-home"],
    [3, true, "recovery"],
  ] as const) {
    s.day = day;
    s.familyStory!.called = called;
    s.familyStory!.awakeSeconds = called ? 120 : 0;
    const c = journalContext(s);
    assert.equal(c.familyPhase, phase);
    assert(validJournalContext(c));
    const entry = constructJournal(c).entry;
    assert(!/need.*surgery|operation.*money/i.test(entry));
  }
});
