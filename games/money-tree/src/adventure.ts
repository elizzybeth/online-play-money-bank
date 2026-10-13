import { recordEarnings } from "./millionaire";
import { samplePrice } from "./market";
import type { State } from "./game";
import type { Fellowship } from "./millionaire";
import { housingDay } from "./housing";
export type Meteor = {
  id: number;
  day: number;
  x: number;
  z: number;
  landed: boolean;
  harvested: boolean;
  crashed: boolean;
  plot?: number;
};
export type Adventure = {
  lastSettledDay?: number;
  featherRequested?: boolean;
  feather?: { chicken: string; day: number };
  feathersGiven?: number;
  lastCuddleDay?: number;
  lastCuddleSeconds?: number;
  awakeSeconds?: number;
  meteorNextDay?: number;
  meteorNextAt?: number;
  meteorSeed?: number;
  nextMeteorId?: number;
  meteors?: Meteor[];
  churchChange?: { from: Fellowship; heardBy: string[] };
  reflections?: number[];
};
export function adventure(s: State) {
  return (s.adventure ??= {});
}
export function dailyEconomy(s: State) {
  const a = adventure(s);
  if (a.lastSettledDay === s.day) return;
  a.lastSettledDay = s.day;
  const interest = Math.round(s.bank * 0.05);
  if (interest && Number.isSafeInteger(s.bank + interest)) {
    s.bank += recordEarnings(s, interest, false, false);
    s.totalEarned = (s.totalEarned ?? 0) + interest;
    s.dailyNet = (s.dailyNet ?? 0) + interest;
    s.events.push(
      `The piggy bank earned $${(interest / 100).toFixed(2)} in daily interest at five percent.`,
    );
  }
  housingDay(s);
}
export function requestFeather(s: State) {
  const a = adventure(s);
  if (
    a.feather ||
    s.events.some((event) => event.startsWith("Gave Mom the feather from "))
  )
    return false;
  a.featherRequested = true;
  return true;
}
export function noteChickenCuddle(s: State, chicken: string) {
  if (chicken === "Fancy Chicken") return false;
  const a = adventure(s);
  s.chickenCuddles = (s.chickenCuddles ?? 0) + 1;
  a.lastCuddleDay = s.day;
  a.lastCuddleSeconds = a.awakeSeconds ?? 0;
  if (a.featherRequested && !a.feather) {
    a.feather = { chicken, day: s.day };
    a.featherRequested = false;
    s.events.push(
      `A feather from ${chicken} caught in my hair. I can bring it to Mom.`,
    );
  }
  return true;
}
export function giveFeather(s: State) {
  const a = adventure(s),
    feather = a.feather;
  if (!feather) return null;
  delete a.feather;
  a.feathersGiven = (a.feathersGiven ?? 0) + 1;
  s.events.push(
    `Gave Mom the feather from ${feather.chicken}. She said it would bring me good luck.`,
  );
  return feather.chicken;
}
export function cuddleNeglect(s: State) {
  const a = adventure(s);
  return Math.min(
    7,
    Math.max(0, s.day - (a.lastCuddleDay ?? 1)) +
      Math.max(
        0,
        (a.awakeSeconds ?? 0) - (a.lastCuddleSeconds ?? a.awakeSeconds ?? 0),
      ) /
        1800,
  );
}
export function advanceAdventure(s: State, dt: number) {
  const a = adventure(s);
  a.awakeSeconds = (a.awakeSeconds ?? 0) + dt;
  if (!s.millionaire?.unlocked) return null;
  a.meteorSeed ??= 53129;
  if (a.meteorNextDay === undefined) {
    a.meteorNextDay = s.day + 1;
    a.meteorNextAt = 30;
  }
  if (s.day < a.meteorNextDay || (a.awakeSeconds ?? 0) < (a.meteorNextAt ?? 0))
    return null;
  a.meteorSeed = (a.meteorSeed * 16807) % 2147483647;
  const seed = a.meteorSeed;
  const sites = [
    [-80, -180],
    [142, -220],
    [-77, -255],
    [150, -270],
    [-80, -460],
    [150, -460],
  ];
  const id = a.nextMeteorId ?? (a.meteors?.length ?? 0) + 1;
  a.nextMeteorId = id + 1;
  const site = sites[(id - 1) % sites.length];
  const previous = a.meteors?.find((m) => m.x === site[0] && m.z === site[1]);
  a.meteors = a.meteors?.filter((m) => m !== previous) ?? [];
  const meteor: Meteor = {
    id,
    day: s.day,
    x: site[0],
    z: site[1],
    landed: false,
    harvested: false,
    crashed: false,
    plot: previous?.plot,
  };
  (a.meteors ??= []).push(meteor);
  // A repeat strike inherits the previous site while the meteor is in flight.
  // Keep its plot link valid before any autosave or tab-close write.
  if (previous?.plot !== undefined && s.plots[previous.plot])
    s.plots[previous.plot].meteor = id;
  a.meteorNextDay = s.day + 1 + (seed % 3);
  a.meteorNextAt = (a.awakeSeconds ?? 0) + 30 + (seed % 61);
  return meteor;
}
export function landMeteor(s: State, id: number) {
  const m = adventure(s).meteors?.find((m) => m.id === id);
  if (!m || m.landed) return false;
  m.landed = true;
  const tree = {
    x: m.x,
    z: m.z,
    meteor: m.id,
    soilFilled: true,
    stage: "ready" as const,
    remaining: 0,
    fertilized: false,
    yield: 700,
  };
  if (m.plot === undefined) {
    m.plot = s.plots.length;
    s.plots.push(tree);
  } else s.plots[m.plot] = tree;
  if (!m.crashed) {
    m.crashed = true;
    if (s.coin) {
      s.coin.exactPrice = Math.max(
        1,
        (s.coin.exactPrice ?? s.coin.price) * 0.48,
      );
      s.coin.price = Math.round(s.coin.exactPrice);
      s.coin.history.push(s.coin.price);
      s.coin.history = s.coin.history.slice(-24);
      samplePrice(s);
    }
    s.events.push(
      `A meteor fell into the desert. One money tree grew at its heart.${s.coin ? ` Fear of another strike sent ${s.coin.name} tumbling.` : ""}`,
    );
  }
  return true;
}
export function validAdventure(value: unknown, day: number) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object") return false;
  const a = value as Adventure;
  if (
    [
      "lastSettledDay",
      "feathersGiven",
      "lastCuddleDay",
      "meteorNextDay",
      "meteorSeed",
      "nextMeteorId",
      "lastCuddleSeconds",
      "awakeSeconds",
      "meteorNextAt",
    ].some(
      (k) =>
        (a as any)[k] !== undefined &&
        (!Number.isFinite((a as any)[k]) || (a as any)[k] < 0),
    )
  )
    return false;
  if (
    a.featherRequested !== undefined &&
    typeof a.featherRequested !== "boolean"
  )
    return false;
  if (
    a.feather &&
    (!["Tuck", "Cluck", "Pluck", "Luck", "Fuck"].includes(a.feather.chicken) ||
      !Number.isInteger(a.feather.day) ||
      a.feather.day < 1 ||
      a.feather.day > day)
  )
    return false;
  if (
    [
      "lastSettledDay",
      "lastCuddleDay",
      "feathersGiven",
      "meteorNextDay",
      "meteorSeed",
      "nextMeteorId",
    ].some(
      (k) =>
        (a as any)[k] !== undefined && !Number.isSafeInteger((a as any)[k]),
    )
  )
    return false;
  if (a.lastSettledDay !== undefined && a.lastSettledDay > day) return false;
  if (a.lastCuddleDay !== undefined && a.lastCuddleDay > day) return false;
  if (
    a.meteors &&
    (!Array.isArray(a.meteors) ||
      a.meteors.length > 6 ||
      new Set(a.meteors.map((m) => m.id)).size !== a.meteors.length ||
      a.meteors.some(
        (m) =>
          !Number.isInteger(m.id) ||
          m.id < 1 ||
          (m.landed && m.plot === undefined) ||
          m.landed !== m.crashed ||
          (m.plot !== undefined &&
            (!Number.isInteger(m.plot) || m.plot < 5 || m.plot >= 220)) ||
          !Number.isInteger(m.day) ||
          m.day > day ||
          m.day < 1 ||
          !Number.isFinite(m.x) ||
          !Number.isFinite(m.z) ||
          Math.abs(m.x) > 200 ||
          m.z > -150 ||
          m.z < -460 ||
          ["landed", "harvested", "crashed"].some(
            (k) => typeof (m as any)[k] !== "boolean",
          ),
      ))
  )
    return false;
  if (
    a.churchChange &&
    (!["arms", "bridge", "fire"].includes(a.churchChange.from) ||
      !Array.isArray(a.churchChange.heardBy) ||
      a.churchChange.heardBy.length > 30 ||
      a.churchChange.heardBy.some(
        (x) => typeof x !== "string" || x.length > 80,
      ))
  )
    return false;
  return (
    !a.reflections ||
    (Array.isArray(a.reflections) &&
      a.reflections.length <= 100 &&
      a.reflections.every((n) => Number.isInteger(n) && n >= 0 && n < 100))
  );
}
