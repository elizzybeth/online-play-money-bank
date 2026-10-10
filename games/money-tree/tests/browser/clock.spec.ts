import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("crop clock survives a render stall and respects the pause menu", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
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
  s.plots[0] = {
    stage: "growing",
    remaining: 180,
    fertilized: false,
    yield: 0,
  };
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
    await expect(page.locator("#modal")).toBeHidden();
    await page.clock.fastForward(16);
    await expect(page.locator("#objective")).toContainText(
      "Let your garden grow",
    );
  }
  await importGarden();
  await page.clock.fastForward(190000);
  expect((await state()).plots[0].stage).toBe("ready");
  await importGarden();
  await page.getByRole("button", { name: "Pause game" }).click();
  const before = (await state()).plots[0].remaining;
  await page.clock.fastForward(190000);
  expect((await state()).plots[0].remaining).toBe(before);
  await page.getByRole("button", { name: "Keep playing" }).click();
  await page.clock.fastForward(190000);
  expect((await state()).plots[0].stage).toBe("ready");
});

test("hand planting takes longer and watering is grey until a can is purchased", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metRobertson: true,
    seeds: 1,
    cash: 133,
    bank: 0,
    position: { x: -20, z: 20.6 },
  });
  await page.getByRole("button", { name: "Pause game" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save" }).click();
  await (
    await chooser
  ).setFiles({
    name: "hand-garden.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#modal")).toBeHidden();
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("Plant seeds");
  await page.keyboard.press("e");
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("Planting");
  await page.clock.fastForward(2000);
  const state = () => page.evaluate(() => (window as any).game.state());
  expect((await state()).plots[0].stage).toBe("empty");
  expect((await state()).seeds).toBe(1);
  await page.clock.fastForward(7000);
  expect((await state()).plots[0].stage).toBe("planted");
  await expect(page.locator("#prompt")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.locator("#prompt")).toHaveClass(/unavailable/);
  await expect(page.locator("#prompt")).toContainText("need watering can");
  await page.keyboard.press("e");
  expect((await state()).plots[0].stage).toBe("planted");
  await page.evaluate(() => (window as any).game.teleport(2, -26.9));
  await page.clock.fastForward(16);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Buy · $1.00" }).click();
  await page.evaluate(() => (window as any).game.teleport(-20, 20.6));
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toHaveAttribute(
    "aria-disabled",
    "false",
  );
  await page.keyboard.press("e");
  expect((await state()).plots[0].stage).toBe("growing");
  await page.clock.fastForward(190000);
  expect((await state()).plots[0].stage).toBe("ready");
});
