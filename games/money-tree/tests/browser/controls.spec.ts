import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("Shift runs 1.75 times faster than walking on the same clear route", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const state = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    position: { x: 3, z: 25 },
  });
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    state,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => (window as any).game.setYaw(0));
  for (let i = 0; i < 4; i++) await page.clock.fastForward(125);
  const travel = async (running: boolean) => {
    await page.evaluate(() => (window as any).game.teleport(3, 25));
    if (running) await page.keyboard.down("Shift");
    await page.keyboard.down("w");
    for (let i = 0; i < 16; i++) await page.clock.fastForward(125);
    await page.keyboard.up("w");
    if (running) await page.keyboard.up("Shift");
    return page.evaluate(() => {
      const p = (window as any).game.state().position;
      return Math.hypot(p.x - 3, p.z - 25);
    });
  };
  const walk = await travel(false),
    run = await travel(true);
  expect(walk).toBeGreaterThan(2);
  expect(run / walk).toBeCloseTo(1.75, 1);
});
test("click captures mouse; NPC replies and menus release it", async ({
  page,
  browserName,
}) => {
  // Pointer Lock is not implemented by this WebKit test runtime; fallback arrows/drag remain available.
  test.skip(
    browserName === "webkit",
    "WebKit automation has no pointer-lock implementation",
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(async () => (window as any).game.teleport(3, 25));
  await page.locator("#world").click({ position: { x: 700, y: 430 } });
  await expect
    .poll(() => page.evaluate(async () => document.pointerLockElement?.id))
    .toBe("world");
  const before = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  await page.mouse.move(780, 450);
  await expect
    .poll(() =>
      page.evaluate(async () => (window as any).game.camera().position),
    )
    .not.toEqual(before);
  await page.keyboard.press("j");
  await expect(page.locator("#modal")).toBeVisible();
  await expect
    .poll(() => page.evaluate(async () => document.pointerLockElement))
    .toBeNull();
  await page.getByRole("button", { name: "Close notebook" }).click();
  await page.locator("#world").click({ position: { x: 700, y: 430 } });
  await expect
    .poll(() => page.evaluate(async () => document.pointerLockElement?.id))
    .toBe("world");
  await page.evaluate(async () => (window as any).game.teleport(8, -31.7));
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect
    .poll(() => page.evaluate(async () => document.pointerLockElement))
    .toBeNull();
});

test("E activates safe modal defaults and never resets a garden", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.keyboard.press("i");
  await expect(page.locator("#modal")).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await page.evaluate(async () => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeVisible();
  await page.keyboard.press("e");
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(433);
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await page.keyboard.press("j");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Start a new garden" }).click();
  await page.getByRole("button", { name: "Start fresh" }).focus();
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toContainText("Take a little breather");
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(433);
  expect(
    await page.evaluate(async () => (window as any).game.state().awake),
  ).toBe(true);
});

test("piggy bank accepts partial amounts and prevents an overdraft", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(async () => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await page.getByLabel("Transfer amount").fill("2.00");
  await page
    .getByRole("button", { name: "Withdraw amount", exact: true })
    .click();
  let state = await page.evaluate(async () => (window as any).game.state());
  expect(state.cash).toBe(200);
  expect(state.bank).toBe(233);
  await page.getByLabel("Transfer amount").fill(".67");
  await page
    .getByRole("button", { name: "Deposit amount", exact: true })
    .click();
  state = await page.evaluate(async () => (window as any).game.state());
  expect(state.cash).toBe(133);
  expect(state.bank).toBe(300);
  await page.getByLabel("Transfer amount").fill("3.01");
  await page
    .getByRole("button", { name: "Withdraw amount", exact: true })
    .click();
  await expect(page.locator("#bank-error")).toContainText("$3.00");
  expect(
    await page.evaluate(async () => (window as any).game.state().bank),
  ).toBe(300);
});

test("title-screen new game preserves saves until explicit confirmation", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(async () => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await page
    .getByRole("button", { name: "Withdraw amount", exact: true })
    .click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const beforeReload = await page.evaluate(
    async () => await (window as any).game.savedState("money-tree-v1"),
  );
  await page.reload();
  await expect(page.locator("#begin")).toBeEnabled({ timeout: 45000 });
  const saved = await page.evaluate(async () => (window as any).game.state());
  // Unload can persist one last active frame. Title-screen confirmations must
  // preserve that loaded snapshot, including its clock, exactly.
  expect(saved).toEqual({
    ...beforeReload,
    night: { ...beforeReload.night, elapsed: saved.night.elapsed },
    adventure: {
      ...beforeReload.adventure,
      awakeSeconds: saved.adventure.awakeSeconds,
    },
  });
  expect(saved.night.elapsed).toBeGreaterThanOrEqual(
    beforeReload.night.elapsed,
  );
  expect(saved.adventure.awakeSeconds).toBeGreaterThanOrEqual(
    beforeReload.adventure.awakeSeconds,
  );
  const newGame = page.locator("#new-game");
  await expect(newGame).toBeVisible();
  await expect(page.locator("#intro small")).toHaveCount(0);
  await expect(page.locator(".title-logo")).toHaveAttribute(
    "alt",
    "Money Tree",
  );
  const layout = await page.locator(".intro-actions").evaluate((el) => {
    const [a, b] = Array.from(el.children).map((e) =>
      e.getBoundingClientRect(),
    );
    return {
      sameRow: Math.abs(a.top - b.top) < 1,
      sideBySide: b.left > a.right,
    };
  });
  expect(layout).toEqual({ sameRow: true, sideBySide: true });
  await newGame.click();
  await expect(
    page.getByRole("dialog", { name: "Start a new game?" }),
  ).toBeVisible();
  await page.keyboard.press("e");
  await expect(newGame).toBeVisible();
  expect(await page.evaluate(async () => (window as any).game.state())).toEqual(
    saved,
  );
  await newGame.click();
  await page.keyboard.press("Escape");
  await expect(newGame).toBeVisible();
  expect(await page.evaluate(async () => (window as any).game.state())).toEqual(
    saved,
  );
  await newGame.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await expect(page.locator("#intro")).toBeHidden();
  await expect(page.locator("#prompt")).toContainText("Get out of bed");
  const reset = await page.evaluate(async () => (window as any).game.state());
  expect(reset.awake).toBe(false);
  expect(reset.cash).toBe(0);
  expect(reset.bank).toBe(433);
  expect(reset.day).toBe(1);
  expect(reset.plots.every((p: any) => p.stage === "empty")).toBe(true);
  await page.reload();
  await expect(page.locator("#begin")).toBeEnabled({ timeout: 45000 });
  expect(await page.evaluate(async () => (window as any).game.state())).toEqual(
    reset,
  );
});
