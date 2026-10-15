import { mountainRetailOpen } from "./millionaire";
import type { State } from "./game";
export const crops = ["iris", "pepper", "tomato"] as const;
export type Crop = (typeof crops)[number];
export const seedOffers = [
  { id: "money", name: "Money seeds", count: 5, price: 5000 },
  { id: "iris", name: "Iris seeds · Mom’s favorite", count: 5, price: 1000 },
  { id: "pepper", name: "Pepper seeds", count: 5, price: 1500 },
  { id: "tomato", name: "Tomato seeds", count: 5, price: 1500 },
] as const;
export function buyGardenSeeds(s: State, id: string) {
  const offer = seedOffers.find((o) => o.id === id);
  if (!offer || !mountainRetailOpen(s) || s.cash < offer.price) return false;
  s.cash -= offer.price;
  if (id === "money") s.seeds += offer.count;
  else {
    s.cropSeeds ??= {};
    s.cropSeeds[id as Crop] = (s.cropSeeds[id as Crop] ?? 0) + offer.count;
  }
  s.events.push(`Bought five ${id} seeds at the mountain Seed ATM.`);
  return true;
}
export function plantCrop(s: State, i: number, crop: Crop) {
  const p = s.plots[i];
  if (
    !p ||
    p.mountain ||
    p.community ||
    p.meteor ||
    p.soilFilled === false ||
    !["empty", "harvested"].includes(p.stage) ||
    !s.cropSeeds?.[crop] ||
    !crops.includes(crop)
  )
    return false;
  s.cropSeeds[crop]!--;
  p.crop = crop;
  p.stage = "planted";
  p.yield = 0;
  p.fertilized = false;
  p.remaining = 0;
  if (
    s.can &&
    (s.equippedHats ?? [s.equippedHat]).some((h) => h === "dew" || h === "rain")
  ) {
    p.stage = "growing";
    p.remaining = 180;
  }
  s.events.push(`Planted ${crop} seeds in the home garden.`);
  return true;
}
export function harvestCrop(s: State, i: number) {
  const p = s.plots[i];
  if (!p?.crop || p.crop === "iris" || p.stage !== "ready") return false;
  s.groceries ??= {};
  s.groceries[p.crop] = (s.groceries[p.crop] ?? 0) + 3;
  p.stage = "harvested";
  p.yield = 0;
  s.events.push(`Picked three ${p.crop}s for cooking with Mom.`);
  return true;
}
export function validCrops(s: State) {
  return (
    (s.cropSeeds === undefined ||
      (!!s.cropSeeds &&
        typeof s.cropSeeds === "object" &&
        !Array.isArray(s.cropSeeds) &&
        Object.entries(s.cropSeeds).every(
          ([k, v]) =>
            crops.includes(k as Crop) && Number.isSafeInteger(v) && v >= 0,
        ))) &&
    s.plots.every(
      (p) =>
        p.crop === undefined ||
        (crops.includes(p.crop) && !p.mountain && !p.community && !p.meteor),
    )
  );
}
