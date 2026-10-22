import { test, expect } from "@playwright/test";
import { fresh, blocked, move } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";

for (const unlocked of [false, true])
  test(`hedge gates and real-world collision agree when unlocked=${unlocked}`, async ({
    page,
  }, info) => {
    const s = Object.assign(fresh(), {
      awake: true,
      metMom: true,
      foundTVSeeds: unlocked,
      position: { x: 34.5, z: -37 },
    });
    if (unlocked) applyDebugAction(s, "level3");
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
    const rects = await page.evaluate(() => (window as any).game.rects);
    expect(blocked(34.5, -40, rects)).toBe(!unlocked);
    expect(blocked(39, -60, rects)).toBe(!unlocked);
    for (const z of [-35, -28, -12, 0])
      expect(blocked(50, z, rects)).toBe(true);
    const crossing = { x: 35, z: -20 };
    move(crossing, 25, 0, rects);
    expect(crossing.x).toBeCloseTo(60);
    // Actual keyboard movement catches progression clamping and permanent blockers.
    await page.evaluate(() => (window as any).game.setYaw(0));
    await page.keyboard.down("w");
    for (let i = 0; i < 15; i++) await page.clock.fastForward(100);
    await page.keyboard.up("w");
    const position = (await page.evaluate(() => (window as any).game.state()))
      .position;
    if (unlocked) expect(position.z).toBeLessThan(-41.5);
    else expect(position.z).toBeGreaterThan(-39.1);
    const panels = await page.evaluate(() => (window as any).game.hedgeAudit());
    expect(panels.length).toBeGreaterThan(15);
    for (const panel of panels) {
      expect(panel.max[0] - panel.min[0]).toBeCloseTo(panel.run.w, 2);
      expect(panel.max[2] - panel.min[2]).toBeCloseTo(panel.run.d, 2);
    }
    await page.evaluate(() =>
      (window as any).game.homeBugShot("sigma-entrance"),
    );
    await page.screenshot({ path: info.outputPath("sigma-entrance.png") });
    await page.evaluate(() => (window as any).game.homeBugShot("market-hedge"));
    await page.screenshot({ path: info.outputPath("far-bank-hedge.png") });
  });
