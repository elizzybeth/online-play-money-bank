import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function start(page: Page) {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    foundTVSeeds: true,
    communityPlanted: true,
    cash: 5000,
    position: { x: 32, z: -73.6 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
test("named coin creates an accessible ATM with chart, partial buy/sell and persisted history", async ({
  page,
}) => {
  await start(page);
  expect(
    await page.evaluate(() =>
      (window as any).game.rects.some((r: any) => r.x === 36 && r.z === -74),
    ),
  ).toBe(false);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Your entrepreneurial spirit?" })
    .click();
  await page.locator("#coin-name").fill("Seed Fund");
  await page.getByRole("button", { name: "Name it", exact: true }).click();
  await expect(page.locator(".coin-chart svg")).toHaveAttribute(
    "aria-label",
    /latest price \$1.00/,
  );
  await expect(
    page.getByRole("button", { name: "Buy", exact: true }),
  ).toHaveCSS("background-color", "rgb(35, 150, 56)");
  await page.locator("#coin-amount").fill("10");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.locator("#coin-sell-amount").fill("3");
  await page.getByRole("button", { name: "Sell", exact: true }).click();
  let s = await page.evaluate(() => (window as any).game.state());
  expect(s.cash).toBe(4300);
  await expect(page.locator("#cash-hud")).toContainText("$43.00");
  await expect(page.locator("#daily-net-hud")).toContainText("−$7.00");
  await expect(page.locator("#bank-hud")).toContainText("$4.33");
  await expect(
    page.getByRole("img", { name: "Pocket", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Piggy bank", exact: true }),
  ).toBeVisible();
  expect(s.coin.units).toBe(7000000);
  await page.getByRole("button", { name: "Leave", exact: true }).click();
  await page.evaluate(() => (window as any).game.teleport(36, -71.7));
  await expect(page.locator("#prompt")).toContainText("Use coin ATM");
  expect(
    await page.evaluate(() =>
      (window as any).game.rects.some((r: any) => r.x === 36 && r.z === -74),
    ),
  ).toBe(true);
  const clearance = await page.evaluate(() => {
    const rects = (window as any).game.rects;
    const atm = rects.find((r: any) => r.x === 36 && r.z === -74);
    const hedge = rects.find(
      (r: any) => r.x === 39 && Math.abs(r.z - atm.z) <= r.d / 2,
    );
    return hedge.x - hedge.w / 2 - (atm.x + atm.w / 2);
  });
  expect(clearance).toBeGreaterThan(1.5);
  await page.evaluate(() => (window as any).game.advance(90));
  await page.keyboard.press("e");
  await expect(page.locator(".coin-candle")).toHaveCount(7);
  await page.locator("#coin-amount").fill("999999");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(page.locator("#coin-error")).toContainText("pocket");
  await page.getByRole("button", { name: "Leave", exact: true }).click();
  await page.keyboard.press("e");
  await page.locator("#coin-amount").fill("1");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByRole("button", { name: "Leave", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => (window as any).game.teleport(36, -71.7));
  await expect(page.locator("#prompt")).toContainText("ATM");
  await page.keyboard.press("e");
  await expect(page.locator(".coin-candle")).toHaveCount(7);
  await page.screenshot({ path: "../../outputs/money-tree-coin-atm-menu.png" });
});
