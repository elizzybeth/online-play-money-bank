import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { walkTo } from "./movement";
test("farm is reachable, maze reward survives reload, and new layouts render cleanly", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s, { awake: true, metMom: true, position: { x: -47, z: -20 } });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 8; i++) await page.clock.fastForward(40);
  const cropBatches = await page.evaluate(
    () => (window as any).game.farm().cornMeshes,
  );
  expect(cropBatches).toBeGreaterThan(9);
  expect(cropBatches).toBeLessThan(100);
  const mabelBeds = await page.evaluate(() =>
    (window as any).game
      .wildlife()
      .gardens.filter((g: any) => g.position[0] < -30),
  );
  expect(mabelBeds).toHaveLength(5);
  expect(mabelBeds.every((g: any) => g.position[2] < -30)).toBe(true);
  await walkTo(page, -47, -30);
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBeLessThan(-29);
  const before = await page.evaluate(() => (window as any).game.state().seeds);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "maze-seeds");
    g.teleport(t.x, t.z);
  });
  await page.clock.fastForward(40);
  await expect(page.locator("#prompt")).toContainText("corn maze seed packet");
  await page.keyboard.press("e");
  await page.clock.fastForward(40);
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
    before + 5,
  );
  expect(
    await page.evaluate(() => (window as any).game.farm().cooldown),
  ).toBeGreaterThan(299);
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(40);
  expect(await page.evaluate(() => (window as any).game.farm().visible)).toBe(
    false,
  );
  await page.addStyleTag({
    content:
      "#hud,#resource-hud,#quest,#controls,#coin-tracker,#bank-hud-stack,#topbar,#prompt,#thought,#toast,.npc-name{visibility:hidden!important}",
  });
  for (const v of info.project.use.browserName === "chromium"
    ? ["overview", "house", "maze", "sign", "shop"]
    : []) {
    await page.evaluate((v) => (window as any).game.farmReview(v), v);
    await page.screenshot({ path: info.outputPath(`${v}.png`) });
  }
  expect(errors).toEqual([]);
});
