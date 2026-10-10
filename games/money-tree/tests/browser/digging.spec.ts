import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
for (const shovel of [false, true])
  test(`planting animates ${shovel ? "a shovel" : "both hands"}`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
    const s = fresh();
    Object.assign(s, {
      awake: true,
      metMom: true,
      boughtSeeds: true,
      seeds: 1,
      shovel,
      position: { x: -20, z: 21.5 },
    });
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      s,
    );
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
    await page.keyboard.press("e");
    await page.clock.fastForward(16);
    await expect
      .poll(() => page.evaluate(() => (window as any).game.digging().active))
      .toBe(true);
    await expect
      .poll(() => page.evaluate(() => (window as any).game.digging().shovel))
      .toBe(shovel);
    const pose = await page.evaluate(() => (window as any).game.digging());
    expect(pose.shovel).toBe(shovel);
    expect(pose.hands[0][0] * pose.hands[1][0]).toBeLessThan(0);
    if (!shovel) await expect(page.locator("#toast")).toContainText("shovel");
    for (let i = 0; i < 10; i++) await page.clock.fastForward(16);
    const later = await page.evaluate(() => (window as any).game.digging());
    expect(later.hands).not.toEqual(pose.hands);
    await page.keyboard.down("s");
    for (let i = 0; i < 15; i++) await page.clock.fastForward(16);
    await expect
      .poll(() => page.evaluate(() => (window as any).game.digging().active))
      .toBe(false);
    await page.keyboard.up("s");
  });
test("the inventory bed picture starts placement", async ({ page }) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    gardenBeds: 1,
    position: { x: -24, z: 21.5 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("i");
  await page
    .getByRole("button", { name: "Place a garden bed from your bag" })
    .click();
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#prompt")).toContainText("garden bed");
});
