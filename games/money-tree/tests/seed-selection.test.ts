import { unlockSigma } from "../src/sigma";
import test from "node:test";
import assert from "node:assert/strict";
import { fresh, decode, growOvernight, fertilize } from "../src/game";
import {
  activePlantingSeed,
  selectPlantingSeed,
  plantCrop,
} from "../src/garden-crops";
import { gardenBatch, compostFertilizer } from "../src/town-life";
test("selected seeds persist, depletion falls back, and unavailable seeds cannot be selected", () => {
  const s = fresh();
  s.seeds = 2;
  s.cropSeeds = { iris: 1, tomato: 2 };
  assert(selectPlantingSeed(s, "iris"));
  assert.equal(activePlantingSeed(s), "iris");
  assert.equal(decode(JSON.stringify(s))?.activeSeed, "iris");
  s.cropSeeds.iris = 0;
  assert.equal(activePlantingSeed(s), "money");
  s.seeds = 0;
  assert.equal(activePlantingSeed(s), "tomato");
  assert(!selectPlantingSeed(s, "pepper"));
  assert.equal(decode(JSON.stringify({ ...s, activeSeed: "bogus" })), null);
});
test("community beds accept crop seeds and retain them through save reload and overnight growth", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.cropSeeds = { tomato: 1 };
  unlockSigma(s);
  const i = 5;
  assert(plantCrop(s, i, "tomato"));
  assert.equal(s.cropSeeds.tomato, 0);
  s.plots[i].stage = "growing";
  growOvernight(s);
  assert.equal(s.plots[i].stage, "ready");
  assert.equal(decode(JSON.stringify(s))?.plots[i].crop, "tomato");
});
test("compost supplies fertilizer for an unfed growing tree without changing saved soil bags", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.compostScraps = 76;
  s.soilBags = 7;
  assert(compostFertilizer(s, true));
  assert.equal(s.fertilizer, 3);
  assert.equal(s.compostScraps, 1);
  assert.equal(s.soilBags, 7);
  s.plots[0].stage = "growing";
  assert(fertilize(s, 0));
  assert.equal(s.fertilizer, 2);
  assert.equal(decode(JSON.stringify(s))?.soilBags, 7);
});

test("mountain interaction batches accept manual fertilizer while automatic watering needs no job", () => {
  const s = fresh();
  s.fertilizer = 1;
  s.plots.push({
    stage: "growing",
    remaining: 180,
    fertilized: false,
    yield: 0,
    mountain: true,
    x: 43,
    z: -355,
  });
  assert.deepEqual(gardenBatch(s, 5, "water"), []);
  assert.deepEqual(gardenBatch(s, 5, "fertilize"), [5]);
  for (const i of gardenBatch(s, 5, "fertilize")) assert(fertilize(s, i));
  assert.equal(s.fertilizer, 0);
  assert.equal(s.plots[5].fertilized, true);
});
