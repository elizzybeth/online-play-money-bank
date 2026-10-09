import { test, expect } from "@playwright/test";
import { fresh, seedStashSpots } from "../../src/game";
for (let spot = 0; spot < seedStashSpots.length; spot++)
  test(`forest stash ${spot} is reachable and leads to Robertson's stash`, async ({
    page,
  }) => {
    const s = fresh();
    Object.assign(s, {
      awake: true,
      boughtSeeds: true,
      foundCapSeeds: true,
      seedStashSpot: spot,
      position: { x: seedStashSpots[spot].x, z: seedStashSpots[spot].z },
    });
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      s,
    );
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
    await page.evaluate(() => (window as any).game.teleport(12, -31.5));
    await expect(page.locator("#prompt")).toContainText("behind the tins");
    await page.keyboard.press("e");
    expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
      10,
    );
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    const saved = await page.evaluate(() => (window as any).game.state());
    expect(saved.seedStashSpot).toBe(spot);
    expect(saved.foundStoreSeeds).toBe(true);
  });
test("up and down arrows tilt the camera without walking", async ({ page }) => {
  const s = fresh();
  Object.assign(s, { awake: true, position: { x: 3, z: 20 } });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const initial = await page.evaluate(() => (window as any).game.cameraPitch());
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(200);
  await page.keyboard.up("ArrowUp");
  expect(
    await page.evaluate(() => (window as any).game.cameraPitch()),
  ).toBeLessThan(initial);
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowDown");
  expect(
    await page.evaluate(() => (window as any).game.cameraPitch()),
  ).toBeGreaterThan(initial);
  expect(
    await page.evaluate(() => (window as any).game.state().position),
  ).toEqual(s.position);
});
