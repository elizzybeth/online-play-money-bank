import { createCoin, investCoin, sellCoin, coinValue } from "../src/sigma";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  plant,
  water,
  growOvernight,
  harvest,
  sleep,
  deposit,
  withdraw,
} from "../src/game";
import {
  markPepeBaseline,
  recordEarnings,
  answerAssessment,
  assessment,
  joinFellowship,
  retakeAssessment,
  acceptTithe,
  mansionCount,
  buyApp,
  validMillionaire,
} from "../src/millionaire";
test("Level 3 counts fresh post-Pepe earnings, not savings or old earnings", () => {
  const s = fresh();
  s.totalEarned = 90000;
  s.bank = 1000000;
  assert.equal(recordEarnings(s, 10000), 10000);
  assert.equal(s.millionaire, undefined);
  s.pepePopped = true;
  markPepeBaseline(s);
  recordEarnings(s, 9999);
  assert.equal(s.millionaire!.unlocked, false);
  recordEarnings(s, 1);
  assert.equal(s.millionaire!.unlocked, true);
  const events = s.events.length;
  recordEarnings(s, 100);
  assert.equal(s.events.length, events);
});
test("assessment, retakes and membership gifts are atomic and one-time", () => {
  const s = fresh();
  s.pepePopped = true;
  markPepeBaseline(s);
  recordEarnings(s, 10000);
  assert.equal(answerAssessment(s, 3), false);
  assessment.forEach(() => answerAssessment(s, 1));
  assert.equal(s.millionaire!.result, "bridge");
  assert.equal(joinFellowship(s, "fire"), false);
  assert.equal(joinFellowship(s, "bridge"), true);
  assert.equal(s.seeds, 1);
  assert.equal(joinFellowship(s, "bridge"), false);
  assert.equal(acceptTithe(s), true);
  assert.equal(s.seeds, 26);
  assert.equal(acceptTithe(s), false);
  retakeAssessment(s);
  assessment.forEach(() => answerAssessment(s, 2));
  joinFellowship(s, "fire");
  assert.equal(s.seeds, 26);
  assert.equal(validMillionaire(s.millionaire), true);
});
test("tithing applies to new earnings and mountain wealth builds six mansions by $1000", () => {
  const s = fresh();
  s.pepePopped = true;
  markPepeBaseline(s);
  recordEarnings(s, 10000);
  assessment.forEach(() => answerAssessment(s, 0));
  joinFellowship(s, "arms");
  acceptTithe(s);
  assert.equal(recordEarnings(s, 700), 630);
  assert.equal(s.millionaire!.tithed, 70);
  assert.equal(mansionCount(s.millionaire), 0);
  assert.equal(recordEarnings(s, 100000, true), 90000);
  assert.equal(mansionCount(s.millionaire), 6);
  s.cash = 499;
  assert.equal(buyApp(s, 0), false);
  s.cash = 1000;
  assert.equal(buyApp(s, 0), true);
  assert.equal(s.cash, 500);
  assert.equal(buyApp(s, 0), false);
  assert.equal(validMillionaire({ ...s.millionaire, apps: [0, 0] }), false);
  assert.equal(validMillionaire({ ...s.millionaire, member: "bogus" }), false);
});

test("mountain planting grows overnight with fertilizer, saves reload and transfers are not tithed", () => {
  const s = fresh();
  s.pepePopped = true;
  s.pepeShowStarted = true;
  s.pepeInflation = 12;
  markPepeBaseline(s);
  recordEarnings(s, 10000);
  assessment.forEach(() => answerAssessment(s, 2));
  joinFellowship(s, "fire");
  acceptTithe(s);
  s.can = true;
  s.cash = 1000;
  const index = s.plots.findIndex((p) => p.mountain);
  assert(plant(s, index));
  assert(s.plots[index].fertilized);
  assert(water(s, index));
  growOvernight(s);
  assert.equal(s.plots[index].stage, "ready");
  s.plots[index].yield = 900;
  assert.equal(harvest(s, index), 810);
  assert.equal(s.millionaire!.mountainEarned, 900);
  const tithed = s.millionaire!.tithed;
  assert(deposit(s, 100));
  assert(withdraw(s, 100));
  assert.equal(s.millionaire!.tithed, tithed);
  const restored = decode(JSON.stringify(s));
  assert(restored);
  assert.deepEqual(restored.millionaire, s.millionaire);
  assert.equal(restored.plots.filter((p) => p.mountain).length, 32);
});

test("coin tithing excludes recovered principal, tracks partial-sale basis and losses", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.communityPlanted = true;
  s.cash = 10000;
  s.pepePopped = true;
  markPepeBaseline(s);
  recordEarnings(s, 10000);
  assessment.forEach(() => answerAssessment(s, 0));
  joinFellowship(s, "arms");
  acceptTithe(s);
  assert(createCoin(s, "Test"));
  assert(investCoin(s, 10000));
  s.coin!.price = 200;
  assert(sellCoin(s, 10000));
  assert.equal(s.cash, 9500);
  assert.equal(s.coin!.basis, 5000);
  assert.equal(s.millionaire!.tithed, 500);
  assert(sellCoin(s));
  assert.equal(s.cash, 19000);
  assert.equal(s.millionaire!.tithed, 1000);
  assert(investCoin(s, 10000));
  s.coin!.price = 100;
  assert(sellCoin(s));
  assert.equal(s.millionaire!.tithed, 1000);
  assert.equal(s.coin!.basis, 0);
});
