import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("fertilizer scatters visibly, inventory delta appears, and hat rack explains powers", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = Object.assign(fresh(), {
    awake: true,
    day: 10,
    fertilizer: 5,
    hats: ["inspector"],
    position: { x: -20, z: 20.6 },
  });
  s.plots[0].stage = "growing";
  s.plots[0].remaining = 180;
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await expect(page.locator("#prompt")).toContainText("fertilizer");
  await page.keyboard.press("e");
  for (let i = 0; i < 10; i++) await page.clock.fastForward(32);
  expect(
    await page.evaluate(() => (window as any).game.fertilizerAnimation()),
  ).toEqual({ active: true, visible: true, grains: true });
  await expect(page.locator("#inventory-toasts")).toContainText(
    "−1 fertilizer doses",
  );
  expect(
    await page.evaluate(() => (window as any).game.state().fertilizer),
  ).toBe(4);
  await page.screenshot({
    path: "../../outputs/money-tree-fertilizer-animation.png",
  });
  for (let i = 0; i < 60; i++) await page.clock.fastForward(32);
  expect(
    await page.evaluate(
      () => (window as any).game.fertilizerAnimation().active,
    ),
  ).toBe(false);
  await page.evaluate(() => {
    const rack = (window as any).game.targets.find(
      (t: any) => t.id === "hat-rack",
    );
    (window as any).game.teleport(rack.x, rack.z);
  });
  for (let i = 0; i < 20; i++) await page.clock.fastForward(32);
  if (await page.getByRole("button", { name: "End conversation" }).count())
    await page
      .getByRole("button", { name: "End conversation" })
      .click({ force: true });
  await page.keyboard.press("e");
  await expect(page.locator(".hat-power")).toContainText(
    "Plant, water, fertilize and harvest two adjoining beds",
  );
  const gardens = await page.evaluate(
    () => (window as any).game.wildlife().gardens,
  );
  expect(new Set(gardens.map((g: any) => g.layoutSeed)).size).toBe(
    gardens.length,
  );
  expect(gardens.flatMap((g: any) => g.types)).toContain("orchid");
  expect(gardens.flatMap((g: any) => g.types)).toContain("kangaroo-paw");
});

test("seed recovered from harvest plays its own sound and notifies the inventory", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = Object.assign(fresh(), {
    awake: true,
    rng: 1,
    hats: ["cap"],
    equippedHat: "cap",
    equippedHats: ["cap"],
    foundCapSeeds: true,
    position: { x: -20, z: 20.6 },
  });
  s.plots[0].stage = "ready";
  s.plots[0].yield = 200;
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  await page.clock.fastForward(32);
  expect(await page.evaluate(() => (window as any).game.seedChimes())).toBe(1);
  await expect(page.locator("#inventory-toasts")).toContainText("+1 seeds");
  await expect(page.locator("#daily-net-hud")).toContainText("+$2.00");
});
test("street Chads pace but pause nearby, keep targets aligned and leave shopkeepers accessible", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = Object.assign(fresh(), {
    awake: true,
    foundTVSeeds: true,
    position: { x: 26, z: -44 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 10; i++) await page.clock.fastForward(32);
  const before = await page.evaluate(
    () => (window as any).game.sigma().walkers,
  );
  for (let i = 0; i < 100; i++) await page.clock.fastForward(32);
  const after = await page.evaluate(() => (window as any).game.sigma().walkers);
  expect(
    after.some(
      (w: any, i: number) =>
        Math.hypot(
          w.position[0] - before[i].position[0],
          w.position[2] - before[i].position[2],
        ) > 0.2,
    ),
  ).toBe(true);
  for (const w of after) {
    expect(w.target.x).toBeCloseTo(w.position[0] + 1.3);
    expect(w.target.z).toBeCloseTo(w.position[2]);
    expect(Math.hypot(w.target.x - 32, w.target.z + 74.7)).toBeGreaterThan(6);
  }
  await page.evaluate(
    ([x, z]) => (window as any).game.teleport(x, z),
    [after[0].target.x, after[0].target.z],
  );
  for (let i = 0; i < 60; i++) await page.clock.fastForward(32);
  expect(
    (await page.evaluate(() => (window as any).game.sigma().walkers))[0]
      .position,
  ).toEqual(after[0].position);
  expect(
    await page.evaluate(() => (window as any).game.sigma().entranceSign[1]),
  ).toBe(4.8);
});
