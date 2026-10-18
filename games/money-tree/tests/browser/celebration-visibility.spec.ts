import { test, expect } from "@playwright/test";
import { scheduleSurgery } from "../../src/family-story";
import { fresh } from "../../src/game";
test("Bea and Mom retain full bodies throughout the surgery celebration", async ({
  page,
}, info) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    cash: 600000,
    bank: 450000,
    position: { x: -16, z: 12 },
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(64);
  await page
    .getByRole("button", { name: "Tell Mom you've got $10k", exact: true })
    .click();
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 16; i++) await page.clock.fastForward(250);
    const actors = await page.evaluate(
      () => (window as any).game.family().actors,
    );
    for (const a of actors) {
      expect(a.visible).toBe(true);
      expect(a.height).toBeGreaterThan(1.7);
      expect(a.head[1]).toBeGreaterThan(a.body[1] + 0.3);
    }
  }
  await page.screenshot({ path: info.outputPath("celebration.png") });
});

test("Mom stays absent at home and after reloading a hospital-day save", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    cash: 1000000,
    awake: true,
    metMom: true,
    position: { x: -16, z: 10 },
  });
  scheduleSurgery(s);
  s.day++;
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (const position of [
    [-16.5, 10],
    [-16, 16],
    [-16, 10],
  ]) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      position,
    );
    await page.clock.fastForward(250);
    expect(
      (await page.evaluate(() => (window as any).game.family())).momVisible,
    ).toBe(false);
  }
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(64);
  expect(
    (await page.evaluate(() => (window as any).game.family())).momVisible,
  ).toBe(false);
});
