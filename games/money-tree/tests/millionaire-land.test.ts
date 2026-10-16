import { test } from "node:test";
import assert from "node:assert/strict";
import {
  willowMeeting,
  mountainFoot,
  mountainSummit,
  mountainPlots,
  terrainHeight,
  setCraterSites,
  craterHeight,
  fertileMountainSoil,
} from "../src/millionaire-land";
test("the normal running route takes thirty seconds to the mountain and fifteen to climb", () => {
  assert.equal(
    Math.hypot(
      mountainFoot.x - willowMeeting.x,
      mountainFoot.z - willowMeeting.z,
    ) / 7,
    30,
  );
  assert.equal(
    Math.hypot(
      mountainSummit.x - mountainFoot.x,
      mountainSummit.z - mountainFoot.z,
    ) / 7,
    15,
  );
  let previous = 0;
  for (let distance = 0; distance <= 105; distance += 0.25) {
    const y = terrainHeight(34, -340 - distance);
    assert(y >= previous && y - previous <= 0.101);
    previous = y;
  }
  assert.equal(terrainHeight(34, -445), 14);
});
test("terrace plots are unique, fertile and level with the terrain", () => {
  assert.equal(
    new Set(mountainPlots.map((p) => `${p.x},${p.z}`)).size,
    mountainPlots.length,
  );
  assert(mountainPlots.length > 100);
  for (const p of mountainPlots) {
    assert(fertileMountainSoil(p.x, p.z));
    assert.equal(terrainHeight(p.x, p.z), p.y);
  }
  assert(!fertileMountainSoil(34, -380));
  assert(!fertileMountainSoil(0, 0));
});

test("crater terrain matches the bowl and leaves the outer edge on desert ground", () => {
  setCraterSites([{ x: -80, z: -180 }]);
  try {
    for (const [dx, dz] of [
      [0, 0],
      [3, 4],
      [0, 7],
      [0, 8],
      [6, 7],
    ])
      assert.equal(
        terrainHeight(-80 + dx, -180 + dz),
        craterHeight(Math.sqrt(dx * dx + dz * dz)),
      );
    assert.equal(terrainHeight(-70, -180), 0);
    assert.equal(terrainHeight(150, -220), 0);
  } finally {
    setCraterSites([]);
  }
});
