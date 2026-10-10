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
