import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode, sleep } from "../src/game";
import {
  DAY_SECONDS,
  NIGHT_SECONDS,
  tickNight,
  nightState,
  isNight,
  NightCombat,
} from "../src/night";
const state = () =>
  Object.assign(fresh(), { awake: true, cash: 2000, position: { x: 0, z: 0 } });
const night = () => {
  const s = state();
  tickNight(s, DAY_SECONDS);
  return s;
};
const clear = () => false;
test("five minutes daylight, two minutes night; asleep clocks pause and saves validate", () => {
  const s = state();
  assert.equal(tickNight(s, 299.9), undefined);
  assert(!isNight(s));
  assert.equal(tickNight(s, 0.1), "sunset");
  assert(isNight(s));
  assert.equal(tickNight(s, 119.9), undefined);
  assert.equal(tickNight(s, 0.1), "dawn");
  assert(!isNight(s));
  s.awake = false;
  tickNight(s, 300);
  assert.equal(nightState(s).elapsed, 0);
  assert(decode(JSON.stringify(fresh())));
  s.night = { elapsed: 320, hp: 6 };
  assert.equal(decode(JSON.stringify(s))?.night?.hp, 6);
  for (const n of [
    { elapsed: 420, hp: 10 },
    { elapsed: -1, hp: 10 },
    { elapsed: 300, hp: 11 },
    { elapsed: 300, hp: 1.5 },
  ]) {
    s.night = n;
    assert.equal(decode(JSON.stringify(s)), null);
  }
});
test("wallets take two bills, cows five; bills cost $1 and drops pay HP plus $1 exactly once", () => {
  for (const [kind, hp, payout] of [
    ["wallet", 2, 300],
    ["cow", 5, 600],
  ] as const) {
    const s = night(),
      c = new NightCombat();
    c.spawnIn = 999;
    const e = c.spawn(kind, 0, -2)!;
    for (let hit = 0; hit < hp; hit++) {
      assert(c.throwBill(s, 0, -1));
      c.update(s, 0.25, true, clear);
      assert.equal(e.hp, hp - hit - 1);
    }
    assert.equal(c.enemies.length, 0);
    assert.equal(s.cash, 2000 - hp * 100);
    s.position.z = -2;
    assert.equal(c.update(s, 0.01, true, clear).collected, payout);
    assert.equal(c.update(s, 0.01, true, clear).collected, 0);
    assert.equal(s.cash, 2000 - hp * 100 + payout);
  }
});
test("attacks enforce cash, cooldown and daytime restrictions; walls stop fast bills", () => {
  const s = state(),
    c = new NightCombat();
  assert(!c.throwBill(s, 0, -1));
  tickNight(s, 300);
  s.cash = 99;
  assert(!c.throwBill(s, 0, -1));
  s.cash = 100;
  assert(c.throwBill(s, 0, -1));
  assert(!c.throwBill(s, 0, -1));
  assert.equal(s.cash, 0);
  const e = c.spawn("wallet", 0, -2)!;
  c.spawnIn = 999;
  c.update(s, 0.25, true, (_x, z) => z < -0.5);
  assert.equal(e.hp, 2);
  assert.equal(c.bills.length, 0);
});
test("indoors are safe, contact has invulnerability, and cows only damage while charging", () => {
  const s = night(),
    c = new NightCombat();
  c.spawnIn = 999;
  c.spawn("wallet", 0, 0.1);
  c.update(s, 0.1, true, clear);
  assert.equal(nightState(s).hp, 10);
  c.update(s, 0.1, false, clear);
  assert.equal(nightState(s).hp, 8);
  c.update(s, 0.1, false, clear);
  assert.equal(nightState(s).hp, 8);
  c.reset();
  c.spawnIn = 999;
  const cow = c.spawn("cow", 0, 0.1)!;
  c.update(s, 0.1, false, clear);
  assert.equal(nightState(s).hp, 8);
  cow.phase = "charge";
  cow.timer = 1;
  cow.dx = 0;
  cow.dz = -1;
  c.update(s, 0.1, false, clear);
  assert.equal(nightState(s).hp, 3);
});
test("cow charges lock direction and morning restores health while preserving daily progression", () => {
  const s = night(),
    c = new NightCombat();
  c.spawnIn = 999;
  const cow = c.spawn("cow", 0, -6)!;
  c.update(s, 0.9, false, clear);
  const heading = [cow.dx, cow.dz];
  s.position.x = 9;
  c.update(s, 0.1, false, clear);
  assert.deepEqual([cow.dx, cow.dz], heading);
  nightState(s).hp = 0;
  const day = s.day;
  sleep(s, true);
  assert.equal(s.day, day + 1);
  assert.equal(nightState(s).hp, 10);
  assert(!isNight(s));
});

test("wallet attacks can kill the player, and actor pools stay bounded across waves", () => {
  const s = night(),
    c = new NightCombat();
  c.spawnIn = 999;
  for (let i = 0; i < 20; i++) c.spawn("wallet", 0, 0.1);
  assert.equal(c.enemies.length, 8);
  let result;
  for (let i = 0; i < 5; i++) result = c.update(s, 1, false, () => true);
  assert.equal(nightState(s).hp, 0);
  assert.equal(result?.died, true);
  c.reset();
  assert.equal(c.enemies.length, 0);
  assert.equal(c.bills.length, 0);
  assert.equal(c.loot.length, 0);
});
