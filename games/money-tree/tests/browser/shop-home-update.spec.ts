import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function frames(page: Page, n = 10) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(64);
}
async function start(page: Page) {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    day: 3,
    foundTVSeeds: true,
    position: { x: -17.2, z: 11.1 },
  });
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
test("couch channel control preserves seating and showroom bicycles can be inspected from the aisle", async ({
  page,
}) => {
  await start(page);
  await page.keyboard.press("e");
  await frames(page);
  expect(await page.evaluate(() => (window as any).game.seated())).toBe(true);
  await expect(page.locator("#prompt")).toContainText("TV channel");
  await page.keyboard.press("t");
  await page.getByRole("button", { name: /Town News|Watch the news/ }).click();
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.state().tvChannel),
  ).toBe("news");
  expect(await page.evaluate(() => (window as any).game.seated())).toBe(true);
  await page.keyboard.press("e");
  await frames(page);
  await page.evaluate(() => (window as any).game.teleport(-20.5, -23.3));
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("Inspect");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeVisible();
});
test("bed and shop displays have grounded geometry and leave the shared wall window clear", async ({
  page,
}) => {
  await start(page);
  const r = await page.evaluate(() => (window as any).game.shopHomeReview());
  expect(r.bed.min[2]).toBeCloseTo(6.15, 1);
  expect(r.bed.max[2]).toBeCloseTo(9.65, 1);
  expect(r.groceries.max[2]).toBeLessThan(-32.1);
  expect(r.furnishings.min[2]).toBeGreaterThan(-27.9);
  expect(r.bracelet.max[0] - r.bracelet.min[0]).toBeLessThan(0.4);
  for (const view of ["bed", "shop", "memes", "guru"]) {
    await page.evaluate(
      (v) => (window as any).game.renderShopHomeReview(v),
      view,
    );
    await page.screenshot({
      path: `../../outputs/money-tree-${view}-new-review.png`,
    });
  }
});
