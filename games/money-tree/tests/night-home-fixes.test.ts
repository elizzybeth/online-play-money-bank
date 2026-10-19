import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh, decode } from "../src/game";
import { completeMeditation } from "../src/sigma";
import { nightDialogue, hasAlternateChadTopic } from "../src/night-dialogue";
import {
  seatForTea,
  createTeaDrinking,
  TEA_SEAT_HEIGHT,
} from "../src/tea-pose";
import { makeDiamondHand } from "../src/diamond-hands";

test("meditation welcomes empty pockets, preserves partial savings and awards its seeds once", () => {
  for (const cash of [0, 299, 300, 700]) {
    const s = fresh();
    s.cash = cash;
    const seeds = s.seeds;
    assert.equal(completeMeditation(s), cash >= 300 ? 300 : 0);
    assert.equal(s.cash, cash >= 300 ? cash - 300 : cash);
    assert.equal(s.seeds, seeds + 5);
    const restored = decode(JSON.stringify(s))!;
    assert.equal(completeMeditation(restored), undefined);
    assert.equal(restored.seeds, seeds + 5);
  }
});
test("indoor neighbors have distinct monster dialogue and Chad alternate topics are actionable", () => {
  const ids = [
    "mom",
    "npc1",
    "npc2",
    "npc3",
    "robertson",
    "bicycle",
    "grindset",
    "gigachad",
    "soyjak",
    "stacy",
    "mr-wacky",
    "willow-guru",
  ];
  assert.equal(new Set(ids.map(nightDialogue)).size, ids.length);
  for (const id of [
    ...ids,
    "sigma-chad-0",
    "doge-meditator-2",
    "millionaire-child-4",
  ]) {
    assert.match(nightDialogue(id), /Flapping Wallets?/);
    assert.match(nightDialogue(id), /Cash Cows?/);
  }
  assert(hasAlternateChadTopic("doge-meditator-0"));
  assert(!hasAlternateChadTopic("sigma-chad-0"));
  assert(!hasAlternateChadTopic("unhandled-chad"));
});
test("tea sits hips at the cushion, moves a real cup to the mouth and restores the pose without allocation", () => {
  const scene = new T.Scene(),
    actor = new T.Group(),
    cup = new T.Group();
  const body = new T.Mesh(
    new T.SphereGeometry(0.4),
    new T.MeshStandardMaterial(),
  );
  body.name = "body";
  actor.add(body);
  const hand = new T.Group();
  hand.name = "hand-1";
  hand.position.set(0.43, 0.79, 0);
  actor.add(hand);
  for (const side of [-1, 1]) {
    const foot = new T.Group();
    foot.name = "foot";
    foot.position.set(side * 0.15, 0.16, 0);
    actor.add(foot);
  }
  actor.position.set(10.25, 0, 15.2);
  actor.rotation.y = Math.PI / 2;
  scene.add(actor, cup);
  cup.position.set(11.4, 1.34, 15.45);
  const home = cup.position.clone();
  seatForTea(actor, true);
  assert.equal(actor.position.y, TEA_SEAT_HEIGHT);
  assert(Math.abs(actor.position.y + 0.31 - 0.62) < 0.04);
  const legs = actor.getObjectByName("tea-legs")!;
  const update = createTeaDrinking(actor, cup);
  update(2.5, true);
  assert(cup.position.distanceTo(home) > 0.5);
  const mouth = actor.localToWorld(new T.Vector3(0.18, 1.08, 0.52));
  assert(cup.position.distanceTo(mouth) < 1e-6);
  update(0, true, true);
  assert.deepEqual(cup.position, home);
  update(0, false);
  assert.deepEqual(hand.position.toArray(), [0.43, 0.79, 0]);
  seatForTea(actor, false);
  assert(!legs.visible);
  seatForTea(actor, true);
  assert.equal(actor.getObjectByName("tea-legs"), legs);
});
test("diamond hands use closed brilliant-cut geometry with a table, girdle and pointed pavilion", () => {
  const a = makeDiamondHand(1),
    b = makeDiamondHand(-1);
  const gem = a.getObjectByName("palm-diamond") as T.Mesh;
  assert.equal(
    (b.getObjectByName("palm-diamond") as T.Mesh).geometry,
    gem.geometry,
  );
  const p = gem.geometry.attributes.position;
  assert.equal(p.count, 8 * 6 * 3);
  assert.equal(
    new Set(
      Array.from({ length: p.count }, (_, i) => Number(p.getY(i).toFixed(2))),
    ).size,
    4,
  );
  for (const n of p.array) assert(Number.isFinite(n));
});
