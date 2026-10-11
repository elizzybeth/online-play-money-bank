import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import {
  newMillionaire,
  assessment,
  answerAssessment,
  joinFellowship,
  acceptTithe,
} from "../../src/millionaire";
import fs from "node:fs";
async function frames(page: any, n = 20, dt = 32) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(dt);
}
async function setup(page: any, s: any) {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s: any) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
function base() {
  return Object.assign(fresh(), {
    awake: true,
    metMom: true,
    foundTVSeeds: true,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    millionaire: { ...newMillionaire(), unlocked: true, afterPepe: 10000 },
    position: { x: 34, z: -128 },
  });
}
async function capture(page: any, name: string) {
  if (process.env.MONEY_TREE_CAPTURE) {
    fs.mkdirSync(process.env.MONEY_TREE_CAPTURE, { recursive: true });
    await page.screenshot({
      path: `${process.env.MONEY_TREE_CAPTURE}/${name}.png`,
    });
  }
}
test("mascot quiz separates its break action and closes before the chosen mascot walks over", async ({
  page,
}) => {
  await setup(page, base());
  await page.keyboard.press("e");
  await frames(page);
  await page
    .getByRole("button", { name: "Yes, I'd like an assessment", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "WHICH MASCOT ARE YOU?" }),
  ).toBeVisible();
  await expect(page.locator(".mascot-lineup img")).toHaveCount(3);
  await capture(page, "mascot-landing");
  await page.getByRole("button", { name: "Enter test", exact: true }).click();
  const split = await page.locator(".mascot-quiz .choices").evaluate((row) => {
    const buttons = Array.from(row.querySelectorAll("button")),
      last = buttons.at(-1)!;
    return {
      bottom: buttons
        .slice(0, -1)
        .every(
          (b) =>
            b.getBoundingClientRect().bottom < last.getBoundingClientRect().top,
        ),
      different:
        getComputedStyle(last).backgroundColor !==
        getComputedStyle(buttons[0]).backgroundColor,
    };
  });
  expect(split).toEqual({ bottom: true, different: true });
  for (const q of assessment)
    await page.getByRole("button", { name: q[1], exact: true }).click();
  await expect(page.locator("#modal")).toBeHidden();
  const before = await page.evaluate(
    () => (window as any).game.millionaire().guide[0].position,
  );
  await frames(page, 100);
  const after = await page.evaluate(
    () => (window as any).game.millionaire().guide[0].position,
  );
  expect(Math.hypot(after[0] - 34, after[2] + 128)).toBeLessThan(
    Math.hypot(before[0] - 34, before[2] + 128),
  );
  await expect(page.locator(".speech-bubble")).toContainText(
    "Welcome to Massive Investment Arms",
  );
  await capture(page, "willow-greeting");
});
test("the mascot waits for the player and escorts them into the summit pagoda", async ({
  page,
}) => {
  test.setTimeout(240000);
  const s = base();
  assessment.forEach(() => answerAssessment(s, 0));
  joinFellowship(s, "arms");
  acceptTithe(s);
  s.position = { x: 28, z: -128 };
  await setup(page, s);
  await page.keyboard.press("e");
  await frames(page);
  await page.getByRole("button", { name: "Lead the way", exact: true }).click();
  await frames(page, 12, 250);
  for (let i = 0; i < 220; i++) {
    const host = await page.evaluate(
      () => (window as any).game.millionaire().guide[0].position,
    );
    if (host[2] < -447) break;
    await page.evaluate(([x, _, z]) => {
      for (const [px, pz] of [
        [x, z + 5],
        [x + 4, z + 2],
        [x - 4, z + 2],
        [x, z - 4],
      ]) {
        try {
          (window as any).game.teleport(px, pz);
          return;
        } catch {
          /* Walk around trunks. */
        }
      }
      throw new Error("No clear following position");
    }, host);
    await frames(page, 1, 250);
  }
  const host = await page.evaluate(
    () => (window as any).game.millionaire().guide[0].position,
  );
  expect(host[2]).toBeLessThan(-447);
  expect(host[1]).toBeGreaterThanOrEqual(14);
  await capture(page, "summit-escort");
  await page.evaluate(() => (window as any).game.teleport(36, -446.3));
  await frames(page);
  await page.keyboard.press("e");
  await frames(page);
  await expect(page.locator(".speech-bubble")).toContainText("shared routines");
  await expect(
    page.getByRole("button", { name: "Tell me more", exact: true }),
  ).toBeVisible();
});
test("home counters occupy the lower right, notebook handwriting follows its rules, and captions stay on TV", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    day: 3,
    tvChannel: "news",
    position: { x: -16, z: 10 },
    cash: 500,
    bank: 2000,
  });
  s.journal = [
    "Day 1\n\nA warm room, a good book, and Mom making dinner.\n\nI planted a little hope today.",
  ];
  await setup(page, s);
  const hud = await page.locator("#resource-hud").boundingBox();
  expect(hud!.x + hud!.width).toBeGreaterThan(1200);
  expect(hud!.y).toBeGreaterThan(500);
  const design = await page.evaluate(() => (window as any).game.homeDesign());
  expect(design.furnishings).toBeGreaterThan(12);
  expect(design.tumbleweeds).toHaveLength(12);
  await expect(page.locator("#tv-news-caption")).toHaveCount(0);
  expect(design.tv.caption).toBeTruthy();
  await capture(page, "jewel-home");
  await page.keyboard.press("j");
  const rules = await page.locator(".notebook-page").evaluate((p) => ({
    paragraph: getComputedStyle(p.querySelector("p")!).lineHeight,
    margin: getComputedStyle(p.querySelector("p")!).marginBottom,
    background: getComputedStyle(p).backgroundImage,
  }));
  expect(rules.paragraph).toBe("30px");
  expect(rules.margin).toBe("30px");
  expect(rules.background).toContain("30px");
  await capture(page, "ruled-notebook");
  await page
    .getByRole("button", { name: "Close notebook", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await frames(page);
  const small = await page.locator("#resource-hud").boundingBox();
  expect(small!.x).toBeGreaterThanOrEqual(0);
  expect(small!.x + small!.width).toBeLessThanOrEqual(390);
  await capture(page, "small-home-hud");
});
