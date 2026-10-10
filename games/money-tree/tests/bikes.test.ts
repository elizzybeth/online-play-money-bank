import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { fresh, decode, movementSpeed } from "../src/game";
import { bikes, buyBike, selectBike } from "../src/bikes";
import { makeBike } from "../src/bike-models";
test("seven distinct bicycles span $50-$500 and every bike beats boosted running", () => {
  assert.equal(bikes.length, 7);
  assert.equal(new Set(bikes.map((b) => b.style)).size, 7);
  assert.equal(bikes[0].price, 5000);
  assert.equal(bikes.at(-1)!.price, 50000);
  const s = fresh();
  s.hats = ["propeller"];
  s.equippedHats = ["propeller"];
  s.equippedHat = "propeller";
  s.drink = { id: "sprint", remaining: 180 };
  for (const bike of bikes) assert(bike.speed > movementSpeed(s, true));
});
test("bike purchases are atomic, owned bikes can be selected, and saves migrate safely", () => {
  const s = fresh();
  s.cash = 5000;
  const before = JSON.stringify(s);
  assert(!buyBike(s, "road"));
  assert(!selectBike(s, "road"));
  assert.equal(JSON.stringify(s), before);
  assert(buyBike(s, "tassels"));
  assert.equal(s.cash, 0);
  assert.equal(s.selectedBike, "tassels");
  assert(!buyBike(s, "tassels"));
  s.cash = 50000;
  assert(buyBike(s, "road"));
  assert(selectBike(s, "tassels"));
  const loaded = decode(JSON.stringify(s))!;
  assert.deepEqual(loaded.bikes, ["tassels", "road"]);
  assert.equal(loaded.selectedBike, "tassels");
  const legacy = { ...s };
  delete legacy.bikes;
  delete legacy.selectedBike;
  assert.deepEqual(decode(JSON.stringify(legacy))!.bikes, []);
  const bad = decode(
    JSON.stringify({
      ...s,
      bikes: ["road", "road", "fake"],
      selectedBike: "fake",
    }),
  )!;
  assert.deepEqual(bad.bikes, ["road"]);
  assert.equal(bad.selectedBike, "road");
  assert.equal(bad.cash, s.cash);
});
test("bicycle geometry is finite, detailed and distinguishes the penny-farthing silhouette", () => {
  const sizes = new Map<string, T.Vector3>();
  for (const bike of bikes) {
    const model = makeBike(bike.id);
    const box = new T.Box3().setFromObject(model),
      size = box.getSize(new T.Vector3());
    sizes.set(bike.id, size);
    assert(size.x > 0.4 && size.y > 0.8 && size.z > 1.4);
    let meshes = 0;
    model.traverse((o) => {
      if (o instanceof T.Mesh) {
        meshes++;
        for (const n of o.geometry.getAttribute("position").array)
          assert(Number.isFinite(n));
      }
    });
    assert(meshes >= 40);
  }
  assert(sizes.get("penny")!.y > sizes.get("bmx")!.y);
});
test("journal distinguishes purchasing a bicycle from actually riding it", async () => {
  const { constructJournal, newNarrativeMemory } =
    await import("../src/branching-journal");
  const { journalContext } = await import("../src/journal");
  const s = fresh();
  s.cash = 5000;
  buyBike(s, "tassels");
  for (let seed = 1; seed < 100; seed++) {
    const entry = constructJournal(
      journalContext(s),
      newNarrativeMemory(seed),
    ).entry;
    assert.doesNotMatch(entry, /I rode|I took .* out|I kept checking/);
  }
  s.events = ["Rode my Ribbon Rider bicycle."];
  const entry = constructJournal(journalContext(s)).entry;
  assert.match(entry, /Ribbon Rider/);
  assert.doesNotMatch(entry, /I bought|I paid/);
});
