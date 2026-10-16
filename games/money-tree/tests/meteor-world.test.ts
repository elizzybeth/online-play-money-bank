import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh } from "../src/game";
import { applyDebugAction } from "../src/debug-menu";
import { createMeteorWorld } from "../src/meteor-world";
import { collectMeteorPacket } from "../src/adventure";
import { terrainHeight, setCraterSites } from "../src/millionaire-land";
import type { Target } from "../src/world";

test("meteor reconciliation skips unchanged frames and restores terrain and targets after reset", () => {
  // Artwork is not rendered in this lifecycle test; browser tests cover the models.
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({
      getContext: () =>
        new Proxy(
          {},
          {
            get: () => () => {},
            set: () => true,
          },
        ),
    }),
  } as unknown as Document;
  try {
    const s = Object.assign(fresh(), { awake: true, day: 2 });
    applyDebugAction(s, "level3");
    s.adventure = { meteorCadence: 1, meteorNextAt: 0 };
    const targets: Target[] = [
      { id: "unrelated", x: 0, z: 0, label: "Keep me" },
    ];
    let impacts = 0;
    const world = createMeteorWorld(new T.Scene(), () => impacts++, targets);
    world.update(s, 3);
    assert.equal(impacts, 1);
    const m = s.adventure.meteors![0];
    assert.equal(terrainHeight(m.x, m.z), -2.5);
    assert.equal(targets.length, 11);
    const firstTarget = targets[1];
    const stats = world.stats();
    for (let i = 0; i < 300; i++) world.update(s, 0);
    assert.deepEqual(world.stats(), stats);
    assert.equal(targets[1], firstTarget);
    assert(collectMeteorPacket(s, m.id, 0));
    world.update(s, 0);
    assert.deepEqual(world.stats(), {
      craterSyncs: stats.craterSyncs,
      packetSyncs: stats.packetSyncs + 1,
    });
    assert.equal(targets.length, 10);
    s.millionaire!.unlocked = false;
    world.update(s, 0);
    assert.equal(terrainHeight(m.x, m.z), 0);
    s.millionaire!.unlocked = true;
    world.update(s, 0);
    assert.equal(terrainHeight(m.x, m.z), -2.5);
    // Replacing state must not leave old seed targets or crater models behind.
    const reset = fresh();
    world.update(reset, 0);
    assert.deepEqual(
      targets.map((t) => t.id),
      ["unrelated"],
    );
    assert.equal(
      world.group.getObjectByName("meteor-impact-crater"),
      undefined,
    );
    assert.equal(terrainHeight(m.x, m.z), 0);
    assert.equal(impacts, 1);
  } finally {
    globalThis.document = previousDocument;
    setCraterSites([]);
  }
});
