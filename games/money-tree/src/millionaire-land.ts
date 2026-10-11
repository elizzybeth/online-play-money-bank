export const willowMeeting = { x: 34, z: -130 };
export const mountainFoot = { x: 34, z: -340 };
export const mountainSummit = { x: 34, z: -445 };
export const mountainTerraces = Array.from({ length: 8 }, (_, tier) => ({
  x: 34,
  z: -340 - tier * 15,
  y: tier * 6,
  rx: 65 - tier * 6,
  rz: 15,
}));
export function terrainHeight(x: number, z: number) {
  if (Math.abs(x - 34) <= 3 && z <= -340 && z >= -445) return (-z - 340) * 0.4;
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
export const mountainPlots = mountainTerraces.flatMap((t) =>
  [-1, 1].flatMap((side) =>
    [9, 11].map((offset) => ({
      x: t.x + side * offset,
      z: t.z,
      y: t.y,
    })),
  ),
);
export const mansionSites = Array.from({ length: 6 }, (_, i) => ({
  x: i % 2 ? -53 : 107,
  z: -315 - Math.floor(i / 2) * 44,
}));
