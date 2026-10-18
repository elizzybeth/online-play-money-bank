import { test, expect, type Page } from "@playwright/test";
import { fresh, momStatus } from "../../src/game";
import { readFile } from "node:fs/promises";
async function frames(page: Page, n = 12) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(32);
}
async function start(page: Page, s: ReturnType<typeof fresh>) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
test("notebook uses both ruled leaves, turns long entries and never scrolls", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.journal = [
    "Day 1\n\n" +
      Array.from(
        { length: 20 },
        (_, i) =>
          `Paragraph ${i + 1}. I planted the garden and came home to spend time with Mom.`,
      ).join("\n\n"),
  ];
  await start(page, s);
  for (const size of [
    { width: 1280, height: 800 },
    { width: 390, height: 640 },
  ]) {
    await page.setViewportSize(size);
    await page.keyboard.press("j");
    await frames(page);
    let collected = "",
      spreads = 0;
    do {
      collected += await page.locator(".notebook-spread").innerText();
      const fit = await page.locator(".notebook-spread").evaluate((el) => ({
        scroll: el.scrollHeight,
        height: el.clientHeight,
        leaves: Array.from(
          el.querySelectorAll<HTMLElement>(".notebook-leaf"),
        ).map((p) => ({
          bottom: p.getBoundingClientRect().bottom,
          textBottom: p.querySelector("p")!.getBoundingClientRect().bottom,
        })),
      }));
      expect(fit.scroll).toBeLessThanOrEqual(fit.height + 1);
      fit.leaves.forEach((p) =>
        expect(p.textBottom).toBeLessThanOrEqual(p.bottom + 1),
      );
      spreads++;
      if (
        await page
          .getByRole("button", { name: "Next page", exact: true })
          .isDisabled()
      )
        break;
      await page
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await frames(page);
    } while (spreads < 40);
    expect(collected.replace(/\s+/g, " ")).toContain("Paragraph 20.");
    expect(spreads).toBeGreaterThan(1);
    await page
      .getByRole("button", { name: "Close notebook", exact: true })
      .click();
  }
});
test("Q immediately downloads valid state, refresh preserves it, R tumbles forward", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    day: 8,
    cash: 1234,
    spanakopita: 2,
    compostScraps: 17,
    momLastTalkDay: 7,
    position: { x: 3, z: 25 },
  });
  await start(page, s);
  const downloadEvent = page.waitForEvent("download");
  await page.keyboard.press("q");
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("money-tree-save.json");
  const saved = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(saved.day).toBe(8);
  expect(saved.cash).toBe(1234);
  expect(saved.spanakopita).toBe(2);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(async () => (window as any).game.state().compostScraps),
  ).toBe(17);
  await page.evaluate(async () => (window as any).game.setYaw(0));
  await page.keyboard.press("r");
  await frames(page, 5);
  const roll = await page.evaluate(async () => (window as any).game.rollPose());
  expect(roll.angle).toBeGreaterThan(0);
});
test("Gigachad sells real pastry and Mom shares it; speech keeps thoughts hidden", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    day: 2,
    metMom: true,
    foundTVSeeds: true,
    cash: 1000,
    position: { x: 21, z: -77 },
  });
  await start(page, s);
  await expect(page.locator("#prompt")).toContainText("Gigachad");
  await page.keyboard.press("e");
  await frames(page);
  await page.getByRole("button", { name: "What does spanakopita do?" }).click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "Spinach, phyllo, feta",
  );
  await page.getByRole("button", { name: "I dunno, dill?" }).click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "Whoa. Great idea.",
  );
  await page.getByRole("button", { name: "One spanakopita, please" }).click();
  expect(
    await page.evaluate(async () => (window as any).game.state().spanakopita),
  ).toBe(1);
  await page.evaluate(async () => (window as any).game.teleport(-12.5, 10));
  await frames(page);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect(page.locator("#thought")).toBeHidden();
  const previousCamera = (
    await page.evaluate(async () => (window as any).game.camera())
  ).position;
  await page
    .getByRole("button", { name: "Share spanakopita with Mom" })
    .click();
  expect(
    await page.evaluate(async () => (window as any).game.townLife().sharing),
  ).toBe(true);
  await expect(page.locator(".speech-bubble")).toContainText("delicious");
  await frames(page, 30);
  const mealCamera = (
    await page.evaluate(async () => (window as any).game.camera())
  ).position;
  expect(
    Math.hypot(
      ...mealCamera.map((v: number, i: number) => v - previousCamera[i]),
    ),
  ).toBeGreaterThan(1);
  await page.screenshot({
    path: "../../outputs/money-tree-spanakopita-camera.png",
  });
  // End the 3.2-second scene on a frame and inspect the immediate restored shot.
  for (let i = 0; i < 90; i++) {
    await frames(page, 1);
    if (
      !(await page.evaluate(
        async () => (window as any).game.townLife().sharing,
      ))
    )
      break;
  }
  await frames(page, 1);
  const restored = (
    await page.evaluate(async () => (window as any).game.camera())
  ).position;
  restored.forEach((v: number, i: number) =>
    expect(v).toBeCloseTo(previousCamera[i], 4),
  );
  await page.keyboard.press("e");
  await frames(page, 5);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().sharing),
  ).toBe(false);
  expect(
    await page.evaluate(async () => (window as any).game.state().spanakopita),
  ).toBe(0);
});
test("composter exchanges scraps, Twin Planter waters and feeds both beds, and watering ends in 0.9 seconds", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    day: 2,
    foundTVSeeds: true,
    compostScraps: 27,
    can: true,
    fertilizer: 2,
    hats: ["inspector"],
    equippedHat: "inspector",
    equippedHats: ["inspector"],
    position: { x: 17.7, z: -77.4 },
  });
  s.plots[0].stage = s.plots[1].stage = "planted";
  await start(page, s);
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("27 scraps");
  await page
    .getByRole("button", { name: "Trade 25 scraps for fertilizer" })
    .click();
  expect(
    await page.evaluate(async () => (window as any).game.state().fertilizer),
  ).toBe(3);
  await expect(page.locator("#compost-hud")).toContainText("2");
  await page.evaluate(async () => (window as any).game.teleport(-20, 21));
  await frames(page);
  await page.keyboard.press("e");
  expect(
    await page.evaluate(async () =>
      (window as any).game
        .state()
        .plots.slice(0, 2)
        .every((p: any) => p.stage === "growing"),
    ),
  ).toBe(true);
  await frames(page, 29);
  expect(
    await page.evaluate(
      async () => (window as any).game.wateringAnimation().active,
    ),
  ).toBe(false);
  await page.keyboard.press("e");
  expect(
    await page.evaluate(async () =>
      (window as any).game
        .state()
        .plots.slice(0, 2)
        .every((p: any) => p.fertilized),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(async () => (window as any).game.state().fertilizer),
  ).toBe(1);
});
test("five hens and a rooster wander and Tuck jumps into your arms; Mom has a usable chair and cooks bacon", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, { awake: true, position: { x: -26, z: 25.1 } });
  await start(page, s);
  const chickens = await page.evaluate(
    () => (window as any).game.townLife().chickens,
  );
  expect(chickens).toHaveLength(6);
  expect(chickens.map((c: any) => c.name)).toEqual([
    "Tuck",
    "Cluck",
    "Pluck",
    "Luck",
    "Fuck",
    "Fancy Chicken",
  ]);
  await expect(page.locator("#prompt")).toContainText("Tuck");
  await page.keyboard.press("e");
  await frames(page, 25);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().cuddling),
  ).toBe(0);
  await frames(page, 90);
  await page.keyboard.press("e");
  await frames(page, 5);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().cuddling),
  ).toBeUndefined();
  await page.evaluate(async () => (window as any).game.teleport(-6.6, 11.4));
  await frames(page);
  await expect(page.locator("#prompt")).toHaveText("E Sit");
  await page.keyboard.press("e");
  expect(await page.evaluate(async () => (window as any).game.seated())).toBe(
    true,
  );
  await page.keyboard.press("e");
  expect(await page.evaluate(async () => (window as any).game.seated())).toBe(
    false,
  );
  const day = Array.from({ length: 200 }, (_, i) => i + 1).find(
    (day) => momStatus(day).activity === "bacon",
  )!;
  const baconSave = await page.evaluate(async (day) => {
    const s = await (window as any).game.savedState("money-tree-v1");
    s.day = day;
    return s;
  }, day);
  // Install through the supported import flow so pagehide cannot overwrite an
  // external database edit with the still-active garden's state.
  await page.keyboard.press("Escape");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "bacon-day.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(baconSave)),
  });
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().bacon),
  ).toBe(true);
  expect(
    await page.evaluate(async () => (window as any).game.townLife().spatula),
  ).toBe(true);
  await page.evaluate(async () => (window as any).game.teleport(-12.5, 10));
  await frames(page);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "best bacon sandwich",
  );
  await expect(
    page.getByRole("button", { name: "Love you too", exact: true }),
  ).toBeVisible();
});

test("menus, hint and coin tracker stack in the top right above bottom resources", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    communityPlanted: true,
    metMom: true,
    position: { x: 3, z: 25 },
  });
  s.coin = {
    name: "Cuddle coin",
    price: 100,
    exactPrice: 100,
    history: [100],
    units: 0,
    invested: 0,
    rng: 123,
    elapsed: 0,
  };
  await start(page, s);
  for (const size of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await frames(page);
    const header = (await page.locator("header").boundingBox())!,
      hint = (await page.locator("#quest").boundingBox())!,
      coin = (await page.locator("#coin-tracker").boundingBox())!;
    expect(header.y).toBeLessThan(size.width < 700 ? 65 : 30);
    expect(hint.y).toBeGreaterThan(header.y + header.height);
    expect(coin.y).toBeGreaterThan(hint.y + hint.height);
    expect(coin.x + coin.width).toBeLessThanOrEqual(size.width);
    expect(coin.x + coin.width).toBeGreaterThan(size.width - 25);
    const pocket = (await page.locator("#cash-hud").boundingBox())!;
    const saved = (await page.locator("#bank-hud").boundingBox())!;
    expect(pocket.y).toBeGreaterThan(coin.y + coin.height);
    expect(saved.y).toBeGreaterThan(pocket.y + pocket.height);
    expect(Math.abs(saved.x - pocket.x)).toBeLessThan(2);
  }
});

test("every third sleep offers an optional JSON backup", async ({ page }) => {
  const s = fresh();
  Object.assign(s, { day: 3, awake: true, position: { x: -16, z: 2 } });
  await start(page, s);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Sleep until tomorrow" }).click();
  await expect(page.getByRole("dialog")).toContainText("JSON backup");
  expect(
    await page.evaluate(async () => (window as any).game.state().day),
  ).toBe(4);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download game state" }).click();
  const download = await downloadEvent;
  expect(JSON.parse(await readFile((await download.path())!, "utf8")).day).toBe(
    4,
  );
  await expect(page.locator("#modal")).toBeHidden();
});
