import { test, expect } from "@playwright/test";
import { fresh, seedStashSpots } from "../../src/game";
for (let spot = 0; spot < seedStashSpots.length; spot++)
  test(`forest stash ${spot} is reachable and leads to Bea’s garden`, async ({
    page,
  }) => {
    const s = fresh();
    Object.assign(s, {
      awake: true,
      boughtSeeds: true,
      foundCapSeeds: true,
      seedStashSpot: spot,
      position: { x: seedStashSpots[spot].x, z: seedStashSpots[spot].z + 1.1 },
    });
    await page.addInitScript((s) => {
      if (!localStorage.getItem("money-tree-v1"))
        localStorage.setItem("money-tree-v1", JSON.stringify(s));
    }, s);
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    await expect(page.locator("#prompt")).toContainText("seed packet");
    await page.keyboard.press("e");
    expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
      5,
    );
    await page.keyboard.press("e");
    expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
      5,
    );
    await page.evaluate(() => (window as any).game.teleport(7.8, 21.9));
    await expect(page.locator("#prompt")).toContainText("flowerbed");
    await page.keyboard.press("e");
    expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
      10,
    );
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    const saved = await page.evaluate(() => (window as any).game.state());
    expect(saved.seedStashSpot).toBe(spot);
    expect(saved.foundGardenSeeds).toBe(true);
    expect(saved.foundTVSeeds).toBe(true);
    expect(saved.foundStoreSeeds).toBe(false);
  });
test("up and down arrows tilt the camera without walking", async ({ page }) => {
  const s = fresh();
  Object.assign(s, { awake: true, position: { x: 3, z: 20 } });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const initial = await page.evaluate(() => (window as any).game.cameraPitch());
  await page.keyboard.down("ArrowUp");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.cameraPitch()))
    .toBeLessThan(initial - 0.05);
  await page.keyboard.up("ArrowUp");
  expect(
    await page.evaluate(() => (window as any).game.cameraPitch()),
  ).toBeLessThan(initial);
  await page.keyboard.down("ArrowDown");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.cameraPitch()))
    .toBeGreaterThan(initial + 0.05);
  await page.keyboard.up("ArrowDown");
  expect(
    await page.evaluate(() => (window as any).game.cameraPitch()),
  ).toBeGreaterThan(initial);
  expect(
    await page.evaluate(() => (window as any).game.state().position),
  ).toEqual(s.position);
});
