import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { newMillionaire } from "../../src/millionaire";
import { buyMansion } from "../../src/housing";
async function frames(page: Page, n = 12, step = 100) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(step);
}
async function start(page: Page, state: ReturnType<typeof fresh>) {
  expect(decode(JSON.stringify(state))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, state);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
async function visitMom(page: Page) {
  const target = await page.evaluate(() =>
    (window as any).game.targets.find((t: any) => t.id === "mom"),
  );
  await page.evaluate((p) => (window as any).game.teleport(p.x, p.z), target);
  await frames(page);
  if (!(await page.locator(".speech-bubble").isVisible()))
    await page.keyboard.press("e");
}
test("legacy mansion bed never relocates Mom; mansion conversation resumes and respects her choice", async ({
  page,
}, info) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    day: 2,
    foundTVSeeds: true,
    position: { x: 88, z: -335 },
    cash: 300000,
  });
  s.millionaire = {
    ...newMillionaire(),
    afterPepe: 10000,
    unlocked: true,
    member: "fire",
    titheAccepted: true,
    mountainEarned: 100000,
    welcomeSeed: true,
    summitSeeds: true,
    apps: [0, 1, 2, 3, 4, 5],
  };
  expect(buyMansion(s, "hearst", true)).toBe(true);
  s.housing!.movingInSeen = false;
  s.housing!.momBed = true;
  s.furniture = [{ item: "royal-bed", x: 88, z: -340, y: 0, rotation: 0 }];
  await start(page, s);
  const initial = await page.evaluate(() => (window as any).game.spaceEstate());
  expect(initial.film).toBeNull();
  expect(initial.mom[2]).toBeGreaterThan(-5);
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBe(-335);
  await visitMom(page);
  await page
    .getByRole("button", { name: "Mom, I bought a mansion.", exact: true })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("Why, love?");
  await expect(page.locator(".speech-bubble .choices button")).toHaveCount(4);
  await page
    .getByRole("button", {
      name: "I wanted to give you something wonderful.",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "happy here at home",
  );
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  await visitMom(page);
  await expect(page.locator(".speech-bubble")).toContainText(
    "happy here at home",
  );
  await page
    .getByRole("button", {
      name: "We could bring the chickens and your birdhouses with us.",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "I don’t want to move.",
  );
  await page.screenshot({ path: info.outputPath("mom-loves-home.png") });
  await page
    .getByRole("button", {
      name: "You don’t have to move. I’ll keep coming home.",
      exact: true,
    })
    .click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).momHomeStory
      .mansionStage,
  ).toBe(4);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("button", { name: "Mom, I bought a mansion.", exact: true }),
  ).toHaveCount(0);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).mom[2],
  ).toBeGreaterThan(-5);
});
test("replanting a home bed brings Mom out, persists the conversation, and leaves her enjoying the garden", async ({
  page,
}, info) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    day: 2,
    can: true,
    shovel: true,
    position: { x: -12, z: 21 },
    cropSeeds: { iris: 1 },
  });
  s.plots[4].stage = "harvested";
  await start(page, s);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "What shall we plant?" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Iris · Mom’s favorite · 1 seeds",
      exact: true,
    })
    .click();
  await frames(page, 40, 250);
  expect(
    (await page.evaluate(() => (window as any).game.state())).plots[4].crop,
  ).toBe("iris");
  await page.evaluate(() => (window as any).game.teleport(-10.2, 20));
  await frames(page, 48, 250);
  const visit = await page.evaluate(() => (window as any).game.spaceEstate());
  expect(visit.gardenVisit.arrived).toBe(true);
  expect(visit.mom[2]).toBe(18);
  await expect(page.locator(".speech-bubble")).toContainText("looks beautiful");
  await expect(page.locator(".speech-bubble .choices button")).toHaveCount(3);
  await page
    .getByRole("button", {
      name: "I wanted to grow something just for you.",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "can we afford it?",
  );
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page, 48, 250);
  await expect(page.locator(".speech-bubble")).toContainText(
    "can we afford it?",
  );
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "love our little garden",
  );
  await page.screenshot({ path: info.outputPath("mom-in-garden.png") });
  await page.keyboard.press("e");
  let state = await page.evaluate(() => (window as any).game.state());
  expect(state.momHomeStory.gardenStage).toBe(3);
  expect(state.momHomeStory.gardenDay).toBe(state.day);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).mom[2],
  ).toBe(18);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).gardenVisit,
  ).toBeNull();
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  expect((await page.evaluate(() => (window as any).game.state())).day).toBe(3);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).mom[2],
  ).toBeLessThan(14);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).momActivity,
  ).not.toBe("garden");
});

test("the garden invitation waits while Mom is at the hospital", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    day: 2,
    position: { x: -12, z: 21 },
    familyStory: {
      scheduledDay: 1,
      surgeryDay: 2,
      awakeSeconds: 0,
      called: false,
      escort: false,
      teaStep: 0,
      shopGoal: false,
    },
  });
  s.plots[4].crop = "iris";
  s.plots[4].stage = "planted";
  await start(page, s);
  await frames(page, 20, 250);
  expect(
    (await page.evaluate(() => (window as any).game.family())).momVisible,
  ).toBe(false);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).gardenVisit,
  ).toBeNull();
  expect(
    (await page.evaluate(() => (window as any).game.state())).momHomeStory,
  ).toBeUndefined();
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
});
