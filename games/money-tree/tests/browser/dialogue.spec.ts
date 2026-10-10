import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("NPC speech is anchored and does not pause movement", async ({ page }) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => {
    (window as any).game.teleport(12, 7.5);
    (window as any).game.setYaw(Math.PI / 2);
  });
  await expect(page.locator("#prompt")).toContainText("Jun");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect(page.locator(".speech-bubble")).toContainText(
    "Especially about gardens",
  );
  await expect(
    page.locator(".npc-name").filter({ hasText: "Jun" }),
  ).toBeVisible();
  await expect(page.locator("#modal")).toBeHidden();
  const firstLine = await page.locator(".speech-bubble").innerText();
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).not.toHaveText(firstLine);
  await expect(page.locator(".speech-bubble")).toContainText(
    "strange rustling",
  );
  await page.screenshot({ path: "../../outputs/money-tree-npc-chat.png" });
  const before = await page.evaluate(
    () => (window as any).game.state().position.x,
  );
  await page.waitForTimeout(2400);
  await page.keyboard.down("s");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.state().position.x))
    .toBeGreaterThan(before + 1);
  await page.keyboard.up("s");
  await page.evaluate(() => (window as any).game.teleport(-16, 22));
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
});
test("harvest withers, Robertson stops selling seeds, cap seeds replant once and persist", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    boughtSeeds: true,
    can: true,
    shovel: true,
    bank: 0,
    cash: 500,
    position: { x: -20, z: 20.6 },
  });
  s.plots[0] = { stage: "ready", remaining: 0, fertilized: false, yield: 200 };
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).game.state().plots[0].stage),
    )
    .toBe("harvested");
  await expect(page.locator("#prompt")).toContainText("need seeds");
  await page.evaluate(() => (window as any).game.teleport(8, -31.7));
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "Go find some yourself",
  );
  await expect(
    page.getByRole("button", { name: "Yes, seeds please" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Look around" }).click();
  await page.evaluate(() => (window as any).game.teleport(13, -28.9));
  await expect(page.locator("#prompt")).toContainText("fertilizer");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Buy · $5.00" }).click();
  await page.keyboard.press("i");
  await expect(page.locator(".inventory-card svg")).toHaveCount(7);
  await expect(page.locator("[data-item=fertilizer]")).toContainText("5 doses");
  await page.getByRole("button", { name: "Back to the day" }).click();
  await page.evaluate(() => (window as any).game.teleport(20.65, -24.6));
  await expect(page.locator("#prompt")).toContainText("Cap");
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(5);
  await page.evaluate(() => (window as any).game.teleport(-20, 20.6));
  await expect(page.locator("#prompt")).toContainText("Plant seeds");
  await page.keyboard.press("e");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).game.state().plots[0].stage),
    )
    .toBe("planted");
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toContainText(
    "Press E to add fertilizer",
  );
  await expect(page.locator("#prompt")).toContainText("Apply fertilizer");
  expect(
    await page.evaluate(() => (window as any).game.state().plots[0].fertilized),
  ).toBe(false);
  expect(
    await page.evaluate(() => (window as any).game.state().fertilizer),
  ).toBe(5);
  await page.keyboard.press("e");
  const state = await page.evaluate(() => (window as any).game.state());
  expect(state.seeds).toBe(4);
  expect(state.foundCapSeeds).toBe(true);
  expect(state.plots[0].fertilized).toBe(true);
  expect(state.fertilizer).toBe(4);

  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().foundCapSeeds),
  ).toBe(true);
  expect(await page.evaluate(() => (window as any).game.state().seeds)).toBe(4);
});
