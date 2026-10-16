import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { newMillionaire } from "../src/millionaire";
import { buyMansion } from "../src/housing";
import { plantCrop } from "../src/garden-crops";
import {
  beginMansionConversation,
  canTellMomAboutMansion,
  mansionConversation,
  gardenConversation,
  replyToMom,
  homeGardenReplanted,
} from "../src/mom-home-story";
function estate() {
  const s = fresh();
  s.cash = 100000;
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 10000,
    welcomeSeed: true,
    summitSeeds: true,
    apps: [0, 1, 2, 3, 4, 5],
    unlocked: true,
    member: "fire",
    titheAccepted: true,
    mountainEarned: 100000,
  };
  assert(buyMansion(s, "hearst", true));
  return s;
}
test("every mansion reason and invitation respects Mom’s decision and survives save/reload", () => {
  for (let reason = 0; reason < mansionConversation[0].replies.length; reason++)
    for (
      let appeal = 0;
      appeal < mansionConversation[1].replies.length;
      appeal++
    ) {
      let s = estate();
      assert(canTellMomAboutMansion(s));
      assert(beginMansionConversation(s));
      assert.equal(s.momHomeStory!.mansionStage, 1);
      assert(replyToMom(s, "mansion", reason));
      assert.match(
        mansionConversation[s.momHomeStory!.mansionStage! - 1].text,
        /happy here at home/,
      );
      s = decode(JSON.stringify(s))!;
      assert(s);
      assert(replyToMom(s, "mansion", appeal));
      assert.match(
        mansionConversation[s.momHomeStory!.mansionStage! - 1].text,
        /little house, the chickens, and the birdhouses/,
      );
      assert(replyToMom(s, "mansion", 0));
      assert.equal(s.momHomeStory!.mansionStage, 4);
      assert(!canTellMomAboutMansion(s));
      assert(!beginMansionConversation(s));
      assert(!replyToMom(s, "mansion", 0));
      assert(decode(JSON.stringify(s)));
    }
});
test("replacing a home money tree with any crop unlocks the garden conversation, without requiring a mansion", () => {
  for (const crop of ["iris", "pepper", "tomato"] as const) {
    const s = fresh();
    s.plots[0].stage = "harvested";
    s.cropSeeds = { [crop]: 1 };
    assert(!homeGardenReplanted(s));
    assert(plantCrop(s, 0, crop));
    assert(homeGardenReplanted(s));
    s.momHomeStory = { gardenStage: 1 };
    assert(replyToMom(s, "garden", 2));
    assert.match(gardenConversation[1].text, /can we afford/);
    for (const line of gardenConversation[1].replies)
      assert.match(line, /You’re worth it/);
    assert(replyToMom(s, "garden", 0));
    assert.equal(s.momHomeStory.gardenStage, 3);
    assert.equal(s.momHomeStory.gardenDay, s.day);
    assert(decode(JSON.stringify(s)));
    assert(!replyToMom(s, "garden", 0));
  }
});
test("legacy moving/bed flags remain readable and malformed story progress is rejected", () => {
  const s = estate();
  s.housing!.movingInSeen = false;
  s.housing!.momBed = true;
  assert(decode(JSON.stringify(s)));
  for (const momHomeStory of [
    { mansionStage: 5 },
    { gardenStage: -1 },
    { gardenStage: 3, gardenDay: s.day + 1 },
    [],
  ])
    assert.equal(decode(JSON.stringify({ ...s, momHomeStory })), null);
  assert(!replyToMom(s, "mansion", -1));
  assert(!replyToMom(s, "garden", 99));
});
