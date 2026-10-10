import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  plant,
  water,
  tick,
  sleep,
  plantingBatch,
  plantBatch,
  decode,
} from "../src/game";
import { paintColors, validBirdhousePaint } from "../src/birdhouse-paint";
test("only sleep matures watered crops; unwatered seeds wait and ready crops stay ready", () => {
  const s = fresh();
  s.can = true;
  s.seeds = 2;
  plant(s, 0);
  water(s, 0);
  plant(s, 1);
  tick(s, 86400);
  assert.equal(s.plots[0].stage, "growing");
  assert.equal(s.plots[0].yield, 0);
  sleep(s);
  assert.equal(s.plots[0].stage, "ready");
  assert.equal(s.plots[1].stage, "planted");
  const earned = s.plots[0].yield;
  sleep(s);
  assert.equal(s.plots[0].yield, earned);
});
test("Twin Planter uses exactly two adjacent eligible beds and cancels atomically", () => {
  const s = fresh();
  s.seeds = 3;
  s.hats = ["inspector"];
  s.equippedHat = "inspector";
  assert.deepEqual(plantingBatch(s, 0), [0, 1]);
  s.plots[1].stage = "planted";
  assert.equal(plantBatch(s, [0, 1]), false);
  assert.equal(s.seeds, 3);
  assert.equal(s.plots[0].stage, "empty");
  s.plots[1].stage = "empty";
  assert(plantBatch(s, plantingBatch(s, 0)));
  assert.equal(s.seeds, 1);
  assert.deepEqual(plantingBatch(s, 2), [2]);
  s.seeds = 2;
  s.plots[3].soilFilled = false;
  assert.deepEqual(plantingBatch(s, 2), [2]);
});
test("paint choices persist safely and a painted birdhouse day does not add an extra house at sleep", () => {
  const s = fresh();
  s.day = 4;
  s.birdhousesBuilt = 2;
  s.birdhousePaintDay = 4;
  s.birdhousePaint = [
    { body: paintColors[0].hex, roof: paintColors[5].hex },
    { body: paintColors[1].hex, roof: paintColors[3].hex },
  ];
  assert(validBirdhousePaint(s.birdhousePaint));
  assert.deepEqual(decode(JSON.stringify(s))!.birdhousePaint, s.birdhousePaint);
  sleep(s);
  assert.equal(s.birdhousesBuilt, 2);
  assert(!validBirdhousePaint([{ body: "invalid", roof: paintColors[0].hex }]));
});
