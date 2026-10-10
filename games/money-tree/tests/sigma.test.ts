import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  plant,
  water,
  tick,
  harvest,
  movementSpeed,
  plantingSeconds,
  momStatus,
  findHiddenSeeds,
} from "../src/game";
import {
  sigmaPlots,
  unlockSigma,
  createCoin,
  investCoin,
  sellCoin,
  coinValue,
  tickSigma,
  buyDrink,
  chadLibrary,
  chadLine,
  marketSignals,
  healthDay,
} from "../src/sigma";
import {
  writeBranchedDay,
  constructJournal,
  newNarrativeMemory,
} from "../src/branching-journal";
import { journalContext } from "../src/journal";
const unlocked = () => {
  const s = fresh();
  s.foundGardenSeeds = true;
  assert(findHiddenSeeds(s, "tv"));
  return s;
};
test("fifth packet unlocks ten unique sigma plots once, preserving existing beds and resources", () => {
  const s = fresh();
  s.plots.push({
    x: -26,
    z: 19,
    soilFilled: true,
    stage: "ready",
    yield: 500,
    remaining: 0,
    fertilized: false,
  });
  assert(!unlockSigma(s));
  s.foundGardenSeeds = true;
  assert(findHiddenSeeds(s, "tv"));
  assert.equal(s.plots.length, 16);
  assert.equal(s.plots[5].yield, 500);
  assert(!unlockSigma(s));
  assert.equal(new Set(sigmaPlots.map((p) => `${p.x},${p.z}`)).size, 10);
  assert.equal(sigmaPlots.filter((p) => p.z === -76).length, 3);
  assert.equal(sigmaPlots.filter((p) => p.z === -58.5).length, 3);
  assert.equal(decode(JSON.stringify(s))!.plots.length, 16);
  assert(
    s.plots.filter((p) => p.community).every((p) => p.stage === "harvested"),
  );
});
test("public planting opens coin offer, spend/sell is conservative, names and invalid saves are handled", () => {
  const s = unlocked();
  s.cash = 1000;
  s.can = true;
  s.shovel = true;
  assert(!createCoin(s, "Test"));
  assert(plant(s, 5));
  assert(s.communityPlanted);
  assert(createCoin(s, "Mom Fund"));
  assert(!createCoin(s, "Other"));
  assert(!investCoin(s, 1001));
  assert(!investCoin(s, -10));
  assert(investCoin(s, 200));
  assert.equal(s.cash, 800);
  assert.equal(coinValue(s), 200);
  assert(sellCoin(s));
  assert.equal(s.cash, 1000);
  assert(!sellCoin(s));
  const bad = { ...s, coin: { ...s.coin, name: "<script>" } };
  assert.equal(decode(JSON.stringify(bad))!.coin, undefined);
  const nested = { ...s, coin: { ...s.coin, name: {} } };
  assert.equal(decode(JSON.stringify(nested))!.cash, 1000);
  assert.equal(decode(JSON.stringify(s))!.coin!.name, "Mom Fund");
});
test("coin market is deterministic across reload, bounded, variable and influenced by actual signals", () => {
  const s = unlocked();
  s.communityPlanted = true;
  createCoin(s, "Small Steps");
  s.cash = 10000;
  investCoin(s, 1000);
  const clone = decode(JSON.stringify(s))!;
  for (let i = 0; i < 100; i++) {
    tickSigma(s, 15);
    tickSigma(clone, 15);
  }
  assert.deepEqual(s.coin, clone.coin);
  assert(new Set(s.coin!.history).size > 1);
  assert.equal(s.cash, 9000);
  s.bank = 50000;
  s.totalEarned = 25000;
  s.neighborChats.npc1 = 1;
  plant(s, 5);
  assert.equal(marketSignals(s).earned, 25000);
  assert.equal(marketSignals(s).neighbors, 1);
  assert.equal(marketSignals(s).trees, 1);
  tickSigma(s, 1e7);
  assert(s.coin!.price >= 1 && s.coin!.price <= 100000);
  assert(s.coin!.history.length <= 24);
  assert.equal(healthDay(29).longest, 3);
  assert(
    momStatus(27).energetic &&
      momStatus(28).energetic &&
      momStatus(29).energetic,
  );
});
test("coffee bonuses apply, replace and expire without corrupting standard growth or harvest balance", () => {
  const s = unlocked();
  s.cash = 10000;
  s.can = true;
  s.shovel = true;
  assert(buyDrink(s, "sprint"));
  assert.equal(movementSpeed(s, false), 5.2);
  assert(buyDrink(s, "dig"));
  assert.equal(movementSpeed(s, false), 4);
  assert.equal(plantingSeconds(s), 1);
  assert(buyDrink(s, "growth"));
  plant(s, 5);
  water(s, 5);
  tick(s, 60);
  assert.equal(s.plots[5].remaining, 120);
  assert(buyDrink(s, "yield"));
  s.plots[5].stage = "ready";
  s.plots[5].yield = 700;
  assert.equal(harvest(s, 5), 700);
  tickSigma(s, 180);
  assert(!s.drink);
  assert.equal(plantingSeconds(s), 2);
});
test("every Chad has 20 distinct standalone lines, fresh until pool exhaustion", () => {
  assert.equal(chadLibrary.length, 7);
  for (let i = 0; i < 6; i++) {
    assert.equal(new Set(chadLibrary[i]).size, 20);
    const s = fresh();
    const seen = new Set();
    for (let n = 0; n < 20; n++) seen.add(chadLine(s, `sigma-chad-${i}`));
    assert.equal(seen.size, 20);
    assert(decode(JSON.stringify(s)));
  }
  assert(chadLibrary[1].some((t) => t.includes("not very sigma")));
});
test("journal reflects actual community planting and does not pretend investment is guaranteed", () => {
  const s = unlocked();
  s.events = [];
  plant(s, 5);
  const c = journalContext(s);
  for (let seed = 1; seed <= 1000; seed++) {
    const result = constructJournal(c, newNarrativeMemory(seed));
    assert(
      result.selections.some((id) => id.startsWith("sigmaGarden:")),
      `Missing public garden branch for seed ${seed}`,
    );
    assert(
      !result.selections.some((id) =>
        /sigmaCoin|sigmaInvest|sigmaSale/.test(id),
      ),
    );
    assert(!result.entry.includes("—"));
    assert(
      !/A Chad said|heard Chad|Chad made a face|Chad complained|Chad had opinions|Chad is going to complain/i.test(
        result.entry,
      ),
    );
  }
});

test("health streak signals count good days across every schedule boundary", () => {
  let run = 0,
    best = 0;
  for (let day = 1; day <= 365; day++) {
    run = momStatus(day).energetic ? run + 1 : 0;
    best = Math.max(best, run);
    assert.equal(healthDay(day).longest, best);
  }
});
test("seed-recovery coffee does not accelerate tree growth", () => {
  const s = unlocked();
  s.can = true;
  s.cash = 1000;
  plant(s, 5);
  water(s, 5);
  buyDrink(s, "growth");
  s.drink!.remaining = 1;
  tick(s, 60);
  assert.equal(s.plots[5].remaining, 120);
  tickSigma(s, 60);
  assert(!s.drink);
});

test("selling a coin is reflected without incorrectly claiming no money came in", () => {
  const s = unlocked();
  s.harvestReflected = true;
  s.communityPlanted = true;
  createCoin(s, "Test");
  s.cash = 1000;
  investCoin(s, 100);
  s.events = [];
  sellCoin(s);
  assert.match(writeBranchedDay(s), /sold|coins|coin holding|money came out/i);
});

test("low-priced coins retain fractional movement instead of freezing through rounding", () => {
  const s = unlocked();
  s.communityPlanted = true;
  createCoin(s, "Tiny");
  s.coin!.price = 3;
  s.coin!.exactPrice = 3;
  const prices = new Set<number>();
  for (let i = 0; i < 1000; i++) {
    tickSigma(s, 15);
    prices.add(s.coin!.price);
  }
  assert(prices.size > 1);
  assert(decode(JSON.stringify(s))!.coin);
});

test("community-garden criticism enters the journal only after hearing the actual dialogue", () => {
  const s = unlocked();
  s.events = [];
  plant(s, 5);
  s.events.push(
    "Heard Chad: A community garden? Sharing soil is not very sigma.",
  );
  const c = journalContext(s);
  for (let seed = 1; seed <= 1000; seed++) {
    const result = constructJournal(c, newNarrativeMemory(seed));
    assert(
      result.selections.some((id) => id.startsWith("sigmaGardenCriticism:")),
    );
  }
});

test("cold brew recovers seeds at harvest, with at most one even when stacked with Sprout Cap", () => {
  for (const cap of [false, true]) {
    let recovered = 0;
    for (let i = 1; i <= 100; i++) {
      const s = unlocked();
      s.drink = { id: "growth", remaining: 180 };
      s.rng = i * 2147483;
      if (cap) {
        s.hats = ["cap"];
        s.equippedHat = "cap";
      }
      s.plots[5] = { ...s.plots[5], stage: "ready", yield: 200 };
      const before = s.seeds;
      harvest(s, 5);
      const gained = s.seeds - before;
      assert(gained === 0 || gained === 1);
      recovered += gained;
      assert(decode(JSON.stringify(s)));
    }
    assert(recovered >= (cap ? 65 : 40) && recovered <= (cap ? 85 : 60));
  }
});
test("partial coin sales retain remaining units without creating money", () => {
  const s = unlocked();
  s.cash = 10000;
  s.communityPlanted = true;
  assert(createCoin(s, "Test"));
  assert(investCoin(s, 5000));
  s.coin!.price = 137;
  const before = coinValue(s),
    units = s.coin!.units,
    cash = s.cash;
  assert(sellCoin(s, 1234));
  assert.equal(s.cash, cash + 1234);
  assert(s.coin!.units > 0 && s.coin!.units < units);
  assert(coinValue(s) + 1234 <= before);
  assert(decode(JSON.stringify(s)));
  const snapshot = JSON.stringify(s);
  assert(!sellCoin(s, coinValue(s) + 1));
  assert(!sellCoin(s, -1));
  assert(!sellCoin(s, 1.5));
  assert.equal(JSON.stringify(s), snapshot);
  assert(sellCoin(s));
  assert.equal(s.coin!.units, 0);
});
