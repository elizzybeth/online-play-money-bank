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
