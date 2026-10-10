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
    if (day % 2)
      await expect(page.locator(".speech-bubble")).toContainText("cough");
    else
      await expect(page.locator(".speech-bubble")).not.toContainText("cough");
    await page.keyboard.press("e");
    await expect(page.locator(".speech-bubble")).toContainText(phrase);
    await expect(page.locator("#thought")).toBeVisible();
    await expect(page.locator("#thought")).not.toContainText("Your thought:");
    expect(
      (await page.locator("#thought").textContent())!.length,
    ).toBeGreaterThan(10);
    await expect(page.locator(".speech-bubble")).not.toContainText(
      "take these good days",
    );
    const firstReply = await page.locator(".speech-bubble").textContent();
    // Garden-day Mom moves outside; walk beyond her conversation range.
    await page.evaluate(() => (window as any).game.teleport(-16, 28));
    await expect(page.locator(".speech-bubble")).toHaveCount(0);
    await page.evaluate(() => (window as any).game.teleport(-16, 12));
    if (day % 2)
      await expect(page.locator(".speech-bubble")).toContainText("cough");
    else
      await expect(page.locator(".speech-bubble")).not.toContainText("cough");
    await page.keyboard.press("e");
    await expect(page.locator(".speech-bubble")).not.toHaveText(firstReply!);
    if (activity === "resting" || activity === "reading") {
      const pose = await page.evaluate(() => (window as any).game.momPose());
      expect(pose.y).toBe(0.69);
      expect(pose.scale).toBe(1);
      for (const foot of pose.feet) expect(foot[0]).toBeGreaterThan(-18.6);
    }
  });
}
