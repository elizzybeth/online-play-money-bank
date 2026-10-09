import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAmount,
  neighborLine,
  summarizeDay,
  momStatus,
  findCapSeeds,
  findHiddenSeeds,
  momReply,
  buyGardenSupply,
  placeGardenBed,
  fillGardenBed,
  fresh,
  buy,
  plant,
  water,
  tick,
  harvest,
  sleep,
  load,
  decode,
  withdraw,
  deposit,
  recover,
  move,
  blocked,
  fertilize,
  clearPosition,
} from "../src/game";
test("opening economy, withering and seed hunt loop", () => {
  const s = fresh();
  assert.equal(s.bank, 433);
  withdraw(s);
  for (const item of ["seeds", "shovel", "can"] as const) assert(buy(s, item));
  assert.equal(s.cash, 33);
  assert.equal(s.seeds, 5);
  assert(!buy(s, "fertilizer"));
  for (let i = 0; i < 5; i++) {
    assert(plant(s, i));
    assert(water(s, i));
  }
  tick(s, 179);
  assert(s.plots.every((p) => p.stage === "growing"));
  tick(s, 1);
  for (let i = 0; i < 5; i++) {
    const n = harvest(s, i);
    assert(n >= 200 && n <= 700);
    assert.equal(harvest(s, i), 0);
    assert(!water(s, i));
  }
  assert(!buy(s, "seeds"));
  assert(findCapSeeds(s));
  assert(!findCapSeeds(s));
  for (let i = 0; i < 5; i++) {
    assert(plant(s, i));
    assert(water(s, i));
  }
  deposit(s);
  assert(s.bank >= 1033);
  sleep(s);
  assert.equal(s.day, 2);
  assert(s.journal[1].includes("Harvested"));
  assert(s.plots.every((p) => p.stage === "ready"));
  assert.deepEqual(load(JSON.stringify(s)), s);
});
test("tools, transaction atomicity, fertilizer and recovery", () => {
  const s = fresh();
  assert(!buy(s, "seeds"));
  assert(!plant(s, 0));
  s.seeds = 1;
  assert(plant(s, 0));
  assert(!plant(s, 0));
  assert(!water(s, 0));
  s.bank = 0;
  assert(recover(s));
  assert(!recover(s));
  assert(water(s, 0));
  s.fertilizer = 1;
  assert(fertilize(s, 0));
  assert.equal(s.plots[0].remaining, 120);
  assert(!fertilize(s, 0));
  tick(s, 120);
  assert(s.plots[0].yield >= 400);
  const before = JSON.stringify(s);
  assert(!buy(s, "fertilizer"));
  assert.equal(JSON.stringify(s), before);
});
test("malformed saves and invalid time are safe", () => {
  for (const raw of [
    "oops",
    "{}",
    JSON.stringify({ ...fresh(), cash: -1 }),
    JSON.stringify({ ...fresh(), position: { x: "x", z: 0 } }),
  ])
    assert.deepEqual(
      { ...load(raw), seedStashSpot: 0 },
      { ...fresh(), seedStashSpot: 0 },
    );
  const s = fresh();
  const unchanged = JSON.stringify(s);
  tick(s, NaN);
  assert.equal(JSON.stringify(s), unchanged);
});
test("swept movement cannot tunnel, can slide and traverse doors", () => {
  const wall = [{ x: 0, z: 0, w: 1, d: 8 }];
  const p = { x: -2, z: 0 };
  move(p, 20, 0, wall);
  assert(p.x < -0.79);
  assert(!blocked(p.x, p.z, wall));
  move(p, 2, 2, wall);
  assert(p.z > 1.9);
  const doorway = [
    { x: -2, z: 0, w: 2, d: 0.25 },
    { x: 2, z: 0, w: 2, d: 0.25 },
  ];
  const q = { x: 0, z: 3 };
  move(q, 0, -6, doorway);
  assert(q.z < -2.9);
});
test("new tree collisions move overlapping players onto nearby clear ground", () => {
  const rects = [{ x: -20, z: 19, w: 0.28, d: 0.28 }];
  for (const pos of [
    { x: -20, z: 19 },
    { x: -19.8, z: 19.2 },
  ]) {
    const safe = clearPosition(pos, rects);
    assert(!blocked(safe.x, safe.z, rects));
    assert(Math.hypot(safe.x - pos.x, safe.z - pos.z) < 1);
    move(safe, 0, 1, rects);
    assert(!blocked(safe.x, safe.z, rects));
  }
  const clear = { x: -16, z: 4 };
  assert.equal(clearPosition(clear, rects), clear);
  assert.deepEqual(clearPosition({ x: 200, z: 200 }, rects), clear);
});
test("random actions preserve nonnegative inventory and bounded yields", () => {
  const s = fresh();
  s.cash = 100000;
  let seed = 17;
  for (let k = 0; k < 5000; k++) {
    seed = (seed * 16807) % 2147483647;
    const i = seed % 5;
    switch (seed % 7) {
      case 0:
        buy(s, "seeds");
        break;
      case 1:
        buy(s, "can");
        break;
      case 2:
        plant(s, i);
        break;
      case 3:
        water(s, i);
        break;
      case 4:
        tick(s, 15);
        break;
      case 5:
        harvest(s, i);
        break;
      case 6:
        buy(s, "fertilizer");
        fertilize(s, i);
    }
    assert(s.cash >= 0 && s.seeds >= 0 && s.fertilizer >= 0);
    assert(s.plots.every((p) => p.yield >= 0 && p.yield <= 700));
  }
  assert.deepEqual(load(JSON.stringify(s)), s);
});

test("import decoder accepts formatted fresh saves and rejects invalid data", () => {
  const s = fresh();
  assert.deepEqual(decode(JSON.stringify(s, null, 2)), s);
  assert.equal(decode("{}"), null);
  assert.equal(decode("bad"), null);
});

test("legacy saves migrate seed progression without losing balances", () => {
  const s = fresh();
  withdraw(s);
  buy(s, "seeds");
  const legacy = JSON.parse(JSON.stringify(s));
  delete legacy.boughtSeeds;
  delete legacy.foundCapSeeds;
  const restored = decode(JSON.stringify(legacy))!;
  assert.equal(restored.cash, 233);
  assert.equal(restored.boughtSeeds, true);
  assert.equal(restored.foundCapSeeds, false);
  assert(!buy(restored, "seeds"));
  const before = JSON.stringify(restored);
  assert(!findCapSeeds({ ...fresh() }));
  assert.equal(JSON.stringify(restored), before);
});

test("five dollars buys one fertilizer application for exactly one tree", () => {
  const s = fresh();
  s.cash = 500;
  s.can = true;
  s.seeds = 2;
  assert(buy(s, "fertilizer"));
  assert.equal(s.cash, 0);
  assert.equal(s.fertilizer, 1);
  assert(plant(s, 0));
  assert(plant(s, 1));
  assert(water(s, 0));
  assert(water(s, 1));
  assert.equal(s.fertilizer, 1);
  assert.equal(s.plots[0].fertilized, false);
  assert(fertilize(s, 0));
  assert.equal(s.fertilizer, 0);
  assert(!fertilize(s, 1));
});

test("journal groups repeated work and reflects on day-one surgery money", () => {
  const events = [
    "Talked with Mom before heading out.",
    "Visited Ol’ Man Robertson at the store.",
    ...Array(5).fill("Planted a money seed."),
    ...Array(5).fill("Watered a money tree."),
    "Harvested $2.00 from a money tree.",
    "Harvested $3.00 from a money tree.",
  ];
  const entry = summarizeDay(1, events);
  assert(entry.includes("planting 5 seeds"));
  assert(entry.includes("watering 5 times"));
  assert(entry.includes("Harvested $5.00"));
  assert(entry.includes("drop in the bucket"));
  assert(!entry.includes("Planted a money seed."));
  assert(entry.length < 650);
  const legacy = {
    ...fresh(),
    journal: [fresh().journal[0], `Day 1 — ${events.join(" ")}`],
  };
  assert.equal(decode(JSON.stringify(legacy))!.journal[1], entry);
});
test("Mom has tired days and five distinct good-day activities", () => {
  assert(!momStatus(1).energetic);
  assert(momStatus(1).thought.includes("tired"));
  assert.deepEqual(
    [2, 4, 6, 8, 10].map((day) => momStatus(day).activity),
    ["cooking", "birdhouses", "painting", "reading", "garden"],
  );
  assert(momStatus(10).reply.includes("ugly"));
  assert(momStatus(10).reply.includes("thank you"));
});

test("neighbors vary every conversation and remember their place after a save", () => {
  const s = fresh();
  for (const id of ["npc1", "npc2", "npc3"]) {
    const lines = Array.from({ length: 16 }, () => neighborLine(s, id));
    assert.equal(new Set(lines).size, 16);
  }
  const restored = decode(JSON.stringify(s))!;
  assert.deepEqual(restored.neighborChats, s.neighborChats);
  assert.equal(neighborLine(restored, "npc2"), neighborLine(s, "npc2"));
  assert.equal(
    decode(JSON.stringify({ ...fresh(), neighborChats: { npc2: -1 } })),
    null,
  );
});

test("legacy growing trees migrate to three minutes without losing growth progress", () => {
  const old = JSON.parse(JSON.stringify(fresh()));
  delete old.boughtSeeds;
  delete old.foundCapSeeds;
  delete old.neighborChats;
  old.plots[0] = {
    stage: "growing",
    remaining: 45,
    fertilized: false,
    yield: 0,
  };
  const restored = decode(JSON.stringify(old))!;
  assert.equal(restored.plots[0].remaining, 90);
  assert.equal(decode(JSON.stringify(restored))!.plots[0].remaining, 90);
});

test("partial piggy-bank transfers use exact cents and reject overdrafts", () => {
  const s = fresh();
  assert(withdraw(s, 200));
  assert.equal(s.bank, 233);
  assert.equal(s.cash, 200);
  assert(deposit(s, 67));
  assert.equal(s.bank, 300);
  assert.equal(s.cash, 133);
  const before = JSON.stringify(s);
  assert(!withdraw(s, 301));
  assert(!deposit(s, 134));
  assert(!deposit(s, -1));
  assert.equal(JSON.stringify(s), before);
  assert.equal(parseAmount("1.33"), 133);
  assert.equal(parseAmount(".50"), 50);
  for (const input of ["1.001", "-1", "0", "1e3", "abc"])
    assert.equal(parseAmount(input), null);
});

test("seed stashes unlock in order, collect once, and persist their random spot", () => {
  const s = fresh();
  assert(!findHiddenSeeds(s, "forest"));
  assert(!findHiddenSeeds(s, "store"));
  s.boughtSeeds = true;
  findCapSeeds(s);
  assert(findHiddenSeeds(s, "forest"));
  assert(!findHiddenSeeds(s, "forest"));
  assert(findHiddenSeeds(s, "store"));
  assert(!findHiddenSeeds(s, "store"));
  assert.equal(s.seeds, 15);
  assert.deepEqual(decode(JSON.stringify(s)), s);
  const legacy = {
    ...s,
    seedStashSpot: undefined,
    foundForestSeeds: undefined,
    foundStoreSeeds: undefined,
  };
  const restored = decode(JSON.stringify(legacy))!;
  assert.equal(restored.bank, s.bank);
  assert.equal(restored.foundForestSeeds, false);
  assert(restored.seedStashSpot! >= 0 && restored.seedStashSpot! < 5);
});
test("Mom's replies change on repeat visits and remember their place", () => {
  for (const day of [1, 2, 4, 6, 8, 10]) {
    const s = fresh();
    s.day = day;
    const lines = Array.from({ length: 4 }, () => momReply(s));
    assert.equal(new Set(lines).size, 4);
    assert.equal(momReply(decode(JSON.stringify(s))!), momReply(s));
  }
});

test("beds and soil are separate purchases; placement respects property and obstacles", () => {
  const s = fresh();
  s.cash = 5000;
  s.seeds = 1;
  assert(buyGardenSupply(s, "bed"));
  assert.equal(s.cash, 2000);
  assert.equal(s.gardenBeds, 1);
  assert(buyGardenSupply(s, "soil"));
  assert.equal(s.cash, 1000);
  assert.equal(s.soilBags, 1);
  assert(!placeGardenBed(s, 10, 20, []));
  assert(!placeGardenBed(s, -20, 19, []));
  assert(!placeGardenBed(s, -24, 19, [{ x: -24, z: 19, w: 1, d: 1 }]));
  assert.equal(s.gardenBeds, 1);
  assert(placeGardenBed(s, -24, 19, []));
  assert.equal(s.plots.length, 6);
  assert.equal(s.gardenBeds, 0);
  assert(!plant(s, 5));
  assert.equal(s.seeds, 1);
  assert(fillGardenBed(s, 5));
  assert.equal(s.soilBags, 0);
  assert(!fillGardenBed(s, 5));
  assert(plant(s, 5));
  assert.deepEqual(decode(JSON.stringify(s)), s);
  assert(!buyGardenSupply({ ...s, cash: 2999 }, "bed"));
  assert(!buyGardenSupply({ ...s, cash: 999 }, "soil"));
});
