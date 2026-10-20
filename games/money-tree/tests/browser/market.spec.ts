import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("expanded market has separate shops, vegetarian foods, persistent purchases and centered hats", async ({
  page,
}, info) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    cash: 100000,
    hats: ["beekeeper", "seedkeeper", "alchemist"],
    position: { x: 34, z: -38 },
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  const wake = page.getByRole("button", { name: "Wake up" });
  await expect(wake).toBeEnabled({ timeout: 30000 });
  await wake.dispatchEvent("click");
  await page.clock.fastForward(64);
  await page.keyboard.down("w");
  for (let i = 0; i < 40; i++) await page.clock.fastForward(250);
  await page.keyboard.up("w");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBeLessThan(-40);
  await page.evaluate(() => (window as any).game.teleport(12, -46));
  await page.clock.fastForward(64);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "The Green Basket", exact: true }),
  ).toBeVisible();
  for (const item of [
    "black beans",
    "red beans",
    "pinto beans",
    "corn",
    "potato",
    "eggplant",
    "beet",
    "carrot",
    "pumpkin",
    "cabbage",
    "strawberry",
  ]) {
    await expect(page.locator(`[data-product="${item}"]`)).toHaveCount(1);
  }
  await page.locator('[data-product="pinto beans"]').click();
  await page
    .getByRole("button", { name: "Back to the day", exact: true })
    .click();
  await page.evaluate(() => (window as any).game.teleport(-20, -46));
  await page.clock.fastForward(64);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Bright Side Home", exact: true }),
  ).toBeVisible();
  await page.locator('[data-product="pink-locker"]').click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).furnitureBag,
  ).toContain("pink-locker");
  await page
    .getByRole("button", { name: "Back to the day", exact: true })
    .click();
  for (const shot of ["market", "grocer", "furnishings"]) {
    await page.evaluate((shot) => (window as any).game.homeBugShot(shot), shot);
    await page.screenshot({ path: info.outputPath(`${shot}.png`) });
  }
  await page.keyboard.press("i");
  const hats = page.locator(".hat-bag img");
  await expect(hats).toHaveCount(3);
  for (const hat of await hats.all())
    await expect(hat).toHaveJSProperty("naturalWidth", 192);
  await hats.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("centered-hats.png") });
  await page.keyboard.press("Escape");
  await page.keyboard.press("q");
  await page.clock.fastForward(250);
  await page.reload();
  await expect(wake).toBeEnabled({ timeout: 30000 });
  await wake.dispatchEvent("click");
  const loaded = await page.evaluate(() => (window as any).game.state());
  expect(loaded.groceries["pinto beans"]).toBe(1);
  expect(loaded.furnitureBag).toContain("pink-locker");
});
