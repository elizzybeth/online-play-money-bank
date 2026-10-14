import type { State } from "./game";
export type PriceSample = { day: number; tick: number; price: number };
export type Trader = {
  id: string;
  strategy: number;
  cash: number;
  units: number;
  initial: number;
  trades: number;
  lastProfit: number;
};
export const strategies = [
  "I follow momentum, buying after rises and taking profits when the trend weakens.",
  "I buy dips and sell when the price recovers toward its recent average.",
  "I trade against the crowd, selling rallies and buying fearful drops.",
  "I buy below my valuation and hold until the market catches up.",
  "I make small regular purchases, then rebalance when my holding gets too large.",
  "I protect my cash, entering only after a quiet stretch and leaving on sharp swings.",
  "I watch round numbers, buying rejected selloffs and selling near resistance.",
];
export function registerTraders(s: State, ids: string[]) {
  if (!s.coin) return;
  const c = s.coin;
  c.traders ??= [];
  ids.forEach((id, i) => {
    if (!c.traders!.some((t) => t.id === id))
      c.traders!.push({
        id,
        strategy: i % strategies.length,
        cash: 100000,
        units: 0,
        initial: 100000,
        trades: 0,
        lastProfit: 0,
      });
  });
}
export function traderFlow(s: State) {
  const c = s.coin;
  if (!c) return 0;
  const recent = c.history.slice(-8),
    average = recent.reduce((a, b) => a + b, 0) / recent.length,
    trend = c.price / (recent[0] ?? c.price) - 1;
  let flow = 0;
  for (const t of c.traders ?? []) {
    let side = 0;
    switch (t.strategy) {
      case 0:
        side = trend > 0.02 ? 1 : trend < -0.02 ? -1 : 0;
        break;
      case 1:
        side = c.price < average * 0.97 ? 1 : c.price > average * 1.03 ? -1 : 0;
        break;
      case 2:
        side = trend > 0.04 ? -1 : trend < -0.04 ? 1 : 0;
        break;
      case 3:
        side = c.price < 150 ? 1 : c.price > 240 ? -1 : 0;
        break;
      case 4:
        side = (t.units * c.price) / 1e6 > t.cash ? -1 : 1;
        break;
      case 5:
        side = Math.abs(trend) < 0.02 ? 1 : Math.abs(trend) > 0.06 ? -1 : 0;
        break;
      case 6:
        side = c.price % 10000 > 9500 ? -1 : c.price % 10000 < 500 ? 1 : 0;
    }
    // Strategies keep their personality but rebalance toward a 2% daily valuation.
    const target = c.targetPrice ?? c.price;
    if (c.price < target * 0.92) side = 1;
    if (c.price > target * 1.08) side = -1;
    const budget = Math.min(t.cash, 1000 + t.strategy * 113),
      quantity = Math.max(
        0,
        Math.min(1e12 - t.units, Math.floor((budget * 1e6) / c.price)),
      );
    if (side > 0 && quantity) {
      t.cash -= Math.ceil((quantity * c.price) / 1e6);
      t.units += quantity;
      t.trades++;
      flow += budget / 600000;
    }
    if (side < 0 && t.units) {
      const sold = Math.max(1, Math.floor(t.units * 0.18)),
        value = Math.floor((sold * c.price) / 1e6);
      t.units -= sold;
      t.cash += value;
      t.trades++;
      flow -= value / 600000;
    }
    t.lastProfit = Math.floor((t.units * c.price) / 1e6) + t.cash - t.initial;
  }
  const targetPull = Math.max(
    -0.02,
    Math.min(0.02, Math.log((c.targetPrice ?? c.price) / c.price) * 0.01),
  );
  return Math.max(-0.03, Math.min(0.03, flow + targetPull));
}
export function traderDialogue(s: State, id: string) {
  const t = s.coin?.traders?.find((t) => t.id === id);
  if (!t) return null;
  return `I aim for an average 2% per game day, with no promises about any one day. ${strategies[t.strategy]} ${t.trades ? `After ${t.trades} trades, my portfolio is ${t.lastProfit >= 0 ? "up" : "down"} $${(Math.abs(t.lastProfit) / 100).toFixed(2)} against my starting cash.` : "I have just started; I have not made a trade yet."}`;
}
export function roundResistance(
  before: number,
  proposed: number,
  random: number,
) {
  const crossed = Math.floor(before / 10000) !== Math.floor(proposed / 10000);
  if (!crossed || (before < 10000 && proposed < 10000)) return proposed;
  if (random > 0.78) return proposed;
  const boundary =
    proposed > before
      ? (Math.floor(before / 10000) + 1) * 10000
      : Math.floor(before / 10000) * 10000;
  return proposed > before
    ? Math.min(boundary - 1, before + (proposed - before) * 0.22)
    : Math.min(
        before,
        Math.max(boundary + 1, before + (proposed - before) * 0.22),
      );
}
export function samplePrice(s: State) {
  const c = s.coin;
  if (!c) return;
  c.marketTick = (c.marketTick ?? 0) + 1;
  (c.samples ??= []).push({ day: s.day, tick: c.marketTick, price: c.price });
  c.samples = c.samples.filter((p) => p.day >= s.day - 3).slice(-4096);
}
export function rangePrices(s: State, range: "current" | "day" | "three") {
  const c = s.coin;
  if (!c) return [];
  if (range === "current") return c.history;
  return (c.samples ?? [])
    .filter((p) => p.day >= s.day - (range === "day" ? 1 : 3))
    .map((p) => p.price);
}
export function validMarket(c: {
  samples?: PriceSample[];
  traders?: Trader[];
  marketTick?: number;
}) {
  return (
    (c.marketTick === undefined ||
      (Number.isSafeInteger(c.marketTick) && c.marketTick >= 0)) &&
    (c.samples === undefined ||
      (Array.isArray(c.samples) &&
        c.samples.length <= 4096 &&
        c.samples.every(
          (p) =>
            Number.isSafeInteger(p.day) &&
            p.day >= 1 &&
            Number.isSafeInteger(p.tick) &&
            p.tick >= 0 &&
            Number.isInteger(p.price) &&
            p.price >= 1 &&
            p.price <= 100000,
        ))) &&
    (c.traders === undefined ||
      (Array.isArray(c.traders) &&
        c.traders.length <= 50 &&
        new Set(c.traders.map((t) => t.id)).size === c.traders.length &&
        c.traders.every(
          (t) =>
            typeof t.id === "string" &&
            t.id.length <= 80 &&
            Number.isInteger(t.strategy) &&
            t.strategy >= 0 &&
            t.strategy < 7 &&
            t.units <= 1e12 &&
            [t.cash, t.units, t.initial, t.trades].every(
              (n) => Number.isSafeInteger(n) && n >= 0,
            ) &&
            Number.isSafeInteger(t.lastProfit),
        )))
  );
}
