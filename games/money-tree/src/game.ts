export type Plot = {
  stage: "empty" | "planted" | "growing" | "ready" | "harvested";
  remaining: number;
  fertilized: boolean;
  yield: number;
};
export type State = {
  version: 1;
  day: number;
  cash: number;
  bank: number;
  seeds: number;
  shovel: boolean;
  can: boolean;
  fertilizer: number;
  awake: boolean;
  metMom: boolean;
  metRobertson: boolean;
  recovered: boolean;
  plots: Plot[];
  events: string[];
  journal: string[];
  rng: number;
  position: { x: number; z: number };
};
export const opening =
  "Need $ for mom's operation. Money doesn't grow on trees. Or does it? Ol' Man Robertson said something strange today. He said he'd have some seeds for me next time I see him.";
export const fresh = (): State => ({
  version: 1,
  day: 1,
  cash: 0,
  bank: 433,
  seeds: 0,
  shovel: false,
  can: false,
  fertilizer: 0,
  awake: false,
  metMom: false,
  metRobertson: false,
  recovered: false,
  plots: Array.from({ length: 5 }, () => ({
    stage: "empty",
    remaining: 0,
    fertilized: false,
    yield: 0,
  })),
  events: [],
  journal: [opening],
  rng: 48271,
  position: { x: -15, z: 5 },
});
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;
export function buy(
  s: State,
  item: "seeds" | "shovel" | "can" | "fertilizer",
): boolean {
  const costs = { seeds: 200, shovel: 100, can: 100, fertilizer: 500 };
  if (
    s.cash < costs[item] ||
    ((item === "shovel" || item === "can") && s[item])
  )
    return false;
  s.cash -= costs[item];
  if (item === "seeds") s.seeds += 5;
  else if (item === "fertilizer") s.fertilizer += 5;
  else s[item] = true;
  s.events.push(
    `Bought ${item === "can" ? "a watering can" : item === "seeds" ? "five mysterious seeds" : item === "shovel" ? "a shovel" : "fertilizer"}.`,
  );
  return true;
}
export function plant(s: State, i: number) {
  if (!s.plots[i] || s.plots[i].stage !== "empty" || s.seeds < 1) return false;
  s.seeds--;
  s.plots[i].stage = "planted";
  s.events.push("Planted a money seed.");
  return true;
}
export function water(s: State, i: number) {
  const p = s.plots[i];
  if (!p || !s.can || !["planted", "harvested"].includes(p.stage)) return false;
  p.stage = "growing";
  p.remaining = p.fertilized ? 60 : 90;
  p.yield = 0;
  s.events.push("Watered a money tree.");
  return true;
}
export function fertilize(s: State, i: number) {
  const p = s.plots[i];
  if (
    !p ||
    p.stage === "empty" ||
    p.stage === "ready" ||
    p.fertilized ||
    !s.fertilizer
  )
    return false;
  s.fertilizer--;
  p.fertilized = true;
  if (p.stage === "growing") p.remaining *= 2 / 3;
  s.events.push("Fed a tree with fertilizer.");
  return true;
}
export function tick(s: State, dt: number) {
  if (!Number.isFinite(dt) || dt < 0) return;
  for (const p of s.plots) {
    if (p.stage === "growing") {
      p.remaining = Math.max(0, p.remaining - dt);
      if (!p.remaining) {
        p.stage = "ready";
        s.rng = (s.rng * 16807) % 2147483647;
        const r = s.rng / 2147483647;
        p.yield =
          (p.fertilized ? 4 + Math.floor(r * 4) : 2 + Math.floor(r * r * 6)) *
          100;
      }
    }
  }
}
export function harvest(s: State, i: number) {
  const p = s.plots[i];
  if (!p || p.stage !== "ready") return 0;
  const n = p.yield;
  s.cash += n;
  p.stage = "harvested";
  p.yield = 0;
  p.fertilized = false;
  s.events.push(`Harvested ${money(n)} from a money tree.`);
  return n;
}
export function sleep(s: State) {
  s.journal.push(
    `Day ${s.day} — ${s.events.length ? s.events.join(" ") : "A quiet day. No gardening or purchases to record. Tomorrow is another chance."}`,
  );
  s.events = [];
  s.day++;
  tick(s, 90);
}
export function withdraw(s: State) {
  s.cash += s.bank;
  s.bank = 0;
}
export function deposit(s: State) {
  s.bank += s.cash;
  s.cash = 0;
}
export function recover(s: State) {
  if (s.recovered || s.cash + s.bank >= 100 || s.can) return false;
  s.can = true;
  if (!s.seeds && !s.plots.some((p) => p.stage !== "empty")) s.seeds = 5;
  s.recovered = true;
  s.events.push("Helped Robertson sort a delivery. He gave me supplies.");
  return true;
}
export function decode(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Number.isSafeInteger(s.day) ||
      s.day < 1 ||
      !["cash", "bank", "seeds", "fertilizer"].every(
        (k) => Number.isSafeInteger(s[k]) && s[k] >= 0,
      ) ||
      !["shovel", "can", "awake", "metMom", "metRobertson", "recovered"].every(
        (k) => typeof s[k] === "boolean",
      ) ||
      !Array.isArray(s.plots) ||
      s.plots.length !== 5 ||
      !s.plots.every(
        (p: Plot) =>
          ["empty", "planted", "growing", "ready", "harvested"].includes(
            p.stage,
          ) &&
          Number.isFinite(p.remaining) &&
          p.remaining >= 0 &&
          typeof p.fertilized === "boolean" &&
          Number.isSafeInteger(p.yield) &&
          p.yield >= 0 &&
          p.yield <= 700,
      ) ||
      !["events", "journal"].every(
        (k) =>
          Array.isArray(s[k]) &&
          s[k].every((x: unknown) => typeof x === "string"),
      ) ||
      !Number.isSafeInteger(s.rng) ||
      s.rng <= 0 ||
      s.rng >= 2147483647 ||
      !s.position ||
      !Number.isFinite(s.position.x) ||
      !Number.isFinite(s.position.z)
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export function load(raw: string | null): State {
  return decode(raw) ?? fresh();
}
export type Rect = { x: number; z: number; w: number; d: number };
export function blocked(x: number, z: number, rects: Rect[], radius = 0.48) {
  return rects.some(
    (r) =>
      x + radius > r.x - r.w / 2 &&
      x - radius < r.x + r.w / 2 &&
      z + radius > r.z - r.d / 2 &&
      z - radius < r.z + r.d / 2,
  );
}
export function move(
  pos: { x: number; z: number },
  dx: number,
  dz: number,
  rects: Rect[],
) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  for (let i = 0; i < n; i++) {
    const x = pos.x + dx / n,
      z = pos.z + dz / n;
    if (!blocked(x, pos.z, rects)) pos.x = x;
    if (!blocked(pos.x, z, rects)) pos.z = z;
  }
  return pos;
}
