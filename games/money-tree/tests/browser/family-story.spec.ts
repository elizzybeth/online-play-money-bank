import { test, expect, type Page } from "@playwright/test";
import { fresh, type State } from "../../src/game";
import { scheduleSurgery } from "../../src/family-story";
async function start(page: Page, s = fresh()) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  s.awake = true;
  s.metMom = true;
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
async function frames(page: Page, n = 12) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(64);
}
const overlap = (a: any, b: any) =>
  a.min.every(
    (v: number, i: number) =>
      v <= b.max[i] + 0.01 && a.max[i] >= b.min[i] - 0.01,
  );
test("sign panels have physical clearance, resources sit below the scene on desktop and narrow screens", async ({
  page,
}) => {
  const s = fresh();
  s.position = { x: 28, z: -20 };
  s.foundTVSeeds = true;
  s.cash = 20000000;
  s.bank = 5000000;
  s.seeds = 99;
  s.drink = { id: "sprint", remaining: 60 };
  await start(page, s);
  await frames(page);
  const faces = await page.evaluate(() => (window as any).game.signFaces());
  expect(
    faces.some((f: any) => f.name === "milliner-arrow-Angry Haberdasher"),
  ).toBe(true);
  for (let i = 0; i < faces.length; i++)
    for (let j = i + 1; j < faces.length; j++)
      expect(
        overlap(faces[i], faces[j]),
        faces[i].name + " / " + faces[j].name,
      ).toBe(false);
  const { signs, walls } = await page.evaluate(() =>
    (window as any).game.memeSigns(),
  );
  expect(signs).toHaveLength(3);
  for (const sign of signs)
    for (const wall of walls)
      expect(
        overlap(sign, wall),
        sign.name + " intersects a building wall",
      ).toBe(false);
  for (const width of [1280, 600, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await frames(page, 3);
    const boxes = await page.evaluate(() =>
      ["resource-hud", "cash-hud", "bank-hud", "seed-hud", "daily-net-hud"].map(
        (id) => {
          const r = document.getElementById(id)!.getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
        },
      ),
    );
    const footer = await page.locator("footer").boundingBox();
    expect(boxes[0].bottom).toBeLessThan(footer!.y);
    for (const b of boxes) {
      // Narrow screens wrap the expanded inventory above the lower-left day.
      expect(b.y).toBeGreaterThan(500);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width);
      expect(b.bottom).toBeLessThan(800);
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => (window as any).game.setYaw(0));
  await frames(page, 30);
  await page.screenshot({ path: "../../outputs/money-tree-hud-signs.png" });
});
test("bike pitch is locked, harvest and conversations stay mounted, planting is blocked, hats are physical", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    position: { x: 3, z: 30 },
    bikes: ["tassels"],
    selectedBike: "tassels",
    hats: ["cap", "rabbit", "inspector"],
    seeds: 10,
    can: true,
    fertilizer: 5,
  });
  s.plots[0].stage = "ready";
  s.plots[0].yield = 500;
  await start(page, s);
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.family().rackModels),
  ).toBe(3);
  const walking = await page.evaluate(() => (window as any).game.cameraPitch());
  await page.keyboard.press("h");
  await frames(page, 24);
  const pitch = await page.evaluate(() => (window as any).game.cameraPitch());
  await page.keyboard.down("ArrowUp");
  await frames(page, 15);
  await page.keyboard.up("ArrowUp");
  expect(await page.evaluate(() => (window as any).game.cameraPitch())).toBe(
    pitch,
  );
  await page.evaluate(() => (window as any).game.teleport(-20, 20.6));
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("Harvest");
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    true,
  );
  await page.evaluate(() => (window as any).game.teleport(-17.5, 20.6));
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("H");
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(
    10,
  );
  await page.evaluate(() => {
    const t = (window as any).game.targets.find((t: any) => t.id === "npc1");
    (window as any).game.teleport(t.x + 1.2, t.z);
  });
  await frames(page);
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    true,
  );
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await page.keyboard.press("e");
  await page.keyboard.press("h");
  expect(await page.evaluate(() => (window as any).game.cameraPitch())).toBe(
    walking,
  );
});
test("surgery celebration, absent Mom, two-minute call, recovery and saved story", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, { cash: 600000, bank: 450000, position: { x: -16, z: 12 } });
  await start(page, s);
  await frames(page);
  await page
    .getByRole("button", { name: "Tell Mom you've got $10k", exact: true })
    .click();
  expect(
    await page.evaluate(() => (window as any).game.family().celebrating),
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        (window as any).game.state().cash + (window as any).game.state().bank,
    ),
  ).toBe(50000);
  for (let i = 0; i < 60; i++) await page.clock.fastForward(250);
  await expect(page.locator(".speech-bubble")).toContainText("tomorrow");
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.family().momVisible),
  ).toBe(false);
  await page.clock.fastForward(121000);
  await frames(page, 3);
  await expect(page.getByRole("button", { name: "Answer Mom" })).toBeVisible();
  await page.getByRole("button", { name: "Answer Mom" }).click();
  await expect(page.getByRole("dialog")).toContainText("Auntie");
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  expect(
    await page.evaluate(() => (window as any).game.family().momVisible),
  ).toBe(true);
  expect(
    await page.evaluate(() => (window as any).game.family().activity),
  ).toBe("cooking");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(await page.evaluate(() => (window as any).game.family().phase)).toBe(
    "recovery",
  );
});
test("Bea has actual tea chairs and the full conversation unlocks the $100k goal", async ({
  page,
}) => {
  const s = fresh();
  s.cash = 1000000;
  scheduleSurgery(s);
  s.day = 7;
  s.familyStory!.called = true;
  s.familyStory!.awakeSeconds = 120;
  s.familyStory!.escort = true;
  s.position = { x: 12, z: 17.5 };
  await start(page, s);
  await frames(page);
  await page.evaluate(() => (window as any).game.teleport(12, 16.9));
  await frames(page);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("good tea");
  expect(
    await page.evaluate(() => (window as any).game.family().teaSeated),
  ).toBe(true);
  await frames(page, 30);
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await page.screenshot({ path: "../../outputs/money-tree-bea-tea.png" });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("e");
    await frames(page, 2);
  }
  expect(await page.evaluate(() => (window as any).game.family().phase)).toBe(
    "shop",
  );
  await expect(page.locator("#objective")).toContainText("Robertson");
  await expect(page.locator("#hint")).toContainText("100,000");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(await page.evaluate(() => (window as any).game.family().phase)).toBe(
    "shop",
  );
});
test("Chads explore varied routes with separation; garden lettering and sigma are physical; chalkboard is simple", async ({
  page,
}) => {
  const s = fresh();
  s.foundTVSeeds = true;
  s.position = { x: 26, z: -44 };
  await start(page, s);
  await frames(page);
  const roaming = await page.evaluate(() => (window as any).game.wander(120));
  expect(roaming.minDistance).toBeGreaterThanOrEqual(1.79);
  expect(roaming.walkers.filter((w: any) => w.journeys > 3)).toHaveLength(6);
  expect(
    roaming.walkers.some(
      (w: any) =>
        Math.abs(w.position[0] - w.start[0]) > 1 &&
        Math.abs(w.position[2] - w.start[2]) > 1,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => (window as any).game.drinksBoard())).toBe(
    "Drinks",
  );
  const sign = await page.evaluate(() => (window as any).game.gardenSign());
  expect(sign.letters).toBe(15);
  expect(sign.position[2]).toBeLessThan(-79);
  expect(sign.sigmaBounds[1]).toBeGreaterThan(2);
  await page.evaluate(() => (window as any).game.sigmaOverview());
  await page.screenshot({
    path: "../../outputs/money-tree-garden-iron-sign.png",
  });
});
test("Mom follows the player through Bea’s actual doorway before tea", async ({
  page,
}) => {
  test.setTimeout(240000);
  const { walkTo } = await import("./movement");
  const s = fresh();
  s.cash = 1000000;
  scheduleSurgery(s);
  s.day = 7;
  s.familyStory!.called = true;
  s.familyStory!.awakeSeconds = 120;
  s.familyStory!.escort = true;
  s.position = { x: 12, z: 20.5 };
  await start(page, s);
  await frames(page);
  await walkTo(page, 12, 19.2);
  await walkTo(page, 12, 16.9);
  for (let i = 0; i < 40; i++) await page.clock.fastForward(200);
  const mom = await page.evaluate(
    () => (window as any).game.family().momPosition,
  );
  expect(mom[2]).toBeLessThan(19);
  expect(Math.abs(mom[0] - 12)).toBeLessThan(1);
  await page.keyboard.press("e");
  await frames(page, 25);
  await expect(page.locator(".speech-bubble")).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).game.family().teaSeated),
  ).toBe(true);
});
