import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  plant,
  decode,
  momStatus,
  momReply,
  water,
  fertilize,
  harvest,
} from "../src/game";
import {
  compostSoil,
  buySpanakopita,
  shareSpanakopita,
  gardenBatch,
} from "../src/town-life";
import { marketSignals, createCoin, tickSigma } from "../src/sigma";
import { notebookLines, notebookSpreads } from "../src/notebook-layout";
test("compost only starts in Sigma, awards 1 to 3 on dead-tree replanting and trades exactly 25 for soil", () => {
  const s = fresh();
  s.seeds = 10;
  s.plots[0].stage = "harvested";
  plant(s, 0);
  assert.equal(s.compostScraps, undefined);
  s.foundTVSeeds = true;
  s.plots[0].stage = "harvested";
  plant(s, 0);
  assert(s.compostScraps! >= 1 && s.compostScraps! <= 3);
  const before = s.compostScraps;
  plant(s, 1);
  assert.equal(s.compostScraps, before);
  s.compostScraps = 24;
  assert.equal(compostSoil(s), false);
  s.compostScraps = 27;
  assert(compostSoil(s));
  assert.equal(s.compostScraps, 2);
  assert.equal(s.soilBags, 1);
  assert.equal(decode(JSON.stringify({ ...s, compostScraps: -1 })), null);
  assert.equal(decode(JSON.stringify(s))?.compostScraps, 2);
});
test("spanakopita purchase and sharing conserve cash and items and survive reload", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.cash = 299;
  assert.equal(buySpanakopita(s), false);
  s.cash = 600;
  assert(buySpanakopita(s));
  assert.equal(s.cash, 300);
  assert.equal(decode(JSON.stringify(s))?.spanakopita, 1);
  assert(shareSpanakopita(s));
  assert.equal(s.spanakopita, 0);
  assert.equal(shareSpanakopita(s), false);
});
test("Twin Planter batches water, fertilizer and harvest with per-bed costs", () => {
  const s = fresh();
  s.hats = ["inspector"];
  s.equippedHat = "inspector";
  s.equippedHats = ["inspector"];
  s.can = true;
  s.fertilizer = 2;
  s.plots[0].stage = s.plots[1].stage = "planted";
  assert.deepEqual(gardenBatch(s, 0, "water"), [0, 1]);
  gardenBatch(s, 0, "water").forEach((i) => water(s, i));
  assert.equal(s.plots[1].stage, "growing");
  assert.deepEqual(gardenBatch(s, 0, "fertilize"), [0, 1]);
  gardenBatch(s, 0, "fertilize").forEach((i) => fertilize(s, i));
  assert.equal(s.fertilizer, 0);
  s.plots[0].stage = s.plots[1].stage = "ready";
  s.plots[0].yield = s.plots[1].yield = 400;
  assert.deepEqual(gardenBatch(s, 0, "harvest"), [0, 1]);
  assert.equal(
    gardenBatch(s, 0, "harvest").reduce((n, i) => n + harvest(s, i), 0),
    800,
  );
});
test("Mom's recent visits affect the coin signal and new bacon dialogue reloads", () => {
  const s = fresh();
  s.day = 10;
  assert.equal(marketSignals(s).momRecent, false);
  s.momLastTalkDay = 8;
  assert.equal(marketSignals(s).momRecent, true);
  s.day = 11;
  assert.equal(marketSignals(s).momRecent, false);
  s.day = Array.from({ length: 200 }, (_, i) => i + 1).find(
    (day) => momStatus(day).activity === "bacon",
  )!;
  assert(s.day);
  assert.match(momReply(s), /best bacon sandwich/);
  assert(decode(JSON.stringify(s)));
});
test("notebook wraps every word and paginates into both leaves without dropping lines", () => {
  const paragraphs = [
    "A warm home with a little garden.",
    "Oneverylongwordthatneedstowrap and more words.",
  ];
  const lines = notebookLines(paragraphs, 10, (s) => s.length);
  assert(lines.every((s) => s.length <= 10));
  const spreads = notebookSpreads(lines, 3);
  assert.deepEqual(spreads.flat(2), lines);
  assert(spreads.every((s) => s[0].length <= 3 && s[1].length <= 3));
});

test("spanakopita and chicken cuddles are persistent coin-price signals", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.cash = 600;
  assert.equal(marketSignals(s).spanakopita, 0);
  assert.equal(marketSignals(s).chickenCuddles, 0);
  buySpanakopita(s);
  assert.equal(marketSignals(s).spanakopita, 1);
  shareSpanakopita(s);
  assert.equal(marketSignals(s).spanakopitaShared, 1);
  s.chickenCuddles = 3;
  const saved = decode(JSON.stringify(s))!;
  assert.equal(marketSignals(saved).chickenCuddles, 3);
  assert.equal(marketSignals(saved).spanakopitaShared, 1);
  assert.equal(decode(JSON.stringify({ ...s, chickenCuddles: -1 })), null);
});

test("spanakopita and cuddles independently change prices with the same random swings", () => {
  const base = fresh();
  base.foundTVSeeds = true;
  base.communityPlanted = true;
  assert(createCoin(base, "Family coin"));
  for (const change of [
    (s: typeof base) => (s.spanakopita = 1),
    (s: typeof base) => (s.spanakopitaShared = 1),
    (s: typeof base) => (s.chickenCuddles = 1),
  ]) {
    const control = decode(JSON.stringify(base))!,
      s = decode(JSON.stringify(base))!;
    change(s);
    tickSigma(control, 15);
    tickSigma(s, 15);
    assert(s.coin!.exactPrice! > control.coin!.exactPrice!);
  }
});
