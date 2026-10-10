import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function setup(page: Page, state: ReturnType<typeof fresh>) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    state,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(32);
}
test("sleep confirmation protects an active drink and matures watered trees", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 10,
    can: true,
    position: { x: -17.5, z: 1 },
    drink: { id: "sprint", remaining: 150 },
  });
  s.plots[0] = {
    stage: "growing",
    remaining: 180,
    fertilized: false,
    yield: 0,
  };
  await setup(page, s);
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toContainText("Sleeping will cancel");
  await page.keyboard.press("e"); // Safe default keeps the drink and day.
  await expect(page.locator("#modal")).toBeHidden();
  expect(await page.evaluate(() => (window as any).game.state().day)).toBe(10);
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Sleep and cancel drink effect" })
    .click();
  const state = await page.evaluate(() => (window as any).game.state());
  expect(state.day).toBe(11);
  expect(state.drink).toBeUndefined();
  expect(state.plots[0].stage).toBe("ready");
});
test("Twin Planter plants adjoining beds once for two seeds", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 10,
    seeds: 2,
    shovel: true,
    hats: ["inspector"],
    equippedHat: "inspector",
    position: { x: -20, z: 20.6 },
  });
  await setup(page, s);
  await expect(page.locator("#prompt")).toContainText(
    "Plant two adjoining beds",
  );
  await page.keyboard.press("e");
  for (let i = 0; i < 25; i++) await page.clock.fastForward(100);
  const state = await page.evaluate(() => (window as any).game.state());
  expect(state.seeds).toBe(0);
  expect(state.plots.slice(0, 2).map((p: any) => p.stage)).toEqual([
    "planted",
    "planted",
  ]);
});
test("Mom's paint invitation colors both birdhouses and hangs them together", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 4,
    position: { x: -16, z: 22 },
  });
  await setup(page, s);
  await page.evaluate(() => (window as any).game.teleport(-16, 12));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  await expect(page.locator(".paint-palette button")).toHaveCount(40);
  await page
    .getByRole("button", { name: "Birdhouse 1 body: Violet", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Birdhouse 2 roof: Sunshine", exact: true })
    .click();
  await page.screenshot({
    path: "../../outputs/money-tree-birdhouse-paint.png",
  });
  await page.getByRole("button", { name: "Let’s hang them together" }).click();
  for (let i = 0; i < 85; i++) await page.clock.fastForward(100);
  const state = await page.evaluate(() => (window as any).game.state());
  expect(state.birdhousesBuilt).toBe(2);
  expect(state.birdhousePaint[0].body).toBe("#ac7abc");
  expect(state.birdhousePaint[1].roof).toBe("#f6d660");
  expect(await page.evaluate(() => (window as any).game.birdhouses())).toBe(2);
  expect(state.events).toContain(
    "Picked paint colors for two birdhouses and hung them in the trees with Mom.",
  );
  const target = await page.evaluate(() =>
    (window as any).game.targets.find((t: any) => t.id === "mom"),
  );
  expect(target.z).toBeGreaterThan(0);
});

test("TV switches between cartoons and local news, and keeps the chosen channel", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 10,
    position: { x: -11.4, z: 10 },
  });
  s.events = [
    "The giant Pepe balloon popped. Green scraps and twenty-five seed packets scattered across Sigma Town.",
  ];
  await setup(page, s);
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toContainText("What’s on TV?");
  await page.getByRole("button", { name: "Watch Town News" }).click();
  await page.clock.fastForward(32);
  await expect(page.locator("#tv-news-caption")).toContainText(
    "twenty-five packets",
  );
  expect(
    await page.evaluate(() => (window as any).game.state().tvChannel),
  ).toBe("news");
});
