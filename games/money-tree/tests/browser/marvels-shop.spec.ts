import { test, expect } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { buyMansion } from "../../src/housing";
import { furnishingCatalog } from "../../src/furnishings";
test("permanent planting unlock keeps Terrace Threads, $50 seeds and new hat models after reload", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s.millionaire!, {
    member: "fire",
    result: "fire",
    answers: Array(12).fill(2),
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
  });
  s.awake = true;
  s.cash = 2000000;
  s.millionaire!.titheAccepted = s.millionaire!.summitSeeds = true;
  s.millionaire!.chats = {};
  s.position = { x: 3, z: -304.8 };
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const frames = async () => {
    for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
  };
  await frames();
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Money seeds · 5 for $50.00", exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    s.cash - 5000,
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  for (const id of [
    "terrace",
    "reach",
    "alchemist",
    "dew",
    "harvest",
    "treasury",
  ]) {
    await page.evaluate((id) => {
      const g = (window as any).game,
        t = g.targets.find((t: any) => t.id === `hat-${id}`);
      g.teleport(t.x, t.z);
    }, id);
    await frames();
    await page.keyboard.press("e");
    await page
      .locator("#modal .hat-portrait")
      .screenshot({ path: info.outputPath(`hat-${id}.png`) });
    await page.keyboard.press("e");
    await frames();
  }
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames();
  const result = await page.evaluate(() => (window as any).game.state());
  expect(result.hats).toEqual(
    expect.arrayContaining([
      "terrace",
      "reach",
      "alchemist",
      "dew",
      "harvest",
      "treasury",
    ]),
  );
  expect(result.millionaire.chats["visited-summit"]).toBeUndefined();
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "mountain-hat-rack");
    g.teleport(t.x, t.z);
  });
  await frames();
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Your hat rack", exact: true }),
  ).toBeVisible();
  await page.locator('[data-rack-hat="terrace"]').click();
  await frames();
  const hanging = await page.evaluate(() => (window as any).game.polish());
  expect(hanging.hanging).toBe(true);
  expect(hanging.hangingDestination[2]).toBeLessThan(-300);
  for (let i = 0; i < 5; i++) await frames();
  await page.keyboard.press("e");
  await page.locator('[data-rack-hat="terrace"]').click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).equippedHats,
  ).toContain("terrace");
});
test("every Mansion Marvels showroom item has a model purchase and survives placement and reload", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s.millionaire!, {
    member: "fire",
    result: "fire",
    answers: Array(12).fill(2),
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
  });
  s.awake = true;
  s.cash = 2000000;
  s.millionaire!.titheAccepted = s.millionaire!.summitSeeds = true;
  s.millionaire!.mountainEarned = 100000;
  expect(buyMansion(s, "hearst", true)).toBe(true);
  s.housing!.movingInSeen = true;
  s.position = { x: -34, z: -311 };
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const frames = async () => {
    for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
  };
  await frames();
  // Both new alleys remain walkable for the full depth of the neighboring shops.
  const blockedAlleyPoints = await page.evaluate(() => {
    const g = (window as any).game;
    const blocked: { x: number; z: number }[] = [];
    for (const x of [-46, -21])
      for (let z = -333; z <= -302; z += 0.25)
        if (
          g.rects.some(
            (r: any) =>
              x + 0.48 > r.x - r.w / 2 &&
              x - 0.48 < r.x + r.w / 2 &&
              z + 0.48 > r.z - r.d / 2 &&
              z - 0.48 < r.z + r.d / 2,
          )
        )
          blocked.push({ x, z });
    return blocked;
  });
  expect(blockedAlleyPoints).toEqual([]);
  await page.evaluate(() => (window as any).game.marvelsSignReview());
  await page.screenshot({ path: info.outputPath("marvels-sign.png") });
  await page.evaluate(() => (window as any).game.marvelsReview());
  await page.screenshot({ path: info.outputPath("marvels-showroom.png") });
  const stock = furnishingCatalog.filter((f) => f.level === 4);
  expect(
    (await page.evaluate(() => (window as any).game.marvelsStock())).sort(),
  ).toEqual(stock.map((f) => f.id).sort());
  // Far from the entrance, approach the back-row Chesterfield display.
  await page.evaluate(() => (window as any).game.teleport(-28.7, -325.3));
  await frames();
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Mansion Marvels", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-marvels]")).toHaveCount(stock.length);
  for (const id of [
    "chesterfield",
    "petal-chair",
    "arc-lamp",
    "linen-sectional",
  ])
    await page
      .locator(`[data-marvels="${id}"] img`)
      .screenshot({ path: info.outputPath(`${id}.png`) });
  for (const f of stock) {
    await expect(page.locator(`[data-marvels="${f.id}"] img`)).toBeVisible();
    await page.locator(`[data-marvels="${f.id}"]`).click();
  }
  expect(
    await page.evaluate(() => (window as any).game.state().furnitureBag),
  ).toEqual(stock.map((f) => f.id));
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await frames();
  const before = await page.evaluate(() => (window as any).game.marvelsStats());
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("e");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await frames();
  }
  const after = await page.evaluate(() => (window as any).game.marvelsStats());
  console.log("Resource comparison", { before, after });
  // Newly visible objects cause first-time GPU uploads in WebKit. Compare actual
  // retained scene geometry, textures and portraits rather than upload totals.
  const { uploadedGeometries: _beforeUploads, ...beforeRetained } = before;
  const { uploadedGeometries: _afterUploads, ...afterRetained } = after;
  expect(afterRetained).toEqual(beforeRetained);
  expect(after.meshes).toBeLessThan(200);
  console.log("Mansion Marvels retained resources", after);
  await page.evaluate(() => (window as any).game.teleport(88, -335));
  await frames();
  await page.keyboard.press("F5");
  await page
    .getByRole("button", {
      name: "Preview Emerald Chesterfield sofa",
      exact: true,
    })
    .click();
  await frames();
  await page.keyboard.press("e");
  await frames();
  expect(
    (await page.evaluate(() => (window as any).game.state())).furniture.some(
      (f: any) => f.item === "chesterfield",
    ),
  ).toBe(true);
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames();
  expect(
    (await page.evaluate(() => (window as any).game.state())).furniture.some(
      (f: any) => f.item === "chesterfield",
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
