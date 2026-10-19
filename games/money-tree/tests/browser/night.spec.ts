import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
async function open(page: any, position = { x: -16, z: 4 }) {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    cash: 2000,
    position,
    night: { elapsed: 300, hp: 10 },
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s: any) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await expect(page.getByRole("button", { name: "Wake up" })).toBeEnabled();
  await page.getByRole("button", { name: "Wake up" }).dispatchEvent("click");
  await page.clock.fastForward(100);
}
test("night shelters stay warm and safe and death returns to bed", async ({
  page,
}) => {
  await open(page);
  let n = await page.evaluate(() => (window as any).game.night());
  expect(n.dark).toBe(true);
  expect(n.safe).toBe(true);
  expect(n.warmLight).toBeGreaterThan(0);
  expect(n.ambient).toBeLessThan(0.4);
  await page.keyboard.press("e");
  await expect(page.locator("#night-help")).toBeVisible();
  await page.evaluate(() => (window as any).game.nightHurt(0));
  await page.clock.fastForward(100);
  const s = await page.evaluate(() => (window as any).game.state());
  expect(s.awake).toBe(false);
  expect(s.night).toEqual({ elapsed: 0, hp: 10 });
  expect(s.day).toBe(2);
});
test("ghost wallets and cash cows render outside; bill attack costs pocket cash", async ({
  page,
}, testInfo) => {
  await open(page, { x: 0, z: 25 });
  await page.evaluate(() => {
    const g = (window as any).game;
    g.nightSpawn("wallet", -2, 21);
    g.nightSpawn("cow", 3, 20);
  });
  await page.clock.fastForward(100);
  await expect(page.locator("#night-health")).toHaveText("10 / 10 HP");
  const before = await page.evaluate(() => (window as any).game.state().cash);
  await page.keyboard.press("v");
  await page.clock.fastForward(100);
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    before - 100,
  );
  await page.screenshot({ path: testInfo.outputPath("ghosts.png") });
  const memory = await page.evaluate(() =>
    (window as any).game.nightLifecycleCheck(),
  );
  for (const sample of memory.slice(1)) expect(sample).toEqual(memory[0]);

  await page.evaluate(() => (window as any).game.nightClock(120));
  await page.clock.fastForward(100);
  expect((await page.evaluate(() => (window as any).game.night())).dark).toBe(
    false,
  );
});

test("indoor night conversations, furniture editing and sleeping remain available", async ({
  page,
}) => {
  await open(page, { x: -17.5, z: 2.3 });
  await page.keyboard.press("F5");
  await expect(page.locator("#furniture-editor")).toBeVisible();
  await page.getByRole("button", { name: "Close furniture editor" }).click();
  await page.evaluate(() => (window as any).game.teleport(-17.5, 1));
  await page.clock.fastForward(100);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("button", { name: "Sleep until tomorrow", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sleep until tomorrow", exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).game.night().dark)).toBe(
    false,
  );
});

test("Bea talks about night monsters and tea uses seated legs and a moving porcelain cup", async ({
  page,
}, testInfo) => {
  await open(page, { x: 10, z: 16.4 });
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "Flapping Wallets",
  );
  await page.getByRole("button", { name: "Stay safe" }).click();
  await page.evaluate(() => (window as any).game.teleport(12, 16.9));
  await page.clock.fastForward(100);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Sit for tea" }).click();
  const before = await page.evaluate(() =>
    (window as any).game.homeBugReview(),
  );
  for (let i = 0; i < 10; i++) await page.clock.fastForward(250);
  const after = await page.evaluate(() => (window as any).game.homeBugReview());
  expect(after.teaLegs).toBe(true);
  expect(after.playerTeaLegs).toBe(true);
  expect(after.cups[1]).not.toEqual(before.cups[1]);
  await page.screenshot({ path: "/private/tmp/mt-bea-tea-review.png" });
  expect(
    (await page.evaluate(() => (window as any).game.family())).actors.find(
      (n: any) => n.id === "npc1",
    ).position[1],
  ).toBe(0.28);
  await page.keyboard.press("e");
  expect(
    await page.evaluate(
      () => (window as any).game.homeBugReview().playerTeaLegs,
    ),
  ).toBe(false);
});

test("Mabel roof cuts away without trapping the camera inside its bounds", async ({
  page,
}) => {
  await open(page, { x: -34.6, z: -25 });
  await page.evaluate(() => (window as any).game.nightClock(120));
  const distances: number[] = [];
  for (let i = 0; i < 8; i++) {
    await page.clock.fastForward(100);
    const snapshot = await page.evaluate(() => ({
      camera: (window as any).game.camera(),
      review: (window as any).game.homeBugReview(),
    }));
    expect(snapshot.review.mabelRoof.cutaway).toBe(true);
    expect(snapshot.review.mabelWindows).toBe(2);
    expect(snapshot.camera.penetrations).toBe(0);
    distances.push(
      Math.hypot(
        ...snapshot.camera.position.map(
          (v: number, j: number) => v - [-34.6, 1.4, -25][j],
        ),
      ),
    );
  }
  expect(
    Math.max(...distances.slice(-3)) - Math.min(...distances.slice(-3)),
  ).toBeLessThan(0.5);
});
