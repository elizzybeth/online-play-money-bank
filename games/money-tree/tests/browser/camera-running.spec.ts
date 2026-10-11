import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { newMillionaire } from "../../src/millionaire";

test("running follows smoothly without repeated boom-limit snaps", async ({
  page,
}) => {
  const s = {
    ...fresh(),
    awake: true,
    metMom: true,
    day: 3,
    position: { x: 34, z: -210 },
    foundTVSeeds: true,
    foundGardenSeeds: true,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    millionaire: { ...newMillionaire(), unlocked: true, afterPepe: 10000 },
  };
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up", exact: false }).click();
  await page.evaluate(() => (window as any).game.setYaw(0));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.down("Shift");
  await page.keyboard.down("w");
  const samples: { c: number[]; p: { x: number; z: number } }[] = [];
  for (let i = 0; i < 100; i++) {
    await page.clock.fastForward(32);
    samples.push(
      await page.evaluate(() => ({
        c: (window as any).game.camera().position,
        p: (window as any).game.state().position,
      })),
    );
  }
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");
  let maxExcess = 0;
  for (let i = 20; i < samples.length; i++) {
    const a = samples[i - 1],
      b = samples[i];
    const cameraTravel = Math.hypot(...b.c.map((v, j) => v - a.c[j]));
    const playerTravel = Math.hypot(b.p.x - a.p.x, b.p.z - a.p.z);
    maxExcess = Math.max(maxExcess, cameraTravel - playerTravel);
    expect(Math.hypot(b.c[0] - b.p.x, b.c[2] - b.p.z)).toBeLessThan(8);
  }
  expect(Math.abs(samples.at(-1)!.p.z - samples[0].p.z)).toBeGreaterThan(10);
  expect(maxExcess).toBeLessThan(0.08);
});
