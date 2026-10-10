import { test, expect, type Page } from "@playwright/test";
import { fresh, type State } from "../../src/game";
async function start(page: Page, extra: Partial<State>) {
  const s = Object.assign(fresh(), { awake: true }, extra);
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
async function importFile(page: Page, s: State) {
  await page.getByRole("button", { name: "Pause game" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save" }).click();
  await (
    await chooser
  ).setFiles({
    name: "garden.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
}
test("planting prompt reflects hand digging and stacked speed bonuses", async ({
  page,
}) => {
  await start(page, { seeds: 2, position: { x: -20, z: 20.6 } });
  await expect(page.locator("#prompt")).toContainText("(8s)");
  const fast = Object.assign(fresh(), {
    awake: true,
    seeds: 2,
    shovel: true,
    hats: ["hardhat"],
    equippedHats: ["hardhat"],
    equippedHat: "hardhat",
    drink: { id: "dig", remaining: 180 },
    position: { x: -20, z: 20.6 },
  }) as State;
  await importFile(page, fast);
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#prompt")).toContainText("(0.5s)");
});
test("importing another save cancels an existing garden bed preview", async ({
  page,
}) => {
  await start(page, { gardenBeds: 1, position: { x: 3, z: 30 } });
  await page.keyboard.press("i");
  await page.locator('[data-item="bed"]').click();
  await expect(page.locator("#prompt")).toContainText("Escape cancels");
  const next = Object.assign(fresh(), {
    awake: true,
    gardenBeds: 1,
    cash: 1234,
    position: { x: 3, z: 30 },
  });
  await importFile(page, next);
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#prompt")).not.toContainText("Escape cancels");
  expect(
    await page.evaluate(() => (window as any).game.state().gardenBeds),
  ).toBe(1);
});
test("player stands on actual bed soil, without phantom beds from Sigma plot indices", async ({
  page,
}) => {
  await start(page, { foundTVSeeds: true, position: { x: 8, z: 19 } });
  await expect
    .poll(() => page.evaluate(() => (window as any).game.playerPosition()[1]))
    .toBe(0);
  const next = Object.assign(fresh(), {
    awake: true,
    position: { x: -28, z: 19 },
  });
  next.plots.push({
    x: -28,
    z: 19,
    stage: "empty",
    remaining: 0,
    yield: 0,
    fertilized: false,
    soilFilled: true,
  });
  await importFile(page, next);
  await expect(page.locator("#modal")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => (window as any).game.playerPosition()[1]))
    .toBe(0.29);
});
test("an empty-notebook import leaves the current game intact", async ({
  page,
}) => {
  await start(page, { cash: 1234, position: { x: 3, z: 30 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const bad = fresh();
  bad.journal = [];
  await importFile(page, bad);
  await expect(page.locator("#toast")).toContainText("could not be read");
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    1234,
  );
  expect(errors).toEqual([]);
});
test("mounting a stationary bike does not invent a journal ride", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await start(page, {
    bikes: ["tassels"],
    selectedBike: "tassels",
    position: { x: 3, z: 30 },
  });
  await page.keyboard.press("h");
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  expect(
    await page.evaluate(() => (window as any).game.state().events),
  ).not.toContain("Rode my Ribbon Rider bicycle.");
  await page.keyboard.down("w");
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.up("w");
  const events = await page.evaluate(() => (window as any).game.state().events);
  expect(
    events.filter((e: string) => e === "Rode my Ribbon Rider bicycle."),
  ).toHaveLength(1);
});
