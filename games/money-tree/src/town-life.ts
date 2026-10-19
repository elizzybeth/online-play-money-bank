import { mountainRetailOpen } from "./millionaire";
import { terrainHeight } from "./millionaire-land";
import { purchasePrice } from "./meals";
import { type State, wearing } from "./game";
export function compostFertilizer(s: State, all = false) {
  if (
    (!s.foundTVSeeds && !mountainRetailOpen(s)) ||
    (s.compostScraps ?? 0) < 25
  )
    return false;
  const bags = all ? Math.floor(s.compostScraps! / 25) : 1;
  s.compostScraps! -= bags * 25;
  s.fertilizer += bags;
  s.events.push(
    `Traded ${bags * 25} compost scraps for ${bags} dose${bags === 1 ? "" : "s"} of fertilizer at the community composter.`,
  );
  return true;
}
export function buySpanakopita(s: State) {
  if (!s.foundTVSeeds || s.cash < purchasePrice(s, 300)) return false;
  s.cash -= purchasePrice(s, 300);
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
          !p.fertilized &&
          ["planted", "growing"].includes(p.stage);
  };
  if (!eligible(i)) return [];
  if (job === "harvest" && wearing(s, "terrace") && s.plots[i].mountain) {
    const tier = terrainHeight(s.plots[i].x!, s.plots[i].z!);
    return s.plots.flatMap((p, j) =>
      p.mountain && eligible(j) && terrainHeight(p.x!, p.z!) === tier
        ? [j]
        : [],
    );
  }
  if (job === "fertilize" && wearing(s, "alchemist") && s.plots[i].mountain) {
    const origin = s.plots[i],
      tier = terrainHeight(origin.x!, origin.z!);
    return [
      i,
      ...s.plots
        .flatMap((p, j) =>
          j !== i &&
          p.mountain &&
          eligible(j) &&
          terrainHeight(p.x!, p.z!) === tier
            ? [j]
            : [],
        )
        .sort(
          (a, b) =>
            Math.hypot(s.plots[a].x! - origin.x!, s.plots[a].z! - origin.z!) -
            Math.hypot(s.plots[b].x! - origin.x!, s.plots[b].z! - origin.z!),
        ),
    ].slice(0, s.fertilizer);
  }
  if (!wearing(s, "inspector") || (job === "fertilize" && s.fertilizer < 2))
    return [i];
  if (s.plots[i].mountain) {
    const origin = s.plots[i];
    const tier = terrainHeight(origin.x!, origin.z!);
    const neighbors = s.plots
      .map((p, j) => ({ p, j }))
      .filter(
        ({ p, j }) =>
          j !== i &&
          p.mountain &&
          eligible(j) &&
          terrainHeight(p.x!, p.z!) === tier,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.p.x! - origin.x!, a.p.z! - origin.z!) -
          Math.hypot(b.p.x! - origin.x!, b.p.z! - origin.z!),
      );
    return neighbors.length ? [i, neighbors[0].j] : [i];
  }
  const origin = s.plots[i];
  const neighbor = s.plots.findIndex((p, j) => {
    if (j === i || !eligible(j)) return false;
    const dx = Math.abs((p.x ?? -20 + j * 2) - (origin.x ?? -20 + i * 2));
    const dz = Math.abs((p.z ?? 19) - (origin.z ?? 19));
    return (
      (s.plots[i].community &&
        s.plots[j].community &&
        Math.hypot(dx, dz) <= 4.65) ||
      (dx >= 1.8 && dx <= 3.2 && dz < 0.6) ||
      (dz >= 2.8 && dz <= 3.6 && dx < 0.6)
    );
  });
  return neighbor < 0 ? [i] : [i, neighbor];
}
