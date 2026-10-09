import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test.skip(
  !process.env.MONEY_TREE_VISUAL,
  "Visual baselines are opt-in and use the reviewed local Chrome renderer.",
);
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("opening and bedroom visual regression", async ({ page }) => {
  await page.goto("./?test");
  await expect(page.locator(".title-logo")).toBeVisible();
  await expect(page).toHaveScreenshot("title.png", { maxDiffPixelRatio: 0.01 });
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await expect(page).toHaveScreenshot("opening.png", {
    maxDiffPixelRatio: 0.01,
  });
  await page.screenshot({ path: "../../outputs/money-tree-bed-view.png" });
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await expect(page).toHaveScreenshot("bedroom.png", {
    maxDiffPixelRatio: 0.01,
  });
});
test("yellow ruled notebook with garden doodles", async ({ page }) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.keyboard.press("j");
  await expect(page.locator("#modal .panel")).toHaveScreenshot("notebook.png", {
    maxDiffPixelRatio: 0.01,
  });
  await page.screenshot({ path: "../../outputs/money-tree-notebook.png" });
});
test("ready garden visual regression", async ({ page }) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    metRobertson: true,
    shovel: true,
    can: true,
    cash: 33,
    bank: 0,
    position: { x: -16, z: 22 },
  });
  s.plots = s.plots.map(() => ({
    stage: "ready",
    remaining: 0,
    fertilized: false,
    yield: 200,
  }));
  await page.getByRole("button", { name: "Pause game" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save" }).click();
  await (
    await chooser
  ).setFiles({
    name: "visual-garden.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#objective")).toContainText("Money really grows");
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await expect(page).toHaveScreenshot("garden.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("overhead NPC speech and separate name label", async ({ page }) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => {
    (window as any).game.teleport(12, 7.5);
    (window as any).game.setYaw(Math.PI / 2);
  });
  await expect(page.locator("#prompt")).toContainText("Jun");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect(page).toHaveScreenshot("npc-chat.png", {
    maxDiffPixelRatio: 0.01,
  });
  await page.screenshot({ path: "../../outputs/money-tree-npc-chat.png" });
});

test("pictorial inventory with quantities", async ({ page }) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    cash: 1217,
    seeds: 5,
    shovel: true,
    can: true,
    fertilizer: 1,
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("i");
  await expect(page.locator(".inventory-card svg")).toHaveCount(5);
  await expect(page.locator("[data-item=fertilizer]")).toContainText(
    "1 application",
  );
  await expect(page.locator("#modal .panel")).toHaveScreenshot("bag.png", {
    maxDiffPixelRatio: 0.01,
  });
  await page.screenshot({ path: "../../outputs/money-tree-inventory.png" });
});
