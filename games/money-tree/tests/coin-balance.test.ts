import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import { createCoin, tickSigma } from "../src/sigma";
import { registerTraders } from "../src/market";
import { advanceAdventure, landMeteor } from "../src/adventure";
function market(seed: number) {
  const s = fresh();
  s.awake = true;
  s.foundTVSeeds = s.communityPlanted = true;
  createCoin(s, "Balance");
  s.coin!.rng = seed;
  registerTraders(
    s,
    Array.from({ length: 7 }, (_, i) => `sigma-chad-${i}`),
  );
  return s;
}
test("late-game neglect and recurrent meteors do not pin the market below a dollar", () => {
  let below = 0,
    total = 0;
  const finals: number[] = [];
  let up = 0,
    down = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const s = market(97213 + seed * 7919);
    for (let day = 1; day <= 30; day++) {
      s.day = day;
      for (let i = 0; i < 120; i++) {
        const before = s.coin!.price;
        tickSigma(s, 15);
        const born = advanceAdventure(s, 15);
        if (born) landMeteor(s, born.id);
        if (s.coin!.price > before * 1.25) up++;
        if (s.coin!.price < before * 0.75) down++;
        if (day > 20) {
          total++;
          if (s.coin!.price < 100) below++;
        }
      }
    }
    finals.push(s.coin!.price);
  }
  assert.ok(below / total < 0.1);
  assert.ok(up > 0 && down > 0);
  assert.ok(finals.every((p) => p > 100 && p < 20000));
});
test("an existing penny-price save recovers gradually without a hard dollar floor", () => {
  const s = market(97213);
  s.day = 21;
  s.coin!.price = s.coin!.exactPrice = 1;
  const restored = decode(JSON.stringify(s))!;
  assert.ok(restored);
  tickSigma(restored, 15);
  assert.ok(restored.coin!.price < 100);
  for (let i = 0; i < 300; i++) tickSigma(restored, 15);
  assert.ok(restored.coin!.price > 100);
  assert.ok(restored.coin!.price < 2000);
});
