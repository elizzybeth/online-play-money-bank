/** Smoothed from the player's October 16 river sketch; x/z are world units. */
export const riverWaypoints = [
  [-108, -129],
  [-94, -131],
  [-76, -143],
  [-55, -146],
  [-35, -140],
  [-12, -137],
  [2, -140],
  [15, -140],
  [19, -135],
  [19, -120],
  [22, -110],
  [31, -104],
  [42, -99],
  [52, -94],
  [53, -81],
  [53, -66],
  [48, -53],
  [44, -46],
  [43, -39],
  [43, -26],
  [43, -15],
  [38, -7],
  [31, -5],
  [23, -5],
  [14, -10],
  [5, -9],
  [-6, -6.5],
  [-14, -6],
  [-23, -6],
  [-32, -4.5],
  [-43, -4.5],
  [-61, -4.5],
  [-79, -4.5],
  [-134, -4.5],
] as const;
export type RiverPoint = { x: number; z: number };
// Hermite interpolation follows the sketch without sharply kinked banks.
const points: RiverPoint[] = [];
for (let i = 0; i < riverWaypoints.length - 1; i++) {
  const a = riverWaypoints[Math.max(0, i - 1)],
    b = riverWaypoints[i],
    c = riverWaypoints[i + 1],
    d = riverWaypoints[Math.min(i + 2, riverWaypoints.length - 1)];
  const steps = Math.ceil(Math.hypot(c[0] - b[0], c[1] - b[1]) / 1.5);
  for (let j = 0; j < steps; j++) {
    const t = j / steps,
      t2 = t * t,
      t3 = t2 * t;
    const axis = (k: number) =>
      (2 * t3 - 3 * t2 + 1) * b[k] +
      (t3 - 2 * t2 + t) * (c[k] - a[k]) * 0.35 +
      (-2 * t3 + 3 * t2) * c[k] +
      (t3 - t2) * (d[k] - b[k]) * 0.35;
    points.push({ x: axis(0), z: axis(1) });
  }
}
const end = riverWaypoints.at(-1)!;
points.push({ x: end[0], z: end[1] });
export const riverPoints: readonly RiverPoint[] = points;
export const riverHalfWidth = 2.4,
  riverBankWidth = 3.4;
export const riverSections = points.map((p, i) => {
  const a = points[Math.max(0, i - 1)],
    b = points[Math.min(points.length - 1, i + 1)];
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  return { ...p, nx: -(b.z - a.z) / len, nz: (b.x - a.x) / len };
});
export const riverBridges: readonly {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  axis: "x" | "z";
}[] = [
  { id: "village", x: 3, z: -8.6, w: 8, d: 6, axis: "z" },
  { id: "market", x: 43, z: -20, w: 14, d: 6, axis: "x" },
  { id: "grove", x: 46, z: -98, w: 8, d: 18, axis: "z" },
] as const;
/** The Sigma landing meets the 5.4m corridor flush; other landings flare. */
export function bridgeApproachHalfWidth(
  b: (typeof riverBridges)[number],
  side: number,
  t = 1,
) {
  const half = (b.axis === "z" ? b.w : b.d) / 2,
    end = b.id === "grove" && side === 1 ? 2.7 : half + 2;
  return half + (end - half) * Math.max(0, Math.min(1, t));
}
export function riverDistance(x: number, z: number) {
  if (x < -140 || x > 59 || z < -152 || z > 1) return Infinity;
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      dx = b.x - a.x,
      dz = b.z - a.z;
    const t = Math.max(
      0,
      Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)),
    );
    const ex = x - a.x - t * dx,
      ez = z - a.z - t * dz;
    best = Math.min(best, ex * ex + ez * ez);
  }
  return Math.sqrt(best);
}
// Index only segments close enough to affect feet/wheels. Faraway movement
// avoids a whole-river scan; immutable buckets are shared by height and speed.
let bankCells: Map<number, number[]> | undefined;
const cellKey = (x: number, z: number) =>
  (Math.floor(x / 8) + 64) * 128 + Math.floor(z / 8) + 64;
function indexedBanks() {
  if (bankCells) return bankCells;
  bankCells = new Map();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i];
    for (
      let x = Math.floor((Math.min(a.x, b.x) - riverBankWidth) / 8);
      x <= Math.floor((Math.max(a.x, b.x) + riverBankWidth) / 8);
      x++
    )
      for (
        let z = Math.floor((Math.min(a.z, b.z) - riverBankWidth) / 8);
        z <= Math.floor((Math.max(a.z, b.z) + riverBankWidth) / 8);
        z++
      ) {
        const key = (x + 64) * 128 + z + 64;
        if (!bankCells.has(key)) bankCells.set(key, []);
        bankCells.get(key)!.push(i);
      }
  }
  return bankCells;
}
export function riverBankDistance(x: number, z: number) {
  if (x < -140 || x > 59 || z < -152 || z > 1) return Infinity;
  const candidates = indexedBanks().get(cellKey(x, z));
  if (!candidates) return Infinity;
  let best = Infinity;
  for (const i of candidates) {
    const a = points[i - 1],
      b = points[i],
      dx = b.x - a.x,
      dz = b.z - a.z;
    const t = Math.max(
      0,
      Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)),
    );
    best = Math.min(best, (x - a.x - t * dx) ** 2 + (z - a.z - t * dz) ** 2);
  }
  return best <= riverBankWidth ** 2 ? Math.sqrt(best) : Infinity;
}
export function riverGroundHeight(x: number, z: number) {
  const distance = riverBankDistance(x, z);
  return distance < riverBankWidth
    ? -0.9 *
        Math.min(
          1,
          (riverBankWidth - distance) / (riverBankWidth - riverHalfWidth),
        )
    : undefined;
}
/** Wading and pedalling through water take 35% of dry-ground speed. */
export function riverTravelFactor(x: number, z: number) {
  if (bridgeHeight(x, z) !== undefined) return 1;
  const distance = riverBankDistance(x, z);
  if (distance >= riverBankWidth) return 1;
  const wet = Math.min(
    1,
    (riverBankWidth - distance) / (riverBankWidth - riverHalfWidth),
  );
  return 1 - 0.65 * wet * wet * (3 - 2 * wet);
}

/** Keep boundary meshes and their colliders in agreement at river outlets. */
export function splitRiverBoundary<
  R extends { x: number; z: number; w: number; d: number },
>(r: R): R[] {
  const vertical = r.d > r.w,
    center = vertical ? r.x : r.z,
    half = (vertical ? r.w : r.d) / 2;
  const radius = riverBankWidth + half;
  const cuts = [
    ...points.flatMap((p) => {
      const delta = Math.abs((vertical ? p.x : p.z) - center);
      if (delta >= radius) return [];
      // Project the bank radius onto this wall. A fixed-width cut over-trimmed
      // corners and removed the parallel approach rail beside the river.
      const reach = Math.sqrt(radius * radius - delta * delta) + 0.8;
      const along = vertical ? p.z : p.x;
      return [[along - reach, along + reach]];
    }),
    // Road bridges need their entire deck opening even when the water itself
    // passes just beyond a parallel hedge or wall.
    ...riverBridges.flatMap((b) => {
      const across = vertical ? b.x : b.z;
      const acrossHalf = (vertical ? b.w : b.d) / 2;
      if (Math.abs(across - center) >= acrossHalf + half) return [];
      const along = vertical ? b.z : b.x;
      const alongHalf = (vertical ? b.d : b.w) / 2;
      return [[along - alongHalf, along + alongHalf]];
    }),
  ].sort((a, b) => a[0] - b[0]);
  let intervals = [
    [
      (vertical ? r.z : r.x) - (vertical ? r.d : r.w) / 2,
      (vertical ? r.z : r.x) + (vertical ? r.d : r.w) / 2,
    ],
  ];
  for (const [a, b] of cuts)
    intervals = intervals.flatMap(([lo, hi]) =>
      b <= lo || a >= hi
        ? [[lo, hi]]
        : [...(a > lo ? [[lo, a]] : []), ...(b < hi ? [[b, hi]] : [])],
    );
  return intervals
    .filter(([a, b]) => b - a > 0.05)
    .map(([a, b]) => ({
      ...r,
      ...(vertical
        ? { z: (a + b) / 2, d: b - a }
        : { x: (a + b) / 2, w: b - a }),
    }));
}

/** Open fence spans replace only the missing wall at a riverside bend. */
export function riverBoundaryGaps<
  R extends { x: number; z: number; w: number; d: number },
>(r: R): R[] {
  const vertical = r.d > r.w;
  const start = (vertical ? r.z : r.x) - (vertical ? r.d : r.w) / 2;
  const end = (vertical ? r.z : r.x) + (vertical ? r.d : r.w) / 2;
  const pieces = splitRiverBoundary(r).sort((a, b) =>
    vertical ? a.z - b.z : a.x - b.x,
  );
  const gaps: R[] = [];
  let cursor = start;
  const add = (lo: number, hi: number) => {
    if (hi - lo > 0.05)
      gaps.push({
        ...r,
        ...(vertical
          ? { z: (lo + hi) / 2, d: hi - lo }
          : { x: (lo + hi) / 2, w: hi - lo }),
      });
  };
  for (const p of pieces) {
    const center = vertical ? p.z : p.x,
      half = (vertical ? p.d : p.w) / 2;
    add(cursor, center - half);
    cursor = center + half;
  }
  add(cursor, end);
  return gaps;
}
export const groveApproachPaths = [
  { x: 42, z: -61, w: 10, d: 6 },
  { x: 46, z: -98, w: 5.4, d: 76 },
];

/** Decks are flat; wide, 1:20 ramps join level turning landings to the lawn. */
export function bridgeHeight(x: number, z: number): number | undefined {
  for (const b of riverBridges) {
    const across = b.axis === "z" ? Math.abs(x - b.x) : Math.abs(z - b.z);
    const along = b.axis === "z" ? Math.abs(z - b.z) : Math.abs(x - b.x);
    const half = (b.axis === "z" ? b.d : b.w) / 2;
    const width = (b.axis === "z" ? b.w : b.d) / 2;
    if (along <= half && across <= width) return 0.14;
    const t = (along - half) / 2.8;
    const side = (b.axis === "z" ? z - b.z : x - b.x) >= 0 ? 1 : -1;
    if (t >= 0 && t <= 1 && across <= bridgeApproachHalfWidth(b, side, t))
      return 0.14 * (1 - t);
    if (t > 1 && t <= 1 + 2 / 2.8 && across <= bridgeApproachHalfWidth(b, side))
      return 0;
  }
}
