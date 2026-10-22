import type { Rect } from "./game";
import { splitRiverBoundary } from "./river-land";

// Both rendering and collision use these same named runs. Gate openings are
// deliberately absent from permanent runs; their removable panels live below.
export const sigmaGate = { x: 34.5, z: -40, w: 5, d: 1 };
export const groveGate = { x: 39, z: -60, w: 1, d: 5, clearHeight: 2.1 };
export const villageHedgeRuns = [
  { id: "market-north", x: 91, z: -41, w: 82, d: 1 },
  { id: "market-east", x: 131, z: -19, w: 1, d: 44 },
  { id: "market-south", x: 91, z: 3, w: 82, d: 1 },
  // Far bank, opposite Green Basket. Only the market bridge cuts this run.
  { id: "market-west", x: 50, z: -19, w: 1, d: 44 },
  { id: "farm-west", x: -130, z: -12.5, w: 1, d: 103 },
  { id: "farm-north", x: -84.5, z: -64.5, w: 91, d: 1 },
  { id: "farm-sigma-seam", x: -39, z: -52.5, w: 1, d: 25 },
  { id: "village-east", x: 39, z: 0, w: 1, d: 90 },
  { id: "sigma-entry-west", x: -3.25, z: -40, w: 70.5, d: 1 },
  { id: "sigma-entry-east", x: 37.75, z: -40, w: 1.5, d: 1 },
  { id: "village-south", x: -45.5, z: 39, w: 168, d: 1 },
] as const;
export const sigmaHedgeRuns = [
  { id: "sigma-west", x: -39, z: -77.25, w: 1, d: 24.5 },
  { id: "grove-entry-south", x: 39, z: -51.25, w: 1, d: 12.5 },
  { id: "grove-entry-north", x: 39, z: -76, w: 1, d: 27 },
  { id: "sigma-north", x: 0, z: -90, w: 78, d: 1 },
] as const;
export function hedgePanels(
  runs: readonly (Rect & { id: string })[],
  height: number,
) {
  return runs.flatMap((r) => splitRiverBoundary({ ...r, clearHeight: height }));
}
