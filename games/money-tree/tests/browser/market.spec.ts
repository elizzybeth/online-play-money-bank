import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("east-bank market has a river bridge and separate shops, vegetarian foods, persistent purchases and centered hats", async ({
  page,
}, info) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    cash: 100000,
    hats: ["beekeeper", "seedkeeper", "alchemist"],
    position: { x: 42, z: -20 },
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
  await page.keyboard.down("d");
  for (let i = 0; i < 6; i++) await page.clock.fastForward(250);
  await page.keyboard.up("d");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.x,
  ).toBeGreaterThan(42);
  expect(
    await page.evaluate(() => (window as any).game.river().travelFactor),
  ).toBe(1);
  const targets = await page.evaluate(() => (window as any).game.targets);
  expect(targets.find((t: any) => t.id === "green-basket").x).toBe(70);
  expect(targets.find((t: any) => t.id === "bright-side-home").x).toBe(104);
  await page.evaluate(() => (window as any).game.teleport(70, -18));
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
  await page.evaluate(() => (window as any).game.teleport(104, -18));
  await page.clock.fastForward(64);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Bright Side Home", exact: true }),
  ).toBeVisible();
  for (const id of [
    "everyday-sofa",
    "everyday-bed",
    "oak-sideboard",
    "coffee-table",
    "open-bookcase",
    "writing-desk",
    "bedside-table",
  ])
    await expect(page.locator(`[data-product="${id}"]`)).toHaveCount(1);
  await page.locator('[data-product="pink-locker"]').click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).furnitureBag,
  ).toContain("pink-locker");
  await page
    .getByRole("button", { name: "Back to the day", exact: true })
    .click();
  // Normal follow camera must cut away either shop's walls when orbiting indoors.
  for (const [x, z, shop] of [
    [59, -22.2, "green-basket"],
    [115, -24, "bright-side-home"],
  ] as const) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [x, z],
    );
    let hidden = false;
    for (const yaw of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      await page.evaluate((yaw) => (window as any).game.setYaw(yaw), yaw);
      for (let n = 0; n < 4; n++) await page.clock.fastForward(100);
      const walls = await page.evaluate(() =>
        (window as any).game.cameraWalls(),
      );
      expect(walls.filter((w: any) => w.shop === shop).length).toBeGreaterThan(
        5,
      );
      hidden ||= walls.some((w: any) => w.shop === shop && !w.visible);
      expect(
        (await page.evaluate(() => (window as any).game.camera())).penetrations,
      ).toBe(0);
    }
    expect(hidden).toBe(true);
  }
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
