import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
async function open(page: any, position = { x: -16, z: 4 }) {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    cash: 2000,
    position,
    night: { elapsed: 300, hp: 10 },
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s: any) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 15; i++) await page.clock.fastForward(100);
}
test("night shelters stay warm and safe, interactions wait for dawn, death returns to bed", async ({
  page,
}) => {
  await open(page);
  let n = await page.evaluate(() => (window as any).game.night());
  expect(n.dark).toBe(true);
  expect(n.safe).toBe(true);
  expect(n.warmLight).toBeGreaterThan(0);
  expect(n.ambient).toBeLessThan(0.4);
  await page.keyboard.press("e");
  await expect(page.locator("#night-help")).toBeVisible();
  await page.evaluate(() => (window as any).game.nightHurt(0));
  await page.clock.fastForward(100);
  const s = await page.evaluate(() => (window as any).game.state());
  expect(s.awake).toBe(false);
  expect(s.night).toEqual({ elapsed: 0, hp: 10 });
  expect(s.day).toBe(2);
});
test("ghost wallets and cash cows render outside; bill attack costs pocket cash", async ({
  page,
}, testInfo) => {
  await open(page, { x: 0, z: 25 });
  await page.evaluate(() => {
    const g = (window as any).game;
    g.nightSpawn("wallet", -2, 21);
    g.nightSpawn("cow", 3, 20);
  });
  await page.clock.fastForward(100);
  await expect(page.locator("#night-health")).toHaveText("10 / 10 HP");
  const before = await page.evaluate(() => (window as any).game.state().cash);
  await page.keyboard.press("v");
  await page.clock.fastForward(100);
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    before - 100,
  );
  await page.screenshot({ path: testInfo.outputPath("ghosts.png") });
  const memory = await page.evaluate(() =>
    (window as any).game.nightLifecycleCheck(),
  );
  for (const sample of memory.slice(1)) expect(sample).toEqual(memory[0]);

  await page.evaluate(() => (window as any).game.nightClock(120));
  await page.clock.fastForward(100);
  expect((await page.evaluate(() => (window as any).game.night())).dark).toBe(
    false,
  );
});
