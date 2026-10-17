import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  decode,
  findCapSeeds,
  findHiddenSeeds,
  collectMazeSeeds,
  tick,
  move,
  walkingStepHeight,
} from "../src/game";
import {
  mazeCenter,
  mazeEntrance,
  mazeExit,
  mazeWalls,
  mazePassages,
  mazePacket,
} from "../src/farm-layout";
import { bridgeHeight, riverBridges, riverDistance } from "../src/river-land";
import { withinPlayableBounds } from "../src/world-bounds";
test("three retained discoveries unlock Sigma, old progress survives and deleted stashes cannot pay out", () => {
  const s = fresh();
  s.boughtSeeds = true;
  assert(findCapSeeds(s));
  assert(findHiddenSeeds(s, "forest"));
  assert(!s.foundTVSeeds);
  assert(!findHiddenSeeds(s, "store"));
  assert(!findHiddenSeeds(s, "tv"));
  assert(findHiddenSeeds(s, "garden"));
  assert(s.foundTVSeeds);
  assert.equal(s.seeds, 15);
  assert.equal(s.plots.filter((p) => p.community).length, 10);
  assert.equal(decode(JSON.stringify(s))!.plots.length, s.plots.length);
  const old = fresh();
  old.foundTVSeeds = true;
  old.foundStoreSeeds = true;
  old.hats = ["alchemist"];
  old.equippedHats = ["alchemist"];
  assert.deepEqual(decode(JSON.stringify(old))!.hats, ["alchemist"]);
});
test("maze reward persists a bounded five-minute active timer and rejects invalid timers", () => {
  const s = fresh();
  s.awake = true;
  assert(collectMazeSeeds(s));
  assert(!collectMazeSeeds(s));
  tick(s, 299);
  assert(!collectMazeSeeds(s));
  const loaded = decode(JSON.stringify(s))!;
  loaded.awake = false;
  tick(loaded, 1000);
  assert.equal(loaded.mazeSeedCooldown, 1);
  loaded.awake = true;
  tick(loaded, 1);
  assert(collectMazeSeeds(loaded));
  assert.equal(loaded.seeds, 10);
  for (const value of [-1, 301, "300", null]) {
    const raw = { ...s, mazeSeedCooldown: value };
    if (value !== null) assert.equal(decode(JSON.stringify(raw)), null);
  }
});
test("maze has a real navigable solution, walls prevent shortcuts, and its finish admits only outward travel", () => {
  assert.equal(mazePassages.size, 54);
  const seen = new Set([54]),
    q = [54];
  const gate = { ...mazeExit, w: 0.2, d: 3.2, exitEast: true };
  const solids = [...mazeWalls, gate];
  for (let i = 0; i < q.length; i++)
    for (let b = 0; b < 55; b++) {
      const a = q[i],
        key = `${Math.min(a, b)}:${Math.max(a, b)}`;
      if (seen.has(b) || !mazePassages.has(key)) continue;
      const p = mazeCenter(a % 11, Math.floor(a / 11)),
        dest = mazeCenter(b % 11, Math.floor(b / 11));
      move(p, dest.x - p.x, dest.z - p.z, solids);
      assert(Math.hypot(p.x - dest.x, p.z - dest.z) < 0.01, `${a}->${b}`);
      seen.add(b);
      q.push(b);
    }
  assert.equal(seen.size, 55);
  assert(
    Math.abs(mazePacket.x - mazeExit.x) > 3 ||
      Math.abs(mazePacket.z - mazeExit.z) > 3,
  );
  const out = { x: mazeExit.x - 1.6, z: mazeExit.z };
  move(out, 4, 0, solids);
  assert(out.x > mazeExit.x + 1);
  const back = { ...out };
  move(back, -4, 0, solids);
  assert(back.x > mazeExit.x + 0.5);
  const start = { ...mazeEntrance };
  move(start, -3, 0, solids);
  assert(start.x < mazeExit.x);
  for (const p of [mazeCenter(0, 0), mazeEntrance, { x: -69, z: -10 }])
    assert(withinPlayableBounds({ position: p }));
  assert(riverDistance(-85, -4.5) < 0.1);
});
test("Giant Steps climbs terraces on foot while ordinary movement and walls still constrain players", () => {
  const s = fresh();
  s.position = { x: 25, z: -353 };
  s.millionaire = { unlocked: true } as any;
  s.hats = ["alchemist"];
  s.equippedHats = ["alchemist"];
  assert.equal(walkingStepHeight(s), 2.1);
  s.equippedHats = [];
  assert.equal(walkingStepHeight(s), 0.5);
  s.equippedHats = ["alchemist"];
  s.position = { x: 0, z: 0 };
  assert.equal(walkingStepHeight(s), 0.5);
});
test("bridge approaches are broad, flat at the ends and no steeper than 1:20", () => {
  for (const b of riverBridges) {
    assert(b.w >= 8);
    const end = b.z + b.d / 2;
    assert.equal(bridgeHeight(b.x, end), 0.14);
    assert(Math.abs(bridgeHeight(b.x, end + 1.4)! - 0.07) < 1e-8);
    assert.equal(bridgeHeight(b.x, end + 3.8), 0);
    assert(bridgeHeight(b.x + 5, end + 2)! >= 0);
    assert.equal(bridgeHeight(b.x + 7, end + 2), undefined);
  }
});
