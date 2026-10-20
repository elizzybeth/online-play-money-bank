import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("field seed collections have a toast and seed portraits fit bag cards", async ({
  page,
}, info) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    cropSeeds: { iris: 4, beet: 5 },
    position: { x: -95, z: 7 },
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  const wake = page.getByRole("button", { name: "Wake up" });
  await expect(wake).toBeEnabled({ timeout: 30000 });
  await wake.dispatchEvent("click");
  await page.clock.fastForward(64);
  await page.keyboard.press("i");
  const cards = page
    .getByLabel("Flower and vegetable seeds")
    .locator(".inventory-card");
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    await expect(card.locator("img")).toHaveJSProperty("naturalWidth", 192);
    expect(
      await card.evaluate((el) => {
        const c = el.getBoundingClientRect(),
          image = el.querySelector("img")!.getBoundingClientRect();
        return (
          image.left >= c.left &&
          image.right <= c.right &&
          image.top >= c.top &&
          image.bottom <= c.bottom
        );
      }),
    ).toBe(true);
  }
  await cards.last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("seed-cards.png") });
  await page.keyboard.press("Escape");
  // Walk within the beet field far enough to collect one bag.
  for (let i = 0; i <= 20; i++) {
    await page.evaluate(
      (x) => (window as any).game.teleport(x, 7),
      -95 + i * 0.95,
    );
    await page.clock.fastForward(64);
  }
  await expect(page.locator("#inventory-toasts")).toContainText(
    "+5 beet seeds",
  );
});
