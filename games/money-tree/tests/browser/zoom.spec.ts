import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function frames(page: Page, n = 60) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(32);
}
async function start(page: Page, x: number, z: number, pepe = false) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = Object.assign(fresh(), {
    awake: true,
    foundTVSeeds: true,
    metStacy: pepe,
    foundMeditationSeeds: pepe,
    position: { x, z },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
test("scroll zoom reaches first person, preserves forward movement, and restores third person", async ({
  page,
}) => {
  await start(page, 3, 30);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, -1200);
  await frames(page);
  const eye = await page.evaluate(() => (window as any).game.camera().position);
  expect(Math.hypot(eye[0] - 3, eye[2] - 30)).toBeLessThan(0.1);
  expect(eye[1]).toBeCloseTo(1.7, 1);
  await page.keyboard.down("w");
  await frames(page, 20);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeLessThan(29);
  await page.mouse.wheel(0, 1200);
  await frames(page);
  const p = await page.evaluate(() => (window as any).game.state().position);
  const c = await page.evaluate(() => (window as any).game.camera().position);
  expect(Math.hypot(c[0] - p.x, c[2] - p.z)).toBeGreaterThan(3);
});
test("indoor camera can stay below the roof and remains clear of walls", async ({
  page,
}) => {
  await start(page, -16, 4);
  await page.keyboard.down("ArrowUp");
  await frames(page, 20);
  await page.keyboard.up("ArrowUp");
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.camera().position[1]),
  ).toBeLessThan(3.8);
  expect(
    await page.evaluate(() => (window as any).game.camera().penetrations),
  ).toBe(0);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, -1200);
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.camera().position[1]),
  ).toBeCloseTo(1.7, 1);
  expect(
    await page.evaluate(() => (window as any).game.camera().penetrations),
  ).toBe(0);
});
test("Doge has an accessible lane-facing east doorway", async ({ page }) => {
  await start(page, -9, -49);
  await page.evaluate(() => (window as any).game.setYaw(Math.PI / 2));
  await page.keyboard.down("w");
  await frames(page, 40);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).game.state().position.x),
  ).toBeLessThan(-12);
  await expect(
    page.getByRole("button", { name: "Maybe later", includeHidden: true }),
  ).toHaveCount(1);
  await page.keyboard.down("s");
  await frames(page, 40);
  await page.keyboard.up("s");
  expect(
    await page.evaluate(() => (window as any).game.state().position.x),
  ).toBeGreaterThan(-11);
});

for (const [name, z] of [
  ["Pepe", -65],
  ["Stacy", -81],
] as const) {
  test(`${name} has a clear lane-facing entrance`, async ({ page }) => {
    await start(page, -9, z, name === "Pepe");
    await page.evaluate(() => (window as any).game.setYaw(Math.PI / 2));
    await page.keyboard.down("w");
    await frames(page, 40);
    await page.keyboard.up("w");
    expect(
      await page.evaluate(() => (window as any).game.state().position.x),
    ).toBeLessThan(-12);
    await page.keyboard.down("s");
    await frames(page, 40);
    await page.keyboard.up("s");
    expect(
      await page.evaluate(() => (window as any).game.state().position.x),
    ).toBeGreaterThan(-11);
  });
}

test("walls disappear near the camera without compressing the boom, then restore", async ({
  page,
}) => {
  await start(page, -20.3, 4);
  await page.evaluate(() => (window as any).game.setYaw(-Math.PI / 2));
  await page.keyboard.down("ArrowUp");
  await frames(page, 40);
  await page.keyboard.up("ArrowUp");
  await frames(page, 90);
  const walls = await page.evaluate(() => (window as any).game.cameraWalls());
  expect(walls.some((w: any) => !w.visible)).toBe(true);
  const camera = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  expect(camera[0]).toBeLessThan(-22);
  await page.evaluate(() => (window as any).game.teleport(3, 30));
  await frames(page, 120);
  expect(
    await page.evaluate(() =>
      (window as any).game.cameraWalls().every((w: any) => w.visible),
    ),
  ).toBe(true);
});
