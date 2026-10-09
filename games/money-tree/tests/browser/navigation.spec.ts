import { test, expect, type Page } from "@playwright/test";
async function pos(p: Page) {
  return p.evaluate(() => (window as any).game.state().position);
}
async function axis(p: Page, dimension: "x" | "z", destination: number) {
  const before = await pos(p),
    positive = destination > before[dimension],
    key = dimension === "x" ? (positive ? "d" : "a") : positive ? "s" : "w";
  let slow = false;
  await p.keyboard.down(key);
  try {
    await expect
      .poll(
        async () => {
          const current = await pos(p);
          if (Math.abs(current[dimension] - destination) < 2 && !slow) {
            slow = true;
            await p.keyboard.down("Shift");
          }
          return positive
            ? current[dimension] >= destination - 0.08
            : current[dimension] <= destination + 0.08;
        },
        { timeout: 20000, intervals: [50] },
      )
      .toBe(true);
  } finally {
    await p.keyboard.up(key);
    await p.keyboard.up("Shift");
  }
}
test("whole town traversal through actual doors and fence gate", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await axis(page, "z", 25);
  await axis(page, "x", 3);
  await axis(page, "z", -16);
  await axis(page, "x", 7);
  await axis(page, "z", -31);
  await axis(page, "x", 8);
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toContainText("How’s the garden going");
  await page.getByRole("button", { name: "Look around" }).click();
  await page.screenshot({ path: "../../work/robertsons.png" });
  await axis(page, "x", 7);
  await axis(page, "z", -16);
  await axis(page, "x", 3);
  await axis(page, "z", 25);
  await axis(page, "x", -16);
  await axis(page, "z", 4);
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
