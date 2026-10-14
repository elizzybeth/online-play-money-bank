import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { DailyNetLedger } from "../src/daily-net";
test("daily net tracks receipts and spending, ignores bank transfers, survives saves and resets each day", () => {
  const s = fresh(),
    ledger = new DailyNetLedger(s);
  s.cash += 500;
  ledger.update(s);
  assert.equal(s.dailyNet, 500);
  s.cash -= 200;
  ledger.update(s);
  assert.equal(s.dailyNet, 300);
  s.bank += 100;
  s.cash -= 100;
  ledger.update(s);
  assert.equal(s.dailyNet, 300);
  ledger.update(s);
  assert.equal(s.dailyNet, 300);
  const imported = decode(JSON.stringify(s))!;
  ledger.update(imported);
  assert.equal(imported.dailyNet, 300);
  imported.day++;
  ledger.update(imported);
  assert.equal(imported.dailyNet, 0);
  imported.cash -= 500;
  ledger.update(imported);
  assert.equal(imported.dailyNet, -500);
});

test("eager interest and housing entries are reconciled once against liquid money", async () => {
  const { dailyEconomy } = await import("../src/adventure");
  const { buyMansion, housingDay, sellMansion } =
    await import("../src/housing");
  const { newMillionaire } = await import("../src/millionaire");
  const s = fresh();
  s.bank = 10000;
  const ledger = new DailyNetLedger(s);
  dailyEconomy(s);
  ledger.update(s);
  assert.equal(s.dailyNet, 500);
  ledger.update(s);
  assert.equal(s.dailyNet, 500);
  s.cash = 200000;
  ledger.update(s);
  const before = s.dailyNet!;
  s.millionaire = {
    ...newMillionaire(),
    unlocked: true,
    afterPepe: 10000,
    member: "fire",
    titheAccepted: true,
    mountainEarned: 100000,
  };
  assert.ok(buyMansion(s, "hearst", true));
  ledger.update(s);
  assert.equal(s.dailyNet, before - 100000);
  housingDay(s);
  ledger.update(s);
  assert.equal(s.dailyNet, before - 101000);
  const total = s.cash + s.bank;
  assert.ok(sellMansion(s));
  const receipt = s.cash + s.bank - total;
  ledger.update(s);
  assert.equal(s.dailyNet, before - 101000 + receipt);
});
