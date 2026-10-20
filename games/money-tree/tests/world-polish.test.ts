import { test } from "node:test";
import assert from "node:assert/strict";
import { arrangeHatStack } from "../src/hat-arrangement";
import { fresh, decode, clearPosition } from "../src/game";
import { applyDebugAction } from "../src/debug-menu";
import { advanceAdventure, landMeteor } from "../src/adventure";
import { compostFertilizer } from "../src/town-life";
import { maze } from "../src/farm-layout";
test("ornaments stay above crowns, bonnet below all and sax above nest without scaling dimensions", () => {
  const hats = [
    { id: "alchemist" as const, height: 2.8 },
    { id: "treasury" as const, height: 0.8 },
    { id: "seedkeeper" as const, height: 1 },
    { id: "terrace" as const, height: 0.5 },
    { id: "propeller" as const, height: 1.2 },
  ];
  const low = arrangeHatStack(hats, 1),
    high = arrangeHatStack(hats, 3);
  assert.equal(high[0].id, "seedkeeper");
  assert.equal(high.at(-1)!.id, "alchemist");
  assert.equal(high.at(-2)!.id, "treasury");
  assert(high.at(-1)!.y > low.at(-1)!.y);
  for (const h of high)
    assert.equal(h.height, hats.find((x) => x.id === h.id)!.height);
  assert.equal(maze.cols * maze.rows * maze.cell ** 2, 4 * 11 * 5 * 3.2 ** 2);
});
test("bulk compost trades complete groups with no loss of remainder and single exchange remains available", () => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.compostScraps = 541;
  assert(compostFertilizer(s, true));
  assert.equal(s.fertilizer, 21);
  assert.equal(s.soilBags, 0);
  assert.equal(s.compostScraps, 16);
  assert(!compostFertilizer(s, true));
  s.compostScraps = 77;
  assert(compostFertilizer(s));
  assert.equal(s.compostScraps, 52);
  assert.equal(s.fertilizer, 22);
});
test("meteor rotation visits interior desert, remains bounded and saves during replacement flights", () => {
  const s = Object.assign(fresh(), { awake: true });
  applyDebugAction(s, "level3");
  s.adventure = { meteorCadence: 1, meteorNextAt: 0 };
  const seen = new Set<string>();
  for (let i = 0; i < 24; i++) {
    const m = advanceAdventure(s, 400)!;
    assert(m);
    seen.add(`${m.x},${m.z}`);
    assert(decode(JSON.stringify(s)), `flight ${i}`);
    landMeteor(s, m.id);
    assert(decode(JSON.stringify(s)), `landed ${i}`);
    assert(s.adventure.meteors!.length <= 6);
  }
  assert(seen.has("12,-190"));
  assert(seen.has("58,-240"));
  assert(seen.size >= 9);
  assert(s.plots.filter((p) => p.meteor !== undefined).length <= 6);
});

test("Level 1 players keep their position when reloading inside the expanded farm", () => {
  const p = { x: -118, z: -60 };
  assert.deepEqual(clearPosition(p, []), p);
  assert.deepEqual(clearPosition({ x: 3, z: -60 }, []), { x: 3, z: -60 });
  assert.deepEqual(clearPosition({ x: 3, z: -70 }, []), { x: -16, z: 4 });
  const s = fresh();
  s.position = p;
  assert(decode(JSON.stringify(s)));
});
