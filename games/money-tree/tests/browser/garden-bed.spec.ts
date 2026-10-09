import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("buy a bed and soil, freely place on property, fill and plant, then reload", async ({
  page,
}) => {
  test.setTimeout(180000);
  const s = fresh();
  Object.assign(s, {
    awake: true,
    cash: 4500,
    seeds: 1,
    shovel: true,
    position: { x: 8, z: -31.7 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Garden bed · $30", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Buy garden bed · $30", exact: true })
    .click();
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Soil for one bed · $10", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Buy soil · $10", exact: true })
    .click();
  await page.evaluate(() => {
    (window as any).game.teleport(3, 20);
    (window as any).game.setYaw(0);
  });
  await page.keyboard.press("i");
  await page
    .getByRole("button", { name: "Place a garden bed", exact: true })
    .click();
  await page.keyboard.press("e");
  expect(
    await page.evaluate(() => (window as any).game.state().plots.length),
  ).toBe(5);
  await page.evaluate(() => {
    (window as any).game.teleport(-24, 21.5);
    (window as any).game.setYaw(0);
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).game.bedPreview().valid))
    .toBe(true);
  await page.keyboard.press("e");
  expect(
    await page.evaluate(() => (window as any).game.state().plots.length),
  ).toBe(6);
  await expect(page.locator("#prompt")).toContainText("Fill bed with soil");
  await page.keyboard.press("e");
  await expect(page.locator("#prompt")).toContainText("Plant seeds");
  await page.keyboard.press("e");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).game.state().plots[5].stage),
    )
    .toBe("planted");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  const saved = await page.evaluate(() => (window as any).game.state());
  expect(saved.cash).toBe(500);
  expect(saved.soilBags).toBe(0);
  expect(saved.plots[5]).toMatchObject({
    x: -24,
    z: 19,
    soilFilled: true,
    stage: "planted",
  });
  await page.evaluate(() => (window as any).game.reset());
  await page.keyboard.press("e");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as any).game.targets.filter((t: any) =>
            t.id.startsWith("plot"),
          ).length,
      ),
    )
    .toBe(5);
});
