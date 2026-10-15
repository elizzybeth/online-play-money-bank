import { modernFurniture, type ModernFurnitureId } from "./marvels-catalog";
import type { State, Rect } from "./game";
export type FurnishingId =
  | ModernFurnitureId
  | "sunset"
  | "botanical"
  | "geometric"
  | "seascape"
  | "pouf"
  | "chair"
  | "monstera"
  | "snake"
  | "pothos"
  | "rug"
  | "royal-bed"
  | "gilded-chair"
  | "marble-planter"
  | "palace-rug"
  | "gilded-painting";
export type PlacedFurniture = {
  item: FurnishingId;
  x: number;
  y: number;
  z: number;
  rotation: number;
  seed?: number;
};
export const furnishingCatalog: {
  id: FurnishingId;
  name: string;
  price: number;
  level: number;
  wall?: boolean;
  w: number;
  d: number;
}[] = [
  {
    id: "sunset",
    name: "Sunset painting",
    price: 400,
    level: 1,
    wall: true,
    w: 1.2,
    d: 0.1,
  },
  {
    id: "botanical",
    name: "Botanical painting",
    price: 400,
    level: 1,
    wall: true,
    w: 1.2,
    d: 0.1,
  },
  {
    id: "geometric",
    name: "Jewel geometric painting",
    price: 400,
    level: 1,
    wall: true,
    w: 1.2,
    d: 0.1,
  },
  {
    id: "seascape",
    name: "Seascape painting",
    price: 400,
    level: 1,
    wall: true,
    w: 1.2,
    d: 0.1,
  },
  {
    id: "chair",
    name: "Velvet reading chair",
    price: 700,
    level: 1,
    w: 1.15,
    d: 1.15,
  },
  {
    id: "pouf",
    name: "Pink tufted pouf",
    price: 500,
    level: 1,
    w: 1.06,
    d: 1.06,
  },
  {
    id: "monstera",
    name: "Monstera in a glazed pot",
    price: 600,
    level: 2,
    w: 0.85,
    d: 0.85,
  },
  {
    id: "snake",
    name: "Snake plant in a terracotta pot",
    price: 400,
    level: 2,
    w: 0.6,
    d: 0.6,
  },
  {
    id: "pothos",
    name: "Trailing pothos on a stand",
    price: 600,
    level: 3,
    w: 0.7,
    d: 0.7,
  },
  { id: "rug", name: "Woven jewel rug", price: 900, level: 3, w: 2.4, d: 1.6 },
];
furnishingCatalog.push(
  {
    id: "royal-bed",
    name: "Carved canopy bed",
    price: 50000,
    level: 4,
    w: 2.4,
    d: 3.2,
  },
  {
    id: "gilded-chair",
    name: "Gilded velvet throne chair",
    price: 18000,
    level: 4,
    w: 1.3,
    d: 1.4,
  },
  {
    id: "marble-planter",
    name: "Carved marble urn planter",
    price: 12000,
    level: 4,
    w: 1.2,
    d: 1.2,
  },
  {
    id: "palace-rug",
    name: "Ornate palace carpet",
    price: 24000,
    level: 4,
    w: 4,
    d: 3,
  },
  {
    id: "gilded-painting",
    name: "Gilded gallery painting",
    price: 15000,
    level: 4,
    w: 1.2,
    d: 0.1,
    wall: true,
  },
);
furnishingCatalog.push(...modernFurniture.map((f) => ({ ...f, level: 4 })));
export const homeLevel = (s: State) =>
  s.millionaire?.unlocked ? 3 : s.foundTVSeeds ? 2 : 1;
export function furnitureById(id: FurnishingId) {
  return furnishingCatalog.find((f) => f.id === id)!;
}
export type WallSpace = {
  axis: "x" | "z";
  value: number;
  from: number;
  to: number;
  rotation: number;
  windows: { from: number; to: number; bottom: number; top: number }[];
};
export function canPlaceFurniture(
  p: PlacedFurniture,
  obstacles: Rect[],
  walls: WallSpace[],
  placed: PlacedFurniture[],
  estate = false,
) {
  const item = furnitureById(p.item);
  if (!item || ![p.x, p.y, p.z, p.rotation].every(Number.isFinite))
    return false;
  const w =
      Math.abs(Math.cos(p.rotation)) * item.w +
      Math.abs(Math.sin(p.rotation)) * item.d,
    d =
      Math.abs(Math.sin(p.rotation)) * item.w +
      Math.abs(Math.cos(p.rotation)) * item.d;
  if (item.wall) {
    const wall = walls.find(
      (a) =>
        Math.abs(p[a.axis] - a.value) < 0.25 &&
        Math.abs(p.rotation - a.rotation) < 0.01,
    );
    if (!wall) return false;
    const along = wall.axis === "x" ? p.z : p.x;
    return (
      along - item.w / 2 > wall.from + 0.12 &&
      along + item.w / 2 < wall.to - 0.12 &&
      p.y > 0.85 &&
      p.y < 2.5 &&
      !wall.windows.some(
        (v) =>
          along + item.w / 2 > v.from - 0.12 &&
          along - item.w / 2 < v.to + 0.12 &&
          p.y + 0.5 > v.bottom &&
          p.y - 0.5 < v.top,
      ) &&
      !placed.some(
        (a) =>
          furnitureById(a.item).wall &&
          Math.hypot(a.x - p.x, a.z - p.z) < item.w + 0.12 &&
          Math.abs(a.y - p.y) < 1.1,
      )
    );
  }
  const inside =
    (estate &&
      p.x - w / 2 > 71.8 &&
      p.x + w / 2 < 104.2 &&
      p.z - d / 2 > -351.2 &&
      p.z + d / 2 < -328.8) ||
    (p.x - w / 2 > -20.85 &&
      p.x + w / 2 < -9.15 &&
      p.z - d / 2 > -1.85 &&
      p.z + d / 2 < 13.85) ||
    (p.x - w / 2 > -8.85 &&
      p.x + w / 2 < -1.15 &&
      p.z - d / 2 > 6.15 &&
      p.z + d / 2 < 13.85);
  if (!inside) return false;
  return (
    !obstacles.some(
      (o) =>
        Math.abs(p.x - o.x) < (w + o.w) / 2 + 0.08 &&
        Math.abs(p.z - o.z) < (d + o.d) / 2 + 0.08,
    ) &&
    !placed.some((o) => {
      const t = furnitureById(o.item);
      if (t.wall) return false;
      const ow =
          Math.abs(Math.cos(o.rotation)) * t.w +
          Math.abs(Math.sin(o.rotation)) * t.d,
        od =
          Math.abs(Math.sin(o.rotation)) * t.w +
          Math.abs(Math.cos(o.rotation)) * t.d;
      return (
        Math.abs(p.x - o.x) < (w + ow) / 2 + 0.08 &&
        Math.abs(p.z - o.z) < (d + od) / 2 + 0.08
      );
    })
  );
}
export function validFurnishings(s: any) {
  return (
    (s.furnitureBag === undefined ||
      (Array.isArray(s.furnitureBag) &&
        s.furnitureBag.length <= 200 &&
        s.furnitureBag.every((id: FurnishingId) => !!furnitureById(id)))) &&
    (s.furniture === undefined ||
      (Array.isArray(s.furniture) &&
        s.furniture.length <= 200 &&
        s.furniture.every(
          (p: PlacedFurniture) =>
            !!furnitureById(p.item) &&
            [p.x, p.y, p.z, p.rotation].every(Number.isFinite) &&
            Math.abs(p.x) < 110 &&
            (Math.abs(p.z) < 100 ||
              (s.housing &&
                p.x >= 71 &&
                p.x <= 105 &&
                p.z >= -352 &&
                p.z <= -328)) &&
            p.y >= 0 &&
            p.y < 4 &&
            (p.seed === undefined ||
              (Number.isSafeInteger(p.seed) && p.seed >= 0)),
        ))) &&
    (s.momCanvasDays === undefined ||
      (Array.isArray(s.momCanvasDays) &&
        s.momCanvasDays.every(
          (n: number) => Number.isSafeInteger(n) && n >= 1 && n <= s.day,
        )))
  );
}
