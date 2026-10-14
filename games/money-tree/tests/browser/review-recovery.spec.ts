import { test, expect, type Page } from "@playwright/test";
import { fresh, type State } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
async function start(
  page: Page,
  state = Object.assign(fresh(), { awake: true, cash: 1500 }),
) {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, state);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
async function importState(page: Page, state: State) {
  await page.keyboard.press("Escape");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "review-save.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(state)),
  });
}
test("import retains a valid far-east Level 3 position and survives refresh", async ({
  page,
}) => {
  await start(page);
  const next = Object.assign(fresh(), {
    awake: true,
    day: 21,
    cash: 45678,
    position: { x: 150, z: -220 },
  });
  applyDebugAction(next, "level3");
  await importState(page, next);
  await expect(page.getByRole("dialog")).toBeHidden();
  for (let i = 0; i < 5; i++) await page.clock.runFor(40);
  expect(
    await page.evaluate(async () => (window as any).game.state().position),
  ).toEqual(next.position);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(async () => (window as any).game.state().position),
  ).toEqual(next.position);
});
test("failed storage write does not replace the current game or reject an unhandled promise", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  const before = await page.evaluate(async () => ({
    cash: (window as any).game.state().cash,
    raw: await (window as any).game.savedRaw("money-tree-v1"),
  }));
  await page.evaluate(async () => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
      if (k === "money-tree-v1")
        throw new DOMException("Storage is full", "QuotaExceededError");
      return original.call(this, v, k);
    };
  });
  await importState(
    page,
    Object.assign(fresh(), { awake: true, cash: 999999 }),
  );
  await expect(page.locator("#toast")).toContainText(
    "current garden is unchanged",
  );
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(before.cash);
  expect(
    await page.evaluate(
      async () => await (window as any).game.savedRaw("money-tree-v1"),
    ),
  ).toBe(before.raw);
  expect(errors).toEqual([]);
});
test("import cancels a held chicken instead of carrying it into the loaded game", async ({
  page,
}) => {
  await start(page);
  await page.evaluate(async () => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "chicken-0");
    for (const [dx, dz] of [
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
    ]) {
      try {
        g.teleport(t.x + dx, t.z + dz);
        return;
      } catch {}
    }
    throw Error("No chicken approach");
  });
  for (let i = 0; i < 5; i++) await page.clock.runFor(40);
  await page.keyboard.press("e");
  for (let i = 0; i < 16; i++) await page.clock.runFor(40);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().cuddling),
  ).toBe(0);
  await importState(page, Object.assign(fresh(), { awake: true, cash: 9876 }));
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page.evaluate(async () => (window as any).game.townLife().cuddling),
  ).toBeUndefined();
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(9876);
});

test("import during cooking cancels the old meal scene and leaves the loaded game untouched", async ({
  page,
}) => {
  await start(
    page,
    Object.assign(fresh(), {
      awake: true,
      metMom: true,
      day: 2,
      pendingMeal: 15,
      position: { x: -12.5, z: 11.2 },
    }),
  );
  for (let i = 0; i < 5; i++) await page.clock.runFor(40);
  if (await page.getByRole("button", { name: "End conversation" }).count())
    await page.getByRole("button", { name: "End conversation" }).click();
  await page.keyboard.press("e");
  for (let i = 0; i < 5; i++) await page.clock.runFor(40);
  expect(
    await page.evaluate(async () => (window as any).game.homeLiving().cooking),
  ).not.toBeNull();
  const next = Object.assign(fresh(), { awake: true, cash: 12345 });
  await importState(page, next);
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page.evaluate(async () => (window as any).game.homeLiving().cooking),
  ).toBeNull();
  for (let i = 0; i < 8; i++) await page.clock.runFor(40);
  const after = await page.evaluate(async () => (window as any).game.state());
  expect(after.cash).toBe(12345);
  expect(after.pendingMeal).toBeUndefined();
  expect(after.foodBuff).toBeUndefined();
});

test("debug tools do not report success or mutate progress when storage fails", async ({
  page,
}) => {
  await start(page);
  const cash = await page.evaluate(
    async () => (window as any).game.state().cash,
  );
  await page.evaluate(async () => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
      if (k === "money-tree-v1")
        throw new DOMException("Storage is full", "QuotaExceededError");
      return original.call(this, v, k);
    };
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Debug menu", exact: true }).click();
  await page.getByRole("button", { name: "Supplies", exact: true }).click();
  await page
    .getByRole("button", { name: "Add $10,000 to Pocket", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "progress is unchanged",
  );
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(cash);
});
