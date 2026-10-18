import { mountainPlots, fertileMountainSoil } from "../src/millionaire-land";
import { createCoin, investCoin, sellCoin, coinValue } from "../src/sigma";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  plant,
  water,
  fertilize,
  growOvernight,
  harvest,
  sleep,
  deposit,
  withdraw,
} from "../src/game";
import {
  markPepeBaseline,
  migrateMillionaire,
  recordEarnings,
  answerAssessment,
  assessment,
  joinFellowship,
  retakeAssessment,
  acceptTithe,
  mansionCount,
  buyApp,
  validMillionaire,
  ensureMountainPlots,
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
  assert.equal(recordEarnings(s, 17000, true), 15300);
  assert.equal(mansionCount(s.millionaire), 1);
  assert(
    s.events.some(
      (e) =>
        e.startsWith("One Child of ") && e.includes("One of six now lives"),
    ),
  );
  assert.equal(recordEarnings(s, 83000, true), 74700);
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

test("mountain planting is auto-watered, fertilizer is manual, saves reload and transfers are not tithed", () => {
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
  assert.equal(s.plots[index].fertilized, false);
  s.fertilizer = 1;
  assert(fertilize(s, index));
  assert.equal(s.fertilizer, 0);
  assert(s.plots[index].fertilized);
  assert.equal(s.plots[index].stage, "growing");
  assert.equal(water(s, index), false);
  growOvernight(s);
  assert.equal(s.plots[index].stage, "ready");
  s.plots[index].yield = 900;
  assert.equal(harvest(s, index), 810);
  assert.equal(s.millionaire!.mountainEarned, 900);
  const tithed = s.millionaire!.tithed;
  const pocketBefore = s.cash,
    bankBefore = s.bank;
  assert(deposit(s, 100));
  assert.equal(s.bank, bankBefore + 100);
  assert.equal(s.cash, pocketBefore - 100);
  assert(withdraw(s, 100));
  assert.equal(s.cash, pocketBefore);
  assert.equal(s.bank, bankBefore);
  assert.equal(s.millionaire!.tithed, tithed);
  const restored = decode(JSON.stringify(s));
  assert(restored);
  assert.deepEqual(restored.millionaire, s.millionaire);
  assert.equal(
    restored.plots.filter((p) => p.mountain).length,
    mountainPlots.length,
  );
});

test("coin sales are exempt from tithing and retain partial-sale basis tracking", () => {
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
  assert.equal(s.cash, 10000);
  assert.equal(s.coin!.basis, 5000);
  assert.equal(s.millionaire!.tithed, 0);
  assert(sellCoin(s));
  assert.equal(s.cash, 20000);
  assert.equal(s.millionaire!.tithed, 0);
  assert(investCoin(s, 10000));
  s.coin!.price = 100;
  assert(sellCoin(s));
  assert.equal(s.millionaire!.tithed, 0);
  assert.equal(s.coin!.basis, 0);
});

test("legacy saves recover recorded post-Pepe income without including earlier harvests or savings", () => {
  const s = fresh();
  s.pepePopped = true;
  s.pepeShowStarted = true;
  s.pepeInflation = 12;
  s.day = 4;
  s.totalEarned = 900000;
  s.bank = 10000000;
  s.journalHistory = [
    { day: 1, earned: 50000, available: 50000, events: ["Harvested $500.00."] },
    {
      day: 2,
      earned: 5300,
      available: 55300,
      events: [
        "Harvested $50.00.",
        "The giant Pepe balloon popped. Green scraps scattered.",
        "Harvested $3.00.",
      ],
    },
    { day: 3, earned: 9500, available: 64800, events: ["Harvested $95.00."] },
  ];
  s.events = ["Harvested $2.00."];
  const restored = decode(JSON.stringify(s));
  assert(restored);
  assert.equal(restored.millionaire!.afterPepe, 10000);
  assert.equal(restored.millionaire!.unlocked, true);
  assert.equal(restored.cash, s.cash);
  assert.equal(restored.bank, s.bank);
  assert(!migrateMillionaire(restored));
  assert.equal(restored.millionaire!.afterPepe, 10000);
  const old = fresh();
  old.pepePopped = true;
  old.totalEarned = 900000;
  old.bank = 10000000;
  migrateMillionaire(old);
  assert.equal(old.millionaire!.afterPepe, 0);
  assert.equal(old.millionaire!.unlocked, false);
});

test("old mountain gardens migrate to one hundred sites without losing a planted tree", () => {
  const s = fresh();
  s.pepePopped = true;
  markPepeBaseline(s);
  recordEarnings(s, 10000);
  assessment.forEach(() => answerAssessment(s, 0));
  joinFellowship(s, "arms");
  acceptTithe(s);
  const first = s.plots.find((p) => p.mountain)!;
  first.x = 82;
  first.z = -340;
  first.stage = "planted";
  s.plots = s.plots.filter((p) => !p.mountain || p === first);
  ensureMountainPlots(s);
  assert.equal(s.plots.filter((p) => p.mountain).length, mountainPlots.length);
  assert.equal(first.stage, "growing");
  assert.equal(first.fertilized, false);
  assert.equal(first.remaining, 180);
  assert(fertileMountainSoil(first.x!, first.z!));
  const coordinates = s.plots
    .filter((p) => p.mountain)
    .map((p) => `${p.x},${p.z}`);
  assert.equal(new Set(coordinates).size, mountainPlots.length);
  assert.equal(ensureMountainPlots(s), false);
});
