import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
for (const [day, activity, phrase] of [
  [1, "resting", "exhausted"],
  [2, "cooking", "something warm"],
  [4, "birdhouses", "birdhouses"],
  [6, "painting", "painting"],
  [8, "reading", "my book"],
  [10, "garden", "ugly"],
] as const) {
  test(`Mom homecoming on day ${day}: ${activity}, coughing and private reflection`, async ({
    page,
  }) => {
    const s = fresh();
    Object.assign(s, { day, awake: true, position: { x: -16, z: 22 } });
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      s,
    );
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    await page.evaluate(() => (window as any).game.teleport(-16, 12));
    await expect(page.locator(".speech-bubble")).toContainText("cough");
    await page.getByRole("button", { name: "How are you doing?" }).click();
    await expect(page.locator(".speech-bubble")).toContainText(phrase);
    await expect(page.locator("#thought")).toBeVisible();
    await expect(page.locator("#thought")).toContainText(
      day === 1 ? "tired" : "good days",
    );
    await expect(page.locator(".speech-bubble")).not.toContainText(
      "take these good days",
    );
    // Garden-day Mom moves outside; walk beyond her conversation range.
    await page.evaluate(() => (window as any).game.teleport(-16, 28));
    await expect(page.locator(".speech-bubble")).toHaveCount(0);
    await page.evaluate(() => (window as any).game.teleport(-16, 12));
    await expect(page.locator(".speech-bubble")).toContainText("cough");
  });
}
