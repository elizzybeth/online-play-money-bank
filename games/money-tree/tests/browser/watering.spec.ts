import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";

test("watering tips a held can, pours into the bed, and leaves dark soil", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    can: true,
    position: { x: -20, z: 21.5 },
  });
  s.plots[0].stage = "planted";
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  expect(
    await page.evaluate(
      () => (window as any).game.wateringAnimation().soilRings[0],
    ),
  ).toBe(false);
  await page.keyboard.press("e");
  for (let i = 0; i < 30; i++) await page.clock.fastForward(16);
  const pose = await page.evaluate(() =>
    (window as any).game.wateringAnimation(),
  );
  expect(pose.active).toBe(true);
  expect(pose.visible).toBe(true);
  expect(pose.drops).toHaveLength(32);
  expect(pose.soilRings[0]).toBe(true);
  for (const drop of pose.drops) expect(drop[1]).toBeGreaterThanOrEqual(0.3);
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  expect(
    await page.evaluate(() => (window as any).game.wateringAnimation().visible),
  ).toBe(false);
  expect(
    await page.evaluate(() => (window as any).game.state().plots[0].stage),
  ).toBe("growing");
});
