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
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await expect(page).toHaveScreenshot("opening.png", {
    maxDiffPixelRatio: 0.01,
  });
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toHaveCSS("opacity", "0");
  await expect(page).toHaveScreenshot("bedroom.png", {
    maxDiffPixelRatio: 0.01,
  });
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
