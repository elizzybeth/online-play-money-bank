import { test, expect } from "@playwright/test";
test("Shift runs faster than walking without crossing colliders", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("./?test");
  await page.clock.pauseAt(
    new Date(await page.evaluate(() => Date.now() + 1000)),
  );
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(3, 25));
  await page.keyboard.down("w");
  await page.clock.fastForward(1000);
  await page.keyboard.up("w");
  const walk =
    25 - (await page.evaluate(() => (window as any).game.state().position.z));
  await page.evaluate(() => (window as any).game.teleport(3, 25));
  await page.keyboard.down("Shift");
  await page.keyboard.down("w");
  await page.clock.fastForward(1000);
  await page.keyboard.up("w");
  await page.keyboard.up("Shift");
  const run =
    25 - (await page.evaluate(() => (window as any).game.state().position.z));
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
  await page.evaluate(() => (window as any).game.teleport(3, 25));
  await page.locator("#world").click({ position: { x: 700, y: 430 } });
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement?.id))
    .toBe("world");
  const before = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  await page.mouse.move(780, 450);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.camera().position))
    .not.toEqual(before);
  await page.keyboard.press("j");
  await expect(page.locator("#modal")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement))
    .toBeNull();
  await page.getByRole("button", { name: "Close notebook" }).click();
  await page.locator("#world").click({ position: { x: 700, y: 430 } });
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement?.id))
    .toBe("world");
  await page.evaluate(() => (window as any).game.teleport(8, -31.7));
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement))
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
  await page.evaluate(() => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeVisible();
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    433,
  );
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
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    433,
  );
  expect(await page.evaluate(() => (window as any).game.state().awake)).toBe(
    true,
  );
});

test("piggy bank accepts partial amounts and prevents an overdraft", async ({
  page,
}) => {
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-10.8, 1.4));
  await expect(page.locator("#prompt")).toContainText("piggy bank");
  await page.keyboard.press("e");
  await page.getByLabel("Transfer amount").fill("2.00");
  await page
    .getByRole("button", { name: "Withdraw amount", exact: true })
    .click();
  let state = await page.evaluate(() => (window as any).game.state());
  expect(state.cash).toBe(200);
  expect(state.bank).toBe(233);
  await page.getByLabel("Transfer amount").fill(".67");
  await page
    .getByRole("button", { name: "Deposit amount", exact: true })
    .click();
  state = await page.evaluate(() => (window as any).game.state());
  expect(state.cash).toBe(133);
  expect(state.bank).toBe(300);
  await page.getByLabel("Transfer amount").fill("3.01");
  await page
    .getByRole("button", { name: "Withdraw amount", exact: true })
    .click();
  await expect(page.locator("#bank-error")).toContainText("$3.00");
  expect(await page.evaluate(() => (window as any).game.state().bank)).toBe(
    300,
  );
});
