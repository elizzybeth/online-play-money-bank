import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, decode } from "../src/game";
import {
  canEnterPepe,
  startPepeShow,
  tickPepeShow,
  collectPepePacket,
} from "../src/pepe-event";
test("Pepe requires both encounters, bursts once and scatters exactly twenty-five collectible packets", () => {
  const s = fresh();
  assert(!canEnterPepe(s));
  s.metStacy = true;
  assert(!canEnterPepe(s));
  s.foundMeditationSeeds = true;
  assert(canEnterPepe(s));
  assert(startPepeShow(s));
  assert(!startPepeShow(s));
  assert(!tickPepeShow(s, 11));
  assert(!collectPepePacket(s, 0));
  assert(tickPepeShow(s, 1));
  assert(!tickPepeShow(s, 99));
  for (let i = 0; i < 25; i++) {
    assert(collectPepePacket(s, i));
    assert(!collectPepePacket(s, i));
  }
  assert.equal(s.seeds, 125);
  assert(!collectPepePacket(s, 25));
  assert(!collectPepePacket(s, -1));
  assert(decode(JSON.stringify(s)));
  assert.equal(decode(JSON.stringify({ ...s, pepePackets: [0, 0] })), null);
});
test("invalid balloon elapsed time cannot corrupt a save or pop the balloon", () => {
  const s = fresh();
  s.metStacy = true;
  s.foundMeditationSeeds = true;
  startPepeShow(s);
  const before = JSON.stringify(s);
  for (const dt of [NaN, Infinity, -Infinity, -1, 0])
    assert(!tickPepeShow(s, dt));
  assert.equal(JSON.stringify(s), before);
  assert(decode(JSON.stringify(s)));
});

test("Pepe scatter is irregular, reload-stable and keeps all packets on clear ground", async () => {
  const { pepeScatter } = await import("../src/pepe-scatter");
  const obstacle = (x: number, z: number) =>
    x > 10 && x < 20 && z < -60 && z > -70;
  const points = pepeScatter(obstacle);
  assert.equal(points.length, 100);
  assert.deepEqual(points, pepeScatter(obstacle));
  assert(points.every((p) => !obstacle(p.x, p.z)));
  assert.equal(new Set(points.slice(0, 25).map((p) => p.x)).size, 25);
  assert.equal(new Set(points.slice(0, 25).map((p) => p.z)).size, 25);
  for (let i = 0; i < 25; i++)
    for (let j = 0; j < i; j++)
      assert(
        Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z) >= 1.4,
      );
});
