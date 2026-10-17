import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { newMillionaire } from "../../src/millionaire";
async function start(page: Page, cash = 2000) {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    foundTVSeeds: true,
    cash,
    position: { x: 0, z: -25 },
    millionaire: { ...newMillionaire(), unlocked: true, afterPepe: 10000 },
  });
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
async function frames(page: Page, n = 8) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(40);
}
test("Robertsons has separate pictorial departments with repeat purchases, saved quantities, and affordability", async ({
  page,
}) => {
  await start(page);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "robertsons-home");
    g.teleport(t.x + 1.5, t.z);
  });
  await frames(page);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("dialog", { name: "Robertsons: Home Furnishings" }),
  ).toBeVisible();
  await expect(page.locator("[data-product=eggs]")).toHaveCount(0);
  const chair = page.locator("[data-product=chair]");
  await expect(chair.locator("img")).toHaveJSProperty("naturalWidth", 192);
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: process.env.MONEY_TREE_CAPTURE + "/furnishings.png",
    });
  await chair.click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).furnitureBag,
  ).toContain("chair");
  await page.getByRole("button", { name: "Groceries", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Robertsons: Groceries" }),
  ).toBeVisible();
  await expect(page.locator("[data-product=chair]")).toHaveCount(0);
  await expect(page.locator(".shop-card")).toHaveCount(4);
  await page.locator("[data-product=eggs]").click();
  await page.locator("[data-product=eggs]").click();
  await expect(page.locator("[data-product=eggs]")).toContainText("In bag: 2");
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: process.env.MONEY_TREE_CAPTURE + "/groceries.png",
    });
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).groceries.eggs,
  ).toBe(2);
});
test("unaffordable cards are disabled without charging the player", async ({
  page,
}) => {
  await start(page, 50);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "robertsons-groceries");
    g.teleport(t.x + 1.5, t.z);
  });
  await frames(page);
  await page.keyboard.press("e");
  await expect(page.locator(".shop-card:disabled")).toHaveCount(4);
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    50,
  );
});
test("Level 3 exposed terrain passes the depth audit and the higher bike sign clears the doorway", async ({
  page,
}) => {
  await start(page);
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.millionaire().visible),
  ).toBe(true);
  expect(
    await page.evaluate(() => {
      const g = (window as any).game;
      // River outlets divide the old rectangles; the remaining perimeter is solid.
      return [
        [-94.8, -280],
        [160.8, -280],
        [33, -470.8],
        [-25.95, -89.6],
        [105.35, -89.6],
      ].every(([x, z]) =>
        g.rects.some(
          (r: any) =>
            Math.abs(x - r.x) <= r.w / 2 && Math.abs(z - r.z) <= r.d / 2,
        ),
      );
    }),
  ).toBe(true);
  const risks = await page.evaluate(() => (window as any).game.depthAudit());
  expect(risks).toEqual([]);
  const [sign] = await page.evaluate(
    () => (window as any).game.bicycle().facade,
  );
  expect(sign.min[1]).toBeGreaterThan(4);
  await page.evaluate(() => (window as any).game.teleport(46, -88));
  await frames(page);
  await page.keyboard.down("w");
  await frames(page, 40);
  await page.keyboard.up("w");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBeLessThan(-90);
});
