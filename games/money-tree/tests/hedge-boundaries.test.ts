import { test } from "node:test";
import assert from "node:assert/strict";
import { blocked, move } from "../src/game";
import {
  villageHedgeRuns,
  sigmaHedgeRuns,
  hedgePanels,
  sigmaGate,
  groveGate,
} from "../src/hedge-boundaries";
import { riverDistance, riverBankWidth } from "../src/river-land";
const panels = [
  ...hedgePanels(villageHedgeRuns, 2.3),
  ...hedgePanels(sigmaHedgeRuns, 2.1),
];
test("every hedge perimeter is closed except named gates, bridge paths and the river channel", () => {
  // Independently describe complete perimeter lines, including seams between runs.
  const lines = [
    [-130, -64.5, -130, 39],
    [-130, -64.5, -39, -64.5],
    [-39, -90, -39, -40],
    [-39, -40, 39, -40],
    [-39, -90, 39, -90],
    [39, -90, 39, 39],
    [-130, 39, 39, 39],
    [50, -41, 132, -41],
    [131, -41, 131, 3],
    [50, 3, 132, 3],
    [50, -41, 50, 3],
  ];
  for (const [ax, az, bx, bz] of lines) {
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) * 10);
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n,
        z = az + ((bz - az) * i) / n;
      if (blocked(x, z, panels, 0.48)) continue;
      const sigma = z === -40 && x >= 32 && x <= 37;
      const grove = x === 39 && z >= -62.5 && z <= -57.5;
      const bridge = (x === 39 || x === 50) && z >= -23 && z <= -17;
      const water = riverDistance(x, z) <= riverBankWidth + 1.4;
      assert(
        sigma || grove || bridge || water,
        `unplanned hedge opening at ${x},${z}`,
      );
    }
  }
});
test("Sigma gate opens without a permanent duplicate wall and shuts before unlock", () => {
  const p = { x: 34.5, z: -37 };
  move(p, 0, -7, [...panels, sigmaGate]);
  assert(p.z > -39.1);
  Object.assign(p, { x: 34.5, z: -37 });
  move(p, 0, -7, panels);
  assert(Math.abs(p.z + 44) < 1e-7);
  move(p, 0, 7, panels);
  assert(Math.abs(p.z + 37) < 1e-7);
  assert(!panels.some((r) => blocked(34.5, -40, [r])));
});
test("far-bank hedge closes both sides of the bridge while designated crossings stay open", () => {
  for (const z of [-38, -32, -26, -14, -8, 0]) {
    const p = { x: 53, z };
    move(p, -6, 0, panels);
    assert(p.x > 50.9, `far-bank leak at ${z}`);
  }
  for (const z of [-21.5, -20, -18.5]) {
    const p = { x: 35, z };
    move(p, 25, 0, panels);
    assert(Math.abs(p.x - 60) < 1e-7);
    move(p, -25, 0, panels);
    assert(Math.abs(p.x - 35) < 1e-7);
  }
  const p = { x: 36, z: -60 };
  move(p, 6, 0, [...panels, groveGate]);
  assert(p.x < 38.1);
  Object.assign(p, { x: 36, z: -60 });
  move(p, 6, 0, panels);
  assert(Math.abs(p.x - 42) < 1e-7);
});
