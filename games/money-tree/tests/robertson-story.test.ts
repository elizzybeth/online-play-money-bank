import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { storyPhase, shopCost } from "../src/family-story";
import {
  canSaveShop,
  chooseShopPlan,
  nextRobertsonHistory,
  robertsonHistory,
  reportShopProgress,
  saveRobertsons,
} from "../src/robertson-story";
import { journalContext, validJournalContext } from "../src/journal";
import { constructJournal } from "../src/branching-journal";
function saving() {
  const s = fresh();
  s.day = 8;
  s.awake = true;
  s.familyStory = {
    scheduledDay: 1,
    surgeryDay: 2,
    awakeSeconds: 120,
    called: true,
    escort: false,
    teaStep: 6,
    shopGoal: true,
  };
  return s;
}
test("old active shop saves load and history progresses through the whole story", () => {
  const s = saving();
  assert.ok(decode(JSON.stringify(s)));
  assert.deepEqual(
    robertsonHistory.map(() => nextRobertsonHistory(s)),
    robertsonHistory,
  );
  assert.equal(nextRobertsonHistory(s), robertsonHistory[0]);
  assert.ok(decode(JSON.stringify(s)));
  s.familyStory!.shopStoryStep = 8;
  assert.equal(decode(JSON.stringify(s)), null);
});
test("secret and revealed rescue plans persist, and exact/vague check-ins do not spend money", () => {
  const s = saving();
  s.cash = 12345;
  s.bank = 54321;
  assert.ok(chooseShopPlan(s, false));
  assert.equal(reportShopProgress(s, true), false);
  assert.equal(decode(JSON.stringify(s))!.familyStory!.shopPlan, "secret");
  assert.ok(chooseShopPlan(s, true));
  assert.ok(reportShopProgress(s, true));
  assert.match(s.events.at(-1)!, /\$666\.66 saved/);
  assert.ok(reportShopProgress(s, false));
  assert.equal(s.cash + s.bank, 66666);
  assert.equal(decode(JSON.stringify(s))!.familyStory!.shopPlan, "told");
});
for (const told of [true, false])
  test(`rescue pays once from pocket and savings, with ${told ? "grateful" : "surprised"} completion`, async () => {
    const s = saving();
    chooseShopPlan(s, told);
    s.cash = shopCost - 100;
    s.bank = 99;
    assert.equal(canSaveShop(s), false);
    assert.equal(saveRobertsons(s), false);
    s.bank = 300;
    assert.ok(canSaveShop(s));
    assert.ok(saveRobertsons(s));
    assert.equal(s.cash, 0);
    assert.equal(s.bank, 200);
    assert.equal(saveRobertsons(s), false);
    assert.equal(storyPhase(s), "shop-saved");
    assert.match(s.events.at(-1)!, told ? /overjoyed/ : /Surprised/);
    assert.ok(decode(JSON.stringify(s)));
    const context = journalContext(s);
    assert.equal(context.remaining, 0);
    assert.ok(validJournalContext(context));
    assert.ok((await constructJournal(context)).entry.includes("Robertson"));
  });
test("rescue story state cannot be attached to an unrelated quest or celebrated before payment", () => {
  const s = saving();
  s.familyStory!.shopCelebrated = true;
  assert.equal(decode(JSON.stringify(s)), null);
  s.familyStory!.shopCelebrated = undefined;
  s.familyStory!.shopPlan = "told";
  s.familyStory!.shopGoal = false;
  assert.equal(decode(JSON.stringify(s)), null);
  assert.equal(saveRobertsons(fresh()), false);
});
