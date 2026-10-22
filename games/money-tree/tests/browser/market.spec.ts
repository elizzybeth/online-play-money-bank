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
  await expect(page.locator('[data-product="beans"]')).toHaveCount(0);
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
    [115, -28, "bright-side-home"],
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
  await page.evaluate(() => (window as any).game.teleport(55, -20));
  await page.clock.fastForward(250);
  const roof = await page.evaluate(() => (window as any).game.marketRoof());
  expect(roof.visible).toBe(true);
  expect(roof.cutaway).toBe(true);
  expect(roof.min[0]).toBeLessThan(58);
  expect(roof.max[0]).toBeGreaterThan(82);
  expect(roof.min[2]).toBeLessThan(-32);
  expect(roof.max[2]).toBeGreaterThan(-16);
  await page.evaluate(() => (window as any).game.teleport(70, -18));
  await page.evaluate(() => (window as any).game.setYaw(Math.PI));
  await page
    .locator("canvas")
    .first()
    .dispatchEvent("wheel", { deltaY: 1000, bubbles: true });
  for (let n = 0; n < 12; n++) await page.clock.fastForward(100);
  expect(
    (await page.evaluate(() => (window as any).game.marketRoof())).visible,
  ).toBe(false);
  await page
    .locator("canvas")
    .first()
    .dispatchEvent("wheel", { deltaY: -1000, bubbles: true });
  // Cross the showroom between front and rear sets without a partition blocking it.
  for (let x = 96; x <= 112; x += 0.5)
    await page.evaluate((x) => (window as any).game.teleport(x, -24.5), x);
  const glazing = await page.evaluate(() =>
    (window as any).game.marketWindows(),
  );
  expect(glazing).toHaveLength(2);
  expect(glazing[0].transparent).toBe(true);
  expect(glazing[0].opacity).toBeLessThan(0.25);
  expect(glazing[0].min[0]).toBeCloseTo(58);
  expect(glazing[0].max[1] - glazing[0].min[1]).toBeGreaterThan(5);
  // Walk directly off the bridge through the new river entrance.
  await page.evaluate(() => {
    (window as any).game.teleport(55, -20);
    (window as any).game.setYaw(0);
  });
  await page.keyboard.down("d");
  for (let i = 0; i < 12; i++) await page.clock.fastForward(100);
  await page.keyboard.up("d");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.x,
  ).toBeGreaterThan(58.6);
  const facade = await page.evaluate(() => (window as any).game.marketFacade());
  expect(facade).toHaveLength(2);
  expect(facade.every((f: any) => f.bounds.min.y > 6)).toBe(true);
  for (const shot of [
    "market",
    "grocer",
    "grocer-river",
    "grocer-front",
    "grocer-side",
    "market-hedge",
    "furnishings",
    "home-entry",
  ]) {
    await page.evaluate((shot) => (window as any).game.homeBugShot(shot), shot);
    await page.screenshot({ path: info.outputPath(`${shot}.png`) });
  }
  const rects = await page.evaluate(() => (window as any).game.rects);
  expect(
    rects.some(
      (r: any) =>
        r.id === "market-west" &&
        Math.abs(r.x - 50) < 0.1 &&
        r.z - r.d / 2 <= -35 &&
        r.z + r.d / 2 >= -25,
    ),
  ).toBe(true);
  const beans = rects.find(
    (r: any) => Math.abs(r.x - 80.95) < 0.01 && Math.abs(r.z + 26.9) < 0.01,
  );
  const rear = rects.find(
    (r: any) => Math.abs(r.x - 78.7) < 0.01 && Math.abs(r.z + 30.65) < 0.01,
  );
  expect(beans.z - beans.d / 2 - (rear.z + rear.d / 2)).toBeGreaterThan(0.5);
  const beforeSunset = await page.evaluate(() => (window as any).game.night());
  await page.evaluate(() => {
    const game = (window as any).game;
    game.nightClock(285 - game.night().state.elapsed);
    game.teleport(35, -20);
  });
  for (let i = 0; i < 12; i++) await page.clock.fastForward(100);
  const sunset = await page.evaluate(() => (window as any).game.night());
  expect(sunset.dark).toBe(false);
  expect(sunset.ambient).toBeLessThan(beforeSunset.ambient - 0.5);
  expect(sunset.sky).not.toBe(beforeSunset.sky);
  await page.evaluate(() => (window as any).game.homeBugShot("grocer-river"));
  await page.screenshot({ path: info.outputPath("sunset.png") });
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
