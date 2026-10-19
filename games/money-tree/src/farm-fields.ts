import type { State } from "./game";
import type { Crop } from "./garden-crops";
export type FarmField = {
  crop: Crop;
  x: number;
  z: number;
  w: number;
  d: number;
  existing?: boolean;
};
/** Each crop has one section; corn occupies the existing maze. */
export const farmFields: readonly FarmField[] = [
  { crop: "corn", x: -88, z: -47.5, w: 69, d: 31, existing: true },
  { crop: "pumpkin", x: -118, z: -18, w: 9, d: 7, existing: true },
  { crop: "cabbage", x: -105, z: -18, w: 9, d: 7, existing: true },
  { crop: "sunflower", x: -92, z: -18, w: 9, d: 7, existing: true },
  { crop: "carrot", x: -82, z: -19, w: 8, d: 8, existing: true },
  { crop: "tomato", x: -56, z: -19, w: 8, d: 8 },
  ...(
    [
      "pepper",
      "beet",
      "lettuce",
      "radish",
      "onion",
      "eggplant",
      "strawberry",
      "lavender",
      "potato",
    ] as const
  ).map((crop, i) => ({
    crop,
    x: -113 + (i % 3) * 27,
    z: 7 + Math.floor(i / 3) * 11,
    w: 22,
    d: 7,
  })),
];
export type FarmForage = {
  cooldowns: Partial<Record<Crop, number>>;
  walked: number;
  last: { x: number; z: number };
  field?: Crop;
};
export function forageFarm(
  s: State,
  dt: number,
  onFoot: boolean,
): Crop | undefined {
  if (!Number.isFinite(dt) || dt <= 0) return;
  const field = farmFields.find(
    (f) =>
      Math.abs(s.position.x - f.x) < f.w / 2 &&
      Math.abs(s.position.z - f.z) < f.d / 2,
  );
  if (!field && !s.farmForage) return;
  const f = (s.farmForage ??= {
    cooldowns: {},
    walked: 0,
    last: { ...s.position },
  });
  for (const crop of Object.keys(f.cooldowns) as Crop[]) {
    f.cooldowns[crop] = Math.max(0, f.cooldowns[crop]! - Math.min(dt, 0.25));
    if (!f.cooldowns[crop]) delete f.cooldowns[crop];
  }
  const distance = Math.hypot(s.position.x - f.last.x, s.position.z - f.last.z);
  f.last.x = s.position.x;
  f.last.z = s.position.z;
  if (!field || field.crop !== f.field || !onFoot || distance > 2) {
    f.walked = 0;
    f.field = field?.crop;
    return;
  }
  if (f.cooldowns[field.crop]) return;
  f.walked += distance;
  if (f.walked < 18) return;
  f.walked = 0;
  f.cooldowns[field.crop] = 180;
  s.cropSeeds ??= {};
  s.cropSeeds[field.crop] = (s.cropSeeds[field.crop] ?? 0) + 5;
  s.events.push(
    `Found a bag of five ${field.crop} seeds while exploring Robertson’s fields.`,
  );
  return field.crop;
}
export function validFarmForage(
  value: unknown,
): value is FarmForage | undefined {
  if (value === undefined) return true;
  if (!value || typeof value !== "object") return false;
  const f = value as FarmForage;
  const valid = (crop: string) => farmFields.some((p) => p.crop === crop);
  return (
    !!f.last &&
    Number.isFinite(f.last.x) &&
    Number.isFinite(f.last.z) &&
    Number.isFinite(f.walked) &&
    f.walked >= 0 &&
    f.walked < 18 &&
    (f.field === undefined || valid(f.field)) &&
    !!f.cooldowns &&
    typeof f.cooldowns === "object" &&
    !Array.isArray(f.cooldowns) &&
    Object.entries(f.cooldowns).every(
      ([crop, n]) =>
        valid(crop) &&
        typeof n === "number" &&
        Number.isFinite(n) &&
        n >= 0 &&
        n <= 180,
    )
  );
}
