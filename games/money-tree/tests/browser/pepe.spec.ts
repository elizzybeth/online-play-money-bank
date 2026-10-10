import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("Pepe opens after both encounters, inflates after dialogue, and keeps collected seeds on reload", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    foundGardenSeeds: true,
    metStacy: true,
    foundMeditationSeeds: true,
    position: { x: -18, z: -60 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 40; i++) await page.clock.fastForward(16);
  await expect(page.locator(".speech-bubble")).toContainText("Is inflation");
  for (let i = 0; i < 4; i++) await page.keyboard.press("e");
  expect(
    await page.evaluate(() => (window as any).game.state().pepeShowStarted),
  ).toBe(true);
  for (let i = 0; i < 36; i++) await page.clock.fastForward(250);
  expect(
    await page.evaluate(() => (window as any).game.camera().position[1]),
  ).toBeGreaterThan(25);
  for (let i = 0; i < 24; i++) await page.clock.fastForward(250);
  expect(
    await page.evaluate(() => (window as any).game.state().pepePopped),
  ).toBe(true);
  await page.evaluate(() => (window as any).game.teleport(-6, -47));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("money seeds");
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().pepePackets),
  ).toEqual([0]);
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  for (let i = 1; i < 25; i++) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [-6 + (i % 5) * 9, i === 24 ? -74 : -47 - Math.floor(i / 5) * 8],
    );
    for (let frame = 0; frame < 3; frame++) await page.clock.fastForward(16);
    await page.keyboard.press("e");
  }
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
    125,
  );
  expect(
    await page.evaluate(() => (window as any).game.state().pepePackets.length),
  ).toBe(25);
});
test("the Pepe doorway remains physically closed before meeting Stacy and completing meditation", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    foundGardenSeeds: true,
    position: { x: -18, z: -56.8 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.evaluate(() => (window as any).game.setYaw(0));
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.keyboard.down("w");
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeGreaterThan(-57.4);
  expect(
    await page.evaluate(() => (window as any).game.state().pepeShowStarted),
  ).toBe(false);
});
test("starting fresh immediately after the balloon pops releases cinematic controls", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    metStacy: true,
    foundMeditationSeeds: true,
    pepeShowStarted: true,
    pepeInflation: 11.9,
    position: { x: -18, z: -60 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 4; i++) await page.clock.fastForward(100);
  expect(
    await page.evaluate(() => (window as any).game.state().pepePopped),
  ).toBe(true);
  await page.evaluate(() => (window as any).game.reset());
  await page.keyboard.press("e");
  for (let i = 0; i < 4; i++) await page.clock.fastForward(16);
  expect(await page.evaluate(() => (window as any).game.state().awake)).toBe(
    true,
  );
});
