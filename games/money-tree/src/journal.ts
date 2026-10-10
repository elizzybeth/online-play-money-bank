import type { State } from "./game";
import { hatById } from "./hats";
export type JournalMemory = {
  day: number;
  events: string[];
  earned: number;
  available: number;
};
export type JournalContext = {
  day: number;
  page: number;
  events: string[];
  previous: string[];
  earned: number;
  available: number;
  cash: number;
  bank: number;
  remaining: number;
  daysNeeded: number | null;
  firstHarvest: boolean;
  boughtSeeds: boolean;
  hats: string[];
  worn: string | null;
  seed: number;
  garden: Record<string, number>;
  plotCount?: number;
  history: JournalMemory[];
  hasHarvested: boolean;
  inventory: {
    seeds: number;
    wateringCan: boolean;
    shovel: boolean;
    fertilizer: number;
  };
};
export function journalContext(s: State): JournalContext {
  const earned = s.events
    .filter((e) => e.startsWith("Harvested"))
    .reduce(
      (n, e) => n + Math.round(Number(e.match(/\$([\d.]+)/)?.[1] ?? 0) * 100),
      0,
    );
  const available = s.cash + s.bank;
  const remaining = Math.max(0, 1_000_000 - available);
  return {
    day: s.day,
    page: s.journal.length,
    events: [...s.events],
    previous: [...s.journal],
    earned,
    available,
    cash: s.cash,
    bank: s.bank,
    remaining,
    daysNeeded: earned ? Math.ceil(remaining / earned) : null,
    firstHarvest: earned > 0 && !s.harvestReflected,
    boughtSeeds: s.boughtSeeds,
    hats: s.hats.map((id) => `${hatById(id)!.name}: ${hatById(id)!.power}`),
    worn: hatById(s.equippedHat)?.name ?? null,
    seed: Math.floor(Math.random() * 1_000_000_000),
    history: structuredClone((s.journalHistory ?? []).slice(-3)),
    hasHarvested: s.harvestReflected || earned > 0,
    inventory: {
      seeds: s.seeds,
      wateringCan: s.can,
      shovel: s.shovel,
      fertilizer: s.fertilizer,
    },
    plotCount: s.plots.length,
    garden: Object.fromEntries(
      ["empty", "planted", "growing", "ready", "harvested"].map((stage) => [
        stage,
        s.plots.filter((p) => p.stage === stage).length,
      ]),
    ),
  };
}
export function validJournalContext(c: unknown): c is JournalContext {
  if (!c || typeof c !== "object") return false;
  const x = c as JournalContext;
  const valid =
    !!x.inventory &&
    Number.isSafeInteger(x.inventory.seeds) &&
    x.inventory.seeds >= 0 &&
    Number.isSafeInteger(x.inventory.fertilizer) &&
    x.inventory.fertilizer >= 0 &&
    typeof x.inventory.wateringCan === "boolean" &&
    typeof x.inventory.shovel === "boolean" &&
    Array.isArray(x.history) &&
    x.history.every(validJournalMemory) &&
    typeof x.hasHarvested === "boolean" &&
    !!x.garden &&
    Object.values(x.garden).every(
      (n) => Number.isSafeInteger(n) && n >= 0 && n <= 50,
    ) &&
    [
      x.day,
      x.page,
      x.earned,
      x.available,
      x.cash,
      x.bank,
      x.remaining,
      x.seed,
    ].every((n) => Number.isSafeInteger(n) && n >= 0) &&
    x.day > 0 &&
    x.page > 0 &&
    (x.daysNeeded === null ||
      (Number.isSafeInteger(x.daysNeeded) && x.daysNeeded >= 0)) &&
    typeof x.firstHarvest === "boolean" &&
    typeof x.boughtSeeds === "boolean" &&
    [x.events, x.previous, x.hats].every(
      (a) =>
        Array.isArray(a) &&
        a.length <= 5000 &&
        a.every((v) => typeof v === "string" && v.length <= 20000),
    ) &&
    (x.worn === null || typeof x.worn === "string");
  if (!valid) return false;
  const earned = x.events
    .filter((e) => e.startsWith("Harvested"))
    .reduce(
      (n, e) => n + Math.round(Number(e.match(/\$([\d.]+)/)?.[1] ?? 0) * 100),
      0,
    );
  return (
    x.available === x.cash + x.bank &&
    x.remaining === Math.max(0, 1_000_000 - x.available) &&
    x.earned === earned &&
    x.daysNeeded === (earned ? Math.ceil(x.remaining / earned) : null) &&
    (!x.firstHarvest || (earned > 0 && x.hasHarvested)) &&
    (!earned || x.hasHarvested) &&
    Object.keys(x.garden).length === 5 &&
    ["empty", "planted", "growing", "ready", "harvested"].every((k) =>
      Number.isSafeInteger(x.garden[k]),
    ) &&
    Number.isSafeInteger(x.plotCount ?? 5) &&
    (x.plotCount ?? 5) >= 5 &&
    (x.plotCount ?? 5) <= 50 &&
    Object.values(x.garden).reduce((a, b) => a + b, 0) === (x.plotCount ?? 5)
  );
}
export function validJournalMemory(x: unknown): x is JournalMemory {
  if (!x || typeof x !== "object") return false;
  const m = x as JournalMemory;
  return (
    [m.day, m.earned, m.available].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    ) &&
    Array.isArray(m.events) &&
    m.events.every((e) => typeof e === "string" && e.length <= 10000)
  );
}
export function rememberDay(s: State): JournalMemory {
  const c = journalContext(s);
  return {
    day: c.day,
    earned: c.earned,
    available: c.available,
    events: [...new Set(c.events)],
  };
}
