import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("crop clock survives a render stall and respects the pause menu", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metRobertson: true,
    can: true,
    cash: 33,
    bank: 0,
  });
  s.plots[0] = { stage: "growing", remaining: 90, fertilized: false, yield: 0 };
  s.position = { x: -16, z: 22 };
  const state = () => page.evaluate(() => (window as any).game.state());
  async function importGarden() {
    await page.getByRole("button", { name: "Pause game" }).click();
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Import save" }).click();
    await (
      await chooser
    ).setFiles({
      name: "clock-garden.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(s)),
    });
    await expect(page.locator("#objective")).toContainText(
      "Let your garden grow",
    );
  }
  await importGarden();
  await page.clock.fastForward(100000);
  expect((await state()).plots[0].stage).toBe("ready");
  await importGarden();
  await page.getByRole("button", { name: "Pause game" }).click();
  const before = (await state()).plots[0].remaining;
  await page.clock.fastForward(100000);
  expect((await state()).plots[0].remaining).toBe(before);
  await page.getByRole("button", { name: "Keep playing" }).click();
  await page.clock.fastForward(100000);
  expect((await state()).plots[0].stage).toBe("ready");
});
