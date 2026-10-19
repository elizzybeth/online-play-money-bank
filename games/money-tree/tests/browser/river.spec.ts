import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { createCoin } from "../../src/sigma";
import { bridgeApproachHalfWidth, riverBridges } from "../../src/river-land";
test("river bridges are walkable, banks are lush and drought can change them without rebuilding", async ({
  page,
}, info) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  s.communityPlanted = true;
  createCoin(s, "River Coin");
  s.awake = true;
  s.metMom = true;
  s.position = { x: 3, z: 1 };
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 8; i++) await page.clock.fastForward(64);
  const data = await page.evaluate(() => (window as any).game.river());
  const chads = await page.evaluate(() => (window as any).game.diamondHands());
  expect(chads.length).toBeGreaterThan(8);
  expect(chads.every((c: any) => c.hands === 2 && c.diamonds === 2)).toBe(true);
  await page.evaluate(() => (window as any).game.diamondHandsReview());
  await page.screenshot({ path: info.outputPath("diamond-hands.png") });

  expect(
    data.vegetation
      .filter((v: any) => v.name === "bank-reeds")
      .reduce((sum: number, v: any) => sum + v.count, 0),
  ).toBeGreaterThan(100);
  for (const bridge of riverBridges) {
    const blocked = await page.evaluate((b) => {
      const g = (window as any).game,
        points = [];
      const length = b.axis === "z" ? b.d : b.w;
      for (let n = -length / 2 - 4.2; n < length / 2 + 4.2; n += 0.25) {
        const x = b.x + (b.axis === "x" ? n : 0),
          z = b.z + (b.axis === "z" ? n : 0);
        if (
          g.rects.some(
            (r: any) =>
              x + 0.48 > r.x - r.w / 2 &&
              x - 0.48 < r.x + r.w / 2 &&
              z + 0.48 > r.z - r.d / 2 &&
              z - 0.48 < r.z + r.d / 2,
          )
        )
          points.push({ x, z });
      }
      return points;
    }, bridge);
    expect(blocked, bridge.id).toEqual([]);
  }
  const approaches = riverBridges.flatMap((b) =>
    [-1, 1].map((side) => ({
      ...b,
      side,
      clearHalf: Math.min(3, bridgeApproachHalfWidth(b, side) - 0.7),
    })),
  );
  const approachObstacles = await page.evaluate((bridges) => {
    const rects = (window as any).game.rects,
      blocked = [];
    for (const b of bridges)
      for (const dx of [-b.clearHalf, 0, b.clearHalf]) {
        const x = b.x + dx,
          z = b.z + b.side * (b.d / 2 + 2);
        if (
          rects.some(
            (r: any) =>
              Math.abs(x - r.x) < r.w / 2 + 0.48 &&
              Math.abs(z - r.z) < r.d / 2 + 0.48,
          )
        )
          blocked.push({ id: b.id, x, z });
      }
    return blocked;
  }, approaches);
  expect(approachObstacles).toEqual([]);
  expect(data.bridges.map((b: any) => b.id)).not.toContain("east-road");
  const constraints = await page.evaluate(() => {
    const g = (window as any).game;
    const blocked = (x: number, z: number) =>
      g.rects.some(
        (r: any) =>
          Math.abs(x - r.x) < r.w / 2 + 0.48 &&
          Math.abs(z - r.z) < r.d / 2 + 0.48,
      );
    return {
      waterOpen: !blocked(43, -16),
      straight: Array.from({ length: 45 }, (_, i) => -90 - i * 0.5).every(
        (z) => !blocked(46, z),
      ),
      fence: Array.from({ length: 54 }, (_, i) => -84 + i * 0.49).every((z) =>
        blocked(49.1, z),
      ),
    };
  });
  expect(constraints).toEqual({
    waterOpen: true,
    straight: true,
    fence: true,
  });
  for (const view of ["grove", "bend", "rack"] as const) {
    await page.evaluate(
      (v) => (window as any).game.riverCrossingReview(v),
      view,
    );
    await page.screenshot({ path: info.outputPath(`${view}-review.png`) });
  }
  for (const view of ["village", "grove", "east"] as const) {
    await page.evaluate((v) => (window as any).game.riverOverview(v), view);
    await page.screenshot({ path: info.outputPath(`river-${view}.png`) });
  }
  await page.evaluate(() => (window as any).game.riverDrought(true));
  await page.evaluate(() => (window as any).game.riverDrought(false));
  expect(await page.evaluate(() => (window as any).game.river())).toEqual(data);
  expect(errors).toEqual([]);
});
test("Robertsons fertilizer has an actual model preview and purchase adds five doses", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.metMom = true;
  s.cash = 1000;
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => {
    const g = (window as any).game,
      t = g.targets.find((t: any) => t.id === "fertilizer");
    g.teleport(t.x, t.z);
  });
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Fertilizer · five doses", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Fertilizer box · five doses" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buy · $5.00", exact: true }).click();
  const result = await page.evaluate(() => (window as any).game.state());
  expect(result.fertilizer).toBe(5);
  expect(result.cash).toBe(500);
});

test("walk and bike through the river slowly among ferns, heliconias and passionflowers", async ({
  page,
}, info) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    position: { x: -25, z: 12 },
    bikes: ["cruiser"],
    selectedBike: "cruiser",
  });
  applyDebugAction(s, "level3");
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await expect(page.getByRole("button", { name: "Wake up" })).toBeEnabled();
  await page.getByRole("button", { name: "Wake up" }).dispatchEvent("click");
  await page.clock.fastForward(125);
  const travel = async () => {
    const before = await page.evaluate(
      () => (window as any).game.state().position.z,
    );
    await page.keyboard.down("w");
    for (let i = 0; i < 4; i++) await page.clock.fastForward(125);
    await page.keyboard.up("w");
    return Math.abs(
      before -
        (await page.evaluate(() => (window as any).game.state().position.z)),
    );
  };
  const dry = await travel();
  await page.evaluate(() => (window as any).game.teleport(-25, -6));
  await page.clock.fastForward(125);
  const wet = await travel();
  expect(wet).toBeGreaterThan(0.2);
  expect(wet).toBeLessThan(dry * 0.5);
  expect(
    await page.evaluate(() => (window as any).game.river().groundHeight),
  ).toBeLessThan(-0.8);
  await page.evaluate(() => (window as any).game.teleport(-25, -6));
  await page.keyboard.press("h");
  for (let i = 0; i < 5; i++) await page.clock.fastForward(250);
  expect(
    await page.evaluate(() => (window as any).game.bicycle().firstPerson),
  ).toBe(true);
  await page.keyboard.down("w");
  for (let i = 0; i < 3; i++) await page.clock.fastForward(125);
  await page.keyboard.up("w");
  const biked = await page.evaluate(
    () => (window as any).game.state().position.z,
  );
  expect(biked).toBeLessThan(-6.2);
  expect(biked).toBeGreaterThan(-8.3);
  await page.keyboard.press("h");
  const data = await page.evaluate(() => (window as any).game.river());
  expect(data.colliders).toEqual([]);
  expect(data.plants.fern).toBeGreaterThan(100);
  for (const kind of [
    "fern",
    "heliconia-red",
    "heliconia-pendant",
    "heliconia-gold",
    "heliconia-orange",
    "passionflower",
  ]) {
    expect(data.plants[kind]).toBeGreaterThan(0);
    await page.evaluate(
      (kind) => (window as any).game.riverPlantReview(kind),
      kind,
    );
    await page.screenshot({ path: info.outputPath(`${kind}.png`) });
  }
});
