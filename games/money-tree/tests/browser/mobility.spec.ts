import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("Spring Hare clears the hedge into Sigma and Q rolls without crossing walls", async ({
  page,
}) => {
  // Keep the full jump/roll assertions with fewer software-rendered frames.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    foundGardenSeeds: true,
    hats: ["rabbit"],
    equippedHat: "rabbit",
    equippedHats: ["rabbit"],
    position: { x: -30, z: -37.5 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => (window as any).game.setYaw(0));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("Space");
  await page.keyboard.down("w");
  let peak = 0;
  for (let i = 0; i < 55; i++) {
    await page.clock.fastForward(32);
    peak = Math.max(
      peak,
      await page.evaluate(() => (window as any).game.jumpHeight()),
    );
  }
  await page.keyboard.up("w");
  expect(peak).toBeGreaterThan(3);
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeLessThan(-41);
  expect(await page.evaluate(() => (window as any).game.jumpHeight())).toBe(0);
  await page.evaluate(() => (window as any).game.teleport(3, 25));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("q");
  for (let i = 0; i < 16; i++) await page.clock.fastForward(32);
  const p = await page.evaluate(() => (window as any).game.state().position);
  expect(Math.hypot(p.x - 3, p.z - 25)).toBeGreaterThan(4);
  expect(Math.hypot(p.x - 3, p.z - 25)).toBeLessThan(4.6);
  await page.evaluate(() => (window as any).game.teleport(-30, -37.5));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("q");
  for (let i = 0; i < 16; i++) await page.clock.fastForward(32);
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeGreaterThan(-39.1);
});
