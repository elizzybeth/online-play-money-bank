let craters: { x: number; z: number }[] = [];
export function setCraterSites(sites: { x: number; z: number }[]) {
  craters = sites;
}
export function craterHeight(r: number) {
  return r < 7
    ? -2.5 + 3.8 * (r / 7) ** 2
    : r < 8
      ? 1.3 + (r - 7) * 0.2
      : (1.5 * (10 - r)) / 2;
}
export const willowMeeting = { x: 34, z: -130 };
export const mountainFoot = { x: 34, z: -340 };
export const mountainSummit = { x: 34, z: -445 };
export const mountainTerraces = Array.from({ length: 8 }, (_, tier) => ({
  x: 34,
  z: -340 - tier * 15,
  y: tier * 2,
  rx: 32 - tier * 2,
  rz: 15,
}));
export function terrainHeight(x: number, z: number) {
  const crater = craters.find((c) => Math.hypot(x - c.x, z - c.z) < 10);
  if (crater) return craterHeight(Math.hypot(x - crater.x, z - crater.z));
  if (Math.abs(x - 34) <= 3 && z <= -340 && z >= -445)
    return (-z - 340) * (14 / 105);
  const terrace = mountainTerraces
    .slice()
    .reverse()
    .find((t) => ((x - t.x) / t.rx) ** 2 + ((z - t.z) / t.rz) ** 2 <= 1);
  return terrace?.y ?? 0;
}
export function fertileMountainSoil(x: number, z: number) {
  return (
    mountainTerraces.some(
      (t) => ((x - t.x) / (t.rx - 2)) ** 2 + ((z - t.z) / (t.rz - 2)) ** 2 <= 1,
    ) && Math.abs(x - 34) > 4
  );
}
// Preserve the original 32 coordinates so existing gardens keep their trees.
export const mountainPlots = mountainTerraces
  .flatMap((t, tier) =>
    [-1, 1].flatMap((side) => [
      ...[9, 11].map((offset) => ({ x: t.x + side * offset, z: t.z, y: t.y })),
      ...[7, 13].flatMap((offset) =>
        [-4, 4].map((dz) => ({ x: t.x + side * offset, z: t.z + dz, y: t.y })),
      ),
      ...(tier === 0
        ? [-4, 4].map((dz) => ({ x: t.x + side * 19, z: t.z + dz, y: t.y }))
        : []),
    ]),
  )
  .map((p) => ({ ...p, y: terrainHeight(p.x, p.z) }));
export const mansionSites = Array.from({ length: 6 }, (_, i) => ({
  x: i % 2 ? -70 : 138,
  z: -315 - Math.floor(i / 2) * 52,
}));
