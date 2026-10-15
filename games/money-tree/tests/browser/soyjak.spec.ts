import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("Soyjak sells independent, saved temporary size and paper hat effects", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const s = fresh();
  s.awake = true;
  s.foundTVSeeds = true;
  s.cash = 20000;
  s.hats = ["cap", "rabbit"];
  s.equippedHats = ["cap", "rabbit"];
  s.equippedHat = "rabbit";
  s.position = { x: 25.7, z: -77.1 };
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const frames = async () => {
    for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
  };
  await frames();
  await page.evaluate(() => (window as any).game.soyjakReview());
  await page.screenshot({ path: info.outputPath("soyjak-stall.png") });
  await page.keyboard.press("e");
  await page.getByRole("button", { name: /Impossible Burger/ }).click();
  await frames();
  expect(
    await page.evaluate(() => (window as any).game.soyEffectsView()),
  ).toEqual({ scale: 2, serious: false });
  await page.keyboard.press("e");
  await page.getByRole("button", { name: /Soy milk/ }).click();
  await frames();
  expect(
    await page.evaluate(() => (window as any).game.soyEffectsView()),
  ).toEqual({ scale: 2, serious: true });
  await expect(page.locator("#soy-effects-hud")).toContainText("Serious Hat");
  await page.evaluate(() => {
    const g = (window as any).game;
    g.teleport(25.7, -74);
    g.soyjakPlayerReview();
  });
  await page.screenshot({
    path: info.outputPath("soyjak-giant-serious-hat.png"),
  });
  expect(await page.evaluate(() => (window as any).game.state().hats)).toEqual(
    s.hats,
  );
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames();
  expect(
    await page.evaluate(() => (window as any).game.soyEffectsView()),
  ).toEqual({ scale: 2, serious: true });
  await page.evaluate(() => (window as any).game.advance(120));
  await frames();
  expect(
    await page.evaluate(() => (window as any).game.soyEffectsView()),
  ).toEqual({ scale: 1, serious: false });
  expect(
    await page.evaluate(() => (window as any).game.state().equippedHats),
  ).toEqual(s.equippedHats);
  await expect(page.locator("#soy-effects-hud")).toBeHidden();
  expect(errors).toEqual([]);
});
