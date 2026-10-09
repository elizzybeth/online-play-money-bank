import { test, expect, type Page } from "@playwright/test";
import { fresh, blocked, type State } from "../../src/game";
const state = (page: Page): Promise<State> =>
  page.evaluate(() => (window as any).game.state());
async function start(page: Page) {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
}
async function importSave(page: Page, s: State) {
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
  await expect(page.locator("#modal")).toBeHidden();
}
test("watering a seed while standing on it clears the new trunk and allows movement", async ({
  page,
}) => {
  await start(page);
  const s = fresh();
  Object.assign(s, { awake: true, can: true, position: { x: -20, z: 19 } });
  s.plots[0].stage = "planted";
  await importSave(page, s);
  await expect(page.locator("#prompt")).toContainText("Water seeds");
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await state(page)).plots[0].stage)
    .toBe("growing");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).game.rects.some(
          (r: any) => r.x === -20 && r.z === 19 && r.w === 0.28,
        ),
      ),
    )
    .toBe(true);
  const rects = await page.evaluate(() => (window as any).game.rects);
  const before = (await state(page)).position;
  expect(blocked(before.x, before.z, rects)).toBe(false);
  expect(Math.hypot(before.x + 20, before.z - 19)).toBeLessThan(1);
  await page.keyboard.down("s");
  await expect
    .poll(async () => (await state(page)).position.z)
    .toBeGreaterThan(before.z + 0.5);
  await page.keyboard.up("s");
  expect((await state(page)).plots[0].stage).toBe("growing");
});
test("unstuck returns home without resetting resources, journal, day or crops; cancels digging", async ({
  page,
}) => {
  await start(page);
  const s = fresh();
  Object.assign(s, {
    awake: true,
    day: 7,
    cash: 1250,
    bank: 433,
    seeds: 3,
    fertilizer: 2,
    can: true,
    position: { x: -20, z: 20.6 },
  });
  s.plots[1] = { stage: "ready", remaining: 0, fertilized: true, yield: 600 };
  s.journal.push("A good day in the garden.");
  await importSave(page, s);
  await page.keyboard.press("e");
  await expect(page.locator("#prompt")).toContainText("Planting");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "I'm stuck — return home" }).click();
  await expect(page.locator("#modal")).toBeHidden();
  await expect.poll(async () => (await state(page)).metMom).toBe(true);
  const after = await state(page);
  expect(after).toEqual({ ...s, metMom: true, events: ["Checked in with Mom after coming home."], position: { x: -16, z: 4 } });
  await page.waitForTimeout(300);
  await expect(page.locator("#prompt")).not.toContainText("Planting");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(await state(page)).toEqual(after);
});
test("Mom and Robertson remind an empty-pocket player about the piggy bank", async ({
  page,
}) => {
  await start(page);
  await page.evaluate(() => (window as any).game.teleport(-16, 10));
  await expect(page.locator("#speech-layer")).toContainText(
    "Take some money with you",
  );
  await expect(page.locator("#speech-layer")).toContainText("piggy bank");
  await page.evaluate(() => (window as any).game.teleport(-17.2, 10));
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("piggy bank");
  await page.getByRole("button", { name: "Love you too" }).click();
  await page.evaluate(() => (window as any).game.teleport(8, -31.7));
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "Head back home and check your piggy bank",
  );
  await page.getByRole("button", { name: "Look around" }).click();
  await page.evaluate(() => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Withdraw savings" }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.evaluate(() => (window as any).game.teleport(-17.2, 10));
  await expect(page.locator("#prompt")).toContainText("Mom");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).not.toContainText("piggy bank");
  await page.getByRole("button", { name: "Love you too" }).click();
  await page.evaluate(() => (window as any).game.teleport(8, -31.7));
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).not.toContainText(
    "Head back home",
  );
});
test("Robertsons' two sign boards do not overlap", async ({ page }) => {
  await start(page);
  const [name, trade] = await page.evaluate(() =>
    (window as any).game.shopSigns(),
  );
  expect(name.min[1]).toBeGreaterThan(trade.max[1] + 0.1);
  await page.evaluate(() => {
    (window as any).game.teleport(8, -8);
    (window as any).game.setYaw(0);
  });
  await page.mouse.move(900, 600);
  await page.mouse.down();
  await page.mouse.move(900, 500, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await page.screenshot({ path: "../../outputs/money-tree-store-sign.png" });
});
