import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("feather stays in hair until the player replies with E, passes to Mom, then completes once", async ({
  page,
}) => {
  // This exercises the entire wait, reply, and handoff with rendered frames.
  test.setTimeout(process.env.CI ? 480000 : 240000);
  const s = Object.assign(fresh(), {
    day: 2,
    awake: true,
    metMom: true,
    position: { x: -14, z: 12 },
    hats: ["cap", "beekeeper", "inspector"],
    equippedHat: "inspector",
    equippedHats: ["cap", "beekeeper", "inspector"],
    adventure: { feather: { chicken: "Cluck", day: 2 } },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "mom");
    for (const [dx, dz] of [
      [0, 1.5],
      [1.5, 0],
      [-1.5, 0],
      [0, -1.5],
    ]) {
      try {
        g.teleport(t.x + dx, t.z + dz);
        return;
      } catch {}
    }
    throw Error("No clear position near Mom");
  });
  for (let i = 0; i < 10; i++) await page.clock.fastForward(40);
  if (!(await page.locator(".speech-bubble").count()))
    await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "What have you brought",
  );
  const reply = page.getByRole("button", {
    name: /I brought you a feather from Cluck, Mom/,
  });
  await expect(reply).toContainText("E");
  expect(
    await page.evaluate(
      () => (window as any).game.state().adventure.feather.chicken,
    ),
  ).toBe("Cluck");
  await page.keyboard.press("e");
  for (let i = 0; i < 32; i++) await page.clock.fastForward(40);
  expect(
    await page.evaluate(() => (window as any).game.spaceEstate().featherParent),
  ).toBe("hand-1");
  for (let i = 0; i < 23; i++) await page.clock.fastForward(40);
  expect(
    await page.evaluate(() => (window as any).game.spaceEstate().featherOwner),
  ).toBe("mom");
  if (process.env.MONEY_TREE_CAPTURE)
    await page.screenshot({
      path: process.env.MONEY_TREE_CAPTURE + "/feather-pass.png",
    });
  for (let i = 0; i < 30; i++) await page.clock.fastForward(40);
  await expect(page.locator(".speech-bubble")).toContainText("Thank you, love");
  expect(
    await page.evaluate(() => (window as any).game.state().adventure.feather),
  ).toBeUndefined();
  expect(
    await page.evaluate(
      () => (window as any).game.state().adventure.feathersGiven,
    ),
  ).toBe(1);
  await page.keyboard.press("e");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(
      () => (window as any).game.state().adventure.feathersGiven,
    ),
  ).toBe(1);
  expect(
    await page.evaluate(() => (window as any).game.spaceEstate().feather),
  ).toBe(false);
});
