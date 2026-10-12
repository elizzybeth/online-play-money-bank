import { sleep, type State } from "./game";
import { newMillionaire, ensureMountainPlots } from "./millionaire";
import { bikes } from "./bikes";
import { hats } from "./hats";
import { adventure } from "./adventure";
export const debugActions = [
  { id: "level2", label: "Unlock Level 2 · Sigma Town", group: "Progress" },
  {
    id: "level3",
    label: "Unlock Level 3 · Mt. Millionaire",
    group: "Progress",
  },
  { id: "cash", label: "Add $10,000 to Pocket", group: "Supplies" },
  { id: "bank", label: "Add $10,000 to Saved", group: "Supplies" },
  {
    id: "supplies",
    label: "Add 100 seeds, fertilizer and compost + tools",
    group: "Supplies",
  },
  { id: "bikes", label: "Own every bike", group: "Equipment" },
  { id: "hats", label: "Own every hat", group: "Equipment" },
  { id: "trees", label: "Ripen planted trees", group: "World" },
  { id: "day", label: "Advance one day", group: "World" },
  { id: "meteor", label: "Trigger a meteor · unlocks Level 3", group: "World" },
  { id: "home", label: "Go home", group: "Travel" },
  { id: "shop", label: "Go to Robertsons", group: "Travel" },
  { id: "sigma", label: "Go to Sigma Town · unlocks Level 2", group: "Travel" },
  {
    id: "mountain",
    label: "Go to Level 3 entrance · unlocks Level 3",
    group: "Travel",
  },
  {
    id: "desert",
    label: "Go to the desert · unlocks Level 3",
    group: "Travel",
  },
] as const;
export type DebugAction = (typeof debugActions)[number]["id"];
function unlock(s: State, level: number) {
  s.awake = true;
  s.foundTVSeeds = true;
  if (level === 3) {
    s.pepePopped = true;
    s.pepeShowStarted = true;
    s.pepeInflation = 12;
    s.millionaire ??= newMillionaire();
    s.millionaire.afterPepe = Math.max(10000, s.millionaire.afterPepe);
    s.millionaire.unlocked = true;
    ensureMountainPlots(s);
  }
}
export function applyDebugAction(s: State, id: DebugAction) {
  switch (id) {
    case "level2":
      unlock(s, 2);
      break;
    case "level3":
      unlock(s, 3);
      break;
    case "cash":
      s.cash += 1000000;
      break;
    case "bank":
      s.bank += 1000000;
      break;
    case "supplies":
      s.seeds += 100;
      s.fertilizer += 100;
      s.compostScraps = (s.compostScraps ?? 0) + 100;
      s.shovel = s.can = true;
      break;
    case "bikes":
      s.bikes = bikes.map((b) => b.id);
      s.selectedBike ??= "cruiser";
      break;
    case "hats":
      s.hats = hats.map((h) => h.id);
      break;
    case "trees":
      for (const p of s.plots)
        if (p.stage === "planted" || p.stage === "growing") {
          p.stage = "ready";
          p.remaining = 0;
        }
      break;
    case "day":
      sleep(s);
      s.awake = true;
      break;
    case "meteor": {
      unlock(s, 3);
      const a = adventure(s);
      a.meteorNextDay = s.day;
      a.meteorNextAt = a.awakeSeconds ?? 0;
      break;
    }
    case "home":
      s.awake = true;
      s.position = { x: -16, z: 4 };
      break;
    case "shop":
      s.awake = true;
      s.position = { x: 0, z: -25 };
      break;
    case "sigma":
      unlock(s, 2);
      s.position = { x: 0, z: -62 };
      break;
    case "mountain":
      unlock(s, 3);
      s.position = { x: 46, z: -96 };
      break;
    case "desert":
      unlock(s, 3);
      s.position = { x: -65, z: -180 };
      break;
  }
  s.events.push(`Debug: ${debugActions.find((a) => a.id === id)!.label}.`);
}
