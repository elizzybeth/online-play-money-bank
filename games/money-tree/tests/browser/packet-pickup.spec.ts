import { test, expect } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
for (const kind of ["forest", "garden", "maze", "meteor", "pepe"] as const)
  test(`walking over a ${kind} packet collects it once without E`, async ({
    page,
  }) => {
    const s = Object.assign(fresh(), {
      awake: true,
      metMom: true,
      foundCapSeeds: true,
      seeds: 0,
    });
    if (kind === "garden") s.foundForestSeeds = true;
    if (kind === "meteor" || kind === "pepe") applyDebugAction(s, "level3");
    if (kind === "meteor") s.adventure = { meteorCadence: 1, meteorNextAt: 0 };
    expect(decode(JSON.stringify(s))).not.toBeNull();
    await page.clock.install({ time: new Date("2026-01-01") });
    await page.clock.pauseAt(new Date("2026-01-02"));
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      s,
    );
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    for (let i = 0; i < 10; i++) await page.clock.fastForward(250);
    if (kind === "meteor")
      await page.evaluate(() => (window as any).game.advanceSpace(3));
    const id =
      kind === "meteor"
        ? "meteor-seed-1-0"
        : kind === "pepe"
          ? "pepe-seed-0"
          : `${kind}-seeds`;
    const before = (await page.evaluate(() => (window as any).game.state()))
      .seeds;
    await page.evaluate((id) => {
      const g = (window as any).game,
        t = g.targets.find((t: any) => t.id === id);
      g.teleport(t.x, t.z + 1.05);
      g.setYaw(0);
    }, id);
    await page.clock.fastForward(32);
    await page.keyboard.down("w");
    for (let i = 0; i < 5; i++) await page.clock.fastForward(32);
    await page.keyboard.up("w");
    expect(
      (await page.evaluate(() => (window as any).game.state())).seeds,
    ).toBe(before + 5);
    for (let i = 0; i < 10; i++) await page.clock.fastForward(32);
    expect(
      (await page.evaluate(() => (window as any).game.state())).seeds,
    ).toBe(before + 5);
  });
