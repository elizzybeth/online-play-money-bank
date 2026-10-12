import { test } from "node:test";
import assert from "node:assert/strict";
import { SaveStore } from "../src/save-store";
import { fresh } from "../src/game";
function storage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
}
test("rejected saves survive reads, autosaves, unload writes and explicit recovery export", () => {
  const s = storage();
  s.setItem("money-tree-v1", '{"day":50,"cash":120000}');
  const store = new SaveStore(s);
  store.read();
  assert.ok(store.protected);
  assert.equal(store.write(fresh()), false);
  assert.equal(s.getItem("money-tree-v1"), store.rejected);
  assert.equal(s.getItem("money-tree-v1-rejected"), store.rejected);
  assert.ok(store.write(fresh(), true));
  assert.equal(store.protected, false);
});
test("a valid backup recovers progress and invalid new state cannot overwrite it", () => {
  const s = storage(),
    state = fresh();
  state.day = 17;
  state.cash = 12345;
  s.setItem("money-tree-v1", JSON.stringify(state));
  const first = new SaveStore(s);
  first.read();
  assert.ok(first.write(state));
  s.setItem("money-tree-v1", "broken data");
  const second = new SaveStore(s),
    recovered = second.read();
  assert.equal(recovered.cash, 12345);
  assert.equal(recovered.day, 17);
  assert.ok(second.recovered);
  assert.ok(second.write(recovered));
  const original = s.getItem("money-tree-v1");
  recovered.cash = NaN;
  assert.equal(second.write(recovered), false);
  assert.equal(s.getItem("money-tree-v1"), original);
  assert.equal(s.getItem("money-tree-v1-rejected"), "broken data");
});
