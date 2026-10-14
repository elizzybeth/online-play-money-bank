import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { assessment } from "../../src/millionaire";
import { createCoin } from "../../src/sigma";
async function frames(page: Page, n = 12, ms = 64) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(ms);
}
function state() {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.metMom = true;
  s.cash = 300000;
  s.communityPlanted = true;
  s.millionaire!.member = s.millionaire!.result = "fire";
  s.millionaire!.answers = assessment.map(() => 2);
  s.millionaire!.welcomeSeed = true;
  s.millionaire!.titheAccepted = s.millionaire!.summitSeeds = true;
  return s;
}
async function start(page: Page, s: ReturnType<typeof state>) {
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
async function go(page: Page, id: string) {
  await page.evaluate((id) => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === id);
    g.teleport(t.x, t.z);
  }, id);
  await frames(page);
  await page.keyboard.press("e");
}
test("first Guardian conversation opens ten mountain hats and the seed ATM persists a purchase", async ({
  page,
}) => {
  const s = state();
  s.position = { x: 34, z: -448 };
  await start(page, s);
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toContainText("Terrace Threads");
  await page.getByRole("button", { name: "Thank you", exact: true }).click();
  await go(page, "mountain-seed-atm");
  await page
    .getByRole("button", { name: "Money seeds · 5 for $200.00", exact: true })
    .click();
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    5,
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.evaluate(() => (window as any).game.mountainShopOverview());
  await page.screenshot({ path: "/private/tmp/terrace-threads.png" });
  await go(page, "hat-verdant");
  await expect(page.locator("#modal")).toContainText("60%");
  await expect(page.locator("#modal img")).toBeVisible();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.storageFlush());
  expect(
    (await page.evaluate(() => (window as any).game.savedState())).hats,
  ).toContain("verdant");
});
test("Guardian mansion offer separates PC replies, supports declining, and previews renamed models", async ({
  page,
}) => {
  const s = state();
  s.millionaire!.mountainEarned = 100000;
  s.millionaire!.chats["visited-summit"] = 1;
  s.position = { x: 34, z: -448 };
  await start(page, s);
  await frames(page, 90, 100);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("When are you");
  await expect(page.locator(".speech-bubble p")).not.toContainText([
    "How much does it cost?",
  ]);
  await page
    .getByRole("button", { name: "I don’t want a mansion", exact: true })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "change your mind",
  );
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "How much does it cost?", exact: true })
    .click();
  await page
    .getByRole("button", { name: "I don’t have a million", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "But that will take 100,000 days!",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("40%");
  await page
    .getByRole("button", { name: "Take the mortgage", exact: true })
    .click();
  await expect(page.locator(".mansion-previews img")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Magnate Mansion", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Presidential Palace", exact: true }),
  ).toBeVisible();
  await frames(page, 2);
  const previews = await page.locator(".mansion-previews").boundingBox();
  expect(previews!.y).toBeGreaterThanOrEqual(0);
  const pictures = await page.locator(".mansion-previews img").all();
  const boxes = await Promise.all(pictures.map((p) => p.boundingBox()));
  expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(2);
  await page.screenshot({ path: "/private/tmp/mansion-selection.png" });
});
test("Grindset remains a shopkeeper first and Party Horn emits a longer note parade", async ({
  page,
}) => {
  const s = state();
  createCoin(s, "Strategy");
  s.bikes = ["city"];
  s.selectedBike = "city";
  s.position = { x: 3, z: 30 };
  await start(page, s);
  await go(page, "grindset");
  await expect(
    page.getByRole("button", { name: "See the drinks", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".speech-bubble p")).toContainText([
    "get you to drink",
  ]);
  await page
    .getByRole("button", {
      name: "Tell me about your trading strategy",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("2%");
  await page.getByRole("button", { name: "Tell me more", exact: true }).click();
  await page
    .getByRole("button", { name: "See you around", exact: true })
    .click();
  await page.evaluate(() => (window as any).game.teleport(3, 30));
  await frames(page);
  await page.keyboard.press("h");
  await frames(page, 25);
  await page.keyboard.press("f");
  await frames(page, 30, 100);
  const fx = await page.evaluate(() => (window as any).game.bikeSpecial());
  expect(fx.remaining).toBeGreaterThan(2);
  expect(fx.particles).toBeGreaterThan(24);
});

test("bridge walls join the boundary while bike thoughts stay centered through turns", async ({
  page,
}) => {
  const s = state();
  s.position = { x: 46, z: -80 };
  s.bikes = ["city"];
  s.selectedBike = "city";
  await start(page, s);
  const walls = await page.evaluate(() => {
    const g = (window as any).game;
    return [42.9, 49.1].every((x) =>
      g.rects.some((r: any) => r.x === x && r.z === -75.3 && r.d === 28.6),
    );
  });
  expect(walls).toBe(true);
  await page.evaluate(() => (window as any).game.bridgeOverview());
  await page.screenshot({ path: "/private/tmp/bridge-walls.png" });
  await frames(page);
  await page.keyboard.press("h");
  await frames(page, 30);
  await page.evaluate(() => (window as any).game.teleport(34, -210));
  await frames(page);
  await expect(page.locator("#thought")).toBeVisible();
  for (const yaw of [-2, 0, 2]) {
    await page.evaluate((y) => (window as any).game.setYaw(y), yaw);
    await frames(page, 4);
    const b = await page.locator("#thought").boundingBox();
    expect(Math.abs(b!.x + b!.width / 2 - 640)).toBeLessThan(2);
  }
});
