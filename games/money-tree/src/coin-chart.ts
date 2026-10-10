// Each candle represents an observed 15-second price interval. We do not
// invent intratick highs or lows, or historical prices before the coin existed.
export function coinCandles(history: number[]) {
  return history.slice(-24).map((close, i, prices) => {
    const open = i ? prices[i - 1] : close;
    return {
      open,
      close,
      high: Math.max(open, close),
      low: Math.min(open, close),
    };
  });
}
export function coinChart(history: number[], price: number) {
  const candles = coinCandles(history.length ? history : [price]);
  const low = Math.min(...candles.map((c) => c.low)),
    high = Math.max(...candles.map((c) => c.high));
  const padding = Math.max(2, (high - low) * 0.15);
  const min = Math.max(0, low - padding),
    max = high + padding;
  const y = (p: number) => 210 - ((p - min) / (max - min)) * 180;
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const value = min + ((max - min) * i) / 4,
      yy = y(value);
    return `<path d="M16 ${yy} H548" stroke="#dfe7ed"/><text x="555" y="${yy + 4}" fill="#475b68" font-size="12">$${(value / 100).toFixed(2)}</text>`;
  }).join("");
  const bars = candles
    .map((c, i) => {
      const x = 28 + i * 21,
        color = c.close >= c.open ? "#16846d" : "#d94355";
      return `<g class="coin-candle"><title>Price interval ${i + 1}: open $${(c.open / 100).toFixed(2)}, close $${(c.close / 100).toFixed(2)}</title><path d="M${x} ${y(c.high)} V${y(c.low)}" stroke="${color}" stroke-width="2"/><rect x="${x - 6}" y="${Math.min(y(c.open), y(c.close))}" width="12" height="${Math.max(2, Math.abs(y(c.open) - y(c.close)))}" fill="${color}"/></g>`;
    })
    .join("");
  return `<figure class="coin-chart"><svg viewBox="0 0 640 240" role="img" aria-label="Coin price candlestick chart. ${candles.length} recorded price intervals, latest price $${(price / 100).toFixed(2)}.">${ticks}${bars}<path d="M16 ${y(price)} H548" stroke="#16846d" stroke-dasharray="4 4"/><text x="16" y="235" fill="#475b68" font-size="12">15 seconds per candle · recent game time</text></svg><figcaption>${candles.length === 1 ? "Your coin just started. More candles appear as you play." : "Recorded prices. Green is up, red is down."}</figcaption></figure>`;
}
