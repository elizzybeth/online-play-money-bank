import { test, expect } from "@playwright/test";
import { ensureMountainPlots } from "../../src/millionaire";
import { decode, fresh } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
test("ready mountain trees have visible trunks and banknotes after loading", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.millionaire!.member = "arms";
  s.millionaire!.welcomeSeed = true;
  ensureMountainPlots(s);
  Object.assign(s, {
    awake: true,
    metMom: true,
    position: { x: 34, z: -340 },
    adventure: { meteorCadence: 1, meteorNextAt: 0 },
  });
  for (const p of s.plots)
    if (p.mountain) {
      p.stage = "ready";
      p.remaining = 0;
      p.yield = 700;
    }
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 3; i++) await page.clock.fastForward(32);
  const initial = await page.evaluate(() =>
    (window as any).game.plotModels().map((m: any) => m.uuid),
  );
  // Reusing a meteor slot at a new site recreates scene groups for existing plots.
  for (let i = 0; i < 8; i++)
    await page.evaluate(() => (window as any).game.advanceSpace(361));
  await page.clock.fastForward(32);
  const models = await page.evaluate(() => (window as any).game.plotModels());
  expect(models.filter((m: any) => m.stage === "ready").length).toBeGreaterThan(
    100,
  );
  expect(models.slice(0, initial.length).map((m: any) => m.uuid)).toEqual(
    initial,
  );

  for (const m of models.filter((m: any) => m.stage === "ready")) {
    expect(m.attached).toBe(true);
    expect(m.meshes).toBeGreaterThan(18);
    expect(m.bounds.max[1] - m.bounds.min[1]).toBeGreaterThan(2);
  }
  await page.screenshot({ path: info.outputPath("ready-trees.png") });
});
