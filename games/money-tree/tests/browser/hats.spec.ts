import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
import { hats } from "../../src/hats";
async function setup(page: Page) {
  const s = fresh();
  s.awake = true;
  s.cash = 100000;
  s.boughtSeeds = true;
  s.plots[0] = {
    stage: "growing",
    remaining: 180,
    fertilized: false,
    yield: 0,
  };
  s.position = { x: 24, z: -20 };
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
test("walk into hat shop, inspect ten detailed hats, find seeds and buy/equip with persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await setup(page);
  await page.keyboard.down("w");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.state().position.z))
    .toBeLessThan(-25);
  await page.keyboard.up("w");
  await expect(page.locator("#location")).toHaveText("Thread & Thimble");
  const models = await page.evaluate(() => (window as any).game.hatDisplays());
  expect(models).toHaveLength(10);
  expect(models.every((h: any) => h.meshes >= 5)).toBe(true);
  await page.screenshot({ path: "../../outputs/money-tree-hat-shop.png" });
  await page.evaluate(() => (window as any).game.teleport(20.65, -24.6));
  await expect(page.locator("#prompt")).toContainText("Sprout Cap");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Check the brim" }).click();
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  for (const [i, hat] of hats.entries()) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [i < 5 ? 20.65 : 27.35, -24.6 - (i % 5) * 1.85],
    );
    await expect(page.locator("#prompt")).toContainText(hat.name);
    await page.keyboard.press("e");
    await expect(page.locator(".hat-portrait")).toBeVisible();
    await expect(page.getByRole("heading", { name: hat.name })).toBeVisible();
    await page
      .getByRole("button", {
        name: `Buy & wear · $${(hat.price / 100).toFixed(2)}`,
      })
      .click();
    await expect
      .poll(() => page.evaluate(() => (window as any).game.wornHatHeight()))
      .toBeLessThanOrEqual(2.651);
  }
  const state = await page.evaluate(() => (window as any).game.state());
  expect(state.hats).toHaveLength(10);
  expect(state.cash).toBe(100000 - hats.reduce((n, h) => n + h.price, 0));
  await page.keyboard.press("i");
  await expect(page.locator("[data-hat] img")).toHaveCount(10);
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await page.screenshot({ path: "../../outputs/money-tree-hats.png" });
  await page.locator("[data-hat=inspector]").click();
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await expect(page.locator("#tree-report")).toBeVisible();
  await expect(page.locator("#tree-report")).toContainText("Tree 5");
  await expect(page.locator("#tree-report")).toContainText("remaining");
  await page.evaluate(() => (window as any).game.advance(180));
  await expect(page.locator("#tree-report")).toContainText("Ready to harvest!");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().equippedHat),
  ).toBe("inspector");
  await expect(page.locator("#tree-report")).toBeVisible();
  expect(errors).toEqual([]);
});
test("rabbit hat enables an actual jump, landing and collision remain safe", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.hats = ["rabbit", "propeller", "lantern"];
  s.equippedHat = "rabbit";
  s.position = { x: 3, z: 20 };
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("Space");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.jumpHeight()))
    .toBeGreaterThan(0.3);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.jumpHeight()))
    .toBe(0);
  await page.evaluate(() => (window as any).game.equipHat(null));
  await page.keyboard.press("Space");
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => (window as any).game.jumpHeight())).toBe(0);
});

test("speed hat increases actual walking and headlamp extends interaction reach", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.hats = ["propeller", "lantern"];
  s.equippedHat = "propeller";
  s.position = { x: 3, z: 20 };
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.down("w");
  for (let i = 0; i < 4; i++) await page.clock.fastForward(250);
  await page.keyboard.up("w");
  const boosted =
    20 - (await page.evaluate(() => (window as any).game.state().position.z));
  await page.evaluate(() => {
    (window as any).game.teleport(3, 20);
    (window as any).game.equipHat(null);
  });
  await page.keyboard.down("w");
  for (let i = 0; i < 4; i++) await page.clock.fastForward(250);
  await page.keyboard.up("w");
  const normal =
    20 - (await page.evaluate(() => (window as any).game.state().position.z));
  expect(boosted / normal).toBeCloseTo(1.25, 1);
  await page.evaluate(() => {
    (window as any).game.teleport(22.9, -24.6);
    (window as any).game.equipHat("lantern");
  });
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("Sprout Cap");
  await page.evaluate(() => (window as any).game.equipHat(null));
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toHaveText("");
});
