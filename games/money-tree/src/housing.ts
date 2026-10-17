import type { State } from "./game";
export type MansionStyle = "hearst" | "vernon";
export type Housing = {
  style: MansionStyle;
  status: "owned" | "evicted" | "sold";
  mortgage: boolean;
  downpayment: number;
  principalPaid: number;
  balance: number;
  lastPaymentDay: number;
  /** Legacy save fields; Mom always remains at the little house. */
  movingInSeen: boolean;
  evictionSeen: boolean;
  momBed: boolean;
  storeOpened: boolean;
  purchaseCoinPrice?: number;
  market: number;
  prices: number[];
};
export const mansionPrice = 100_000_000;
export const mansionLot = { x: 88, z: -340, w: 34, d: 24 };
export const marvelsLot = { x: -34, z: -318, w: 20, d: 18 };
export function spendFunds(s: State, amount: number) {
  if (!Number.isSafeInteger(amount) || amount < 0 || s.cash + s.bank < amount)
    return false;
  const pocket = Math.min(s.cash, amount);
  s.cash -= pocket;
  s.bank -= amount - pocket;
  return true;
}
export function buyMansion(s: State, style: MansionStyle, mortgage: boolean) {
  if (
    !s.millionaire?.member ||
    !s.millionaire.titheAccepted ||
    s.millionaire.mountainEarned < 100000 ||
    s.housing?.status === "owned" ||
    s.housing?.status === "evicted" ||
    !["hearst", "vernon"].includes(style)
  )
    return false;
  const down = mortgage ? 100_000 : mansionPrice;
  if (!spendFunds(s, down)) return false;
  s.housing = {
    style,
    status: "owned",
    mortgage,
    downpayment: down,
    principalPaid: 0,
    balance: mortgage ? mansionPrice - down : 0,
    lastPaymentDay: s.day - 1,
    movingInSeen: true,
    evictionSeen: true,
    momBed: false,
    storeOpened: true,
    purchaseCoinPrice: s.coin?.price,
    market: 1.1,
    prices: s.coin ? [s.coin.price] : [],
  };
  s.dailyNet = (s.dailyNet ?? 0) - down;
  s.events.push(
    `Bought a ${style === "hearst" ? "Magnate Mansion" : "Presidential Palace"} mansion ${mortgage ? "with a $1,000 downpayment and a mortgage" : "outright for $1,000,000"}.`,
  );
  return true;
}
export function housingDay(s: State) {
  const h = s.housing;
  if (!h || h.lastPaymentDay >= s.day) return;
  h.lastPaymentDay = s.day;
  if (s.coin) {
    h.prices.push(s.coin.price);
    h.prices = h.prices.slice(-12);
    const lag = h.prices[Math.max(0, h.prices.length - 4)],
      base = h.purchaseCoinPrice ?? lag;
    const target = Math.max(0.5, Math.min(2, (1.1 * lag) / base));
    h.market = Math.max(0.5, Math.min(2, h.market * 0.8 + target * 0.2));
  } else h.market = 1.1;
  if (h.status !== "owned" || !h.mortgage || !h.balance) return;
  const principal = Math.min(600, h.balance),
    payment = principal === 600 ? 1000 : Math.ceil(principal / 0.6);
  if (!spendFunds(s, payment)) {
    h.status = "evicted";
    h.momBed = false;
    h.evictionSeen = false;
    s.events.push(
      "I could not make the $10 mansion payment. The REPO MAN is coming.",
    );
    return;
  }
  h.balance -= principal;
  h.principalPaid += principal;
  s.dailyNet = (s.dailyNet ?? 0) - payment;
  s.events.push(
    `Paid $${(payment / 100).toFixed(2)} on the mansion mortgage: $${(principal / 100).toFixed(2)} principal and $${((payment - principal) / 100).toFixed(2)} interest.`,
  );
  if (!h.balance) {
    h.mortgage = false;
    s.events.push(
      "The mansion mortgage is paid off. This house is finally mine.",
    );
  }
}
export function housingSaleValue(s: State) {
  const h = s.housing;
  return h?.status === "owned"
    ? Math.round((h.downpayment + h.principalPaid) * (s.coin ? h.market : 1.1))
    : 0;
}
export function sellMansion(s: State) {
  const h = s.housing,
    value = housingSaleValue(s);
  if (!h || h.status !== "owned" || !Number.isSafeInteger(s.cash + value))
    return false;
  s.cash += value;
  h.status = "sold";
  h.momBed = false;
  h.balance = 0;
  h.mortgage = false;
  s.dailyNet = (s.dailyNet ?? 0) + value;
  s.events.push(
    `Sold the mansion back to the church for $${(value / 100).toFixed(2)}, based on my equity and the housing market.`,
  );
  return true;
}
export function validHousing(value: unknown, day = Infinity): value is Housing {
  if (value === undefined) return true;
  if (!value || typeof value !== "object") return false;
  const h = value as Housing;
  return (
    ["hearst", "vernon"].includes(h.style) &&
    ["owned", "evicted", "sold"].includes(h.status) &&
    ["mortgage", "movingInSeen", "evictionSeen", "momBed", "storeOpened"].every(
      (k) => typeof (h as any)[k] === "boolean",
    ) &&
    ["downpayment", "principalPaid", "balance", "lastPaymentDay"].every(
      (k) => Number.isSafeInteger((h as any)[k]) && (h as any)[k] >= 0,
    ) &&
    h.lastPaymentDay <= day &&
    (!h.mortgage || h.balance > 0) &&
    h.downpayment <= mansionPrice &&
    h.principalPaid <= mansionPrice &&
    h.balance <= mansionPrice &&
    h.downpayment + h.principalPaid <= mansionPrice &&
    (h.status !== "owned" ||
      h.balance === 0 ||
      h.balance + h.principalPaid + h.downpayment === mansionPrice) &&
    Number.isFinite(h.market) &&
    h.market >= 0.5 &&
    h.market <= 2 &&
    Array.isArray(h.prices) &&
    h.prices.length <= 12 &&
    h.prices.every((p) => Number.isInteger(p) && p > 0 && p <= 100000) &&
    (h.purchaseCoinPrice === undefined ||
      (Number.isInteger(h.purchaseCoinPrice) &&
        h.purchaseCoinPrice > 0 &&
        h.purchaseCoinPrice <= 100000))
  );
}
