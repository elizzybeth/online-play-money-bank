import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh, fertilize, decode } from "../src/game";
import { applyDebugAction } from "../src/debug-menu";
import { ensureMountainPlots } from "../src/millionaire";
import { terrainHeight } from "../src/millionaire-land";
import { gardenBatch } from "../src/town-life";
import {
  riverBridges,
  bridgeHeight,
  bridgeApproachHalfWidth,
  groveApproachPaths,
} from "../src/river-land";
import { createRiverWorld } from "../src/river-world";
import { cornEarGeometry, cornBladeGeometry } from "../src/corn-model";
test("Giant Steps fertilizes only eligible trees on the targeted terrace, with per-tree costs", () => {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.millionaire!.member = "fire";
  s.millionaire!.welcomeSeed = true;
  ensureMountainPlots(s);
  if (!s.hats.includes("alchemist")) s.hats.push("alchemist");
  s.equippedHats = ["alchemist"];
  s.fertilizer = 100;
  const mountain = s.plots.flatMap((p, i) => (p.mountain ? [i] : []));
  assert(mountain.length > 10);
  for (const i of mountain) {
    s.plots[i].stage = "growing";
    s.plots[i].fertilized = false;
  }
  const i = mountain[0],
    p = s.plots[i],
    height = terrainHeight(p.x!, p.z!);
  const expected = mountain.filter(
    (j) => terrainHeight(s.plots[j].x!, s.plots[j].z!) === height,
  );
  assert(expected.length > 2);
  s.plots[expected[1]].fertilized = true;
  const ids = gardenBatch(s, i, "fertilize");
  assert.deepEqual(
    new Set(ids),
    new Set(expected.filter((j) => j !== expected[1])),
  );
  for (const j of ids) assert(fertilize(s, j));
  assert.equal(s.fertilizer, 100 - ids.length);
  assert(
    mountain
      .filter((j) => !expected.includes(j))
      .every((j) => !s.plots[j].fertilized),
  );
  assert(decode(JSON.stringify(s)));
  for (const j of expected) s.plots[j].fertilized = false;
  s.fertilizer = 1;
  assert.deepEqual(gardenBatch(s, i, "fertilize"), [i]);
  s.equippedHats = [];
  s.fertilizer = 100;
  assert.deepEqual(gardenBatch(s, i, "fertilize"), [i]);
});
test("Grove landing meets the road with one aligned width and no grass notch", () => {
  const bridge = riverBridges.find((b) => b.id === "grove")!;
  assert.equal(bridgeApproachHalfWidth(bridge, 1) * 2, 5.4);
  for (let z = -89; z < -60; z += 0.2)
    for (const x of [43.4, 46, 48.6])
      assert(
        bridgeHeight(x, z) !== undefined ||
          groveApproachPaths.some(
            (p) => Math.abs(x - p.x) <= p.w / 2 && Math.abs(z - p.z) <= p.d / 2,
          ),
        `gap at ${x},${z}`,
      );
});
test("Willow Lane rails end at the deck instead of projecting across dry sidewalk", () => {
  const world = createRiverWorld(new T.Scene(), [], []);
  const b = riverBridges.find((b) => b.id === "village")!;
  const group = world.root.getObjectByName("river-bridge-village")!;
  group.traverse((o) => {
    if (!(o instanceof T.Mesh)) return;
    const p = o.geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) > 0.5) assert(Math.abs(p.getZ(i) - b.z) <= b.d / 2 + 0.11);
  });
});
test("rounded corn ears and wrapping husks retain generous proportions with bounded geometry", () => {
  const ear = cornEarGeometry(),
    husk = cornBladeGeometry(true),
    leaf = cornBladeGeometry();
  ear.computeBoundingBox();
  husk.computeBoundingBox();
  assert(ear.boundingBox!.max.x - ear.boundingBox!.min.x > 1.9);
  assert(husk.boundingBox!.max.y > 0.6);
  assert(husk.boundingBox!.min.y < -1);
  for (const g of [ear, husk, leaf]) {
    assert((g.index?.count ?? g.getAttribute("position").count) / 3 < 150);
    for (const n of g.getAttribute("position").array)
      assert(Number.isFinite(n));
    g.dispose();
  }
});
