import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";

test("distinct neighborhood gardens and wildlife visit existing birdhouses", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    boughtSeeds: true,
    position: { x: 3, z: 20 },
    birdhousesBuilt: 3,
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const before = await page.evaluate(() => (window as any).game.wildlife());
  expect(before.gardens).toHaveLength(17);
  const trees = await page.evaluate(() =>
    (window as any).game.scenery.filter((o: any) => o.kind === "tree"),
  );
  expect(trees.length).toBeGreaterThan(35);
  expect(new Set(trees.map((t: any) => t.variety)).size).toBe(4);
  const types = before.gardens.flatMap((g: any) => g.types);
  for (const type of [
    "flytrap",
    "pitcher",
    "sundew",
    "rosette",
    "aloe",
    "cactus",
    "sunflower",
    "cabbage",
    "banana",
  ])
    expect(types).toContain(type);
  expect(before.birds).toHaveLength(10);
  expect(before.butterflies).toHaveLength(20);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => (window as any).game.wildlife());
  expect(after.butterflies[0].position).not.toEqual(
    before.butterflies[0].position,
  );
  expect(after.birds.some((b: any) => b.perch === "birdhouse")).toBe(true);
  await page.screenshot({ path: "../../outputs/money-tree-new-gardens.png" });
  for (const [x, z, name] of [
    [7, -5, "carnivorous"],
    [17.5, 9, "succulents"],
  ] as const) {
    await page.evaluate(
      ([x, z]) => {
        (window as any).game.teleport(x, z);
        (window as any).game.setYaw(Math.PI);
      },
      [x, z],
    );
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `../../outputs/money-tree-${name}.png` });
  }
  await page.evaluate(() => {
    (window as any).game.teleport(7, -24);
    (window as any).game.setYaw(0);
  });
  await page.waitForTimeout(1800);
  expect(
    await page.evaluate(() =>
      (window as any).game.shopSigns().every((s: any) => !s.visible),
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../../outputs/money-tree-roomy-robertsons.png",
  });
});

test("notebook page sketches vary and controls stay outside long entry scrolling", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    journal: [
      s.journal[0],
      "Day 2. " + "I watered the garden today. ".repeat(70),
      "Day 3. Mom painted today.",
    ],
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  const latest = await page.locator(".notebook-doodles").innerHTML();
  await page.getByRole("button", { name: "Previous page" }).click();
  expect(await page.locator(".notebook-doodles").innerHTML()).not.toBe(latest);
  await page.setViewportSize({ width: 700, height: 450 });
  await page.waitForTimeout(500);
  const buttons = page.locator(".notebook-paper .choices");
  const bounds = await buttons.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(451);
  await page
    .locator(".notebook-spread")
    .evaluate((e) => (e.scrollTop = e.scrollHeight));
  expect((await buttons.boundingBox())!.y).toBeCloseTo(bounds!.y, 0);
  await page.getByRole("button", { name: "Next page" }).click();
  expect(await page.locator(".notebook-doodles").innerHTML()).toBe(latest);
});

test("HUD renders seed packet artwork with current count", async ({ page }) => {
  const s = fresh();
  Object.assign(s, { awake: true, seeds: 13 });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#seed-hud strong")).toHaveText("13");
  await expect(page.getByAltText("Money Tree seed packet")).toBeVisible();
  expect(
    await page
      .getByAltText("Money Tree seed packet")
      .evaluate((e: HTMLImageElement) => e.naturalWidth),
  ).toBeGreaterThan(100);
});

test("forward heading survives crossing house and shop doorways", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    boughtSeeds: true,
    position: { x: -16, z: 15.5 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (const [x, z, yaw] of [
    [-16, 15.5, 0],
    [7, -19.5, 0],
    [7, -23, Math.PI],
  ]) {
    await page.evaluate(
      ([x, z, yaw]) => {
        (window as any).game.teleport(x, z);
        (window as any).game.setYaw(yaw);
      },
      [x, z, yaw],
    );
    for (let i = 0; i < 20; i++) await page.clock.fastForward(16);
    const before = await page.evaluate(
      () => (window as any).game.state().position,
    );
    await page.keyboard.down("w");
    for (let i = 0; i < 30; i++) {
      await page.clock.fastForward(32);
      const heading = await page.evaluate(
        () => (window as any).game.camera().forward,
      );
      expect(heading[2]).toBeCloseTo(-Math.cos(yaw), 5);
    }
    await page.keyboard.up("w");
    const after = await page.evaluate(
      () => (window as any).game.state().position,
    );
    expect((after.z - before.z) * -Math.cos(yaw)).toBeGreaterThan(1);
  }
});
