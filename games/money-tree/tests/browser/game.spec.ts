import { walkTo } from "./movement";
import { test, expect, type Page } from "@playwright/test";
const state = (p: Page) => p.evaluate(() => (window as any).game.state());
async function at(p: Page, x: number, z: number) {
  await p.evaluate(([x, z]) => (window as any).game.teleport(x, z), [x, z]);
  await p.waitForTimeout(150);
}
async function interact(p: Page) {
  await p.keyboard.press("e");
  await p.waitForTimeout(150);
}
test("opening, real controls, economy, gardening, journal and reload", async ({
  page,
}) => {
  test.setTimeout(240000);
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("Get out of bed");
  await page.screenshot({ path: "../../work/bedroom.png" });
  await interact(page);
  await page.clock.fastForward(16);
  expect((await state(page)).awake).toBe(true);
  await expect(page.locator("#toast")).toContainText(
    "Take a look around your room",
  );
  await expect(page.locator("#objective")).toContainText("Take a look around");
  await expect(page.locator("#toast")).not.toContainText("Robertson");
  // Actual input drives the player from bedroom through the living room door.
  for (let i = 0; i < 40; i++) await page.clock.fastForward(16);
  await walkTo(page, -16, 5.3);
  await walkTo(page, -16, 12.5);
  await page.clock.resume();
  expect((await state(page)).position.z).toBeGreaterThan(12);
  await expect(page.locator("#speech-layer")).toContainText("love you");
  await at(page, -10.8, 1.4);
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await interact(page);
  await page.getByRole("button", { name: "Withdraw savings" }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect((await state(page)).cash).toBe(433);
  await at(page, 8, -31.7);
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await interact(page);
  await page.getByRole("button", { name: "Yes, seeds please" }).click();
  await page.getByRole("button", { name: "Buy · $2.00" }).click();
  await expect(page.locator("#toast")).toContainText("Money seeds?");
  for (const [x, z, price] of [
    [5, -24.9, "$1.00"],
    [10, -24.9, "$1.00"],
  ] as const) {
    await at(page, x, z);
    await interact(page);
    await page.getByRole("button", { name: `Buy · ${price}` }).click();
  }
  expect((await state(page)).cash).toBe(33);
  for (let i = 0; i < 5; i++) {
    await at(page, -20 + i * 2, 20.6);
    await interact(page);
    await expect
      .poll(async () => (await state(page)).plots[i].stage)
      .toBe("planted");
    await interact(page);
  }
  expect((await state(page)).seeds).toBe(0);
  await page.evaluate(() => (window as any).game.advance(180));
  await at(page, -16, 22);
  await page.screenshot({ path: "../../work/garden.png" });
  for (let i = 0; i < 5; i++) {
    await at(page, -20 + i * 2, 20.6);
    await interact(page);
  }
  expect((await state(page)).cash).toBeGreaterThanOrEqual(1033);
  await at(page, -10.8, 1.4);
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await interact(page);
  await page.getByRole("button", { name: "Deposit all" }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await at(page, -17.5, 1);
  await interact(page);
  await page.getByRole("button", { name: "Sleep until tomorrow" }).click();
  expect((await state(page)).day).toBe(2);
  await page.keyboard.press("j");
  const written = await state(page);
  expect(written.journalNarrative?.firstHarvestWritten).toBe(true);
  await expect(page.locator("#modal")).toContainText(
    `I harvested $${(written.journalHistory!.at(-1)!.earned / 100).toFixed(2)} today.`,
  );
  await expect(page.locator("#modal")).toContainText("$10,000.00");
  await page.getByRole("button", { name: "Close notebook" }).click();
  const before = await state(page);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect((await state(page)).bank).toBe(before.bank);
  expect((await state(page)).day).toBe(2);
  expect(errors).toEqual([]);
});
test("movement blocks walls and interaction cannot cross them", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await interact(page);
  await at(page, -9.7, 3);
  await page.keyboard.down("d");
  await page.waitForTimeout(1000);
  await page.keyboard.up("d");
  expect((await state(page)).position.x).toBeLessThan(-9.42);
  await page.evaluate(() =>
    (window as any).game.targets.push({
      id: "occlusion-probe",
      x: -9.7,
      z: 3,
      label: "Occluded target",
    }),
  );
  await at(page, -8.3, 3);
  await expect(page.locator("#prompt")).toBeEmpty();
});

test("save import preserves valid progress and refuses invalid data", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  const current = await state(page);
  current.day = 3;
  current.cash = 500;
  async function importFile(content: string) {
    await page.getByRole("button", { name: "Pause game" }).click();
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Import save" }).click();
    await (
      await chooser
    ).setFiles({
      name: "garden.json",
      mimeType: "application/json",
      buffer: Buffer.from(content),
    });
  }
  await importFile(JSON.stringify(current, null, 2));
  await expect.poll(async () => (await state(page)).day).toBe(3);
  expect((await state(page)).cash).toBe(500);
  await importFile("{}");
  await expect(page.locator("#toast")).toContainText("could not be read");
  expect((await state(page)).cash).toBe(500);
  expect((await state(page)).day).toBe(3);
});

test("Mom waits until you return home to cough, rather than through the outside wall", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await interact(page);
  const frame = await page.evaluate(() => (window as any).game.frame());
  await at(page, -24, 10);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.frame()))
    .toBeGreaterThan(frame + 1);
  expect((await state(page)).metMom).toBe(false);
  await at(page, -16, 10);
  await expect.poll(async () => (await state(page)).metMom).toBe(true);
  await expect(page.locator("#speech-layer")).toContainText("cough");
});

test("starting a new garden cancels planting and lets you get out of bed", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  const s = await state(page);
  Object.assign(s, { seeds: 1, position: { x: -20, z: 20.6 } });
  await page.getByRole("button", { name: "Pause game" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save" }).click();
  await (
    await chooser
  ).setFiles({
    name: "reset-garden.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#prompt")).toContainText("Plant seeds");
  await page.keyboard.press("e");
  await expect(page.locator("#prompt")).toContainText("Planting");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Start a new garden" }).click();
  await page.getByRole("button", { name: "Start fresh" }).click();
  await expect(page.locator("#prompt")).toContainText("Get out of bed");
  await page.keyboard.press("e");
  expect((await state(page)).awake).toBe(true);
  expect((await state(page)).bank).toBe(433);
});
