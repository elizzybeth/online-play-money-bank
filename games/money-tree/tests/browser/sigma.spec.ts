import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function open(page: Page, unlocked = true) {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    cash: 5000,
    seeds: 5,
    shovel: true,
    can: true,
    foundTVSeeds: unlocked,
    foundGardenSeeds: unlocked,
    position: { x: 34, z: -38 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
async function at(page: Page, x: number, z: number) {
  await page.evaluate(([x, z]) => (window as any).game.teleport(x, z), [x, z]);
}
test("hedge passage stays closed until third packet, then a real walk crosses into Sigma Town", async ({
  page,
}) => {
  await open(page, false);
  await page.keyboard.down("w");
  await page.waitForTimeout(700);
  await page.keyboard.up("w");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBeGreaterThan(-39.1);
  expect(
    (await page.evaluate(() => (window as any).game.sigma())).visible,
  ).toBe(false);
  // A hidden parent must also hide every descendant's floating nameplate.
  const visibleChads = page
    .locator(".npc-name")
    .filter({ hasText: /Chad|Stacy/ });
  for (let i = 0; i < (await visibleChads.count()); i++)
    await expect(visibleChads.nth(i)).toBeHidden();
});
test("sigma garden, fresh Chads, Grindset name input, investments, coffee and save round-trip", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await page.keyboard.down("w");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.state().position.z))
    .toBeLessThan(-42);
  await page.keyboard.up("w");
  const beforeCoinHands = await page.evaluate(() =>
    (window as any).game.diamondHands(),
  );
  expect(beforeCoinHands.length).toBeGreaterThan(8);
  expect(
    beforeCoinHands.every(
      (c: any) => c.hands === 0 && c.diamonds === 0 && c.ordinary === 2,
    ),
  ).toBe(true);
  const garden = await page.evaluate(() => (window as any).game.sigma());
  expect(garden.plots).toHaveLength(10);
  // Street Chads roam; approach the live target rather than its old spawn.
  await page.evaluate(() => {
    const game = (window as any).game;
    const chad = game.sigma().walkers[0].target;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      try {
        game.teleport(
          chad.x + Math.cos(angle) * 1.6,
          chad.z + Math.sin(angle) * 1.6,
        );
        return;
      } catch {
        /* Try another clear side of the live target. */
      }
    }
    throw new Error("No clear approach to the roaming Chad");
  });
  await expect(page.locator("#prompt")).toContainText("Chad");
  await page.keyboard.press("e");
  const first = await page.locator(".speech-bubble").textContent();
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).not.toHaveText(first!);
  await page.getByRole("button", { name: "End conversation" }).click();
  await at(page, 7, -74.4);
  await expect(page.locator("#prompt")).toContainText("Plant");
  await page.keyboard.press("e");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).game.state().communityPlanted),
    )
    .toBe(true);
  await at(page, 33.4, -75.8);
  await expect(page.locator("#prompt")).toContainText("Chad");
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Your entrepreneurial spirit?" })
    .click();
  await page.locator("#coin-name").fill("Seed Fund");
  await page.locator("#coin-name").press("e");
  await expect(page.locator("#coin-name")).toHaveValue("Seed Funde");
  await page.locator("#coin-name").fill("Seed Fund");
  await page.getByRole("button", { name: "Name it", exact: true }).click();
  await expect
    .poll(async () =>
      (await page.evaluate(() => (window as any).game.diamondHands())).every(
        (c: any) => c.hands === 2 && c.diamonds === 2 && c.ordinary === 0,
      ),
    )
    .toBe(true);
  await page.locator("#coin-amount").fill("2.00");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByRole("button", { name: "Leave", exact: true }).click();
  await expect(page.locator("#coin-tracker")).toContainText("Seed Fund");
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    4800,
  );
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "See the drinks" }).click();
  await page.getByRole("button", { name: /Hustle Espresso/ }).click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).drink.id,
  ).toBe("sprint");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#coin-tracker")).toContainText("Seed Fund");
  expect(
    (await page.evaluate(() => (window as any).game.state())).communityPlanted,
  ).toBe(true);
  expect(
    (await page.evaluate(() => (window as any).game.diamondHands())).every(
      (c: any) => c.hands === 2 && c.diamonds === 2 && c.ordinary === 0,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await at(page, 23, -62.8);
  await expect(page.locator("#prompt")).toContainText("Toss $1");
  const before = (await page.evaluate(() => (window as any).game.state())).cash;
  await page.keyboard.press("e");
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    before - 100,
  );
  await expect(page.locator("#toast")).toContainText("Nothing happens");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "../../outputs/money-tree-sigma-town.png" });
});

test("meme houses have clear doors and interior cameras, statue is solid, pavement stays above grass", async ({
  page,
}) => {
  await open(page);
  const geometry = await page.evaluate(
    () => (window as any).game.sigma().pavement as number[],
  );
  const site = await page.evaluate(() => (window as any).game.sigma());
  expect(
    site.plots.some((p: any) =>
      site.paths.some(
        (r: any) =>
          Math.abs(p.x - r.x) < 0.8 + r.w / 2 &&
          Math.abs(p.z - r.z) < 1.6 + r.d / 2,
      ),
    ),
  ).toBe(false);
  expect(geometry.filter((_, i) => i % 3 === 1).every((y) => y > 0.03)).toBe(
    true,
  );
  expect(
    await page.evaluate(() => {
      try {
        (window as any).game.teleport(23, -67);
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
  for (const z of [-49, -66, -81]) {
    await at(page, -3, z + 4.2);
    await page.keyboard.down("w");
    await expect
      .poll(() => page.evaluate(() => (window as any).game.state().position.z))
      .toBeLessThan(z + 2.5);
    await page.keyboard.up("w");
    for (let i = 0; i < 40; i++) await page.waitForTimeout(16);
    expect(
      (await page.evaluate(() => (window as any).game.camera())).position[1],
    ).toBeGreaterThan(1.3);
    expect(
      await page.evaluate(() => (window as any).game.playerVisibility()),
    ).toEqual([true, true]);
  }
});
