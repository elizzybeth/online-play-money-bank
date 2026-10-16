import { newMillionaire } from "../src/millionaire";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import {
  dailyEconomy,
  requestFeather,
  noteChickenCuddle,
  giveFeather,
  cuddleNeglect,
  advanceAdventure,
  landMeteor,
  collectMeteorPacket,
  meteorPacketPosition,
} from "../src/adventure";
import {
  buyMansion,
  housingDay,
  housingSaleValue,
  sellMansion,
  mansionPrice,
} from "../src/housing";
import {
  roundResistance,
  registerTraders,
  traderFlow,
  rangePrices,
  samplePrice,
} from "../src/market";
import { createCoin } from "../src/sigma";
import { newPhoneGame, phoneKey, claimPhoneReward } from "../src/phone-games";
import {
  onMillionaireApproach,
  desertReflections,
  chooseDesertReflection,
  shuffledAnswers,
} from "../src/desert-reflections";
function estate() {
  const s = fresh();
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 10000,
    welcomeSeed: true,
    summitSeeds: true,
    unlocked: true,
    member: "fire",
    titheAccepted: true,
    mountainEarned: 100000,
    apps: [0, 1, 2, 3, 4, 5],
  };
  s.cash = 100000;
  return s;
}
function coin() {
  const s = estate();
  s.foundTVSeeds = true;
  s.communityPlanted = true;
  createCoin(s, "Feather");
  return s;
}
test("daily interest compounds once per day, survives reload and settles before a mortgage", () => {
  let s = fresh();
  s.bank = 10000;
  dailyEconomy(s);
  assert.equal(s.bank, 10500);
  dailyEconomy(s);
  assert.equal(s.bank, 10500);
  s = decode(JSON.stringify(s))!;
  dailyEconomy(s);
  assert.equal(s.bank, 10500);
  s.day++;
  dailyEconomy(s);
  assert.equal(s.bank, 11025);
});
test("Mom receives the requested named feather exactly once and Fancy Chicken cannot supply one", () => {
  const s = fresh();
  requestFeather(s);
  assert.equal(noteChickenCuddle(s, "Fancy Chicken"), false);
  assert.equal(s.adventure?.feather, undefined);
  noteChickenCuddle(s, "Cluck");
  assert.equal((s.adventure as any)?.feather?.chicken, "Cluck");
  assert.equal(giveFeather(s), "Cluck");
  assert.equal(giveFeather(s), null);
  s.day += 4;
  assert.equal(cuddleNeglect(s), 4);
  noteChickenCuddle(s, "Luck");
  assert.equal(cuddleNeglect(s), 0);
});
test("mortgage eligibility, pocket-first fallback, equity and eviction are exact", () => {
  const s = estate();
  s.millionaire!.mountainEarned = 99999;
  assert.equal(buyMansion(s, "hearst", true), false);
  s.millionaire!.mountainEarned = 100000;
  assert.equal(buyMansion(s, "hearst", true), true);
  assert.equal(s.housing!.balance, mansionPrice - 100000);
  s.cash = 600;
  s.bank = 800;
  housingDay(s);
  assert.equal(s.cash, 0);
  assert.equal(s.bank, 400);
  assert.equal(s.housing!.principalPaid, 600);
  assert.equal(s.housing!.balance, 99899400);
  assert.equal(housingSaleValue(s), 110660);
  housingDay(s);
  assert.equal(s.bank, 400);
  s.day++;
  housingDay(s);
  assert.equal(s.housing!.status, "evicted");
  assert.equal(sellMansion(s), false);
});
test("housing market follows a lagged coin price; no-coin resale uses 1.1", () => {
  const s = coin();
  buyMansion(s, "vernon", true);
  s.cash = 100000;
  const base = s.housing!.market;
  s.coin!.price = 200;
  for (let i = 0; i < 3; i++) {
    s.day++;
    housingDay(s);
    assert.equal(s.housing!.market, base);
  }
  s.day++;
  housingDay(s);
  assert.ok(s.housing!.market > base);
  delete s.coin;
  assert.equal(
    housingSaleValue(s),
    Math.round((100000 + s.housing!.principalPaid) * 1.1),
  );
  assert.equal(sellMansion(s), true);
});
test("meteors recur every four to six active minutes without sleeping, remain bounded, and crash exactly once each", () => {
  const s = coin();
  s.coin!.price = 10000;
  s.coin!.exactPrice = 10000;
  advanceAdventure(s, 1);
  const m = advanceAdventure(s, 300)!;
  assert.ok(m);
  assert.equal(landMeteor(s, m.id), true);
  assert.equal(s.coin!.price, 8200);
  assert.equal(landMeteor(s, m.id), false);
  assert.equal(s.coin!.price, 8200);
  for (let i = 0; i < 50; i++) {
    const delay = s.adventure!.meteorNextAt! - s.adventure!.awakeSeconds!;
    assert.ok(delay >= 240 && delay <= 360);
    const next = advanceAdventure(s, delay)!;
    assert.ok(next);
    landMeteor(s, next.id);
  }
  assert.equal(s.adventure!.meteors!.length, 6);
  assert.equal(s.adventure!.nextMeteorId, 52);
});
test("round-number resistance works in both directions but sometimes allows a crossing", () => {
  assert.ok(roundResistance(9990, 10200, 0.5) < 10000);
  assert.ok(roundResistance(10010, 9800, 0.5) > 10000);
  assert.equal(roundResistance(9990, 10200, 0.9), 10200);
  assert.equal(roundResistance(2400, 2500, 0.5), 2500);
});
test("trader strategies use their own budgets, move price flow, report real returns, and history retains observed days", () => {
  const s = coin();
  registerTraders(s, ["a", "b", "c", "d", "e", "f", "g"]);
  assert.equal(s.coin!.traders!.length, 7);
  const cash = s.cash;
  assert.notEqual(traderFlow(s), 0);
  assert.equal(s.cash, cash);
  s.day = 2;
  s.coin!.price = 120;
  samplePrice(s);
  s.day = 4;
  s.coin!.price = 140;
  samplePrice(s);
  assert.deepEqual(rangePrices(s, "day"), [140]);
  assert.deepEqual(rangePrices(s, "three"), [100, 120, 140]);
  assert.ok(decode(JSON.stringify(s)));
});
test("all phone games accept WASD and arrows across repeated fresh sessions; rewards pay once", () => {
  for (let kind = 0; kind < 6; kind++)
    for (let session = 0; session < 4; session++) {
      const g = newPhoneGame(kind, 17 + session);
      assert.equal(phoneKey(g, "D"), true);
      assert.equal(phoneKey(g, "ArrowLeft"), true);
      if (kind === 4) {
        phoneKey(g, "ArrowDown");
        assert.equal(g.cursor, 4);
        phoneKey(g, "Enter");
        assert.deepEqual(g.revealed, [4]);
      }
      g.score = 10;
      g.complete = true;
      const s = estate();
      assert.equal(claimPhoneReward(s, g), true);
      assert.equal(claimPhoneReward(s, g), false);
      assert.equal(s.cash, 100100);
    }
});
test("one hundred reflections are unique and locked topics cannot leak; shuffling preserves answer meanings", () => {
  const lines = desertReflections.flatMap(([, lines]) => lines);
  assert.equal(lines.length, 100);
  assert.equal(new Set(lines).size, 100);
  const s = fresh();
  for (let i = 0; i < 20; i++)
    assert.ok(
      desertReflections[0][1].includes(
        chooseDesertReflection(s, () => 0) as any,
      ),
    );
  assert.equal(new Set(s.adventure!.reflections).size, 20);
  assert.deepEqual(shuffledAnswers([0, 1, 2], () => 0).sort(), [0, 1, 2]);
});

test("a meteor without a launched coin records the discovery without inventing a price crash", () => {
  const s = estate();
  s.day = 2;
  s.adventure = { meteorCadence: 1, meteorNextDay: 2, meteorNextAt: 0 };
  const m = advanceAdventure(s, 1)!;
  landMeteor(s, m.id);
  assert.match(s.events.at(-1)!, /money tree/);
  assert.doesNotMatch(s.events.at(-1)!, /coin|tumbl|plung/);
  assert.ok(decode(JSON.stringify(s)));
});

test("legacy meteor plots recover their recorded ID without changing progress", () => {
  const s = fresh();
  s.day = 21;
  s.cash = 810;
  s.bank = 116837;
  s.adventure = {
    meteors: [
      {
        id: 1,
        day: 21,
        x: -80,
        z: -180,
        landed: false,
        harvested: false,
        crashed: false,
      },
    ],
  };
  landMeteor(s, 1);
  const index = s.adventure.meteors![0].plot!;
  delete s.plots[index].meteor;
  s.plots[index].stage = "harvested";
  s.plots[index].yield = 0;
  const restored = decode(JSON.stringify(s));
  assert.ok(restored);
  assert.equal(restored.plots[index].meteor, 1);
  assert.equal(restored.plots[index].stage, "harvested");
  assert.equal(restored.day, 21);
  assert.equal(restored.bank, 116837);
  assert.equal(restored.cash, 810);
  assert.ok(decode(JSON.stringify(restored)));
  s.plots[index].x = -81;
  assert.equal(decode(JSON.stringify(s)), null);
});

test("repeat meteor impact remains a valid save while flying and after landing", () => {
  const s = coin();
  for (let i = 0; i < 8; i++) {
    s.day = s.adventure?.meteorNextDay ?? 2;
    s.adventure ??= {};
    s.adventure.meteorNextDay = s.day;
    s.adventure.meteorCadence = 1;
    s.adventure.meteorNextAt = 0;
    const m = advanceAdventure(s, 10)!;
    assert.ok(m);
    assert.ok(decode(JSON.stringify(s)), `flying meteor ${m.id}`);
    if (m.id > 6) {
      const oldExport = structuredClone(s);
      oldExport.plots[m.plot!].meteor = m.id - 6;
      const repaired = decode(JSON.stringify(oldExport));
      assert.ok(repaired, "old repeat-flight export");
      assert.equal(repaired.plots[m.plot!].meteor, m.id);
      assert.equal(repaired.cash, oldExport.cash);
      assert.deepEqual(repaired.coin, oldExport.coin);
    }
    landMeteor(s, m.id);
    assert.ok(decode(JSON.stringify(s)), `landed meteor ${m.id}`);
  }
  assert.equal(s.adventure!.meteors!.length, 6);
  const damaged = structuredClone(s);
  damaged.adventure!.meteors![0].plot = damaged.plots.length + 1;
  assert.equal(decode(JSON.stringify(damaged)), null);
});

test("Mom does not request a completed feather gift again that day", () => {
  const s = fresh();
  assert.ok(requestFeather(s));
  noteChickenCuddle(s, "Cluck");
  assert.equal(requestFeather(s), false);
  giveFeather(s);
  assert.equal(requestFeather(s), false);
  s.day++;
  s.events = [];
  assert.ok(requestFeather(s));
});

test("mansion reflections never ask for a bed or moving Mom", () => {
  const s = estate();
  buyMansion(s, "hearst", true);
  s.housing!.momBed = true;
  for (let i = 0; i < 100; i++)
    assert.doesNotMatch(
      chooseDesertReflection(s, () => i / 100) ?? "",
      /Mom needs a bed|room for Mom/,
    );
});

test("mountain reflections are restricted to the four-metre approach lane", () => {
  for (const z of [-145, -210, -310, -339])
    for (const x of [32, 34, 36])
      assert.equal(onMillionaireApproach({ x, z }), true);
  for (const [x, z] of [
    [-14, -310],
    [88, -340],
    [60, -312],
    [34, -131],
    [38, -210],
    [34, -350],
    [34, -144],
    [34, -340],
  ])
    assert.equal(onMillionaireApproach({ x, z }), false);
});

test("meteor packets scatter ten unique pickups and collection survives reload exactly once", () => {
  const s = coin();
  s.adventure = { meteorCadence: 1, meteorNextAt: 0 };
  const m = advanceAdventure(s, 1)!;
  landMeteor(s, m.id);
  assert.equal(m.seedPackets, 1023);
  const sites = Array.from({ length: 10 }, (_, i) =>
    meteorPacketPosition(m, i),
  );
  assert.equal(new Set(sites.map((p) => `${p.x},${p.z}`)).size, 10);
  assert(sites.every((p) => Math.hypot(p.x - m.x, p.z - m.z) < 5));
  const before = s.seeds;
  assert(collectMeteorPacket(s, m.id, 2));
  assert.equal(s.seeds, before + 5);
  assert(!collectMeteorPacket(s, m.id, 2));
  assert(!collectMeteorPacket(s, m.id, 10));
  const restored = decode(JSON.stringify(s))!;
  assert(restored);
  assert(!collectMeteorPacket(restored, m.id, 2));
  assert(collectMeteorPacket(restored, m.id, 3));
});
test("old meteor day schedules migrate to a five-minute active timer and preserve it on reload", () => {
  const s = coin();
  s.adventure = { meteorNextDay: 90, meteorNextAt: 0, awakeSeconds: 100 };
  assert.equal(advanceAdventure(s, 1), null);
  const restored = decode(JSON.stringify(s))!;
  assert(restored);
  assert.equal(advanceAdventure(restored, 299), null);
  assert(advanceAdventure(restored, 1));
});
