import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
for (const [side, x, z] of [
  ["north", -20, 16.5],
  ["south", -20, 21.5],
  ["west", -21.6, 19],
  ["east", -18.9, 19],
] as const) {
  test(`harvest from the ${side} side of a bed`, async ({ page }) => {
    const s = fresh();
    Object.assign(s, {
      awake: true,
      metMom: true,
      boughtSeeds: true,
      position: { x, z },
    });
    s.plots[0].stage = "ready";
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      s,
    );
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    await expect(page.locator("#prompt")).toContainText("Harvest money tree");
    await page.keyboard.press("e");
    expect(
      await page.evaluate(() => (window as any).game.state().plots[0].stage),
    ).toBe("harvested");
  });
}
test("growing timer has no interaction key until fertilizer is available", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    boughtSeeds: true,
    position: { x: -20, z: 21.5 },
  });
  s.plots[0].stage = "growing";
  s.plots[0].remaining = 180;
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#prompt")).toContainText("Growing");
  await expect(page.locator("#prompt kbd")).toHaveCount(0);
});
test("empty beds suggest the next packet after cap seeds were found", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    boughtSeeds: true,
    foundCapSeeds: true,
    position: { x: -20, z: 21.5 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toContainText("trees");
  await expect(page.locator("#toast")).not.toContainText("haberdashery");
});
test("a fertilizer box contains five doses", async ({ page }) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    boughtSeeds: true,
    cash: 500,
    position: { x: 13, z: -28.9 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toContainText("Five doses");
  await page.keyboard.press("e");
  expect(
    await page.evaluate(() => (window as any).game.state().fertilizer),
  ).toBe(5);
});
