import { test } from "node:test";
import assert from "node:assert/strict";
import { coinCandles, coinChart } from "../src/coin-chart";
test("candles use recorded prices, preserve continuity and bound highs/lows", () => {
  assert.deepEqual(coinCandles([100, 120, 80]), [
    { open: 100, close: 100, high: 100, low: 100 },
    { open: 100, close: 120, high: 120, low: 100 },
    { open: 120, close: 80, high: 120, low: 80 },
  ]);
  assert.equal(coinCandles(Array(100).fill(100)).length, 24);
});
test("new or imported coins render a finite chart without invented history", () => {
  for (const history of [[], [100], [1], [100000], [100, 90, 110]]) {
    const svg = coinChart(history, history.at(-1) ?? 100);
    assert.ok(svg.includes('role="img"'));
    assert.ok(!/NaN|Infinity/.test(svg));
    assert.equal(
      (svg.match(/class="coin-candle"/g) ?? []).length,
      Math.max(1, history.length),
    );
  }
});
