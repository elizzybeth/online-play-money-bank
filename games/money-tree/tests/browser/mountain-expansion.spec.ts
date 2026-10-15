import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { assessment } from "../../src/millionaire";
import { createCoin } from "../../src/sigma";
async function frames(page: Page, n = 12, ms = 64) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(ms);
}
async function sceneShot(page: Page, path: string) {
  const style = await page.addStyleTag({
    content:
      "body > :not(#app), #app > :not(canvas) { visibility: hidden !important; }",
  });
  await page.screenshot({ path });
  await style.evaluate((el) => (el as Element).remove());
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
}, testInfo) => {
  const s = state();
  s.compostScraps = 25;
  s.position = { x: 34, z: -448 };
  await start(page, s);
  await page.keyboard.press("e");
  await expect(page.locator("#toast")).toContainText("Terrace Threads");
  await page.getByRole("button", { name: "Thank you", exact: true }).click();
  const unreachable = await page.evaluate(() => {
    const g = (window as any).game;
    const q = [[-24, -612]],
      seen = new Set(["-24,-612"]);
    for (let h = 0; h < q.length; h++) {
      const [x, z] = q[h];
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const a = x + dx,
          b = z + dz,
          key = `${a},${b}`;
        if (
          a < -52 ||
          a > 4 ||
          b < -654 ||
          b > -602 ||
          seen.has(key) ||
          g.rects.some(
            (r: any) =>
              a / 2 + 0.48 > r.x - r.w / 2 &&
              a / 2 - 0.48 < r.x + r.w / 2 &&
              b / 2 + 0.48 > r.z - r.d / 2 &&
              b / 2 - 0.48 < r.z + r.d / 2,
          )
        )
          continue;
        seen.add(key);
        q.push([a, b]);
      }
    }
    return g.targets
      .filter(
        (t: any) =>
          t.id.startsWith("mountain-") ||
          (t.id.startsWith("hat-") && t.z < -300),
      )
      .filter(
        (t: any) =>
          !q.some(([x, z]) => Math.hypot(x / 2 - t.x, z / 2 - t.z) < 1.4),
      )
      .map((t: any) => t.id);
  });
  expect(unreachable).toEqual([]);
  await go(page, "mountain-composter");
  await page
    .getByRole("button", { name: "Trade 25 scraps for soil", exact: true })
    .click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).soilBags,
  ).toBe(1);
  expect(
    (await page.evaluate(() => (window as any).game.state())).compostScraps,
  ).toBe(0);
  await go(page, "mountain-seed-atm");
  await page
    .getByRole("button", { name: "Money seeds · 5 for $200.00", exact: true })
    .click();
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    5,
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.evaluate(() => (window as any).game.teleport(-12, -293));
  await frames(page);
  await page.evaluate(() => (window as any).game.mountainShopOverview());
  await sceneShot(page, testInfo.outputPath("terrace-threads.png"));
  await go(page, "hat-verdant");
  await expect(page.locator("#modal")).toContainText("60%");
  await expect(page.locator("#modal img")).toBeVisible();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.storageFlush());
  expect(
    (await page.evaluate(() => (window as any).game.savedState())).hats,
  ).toContain("verdant");
  await page.evaluate(() => (window as any).game.teleport(-12, -312.1));
  await frames(page);
  await page.evaluate(() => (window as any).game.mountainShopInterior());
  await sceneShot(page, testInfo.outputPath("terrace-threads-interior.png"));
  await go(page, "hat-seedkeeper");
  await expect(page.locator("#modal .hat-portrait")).toBeVisible();
  await page
    .locator("#modal .hat-portrait")
    .screenshot({ path: testInfo.outputPath("seedkeeper-bonnet.png") });
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.storageFlush());
  expect(
    (await page.evaluate(() => (window as any).game.savedState())).hats,
  ).toContain("seedkeeper");
});
test("Guardian mansion offer separates PC replies, supports declining, and previews renamed models", async ({
  page,
}, testInfo) => {
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
  await page.screenshot({ path: testInfo.outputPath("mansion-selection.png") });
});
test("Grindset remains a shopkeeper first and Party Horn emits a longer note parade", async ({
  page,
}, testInfo) => {
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
  await go(page, "gigachad");
  await expect(
    page.getByRole("button", { name: "Buy spanakopita for $3", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Tell me about your trading strategy",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("2%");
  expect(
    (await page.evaluate(() => (window as any).game.savedState())).neighborChats
      .gigachad,
  ).toBeGreaterThan(0);
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
}, testInfo) => {
  const s = state();
  s.position = { x: 46, z: -80 };
  s.bikes = ["city"];
  s.selectedBike = "city";
  await start(page, s);
  const walls = await page.evaluate(() => {
    const g = (window as any).game;
    const blocked = (x: number, z: number) =>
      g.rects.some(
        (r: any) =>
          Math.abs(x - r.x) < r.w / 2 + 0.35 &&
          Math.abs(z - r.z) < r.d / 2 + 0.35,
      );
    // Both turns must meet the hedge, while the west-to-north route stays open.
    return (
      [
        [40, -62.5],
        [42, -62.5],
        [40, -57.5],
        [44, -57.5],
        [48, -57.5],
        [42.9, -75],
        [49.1, -75],
        [49.1, -60],
      ].every(([x, z]) => blocked(x, z)) &&
      [
        [39, -60],
        [41, -60],
        [43, -60],
        [46, -60],
        [46, -64],
        [46, -80],
      ].every(([x, z]) => !blocked(x, z))
    );
  });
  expect(walls).toBe(true);
  await page.evaluate(() => (window as any).game.bridgeOverview());
  await page.screenshot({ path: testInfo.outputPath("bridge-walls.png") });
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

test("mountain musings stay on the grove approach and clear on leaving it", async ({
  page,
}) => {
  const s = state();
  s.awake = true;
  s.position = { x: 34, z: -210 };
  await start(page, s);
  await expect(page.locator("#thought")).toBeVisible();
  for (const [x, z] of [
    [-14, -310],
    [88, -340],
    [60, -312],
    [34, -131],
    [38, -210],
    [34, -350],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        const g = (window as any).game;
        for (const dx of [0, 0.5, -0.5, 1, -1, 1.5, -1.5])
          for (const dz of [0, 0.5, -0.5, 1, -1, 1.5, -1.5]) {
            const px = x + dx,
              pz = z + dz;
            if (Math.abs(px - 34) <= 2 && pz < -144 && pz > -340) continue;
            if (
              g.rects.some(
                (r: any) =>
                  Math.abs(px - r.x) < r.w / 2 + 0.45 &&
                  Math.abs(pz - r.z) < r.d / 2 + 0.45,
              )
            )
              continue;
            g.teleport(px, pz);
            return;
          }
        throw new Error(`No walkable test spot near ${x},${z}`);
      },
      [x, z],
    );
    await frames(page);
    await expect(page.locator("#thought")).toBeHidden();
    // Re-enter before its six-second duration expires to test removal of an active bubble.
    await page.evaluate(() => (window as any).game.teleport(34, -210));
    await page.evaluate(() => {
      const g = (window as any).game;
      g.teleport(34, -211);
      g.desertThoughtStep(13);
    });
    await frames(page);
    await expect(page.locator("#thought")).toBeVisible();
  }
});
