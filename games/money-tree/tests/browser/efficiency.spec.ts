import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { createCoin } from "../../src/sigma";
import { applyDebugAction } from "../../src/debug-menu";

for (const readyForMom of [false, true])
  test(`stationary HUD keeps its contents and hidden bed labels stay untouched${readyForMom ? " with a completed savings goal" : ""}`, async ({
    page,
  }) => {
    const state = Object.assign(fresh(), { awake: true, day: 2, metMom: true });
    applyDebugAction(state, "level3");
    state.millionaire!.member = "arms";
    state.millionaire!.welcomeSeed = true;
    state.communityPlanted = true;
    if (readyForMom) state.cash = 1_000_000;
    createCoin(state, "Efficiency");
    state.foodBuff = { recipe: 1, remaining: 30 };
    await page.clock.install({ time: new Date("2026-01-01") });
    await page.clock.pauseAt(new Date("2026-01-02"));
    await page.addInitScript(
      (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
      state,
    );
    await page.goto("./?test");
    await page.getByRole("button", { name: "Wake up" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    for (let i = 0; i < 8; i++) await page.clock.runFor(40);
    await expect(page.locator("#food-effect")).toBeVisible();
    await expect(page.locator("#membership-hud")).toBeVisible();
    await expect(page.locator("#coin-tracker")).toBeVisible();
    await page.evaluate(() => {
      const hud = document.querySelectorAll(
        "#coin-tracker, #membership-hud, #food-effect, #resource-hud, #bank-hud-stack, #prompt, #stats, #location, #quest",
      );
      const timers = document.querySelector("#timers")!;
      const counts = { hud: 0, hiddenLabels: 0 };
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          if (timers.contains(record.target)) counts.hiddenLabels++;
          else counts.hud++;
        }
      });
      for (const element of Array.from(hud))
        observer.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      observer.observe(timers, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });
      (window as any).efficiency = { counts, observer, tracked: hud.length };
    });
    const workBefore = await page.evaluate(() =>
      (window as any).game.updateWork(),
    );
    for (let i = 0; i < 8; i++) await page.clock.runFor(40);
    expect(
      await page.evaluate(() => (window as any).game.updateWork()),
    ).toEqual(workBefore);
    console.log("unchanged frame rebuilds", { news: 0, momSetup: 0 });
    const result = await page.evaluate(() => {
      const e = (window as any).efficiency;
      e.observer.disconnect();
      return { ...e.counts, tracked: e.tracked };
    });
    console.log("stationary DOM mutations", result);
    expect(result.tracked).toBe(9);
    expect(result.hud).toBe(0);
    expect(result.hiddenLabels).toBe(0);
    const before = await page.locator("#food-effect").textContent();
    for (let i = 0; i < 8; i++) await page.clock.runFor(160);
    expect(await page.locator("#food-effect").textContent()).not.toBe(before);
  });

test("ready labels appear nearby and return after travelling out of range", async ({
  page,
}) => {
  const state = Object.assign(fresh(), {
    awake: true,
    day: 2,
    metMom: true,
    position: { x: -20, z: 21 },
  });
  applyDebugAction(state, "level3");
  state.plots[0].stage = "ready";
  state.plots[0].remaining = 0;
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    state,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  for (let i = 0; i < 8; i++) await page.clock.runFor(40);
  const label = page.locator("#timers .tree-timer").first();
  await expect(label).toBeVisible();
  await expect(label).toHaveText("$ Ready to harvest");
  await expect(page.locator("#prompt")).toContainText("Harvest");
  await page.evaluate(() => (window as any).game.teleport(150, -220));
  for (let i = 0; i < 8; i++) await page.clock.runFor(40);
  await expect(label).toBeHidden();
  await page.evaluate(() => (window as any).game.teleport(-20, 21));
  for (let i = 0; i < 8; i++) await page.clock.runFor(40);
  await expect(label).toBeVisible();
  await expect(page.locator("#prompt")).toContainText("Harvest");
});

test("Mom’s cached setup restores her home pose after an escort without repeating idle setup", async ({
  page,
}) => {
  const s = Object.assign(fresh(), { awake: true, metMom: true, day: 4 });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const result = await page.evaluate(() =>
    (window as any).game.momEscortReturnCheck(),
  );
  expect(result.idleUpdates).toBe(0);
  expect(result.restored).toBe(true);
  expect(result.returned).toEqual(result.home);
  console.log("300 unchanged Mom setup calls", {
    rebuilds: result.idleUpdates,
  });
});
