import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { ensureMountainPlots } from "../../src/millionaire";
import { terrainHeight } from "../../src/millionaire-land";
import { farmFields } from "../../src/farm-fields";
async function open(page: Page, s: ReturnType<typeof fresh>) {
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
}
test("one E with Giant Steps feeds the selected terrace and keeps other terraces unfertilized", async ({
  page,
}) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s.millionaire!, {
    member: "fire",
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
  });
  s.millionaire!.chats["visited-summit"] = 1;
  ensureMountainPlots(s);
  s.hats.push("alchemist");
  s.equippedHats = ["alchemist"];
  s.fertilizer = 100;
  s.awake = s.metMom = true;
  const plots = s.plots.filter((p) => p.mountain);
  for (const p of plots) {
    p.stage = "growing";
    p.fertilized = false;
    p.remaining = 180;
    p.yield = 0;
  }
  const p = plots[0];
  s.position = { x: p.x!, z: p.z! + 1.8 };
  const tier = terrainHeight(p.x!, p.z!);
  const count = plots.filter((p) => terrainHeight(p.x!, p.z!) === tier).length;
  await open(page, s);
  await expect(page.locator("#prompt")).toContainText("Fertilize terrace");
  await page.keyboard.press("e");
  await page.clock.fastForward(100);
  const after = await page.evaluate(() => (window as any).game.state());
  expect(after.fertilizer).toBe(100 - count);
  expect(
    after.plots.filter((p: any) => p.mountain && p.fertilized),
  ).toHaveLength(count);
});
test("south fields have distinct rendered crops and walking finds that crop’s seed bag", async ({
  page,
}, info) => {
  const field = farmFields.find((f) => f.crop === "beet")!;
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    position: { x: field.x - 9, z: field.z },
  });
  applyDebugAction(s, "level2");
  await open(page, s);
  const data = await page.evaluate(() => (window as any).game.farm());
  expect(new Set(data.fields.map((f: any) => f.crop)).size).toBe(
    data.fields.length,
  );
  expect(data.cropModels.filter((f: any) => f.plants > 0)).toHaveLength(10);
  await page.keyboard.down("d");
  for (let i = 0; i < 24; i++) await page.clock.fastForward(125);
  await page.keyboard.up("d");
  await page.keyboard.down("a");
  for (let i = 0; i < 24; i++) await page.clock.fastForward(125);
  await page.keyboard.up("a");
  expect(
    (await page.evaluate(() => (window as any).game.state())).cropSeeds.beet,
  ).toBe(5);
  await page.screenshot({ path: info.outputPath("south-farm-fields.png") });
  await page.keyboard.press("i");
  await expect(page.locator("#modal")).toContainText("beet seeds");
  await page.keyboard.press("Escape");
  if ((process.env.MONEY_TREE_BROWSER ?? "chromium") === "chromium") {
    await page.evaluate(() => (window as any).game.farmReview("maze"));
    await page.screenshot({ path: info.outputPath("corn-detail.png") });
    await page.evaluate(() => {
      (window as any).game.teleport(46, -83);
      (window as any).game.bridgeOverview();
    });
    await page.screenshot({
      path: info.outputPath("grove-road-connection.png"),
    });
  }
});
