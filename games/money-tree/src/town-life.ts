import { type State, wearing } from "./game";
export function compostSoil(s: State) {
  if (!s.foundTVSeeds || (s.compostScraps ?? 0) < 25) return false;
  s.compostScraps! -= 25;
  s.soilBags = (s.soilBags ?? 0) + 1;
  s.events.push(
    "Traded 25 compost scraps for a bag of soil at the community composter.",
  );
  return true;
}
export function buySpanakopita(s: State) {
  if (!s.foundTVSeeds || s.cash < 300) return false;
  s.cash -= 300;
  s.spanakopita = (s.spanakopita ?? 0) + 1;
  s.events.push("Bought spanakopita from Gigachad for $3.");
  return true;
}
export function shareSpanakopita(s: State) {
  if (!s.spanakopita) return false;
  s.spanakopita--;
  s.spanakopitaShared = (s.spanakopitaShared ?? 0) + 1;
  s.events.push(
    "Shared spinach, phyllo and feta spanakopita with Mom. She loved it.",
  );
  return true;
}
export type GardenJob = "water" | "fertilize" | "harvest";
export function gardenBatch(s: State, i: number, job: GardenJob) {
  const eligible = (j: number) => {
    const p = s.plots[j];
    if (!p) return false;
    return job === "harvest"
      ? p.stage === "ready"
      : job === "water"
        ? s.can && p.stage === "planted" && !p.mountain
        : !!s.fertilizer &&
          !p.mountain &&
          !p.fertilized &&
          ["planted", "growing"].includes(p.stage);
  };
  if (!eligible(i)) return [];
  if (!wearing(s, "inspector") || (job === "fertilize" && s.fertilizer < 2))
    return [i];
  const origin = s.plots[i];
  const neighbor = s.plots.findIndex((p, j) => {
    if (j === i || !eligible(j)) return false;
    const dx = Math.abs((p.x ?? -20 + j * 2) - (origin.x ?? -20 + i * 2));
    const dz = Math.abs((p.z ?? 19) - (origin.z ?? 19));
    return (
      (dx >= 1.8 && dx <= 3.2 && dz < 0.6) ||
      (dz >= 2.8 && dz <= 3.6 && dx < 0.6)
    );
  });
  return neighbor < 0 ? [i] : [i, neighbor];
}
