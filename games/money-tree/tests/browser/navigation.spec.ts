import { test, expect, type Page } from "@playwright/test";
async function pos(p: Page) {
  return p.evaluate(() => (window as any).game.state().position);
}
async function axis(p: Page, dimension: "x" | "z", destination: number) {
  const origin = await pos(p);
  for (let step = 0; step < 360; step++) {
    const current = await pos(p);
    const goal = {
      ...origin,
      [dimension]:
        current[dimension] +
        Math.max(-1, Math.min(1, destination - current[dimension])),
    };
    const delta = { x: goal.x - current.x, z: goal.z - current.z };
    const distance = Math.hypot(delta.x, delta.z);
    if (
      Math.abs(destination - current[dimension]) < 0.08 &&
      Math.abs(
        current[dimension === "x" ? "z" : "x"] -
          origin[dimension === "x" ? "z" : "x"],
      ) < 0.08
    )
      return;
    const [fx, , fz] = await p.evaluate(
      () => (window as any).game.camera().forward,
    );
    const horizontal = Math.hypot(fx, fz) || 1,
      forward = (delta.x * fx + delta.z * fz) / horizontal,
      right = (-delta.x * fz + delta.z * fx) / horizontal;
    const keys: string[] = [];
    if (Math.abs(forward) > distance * 0.38) keys.push(forward > 0 ? "w" : "s");
    if (Math.abs(right) > distance * 0.38) keys.push(right > 0 ? "d" : "a");
    for (const key of keys) await p.keyboard.down(key);
    await p.clock.fastForward(
      Math.min(100, Math.max(16, Math.ceil((distance / 4) * 1000))),
    );
    for (const key of keys) await p.keyboard.up(key);
  }
  throw new Error(
    `Could not walk to ${dimension}=${destination}; stopped at ${JSON.stringify(await pos(p))}`,
  );
}
test("whole town traversal through actual doors and fence gate", async ({
  page,
}) => {
  test.setTimeout(240000);
  // Pause on the blank page before expensive WebGL loading. A fixed future
  // target cannot race slow CI rendering or a Date.now() round trip.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await axis(page, "x", -16);
  await axis(page, "z", 25);
  await axis(page, "x", 3);
  await axis(page, "z", -16);
  await axis(page, "x", 7);
  await axis(page, "z", -31);
  await axis(page, "x", 8);
  await page.clock.fastForward(16);
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await page.clock.fastForward(16);
  await expect(page.locator(".speech-bubble")).toContainText(
    "How’s the garden going",
  );
  await page.getByRole("button", { name: "Look around" }).click();
  if (!process.env.CI) await page.screenshot({ path: "../../work/robertsons.png" });
  await axis(page, "x", 7);
  await axis(page, "z", -16);
  await axis(page, "x", 3);
  await axis(page, "z", 25);
  await axis(page, "x", -16);
  await axis(page, "z", 4);
  await page.clock.fastForward(16);
  await expect(page.locator("#location")).toContainText("Home");
  if (!process.env.CI) await page.screenshot({ path: "../../work/bedroom-third-person.png" });
});
test("all required interaction targets are reachable in scene collision geometry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "money-tree-v1",
      JSON.stringify({
        version: 1,
        hats: [],
        equippedHat: null,
        day: 1,
        cash: 0,
        bank: 433,
        seeds: 5,
        shovel: false,
        can: false,
        fertilizer: 0,
        awake: false,
        metMom: false,
        metRobertson: false,
        recovered: false,
        foundTVSeeds: true,
        metStacy: true,
        foundMeditationSeeds: true,
        plots: Array.from({ length: 5 }, () => ({
          stage: "empty",
          remaining: 0,
          fertilized: false,
          yield: 0,
        })),
        events: [],
        journal: [],
        rng: 48271,
        position: { x: -16, z: 4 },
      }),
    );
  });
  await page.goto("./?test");
  const unreachable = await page.evaluate(() => {
    const { rects, targets } = (window as any).game;
    const blocked = (x: number, z: number) =>
      rects.some(
        (r: any) =>
          x + 0.48 > r.x - r.w / 2 &&
          x - 0.48 < r.x + r.w / 2 &&
          z + 0.48 > r.z - r.d / 2 &&
          z - 0.48 < r.z + r.d / 2,
      );
    const q = [[-32, 8]],
      seen = new Set(["-32,8"]);
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
          k = `${a},${b}`;
        if (
          a < -76 ||
          a > 76 ||
          b < -168 ||
          b > 76 ||
          seen.has(k) ||
          blocked(a * 0.5, b * 0.5)
        )
          continue;
        seen.add(k);
        q.push([a, b]);
      }
    }
    return targets
      .filter(
        (t: any) =>
          !q.some(([x, z]) => Math.hypot(x * 0.5 - t.x, z * 0.5 - t.z) < 1.4),
      )
      .map((t: any) => t.id);
  });
  expect(unreachable).toEqual([]);
});

test("camera stays outside walls and furniture during doorway and corner sweeps", async ({
  page,
}) => {
  // 144 rendered camera samples include the hat shop; software WebKit needs more time.
  test.setTimeout(240000);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  for (const [x, z] of [
    [-16, 4],
    [-16, 5.2],
    [-16, 6.8],
    [-16, 13.4],
    [-16, 14.8],
    [-9.7, 3],
    [-20.3, 4],
    [-16, 22],
    [7, -22.3],
    [7, -24],
    [8, -31.7],
    [12, -24.8],
    [7.7, 4.9],
    [24, -22.3],
    [24, -24],
    [20.65, -24.6],
    [27.35, -32],
    [24, -32.3],
  ]) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [x, z],
    );
    for (let i = 0; i < 8; i++) {
      const frame = await page.evaluate((i) => {
        (window as any).game.setYaw((i * Math.PI) / 4);
        return (window as any).game.frame();
      }, i);
      await expect
        .poll(() => page.evaluate(() => (window as any).game.frame()), {
          intervals: [50],
        })
        .toBeGreaterThan(frame);
      expect(
        await page.evaluate(() => (window as any).game.camera().penetrations),
        `camera at ${x},${z}, angle ${i}`,
      ).toBe(0);
    }
  }
});

test("approaching a neighbor does not intersect their rendered head", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(10, 21.4));
  await page.waitForTimeout(1800);
  await page.keyboard.down("w");
  await page.waitForTimeout(1200);
  await page.keyboard.up("w");
  await expect(page.locator("#prompt")).toContainText("Bea");
  expect(
    await page.evaluate(() => (window as any).game.npcHeadPenetrations()),
  ).toBe(0);
});

test("scenery clears paths and doors; visible hedges cover world boundaries", async ({
  page,
}) => {
  await page.goto("./?test");
  const result = await page.evaluate(() => {
    const g = (window as any).game;
    const obstructions = g.scenery.filter((o: any) =>
      g.paths
        .concat(g.doorways, [{ x: 24, z: -29, w: 12, d: 12 }])
        .some(
          (r: any) =>
            o.x + o.radius > r.x - r.w / 2 &&
            o.x - o.radius < r.x + r.w / 2 &&
            o.z + o.radius > r.z - r.d / 2 &&
            o.z - o.radius < r.z + r.d / 2,
        ),
    );
    const connected = new Set([0]);
    for (let pass = 0; pass < g.paths.length; pass++)
      g.paths.forEach((a: any, i: number) => {
        if (connected.has(i))
          g.paths.forEach((b: any, j: number) => {
            if (
              Math.abs(a.x - b.x) <= (a.w + b.w) / 2 + 0.001 &&
              Math.abs(a.z - b.z) <= (a.d + b.d) / 2 + 0.001
            )
              connected.add(j);
          });
      });
    return {
      obstructions,
      hedges: g.boundaryHedges(),
      allPathsConnected: connected.size === g.paths.length,
    };
  });
  expect(result.obstructions).toEqual([]);
  expect(result.allPathsConnected).toBe(true);
  expect(result.hedges).toHaveLength(5);
  for (const bounds of result.hedges)
    expect(bounds.max[1] - bounds.min[1]).toBeGreaterThan(2);
  expect(result.hedges[0].min[0]).toBeLessThan(-38);
  expect(result.hedges[1].max[0]).toBeGreaterThan(38);
  expect(result.hedges[2].min[2]).toBeLessThan(-39);
  expect(result.hedges[4].max[2]).toBeGreaterThan(38);
});

test("camera eases through the front doorway without jumps or wall penetration", async ({
  page,
}) => {
  // Pause on the blank page before expensive WebGL loading. A fixed future
  // target cannot race slow CI rendering or a Date.now() round trip.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-16, 12.5));
  for (let i = 0; i < 60; i++) await page.clock.fastForward(16);
  let previous = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  let maxShift = 0;
  try {
    for (let i = 0; i < 100; i++) {
      const current = await pos(page);
      if (current.z > 14.5) break;
      const [fx, , fz] = await page.evaluate(
        () => (window as any).game.camera().forward,
      );
      const dx = -16 - current.x,
        dz = 16 - current.z,
        distance = Math.hypot(dx, dz);
      const f = dx * fx + dz * fz,
        r = -dx * fz + dz * fx;
      const pressed: string[] = [];
      if (Math.abs(f) > distance * 0.38) pressed.push(f > 0 ? "w" : "s");
      if (Math.abs(r) > distance * 0.38) pressed.push(r > 0 ? "d" : "a");
      for (const key of pressed) await page.keyboard.down(key);
      await page.clock.fastForward(16);
      const camera = await page.evaluate(() => (window as any).game.camera());
      expect(camera.penetrations).toBe(0);
      maxShift = Math.max(
        maxShift,
        Math.hypot(
          ...camera.position.map((n: number, j: number) => n - previous[j]),
        ),
      );
      previous = camera.position;
      for (const key of pressed) await page.keyboard.up(key);
    }
  } finally {
    await page.keyboard.up("s");
    await page.keyboard.up("w");
  }
  expect(maxShift).toBeLessThan(0.75);
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeGreaterThan(14);
});

test("home has a pitched roof that cuts away indoors and returns outside", async ({
  page,
}) => {
  await page.goto("./?test");
  const roof = await page.evaluate(() => (window as any).game.homeRoof());
  expect(roof.bounds.max[0] - roof.bounds.min[0]).toBeGreaterThan(12);
  expect(roof.bounds.max[2] - roof.bounds.min[2]).toBeGreaterThan(16);
  expect(roof.bounds.max[0] - roof.bounds.min[0]).toBeLessThan(15);
  expect(roof.bounds.max[2] - roof.bounds.min[2]).toBeLessThan(19);
  expect(roof.bounds.max[1] - roof.bounds.min[1]).toBeGreaterThan(2);
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).game.homeRoof().opacity))
    .toBeLessThan(0.05);
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-16, 22));
  await expect
    .poll(() => page.evaluate(() => (window as any).game.homeRoof().opacity))
    .toBeGreaterThan(0.95);
});
