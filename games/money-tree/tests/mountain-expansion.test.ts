import { gardenBatch } from "../src/town-life";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  plantingBatch,
  plantBatch,
  plantingSeconds,
  harvest,
  growOvernight,
  water,
  buyHat,
} from "../src/game";
import { applyDebugAction } from "../src/debug-menu";
import { newMillionaire } from "../src/millionaire";
import { mountainHats } from "../src/hats";
import { mountainPlots } from "../src/millionaire-land";
import { createCoin, tickSigma, chadLine } from "../src/sigma";
import { plantCrop, harvestCrop, buyGardenSeeds } from "../src/garden-crops";
import { startMeal, finishMeal, meals } from "../src/meals";
const opened = () => {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.millionaire!.chats["visited-summit"] = 1;
  s.cash = 1000000;
  return s;
};
test("new hats are gated; terrace planting spends one seed per site without crossing levels", () => {
  const s = opened();
  s.millionaire!.chats = {};
  s.millionaire!.titheAccepted = false;
  assert.equal(buyHat(s, "terrace"), false);
  s.millionaire!.chats["visited-summit"] = 1;
  assert.ok(buyHat(s, "terrace"));
  assert.equal(mountainHats.length, 10);
  s.seeds = 100;
  s.plots = mountainPlots.map((p) => ({
    ...p,
    mountain: true,
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  }));
  const ids = plantingBatch(s, 0);
  assert.ok(ids.length > 2);
  assert.ok(plantBatch(s, ids));
  assert.equal(s.seeds, 100 - ids.length);
  assert.equal(s.plots.filter((p) => p.stage === "growing").length, ids.length);
  s.seeds = 2;
  const next = s.plots.findIndex((p) => p.stage === "empty");
  assert.equal(plantingBatch(s, next).length, 2);
});
test("Verdant Sprout speed and seed recovery, treasury deposits, and new ownership survive decode", () => {
  const s = opened();
  s.millionaire = undefined;
  s.hats = ["verdant", "treasury"];
  s.equippedHats = ["verdant", "treasury"];
  s.equippedHat = "treasury";
  s.shovel = true;
  s.bank = 0;
  assert.equal(plantingSeconds(s), 1.5);
  let seeds = 0;
  for (let i = 0; i < 1000; i++) {
    s.plots[0] = {
      stage: "ready",
      remaining: 0,
      fertilized: false,
      yield: 400,
    };
    harvest(s, 0);
  }
  seeds = s.seeds;
  assert.ok(seeds > 540 && seeds < 660);
  assert.equal(s.bank, 100000);
  assert.ok(decode(JSON.stringify(s)));
});
test("Seed ATM restocks money seeds and vegetables grow into new cooking combinations", () => {
  const s = opened();
  assert.ok(buyGardenSeeds(s, "money"));
  assert.equal(s.seeds, 5);
  assert.equal(s.cash, 995000);
  assert.ok(buyGardenSeeds(s, "pepper"));
  s.can = true;
  assert.ok(plantCrop(s, 0, "pepper"));
  assert.ok(water(s, 0));
  growOvernight(s);
  assert.ok(harvestCrop(s, 0));
  assert.equal(s.groceries!.pepper, 3);
  s.groceries!.tomato = 1;
  s.groceries!.eggs = 1;
  const recipe = startMeal(s);
  assert.equal(recipe, 49);
  finishMeal(s);
  assert.equal(s.foodBuff!.recipe, 49);
  assert.match(meals[recipe].name, /shakshuka/);
  assert.ok(decode(JSON.stringify(s)));
  s.cropSeeds!.iris = -1;
  assert.equal(decode(JSON.stringify(s)), null);
});
test("negative price factors cannot lower a sub-dollar coin or a crash-protected coin", () => {
  for (const start of [30, 500]) {
    const s = fresh();
    s.foundTVSeeds = s.communityPlanted = true;
    createCoin(s, "Recovery");
    s.coin!.price = s.coin!.exactPrice = start;
    s.coin!.recoverySeconds = start === 500 ? 180 : 0;
    for (let i = 0; i < 12; i++) {
      const before = s.coin!.exactPrice!;
      tickSigma(s, 15);
      assert.ok(s.coin!.exactPrice! >= before);
    }
    assert.equal(s.coin!.recoverySeconds, 0);
    assert.ok(decode(JSON.stringify(s)));
  }
});
test("daily trading target compounds 2% without being multiplied by frame frequency", () => {
  const s = fresh();
  s.foundTVSeeds = s.communityPlanted = true;
  createCoin(s, "Target");
  tickSigma(s, 15);
  const target = s.coin!.targetPrice!;
  s.day++;
  tickSigma(s, 15);
  assert.ok(Math.abs(s.coin!.targetPrice! - target * 1.02) < 1e-8);
  for (let i = 0; i < 100; i++) tickSigma(s, 0.01);
  assert.equal(s.coin!.targetPrice, target * 1.02);
});
test("mountain harvest and seedkeeper bonuses, compost doubling, and automatic crop watering work", async () => {
  const { plant, fertilize, movementSpeed } = await import("../src/game");
  const s = fresh();
  s.hats = ["harvest", "seedkeeper", "compost"];
  s.equippedHats = [...s.hats];
  s.equippedHat = "compost";
  s.foundTVSeeds = true;
  s.seeds = 1;
  s.plots[0] = {
    stage: "ready",
    remaining: 0,
    fertilized: true,
    yield: 900,
    mountain: true,
    x: 25,
    z: -340,
  };
  assert.equal(harvest(s, 0), 1080);
  s.plots[0].stage = "harvested";
  assert.ok(plant(s, 0));
  assert.ok(s.compostScraps! >= 2 && s.compostScraps! % 2 === 0);
  s.hats.push("dew", "alchemist", "trail");
  s.equippedHats = ["dew", "alchemist", "trail"];
  s.equippedHat = "trail";
  s.can = true;
  s.fertilizer = 1000;
  s.cropSeeds = { iris: 1 };
  assert.ok(plantCrop(s, 1, "iris"));
  assert.equal(s.plots[1].stage, "growing");
  const before = s.fertilizer;
  for (let i = 0; i < 1000; i++) {
    s.plots[2] = {
      stage: "growing",
      remaining: 180,
      fertilized: false,
      yield: 0,
    };
    fertilize(s, 2);
  }
  assert.equal(before - s.fertilizer, 1000);
  s.position = { x: 25, z: -340 };
  assert.equal(movementSpeed(s, false), 5.4);
});

test("Gigachad trading conversations remain valid saved progress", () => {
  const s = opened();
  s.communityPlanted = true;
  createCoin(s, "Chatter");
  chadLine(s, "gigachad");
  assert.equal(s.neighborChats.gigachad, 1);
  assert.ok(decode(JSON.stringify(s)));
});

test("planting access permanently keeps hats and seed ATM available without a Guardian greeting record", () => {
  const s = opened();
  Object.assign(s.millionaire!, {
    member: "fire",
    result: "fire",
    answers: Array(12).fill(2),
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
  });
  s.millionaire!.chats = {};
  assert.ok(buyHat(s, "dew"));
  const cash = s.cash;
  assert.ok(buyGardenSeeds(s, "money"));
  assert.equal(s.cash, cash - 5000);
  const restored = decode(JSON.stringify(s));
  assert.ok(restored);
  assert.ok(buyHat(restored, "harvest"));
  assert.ok(buyGardenSeeds(restored, "money"));
});

test("legacy Soyjak visit counters reload and cannot select a nonexistent dialogue role", () => {
  const s = opened();
  s.neighborChats.soyjak = 1;
  assert.ok(decode(JSON.stringify(s)));
  assert.equal(typeof chadLine(s, "soyjak"), "string");
  const restored = decode(JSON.stringify(s));
  assert.ok(restored);
  assert.equal(restored.neighborChats.soyjak, 2);
});

test("Terrace Conductor harvests all ready money trees on one tier only", () => {
  const s = fresh();
  s.hats = ["terrace"];
  s.equippedHats = ["terrace"];
  s.equippedHat = "terrace";
  s.plots.push(
    ...[
      { x: 25, z: -340 },
      { x: 43, z: -340 },
      { x: 25, z: -355 },
    ].map((p) => ({
      ...p,
      mountain: true,
      stage: "ready" as const,
      soilFilled: true,
      remaining: 0,
      fertilized: false,
      yield: 700,
    })),
  );
  assert.deepEqual(gardenBatch(s, 5, "harvest"), [5, 6]);
  s.plots[6].stage = "harvested";
  assert.deepEqual(gardenBatch(s, 5, "harvest"), [5]);
});
