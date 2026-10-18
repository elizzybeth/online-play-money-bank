import { unlockSigma } from "../../src/sigma";
import { test, expect } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
async function open(page: any, community = false) {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.millionaire!.chats["visited-summit"] = 1;
  Object.assign(s, {
    awake: true,
    metMom: true,
    can: true,
    shovel: true,
    cash: 100000,
    seeds: 4,
    cropSeeds: { iris: 2, tomato: 3, pepper: 1 },
    position: community ? { x: 7, z: -74.4 } : { x: -20, z: 20.6 },
  });
  unlockSigma(s);
  if (community) s.plots[5].stage = "empty";
  else s.plots[0].stage = "empty";
  s.plots[1] = {
    ...s.plots[1],
    crop: "iris",
    stage: "ready",
    yield: 0,
    remaining: 0,
  };
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s: ReturnType<typeof fresh>) =>
      localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 5; i++) await page.clock.fastForward(64);
  return community ? 5 : 0;
}
for (const community of [false, true])
  test(`G selects a modeled seed without planting; E plants it in a ${community ? "community" : "home"} bed`, async ({
    page,
  }) => {
    const i = await open(page, community);
    await expect(page.locator("#prompt")).toContainText("G");
    await page.keyboard.press("g");
    await expect(
      page.getByRole("heading", { name: "Choose your planting seed" }),
    ).toBeVisible();
    const card = page.getByRole("button", {
      name: "Select tomato seeds · 3 available",
      exact: true,
    });
    await expect(card.locator("img")).toHaveJSProperty("naturalWidth", 192);
    await card.click();
    const selected = await page.evaluate(() => (window as any).game.state());
    expect(selected.activeSeed).toBe("tomato");
    expect(selected.plots[i].stage).toBe("empty");
    await page.keyboard.press("e");
    for (let n = 0; n < 40; n++) await page.clock.fastForward(250);
    const planted = await page.evaluate(() => (window as any).game.state());
    expect(planted.plots[i].crop).toBe("tomato");
    expect(planted.cropSeeds.tomato).toBe(2);
    await page.keyboard.press("i");
    const inventory = page.getByLabel("Flower and vegetable seeds");
    await expect(inventory).toContainText("tomato seeds");
    await expect(inventory.locator("img")).toHaveCount(3);
  });
test("seed ATM and garden bed inspection display actual model previews; irises have no harvest label", async ({
  page,
}, info) => {
  await open(page);
  await expect(page.locator("#timers .tree-timer").nth(1)).toBeHidden();
  await page.evaluate(() => {
    const g = (window as any).game;
    g.teleport(3, -32.1);
  });
  await page.clock.fastForward(64);
  await page.keyboard.press("e");
  const bed = page.getByRole("img", { name: "Wooden garden bed model" });
  await expect(bed).toHaveJSProperty("naturalWidth", 192);
  await page.screenshot({ path: info.outputPath("garden-bed-preview.png") });
  await page.getByRole("button", { name: "Keep looking", exact: true }).click();
  await page.evaluate(() => {
    const g = (window as any).game;
    const t = g.targets.find((t: any) => t.id === "mountain-seed-atm");
    g.teleport(t.x, t.z + 1);
  });
  await page.clock.fastForward(64);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Mountain Seed ATM" }),
  ).toBeVisible();
  await expect(page.locator("[data-seed-offer] img")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Tomato seeds · 5 for $15.00", exact: true })
    .click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).cropSeeds.tomato,
  ).toBe(8);
  await page.screenshot({ path: info.outputPath("seed-atm-models.png") });
});
