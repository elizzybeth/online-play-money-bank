import { mountainPlots } from "../../src/millionaire-land";
import { test, expect } from "@playwright/test";
import { newPhoneGame } from "../../src/phone-games";
import { fresh } from "../../src/game";
import { newMillionaire, assessment } from "../../src/millionaire";
async function frames(page: any, n = 20) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(32);
}
async function setup(page: any, s: any) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript(
    (s: any) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
const base = () =>
  Object.assign(fresh(), {
    awake: true,
    metMom: true,
    foundTVSeeds: true,
    foundGardenSeeds: true,
    metStacy: true,
    foundMeditationSeeds: true,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    can: true,
    seeds: 5,
    cash: 2000,
    millionaire: { ...newMillionaire(), afterPepe: 9900 },
    position: { x: -20, z: 21.5 },
  });
test("post-Pepe earnings open a real hedge gap, the assessment awards membership once, and the mountain has a smooth climb", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const s = base();
  s.plots[0] = { stage: "ready", remaining: 0, fertilized: false, yield: 200 };
  await setup(page, s);
  expect(
    (await page.evaluate(() => (window as any).game.millionaire())).visible,
  ).toBe(false);
  await page.keyboard.press("e");
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.millionaire())).visible,
  ).toBe(true);
  const entrance = await page.evaluate(() =>
    (window as any).game.level3Entrance(),
  );
  expect(entrance.bushes).toEqual([false, false, false]);
  expect(entrance.path.min[0]).toBeLessThanOrEqual(37);
  expect(entrance.path.min[2]).toBeLessThanOrEqual(-61.5);
  expect(entrance.path.max[2]).toBeGreaterThanOrEqual(-60);
  await page.evaluate(() => (window as any).game.teleport(37, -60));
  await page.evaluate(() => (window as any).game.setYaw(-Math.PI / 2));
  await page.keyboard.down("w");
  await page.keyboard.down("Shift");
  await frames(page, 60);
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.x,
  ).toBeGreaterThan(42);
  await page.evaluate(() => (window as any).game.teleport(34, -128));
  await frames(page);
  await page.keyboard.press("e");
  await frames(page);
  await page
    .getByRole("button", { name: "Yes, I'd like an assessment", exact: true })
    .click();
  await page.getByRole("button", { name: "Enter test", exact: true }).click();
  for (const question of assessment)
    await page.getByRole("button", { name: question[1], exact: true }).click();
  await expect(page.locator("#modal")).toBeHidden();
  await frames(page, 100);
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: `${process.env.MONEY_TREE_CAPTURE}/level3-assessment.png`,
    });
  await page
    .getByRole("button", { name: "I'd like to join", exact: true })
    .click();
  await frames(page);
  const member = await page.evaluate(() => (window as any).game.state());
  expect(member.millionaire.member).toBe("arms");
  expect(member.seeds).toBe(6);
  expect(member.plots.filter((p: any) => p.mountain)).toHaveLength(
    mountainPlots.length,
  );
  await expect(page.locator("#membership-hud")).toBeVisible();
  await page.evaluate(() => (window as any).game.teleport(34, -340));
  await page.evaluate(() => (window as any).game.setYaw(0));
  await page.keyboard.down("w");
  await page.keyboard.down("Shift");
  for (let i = 0; i < 150; i++) await page.clock.fastForward(100);
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");
  const height = await page.evaluate(
    () => (window as any).game.millionaire().player[1],
  );
  expect(height).toBeGreaterThan(13);
  expect(height).toBeLessThan(15);
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: `${process.env.MONEY_TREE_CAPTURE}/level3-mountain.png`,
    });
  await page.evaluate(() => (window as any).game.teleport(34, -448));
  await frames(page);
  await page.keyboard.press("e");
  await frames(page);
  for (const question of [
    "What’s the catch?",
    "Like, my neighbors?",
    "Then who?",
    "But I’ve only ever seen them on Mt. Millionaire.",
    "Accept the seeds and the 10% contribution",
  ]) {
    await page.getByRole("button", { name: question, exact: true }).click();
    await frames(page, 2);
  }
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    31,
  );
  expect(
    (await page.evaluate(() => (window as any).game.state())).millionaire
      .titheAccepted,
  ).toBe(true);
  expect(
    (
      await page.evaluate(() => (window as any).game.millionaire())
    ).guide.filter((o: any) => o.visible),
  ).toHaveLength(3);
  await page.evaluate(() => (window as any).game.teleport(43, -353));
  await frames(page);
  await page.keyboard.press("e");
  await frames(page, 250);
  let planted = await page.evaluate(() => (window as any).game.state());
  const plot = planted.plots.findIndex(
    (p: any) => p.mountain && p.x === 43 && p.z === -355,
  );
  expect(planted.plots[plot].stage).toBe("growing");
  expect(planted.plots[plot].fertilized).toBe(true);
  await page.keyboard.press("e");
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.state())).plots[plot].stage,
  ).toBe("growing");
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.state())).plots[plot].stage,
  ).toBe("ready");
  const before = await page.evaluate(() => (window as any).game.state());
  await page.keyboard.press("e");
  await frames(page);
  const after = await page.evaluate(() => (window as any).game.state());
  expect(after.millionaire.mountainEarned).toBeGreaterThan(0);
  expect(
    after.cash -
      before.cash +
      after.millionaire.tithed -
      before.millionaire.tithed,
  ).toBe(after.millionaire.mountainEarned);
  expect(errors).toEqual([]);
});
test("a mansion owner comes through the doorway and sells a working phone app", async ({
  page,
}) => {
  const s = base();
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 100000,
    unlocked: true,
    answers: Array(12).fill(0),
    result: "arms",
    member: "arms",
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
    mountainEarned: 100000,
  };
  s.position = { x: 138, z: -295 };
  await setup(page, s);
  await frames(page, 100);
  expect(
    (
      await page.evaluate(() => (window as any).game.millionaire())
    ).mansions.every((m: any) => m.visible),
  ).toBe(true);
  if (
    !(await page
      .getByRole("button", { name: "Buy Holy Snake for $5", exact: true })
      .isVisible())
  ) {
    await page.keyboard.press("e");
    await frames(page);
  }
  await page
    .getByRole("button", { name: "Buy Holy Snake for $5", exact: true })
    .click();
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    1500,
  );
  await expect(page.getByLabel("Holy Snake game board")).toBeVisible();
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: `${process.env.MONEY_TREE_CAPTURE}/level3-phone.png`,
    });
  await page
    .getByRole("button", { name: "One collision shield · $1", exact: true })
    .click();
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    1400,
  );
  await page
    .getByRole("button", { name: "Put phone away", exact: true })
    .click();
  await expect(page.locator("#modal")).toBeHidden();
});

test("a real phone memory game pays a dollar once without tithing and preserves app ownership", async ({
  page,
}) => {
  const s = base();
  s.cash = 6000;
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 100000,
    unlocked: true,
    answers: Array(12).fill(2),
    result: "fire",
    member: "fire",
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
    mountainEarned: 100000,
  };
  s.position = { x: 138, z: -399 };
  await setup(page, s);
  await frames(page, 100);
  if (
    !(await page
      .getByRole("button", { name: "Buy Memory Ministry for $5", exact: true })
      .isVisible())
  ) {
    await page.keyboard.press("e");
    await frames(page);
  }
  await page
    .getByRole("button", { name: "Buy Memory Ministry for $5", exact: true })
    .click();
  const board = page.getByLabel("Memory Ministry game board");
  const rectangle = (await board.boundingBox())!;
  const cards = newPhoneGame(4).cards;
  for (let value = 0; value < 10; value++) {
    for (const index of cards.flatMap((v, i) => (v === value ? [i] : []))) {
      await page.mouse.click(
        rectangle.x + rectangle.width * (((index % 4) + 0.5) / 4),
        rectangle.y + rectangle.height * ((Math.floor(index / 4) + 0.5) / 5),
      );
    }
    await frames(page, 2);
  }
  const earned = await page.evaluate(() => (window as any).game.state());
  expect(earned.cash).toBe(5600);
  expect(earned.millionaire.tithed).toBe(0);
  expect(earned.millionaire.apps).toEqual([4]);
  await expect(page.locator("#phone-game")).toContainText("$1.00");
  await frames(page, 40);
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    5600,
  );
  await page.getByRole("button", { name: "Put phone away" }).click();
  await page.locator("#membership-hud").click();
  await page
    .getByRole("button", { name: "Memory Ministry", exact: true })
    .click();
  await expect(board).toBeVisible();
});

test("mountain harvests start construction and children walk off their terraces", async ({
  page,
}) => {
  const s = base();
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 10000,
    unlocked: true,
    answers: Array(12).fill(0),
    result: "arms",
    member: "arms",
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
    mountainEarned: 16600,
  };
  s.plots.push({
    x: 43,
    z: -340,
    mountain: true,
    soilFilled: true,
    stage: "ready",
    remaining: 0,
    fertilized: true,
    yield: 900,
  });
  s.position = { x: 43, z: -338 };
  await setup(page, s);
  const start = await page.evaluate(() => (window as any).game.millionaire());
  expect(start.mansions.filter((m: any) => m.visible)).toHaveLength(0);
  await page.keyboard.press("e");
  await frames(page, 100);
  const moving = await page.evaluate(() => (window as any).game.millionaire());
  expect(moving.mansions.filter((m: any) => m.visible)).toHaveLength(1);
  expect(moving.mansions[0].builtHeight).toBeGreaterThan(0);
  expect(moving.mansions[0].builtHeight).toBeLessThan(1);
  expect(moving.children[0]).not.toEqual(start.children[0]);
  expect(moving.state.mountainEarned).toBe(17500);
  expect(moving.state.tithed).toBe(90);
  await frames(page, 320);
  const built = await page.evaluate(() => (window as any).game.millionaire());
  expect(built.mansions[0].builtHeight).toBe(1);
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: `${process.env.MONEY_TREE_CAPTURE}/level3-construction.png`,
    });
});
