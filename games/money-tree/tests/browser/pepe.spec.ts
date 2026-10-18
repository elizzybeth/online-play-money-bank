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
  await page.evaluate(() => {
    const t = (window as any).game.targets.find(
      (t: any) => t.id === "pepe-seed-0",
    );
    (window as any).game.teleport(t.x, t.z);
  });
  for (let i = 0; i < 30; i++) await page.clock.fastForward(16);
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().pepePackets),
  ).toEqual([0]);
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  // Let the saved burst finish before walking over the remaining ground packets.
  for (let frame = 0; frame < 10; frame++) await page.clock.fastForward(250);
  for (let i = 1; i < 25; i++) {
    await page.evaluate((i) => {
      const t = (window as any).game.targets.find(
        (t: any) => t.id === `pepe-seed-${i}`,
      );
      (window as any).game.teleport(t.x, t.z);
    }, i);
    for (let frame = 0; frame < 3; frame++) await page.clock.fastForward(16);
  }
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
    125,
  );
  expect(
    await page.evaluate(() => (window as any).game.state().pepePackets.length),
  ).toBe(25);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "pepe-show");
    g.teleport(t.x, t.z + 1);
  });
  for (let frame = 0; frame < 60; frame++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "So, what do you think? Inflation, a good thing? Or not?",
  );
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
    position: { x: -9.5, z: -65 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.evaluate(() => (window as any).game.setYaw(Math.PI / 2));
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.keyboard.down("w");
  for (let i = 0; i < 120; i++) await page.clock.fastForward(16);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).game.state().position.x),
  ).toBeGreaterThan(-10.4);
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

test("Mr Wacky returns after a popped-Pepe save and dances through all five sayings", async ({
  page,
}, info) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    metStacy: true,
    foundMeditationSeeds: true,
    pepeShowStarted: true,
    pepePopped: true,
    pepeInflation: 12,
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 6; i++) await page.clock.fastForward(64);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "mr-wacky");
    g.teleport(t.x, t.z);
  });
  for (let i = 0; i < 6; i++) await page.clock.fastForward(64);
  await expect(page.locator("#prompt")).toContainText("Mr Wacky");
  await page.keyboard.press("e");
  for (const [i, line] of [
    "Good clean fun!",
    "Legal fun!",
    "Illegal fun!",
    "Sexy fun!",
    "Inflatable fun!",
  ].entries()) {
    if (i)
      await page.getByRole("button", { name: "Again!", exact: true }).click();
    await expect(page.locator(".speech-bubble")).toContainText(line);
  }
  const before = await page.evaluate(() => (window as any).game.mrWacky());
  for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
  expect(
    (await page.evaluate(() => (window as any).game.mrWacky())).body,
  ).not.toEqual(before.body);
  await page.evaluate(() => (window as any).game.mrWackyReview());
  await page.screenshot({ path: info.outputPath("mr-wacky.png") });
  await page
    .getByRole("button", { name: "See you, Mr Wacky", exact: true })
    .click();
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 6; i++) await page.clock.fastForward(64);
  expect(
    (await page.evaluate(() => (window as any).game.mrWacky())).visible,
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        (window as any).game.targets.filter((t: any) => t.id === "mr-wacky")
          .length,
    ),
  ).toBe(1);
});
