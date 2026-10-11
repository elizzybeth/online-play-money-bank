import { ingredients } from "./meals";
import { furnishingCatalog } from "./furnishings";
import type { State } from "./game";
import { hats } from "./hats";
import { bikes } from "./bikes";
export function inventorySnapshot(s: State): Record<string, number> {
  return {
    "Pocket money": s.cash,
    "Saved money": s.bank,
    Seeds: s.seeds,
    ...Object.fromEntries(ingredients.map((k) => [k, s.groceries?.[k] ?? 0])),
    ...Object.fromEntries(
      furnishingCatalog.map((f) => [
        f.name,
        (s.furnitureBag ?? []).filter((id) => id === f.id).length,
      ]),
    ),
    "Compost scraps": s.compostScraps ?? 0,
    Spanakopita: s.spanakopita ?? 0,
    "Fertilizer doses": s.fertilizer,
    "Garden beds": s.gardenBeds ?? 0,
    "Soil bags": s.soilBags ?? 0,
    "Watering can": Number(s.can),
    Shovel: Number(s.shovel),
    ...Object.fromEntries(
      hats.map((h) => [h.name, Number(s.hats.includes(h.id))]),
    ),
    ...Object.fromEntries(
      bikes.map((b) => [b.name, Number(s.bikes?.includes(b.id))]),
    ),
  };
}
export function inventoryChanges(
  before: Record<string, number>,
  after: Record<string, number>,
): string[] {
  return Object.entries(after).flatMap(([label, amount]) => {
    const change = amount - (before[label] ?? 0);
    if (!change) return [];
    const number = label.endsWith("money")
      ? `$${(Math.abs(change) / 100).toFixed(2)}`
      : String(Math.abs(change));
    return [`${change > 0 ? "+" : "−"}${number} ${label.toLowerCase()}`];
  });
}
