import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("Stacy tells ten connected chapters, resumes after reload, and gifts seeds once", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    foundGardenSeeds: true,
    foundMeditationSeeds: true,
    cash: 1000,
    position: { x: -16.7, z: -82 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#prompt")).toContainText("Stacy");
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("factory");
  expect(
    await page.evaluate(() => (window as any).game.state().stacyConversations),
  ).toBe(1);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  for (let i = 1; i < 10; i++) {
    await page.keyboard.press("e");
    await page.keyboard.press("e");
  }
  await expect(page.locator(".speech-bubble")).toContainText("do you do tree");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "up and to the right",
  );
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  expect(
    await page.evaluate(() => (window as any).game.state().foundStacySeeds),
  ).toBe(true);
});
