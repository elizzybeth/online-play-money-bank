import { createCoin } from "../../src/sigma";
import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
async function frames(page: Page, n = 6) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(64);
}
async function open(page: Page, s: ReturnType<typeof fresh>) {
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
test("full level-three hat stack preserves proportions and places bonnet, nest and tall sax visibly", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s, {
    awake: true,
    metMom: true,
    hats: ["seedkeeper", "beekeeper", "terrace", "treasury", "alchemist"],
    equippedHats: [
      "seedkeeper",
      "beekeeper",
      "terrace",
      "treasury",
      "alchemist",
    ],
    position: { x: 34, z: -210 },
  });
  await open(page, s);
  const stack = await page.evaluate(() => (window as any).game.hatStack());
  expect(stack[0].id).toBe("seedkeeper");
  expect(stack.at(-1).id).toBe("alchemist");
  expect(stack.at(-2).id).toBe("treasury");
  for (const h of stack) expect(h.scale).toEqual([1, 1, 1]);
  expect(
    stack.at(-1).bounds.max[1] - stack.at(-1).bounds.min[1],
  ).toBeGreaterThan(1);
  await page.screenshot({ path: info.outputPath("hat-stack.png") });
});
test("new crater particles persist until harvest and camera remains above its rim", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s, {
    awake: true,
    metMom: true,
    position: { x: 34, z: -210 },
    adventure: { meteorCadence: 1, meteorNextAt: 0 },
  });
  await open(page, s);
  await page.evaluate(() => (window as any).game.advanceSpace(3));
  const m = await page.evaluate(
    () => (window as any).game.spaceEstate().meteors[0],
  );
  await page.evaluate((m) => (window as any).game.teleport(m.x, m.z + 2), m);
  await frames(page, 14);
  expect(
    await page.evaluate(
      () => (window as any).game.spaceEstate().craterParticles,
    ),
  ).toBe(true);
  expect(
    (await page.evaluate(() => (window as any).game.camera().position))[1],
  ).toBeGreaterThanOrEqual(2.2);
  await page.screenshot({ path: info.outputPath("crater.png") });
  await expect(page.locator("#prompt")).toContainText("Harvest");
  await page.keyboard.press("e");
  await frames(page);
  expect(
    await page.evaluate(
      () => (window as any).game.spaceEstate().craterParticles,
    ),
  ).toBe(false);
});
test("E defaults to all compost with a separate one-bag trade and presenter responds after Pepe", async ({
  page,
}) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s, {
    awake: true,
    metMom: true,
    compostScraps: 541,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    foundMeditationSeeds: true,
    metStacy: true,
    position: { x: 17.7, z: -77.4 },
  });
  s.communityPlanted = true;
  expect(createCoin(s, "Presenter test")).toBe(true);
  await open(page, s);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("button", {
      name: "Trade 25 scraps for fertilizer",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("e");
  expect(
    await page.evaluate(() => (window as any).game.state().compostScraps),
  ).toBe(16);
  expect(
    await page.evaluate(() => (window as any).game.state().fertilizer),
  ).toBe(21);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "pepe-show");
    g.teleport(t.x, t.z);
  });
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("Chad");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await page
    .getByRole("button", { name: "Something else", exact: true })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("Inflation");
  await page.evaluate(() => (window as any).game.storageFlush());
  expect(
    await page.evaluate(() => (window as any).game.state().coin.name),
  ).toBe("Presenter test");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(
      () => (window as any).game.state().neighborChats["pepe-show"],
    ),
  ).toBeGreaterThan(0);
});
test("Mom describes the cleared kitchen instead of claiming to still paint", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    metMom: true,
    day: 6,
    groceries: { rice: 1, beans: 1 },
    position: { x: -2.5, z: 10 },
  });
  await open(page, s);
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "mom");
    g.teleport(-14.7, 10.2);
  });
  await frames(page);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Yes, let’s cook" }).click();
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "mom");
    g.teleport(-14.7, 10.2);
  });
  await frames(page);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "put my things away",
  );
  await expect(page.locator(".speech-bubble")).not.toContainText(
    "painting today",
  );
});
