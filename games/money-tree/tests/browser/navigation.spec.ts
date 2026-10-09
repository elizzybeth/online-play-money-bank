import { test, expect, type Page } from "@playwright/test";
async function pos(p: Page) {
  return p.evaluate(() => (window as any).game.state().position);
}
async function axis(p: Page, dimension: "x" | "z", destination: number) {
  // Keep real keyboard input, but pause the browser clock between samples.
  // Slow software renderers must not keep walking while Playwright reads state.
  for (let step = 0; step < 120; step++) {
    const current = await pos(p);
    const delta = destination - current[dimension];
    if (Math.abs(delta) < 0.08) return;
    const key =
      dimension === "x" ? (delta > 0 ? "d" : "a") : delta > 0 ? "s" : "w";
    await p.keyboard.down(key);
    try {
      await p.clock.fastForward(
        Math.min(250, Math.ceil((Math.abs(delta) / 4) * 1000)),
      );
    } finally {
      await p.keyboard.up(key);
    }
  }
  throw new Error(
    `Could not walk to ${dimension}=${destination}; stopped at ${JSON.stringify(await pos(p))}`,
  );
}
test("whole town traversal through actual doors and fence gate", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./?test");
  await page.clock.pauseAt(
    new Date(await page.evaluate(() => Date.now() + 1000)),
  );
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
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
  await page.screenshot({ path: "../../work/robertsons.png" });
  await axis(page, "x", 7);
  await axis(page, "z", -16);
  await axis(page, "x", 3);
  await axis(page, "z", 25);
  await axis(page, "x", -16);
  await axis(page, "z", 4);
  await page.clock.fastForward(16);
  await expect(page.locator("#location")).toContainText("Home");
  await page.screenshot({ path: "../../work/bedroom-third-person.png" });
});
test("all required interaction targets are reachable in scene collision geometry", async ({
  page,
}) => {
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
          b < -78 ||
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
        .concat(g.doorways)
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
              Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
              Math.abs(a.z - b.z) < (a.d + b.d) / 2
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
  expect(result.hedges).toHaveLength(4);
  for (const bounds of result.hedges)
    expect(bounds.max[1] - bounds.min[1]).toBeGreaterThan(2);
  expect(result.hedges[0].min[0]).toBeLessThan(-38);
  expect(result.hedges[1].max[0]).toBeGreaterThan(38);
  expect(result.hedges[2].min[2]).toBeLessThan(-39);
  expect(result.hedges[3].max[2]).toBeGreaterThan(38);
});

test("camera eases through the front doorway without jumps or wall penetration", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./?test");
  await page.clock.pauseAt(
    new Date(await page.evaluate(() => Date.now() + 1000)),
  );
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-16, 12.5));
  for (let i = 0; i < 60; i++) await page.clock.fastForward(16);
  let previous = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  let maxShift = 0;
  await page.keyboard.down("s");
  try {
    for (let i = 0; i < 55; i++) {
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
    }
  } finally {
    await page.keyboard.up("s");
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
