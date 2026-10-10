import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
async function start(page: any, position = { x: -16, z: 4 }) {
  const s = fresh();
  Object.assign(s, { awake: true, metMom: true, boughtSeeds: true, position });
  await page.addInitScript((s: any) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
test("one handwritten notebook page, bundled fonts and legible thought margins", async ({
  page,
}) => {
  await start(page);
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-left")).not.toContainText("Need $");
  await expect(page.locator(".notebook-page")).toContainText("Need $");
  expect(
    await page
      .locator(".notebook-page p")
      .evaluate((e) => getComputedStyle(e).fontFamily),
  ).toContain("Gaegu");
  const bounds = await page.evaluate(() =>
    (window as any).game.notebookModel(),
  );
  expect(bounds.left).toBeGreaterThan(bounds.gutter);
  expect(await page.evaluate(() => document.fonts.check("24px Gaegu"))).toBe(
    true,
  );
  expect(
    await page.evaluate(() => document.fonts.check("italic 24px Nunito")),
  ).toBe(true);
  await page.screenshot({
    path: "../../outputs/money-tree-handwritten-notebook.png",
  });
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-16.7, 10));
  await expect(page.locator("#prompt")).toContainText("Mom");
  await page.keyboard.press("e");
  await expect(page.locator("#thought")).toBeVisible();
  expect(
    await page
      .locator("#thought")
      .evaluate((e) => parseFloat(getComputedStyle(e).paddingLeft)),
  ).toBeGreaterThanOrEqual(40);
  await expect(page.locator("#thought")).toHaveCSS("font-style", "italic");
  await expect(page.locator(".speech-bubble .default-action kbd")).toHaveText(
    "E",
  );
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  await page.screenshot({ path: "../../outputs/money-tree-soft-thought.png" });
});
test("E chooses the main neighbor response, third E starts a fresh conversation", async ({
  page,
}) => {
  await start(page, { x: 12, z: 7.5 });
  await expect(page.locator("#prompt")).toContainText("Jun");
  await page.keyboard.press("e");
  const text = await page.locator(".speech-bubble").innerText();
  await expect(page.locator(".speech-bubble .default-action")).toContainText(
    "See you around",
  );
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).not.toHaveText(text);
});
test("Robertson directs browsing while beds and soil have separate physical displays", async ({
  page,
}) => {
  await start(page, { x: 8, z: -31.7 });
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Garden bed · $30", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Soil for one bed · $10", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  for (const [x, z, title] of [
    [3, -32.45, "garden bed"],
    [12, -33.4, "soil"],
  ] as const) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [x, z],
    );
    await expect(page.locator("#prompt")).toContainText(title);
    await page.keyboard.press("e");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Keep looking" }).click();
  }
});
test("bedroom and enlarged store corners remain escapable, cameras settle without wall jitter", async ({
  page,
}) => {
  test.setTimeout(240000);
  await start(page);
  for (const [x, z, key] of [
    [-20.35, 4.7, "d"],
    [-9.65, 4.7, "a"],
    [0.65, -24, "d"],
    [15.35, -24, "a"],
    [0.65, -38.35, "d"],
    [15.35, -38.35, "a"],
  ] as const) {
    await page.evaluate(
      ([x, z]) => {
        (window as any).game.teleport(x, z);
        (window as any).game.setYaw(0);
      },
      [x, z],
    );
    await page.waitForTimeout(1400);
    const forward = await page.evaluate(
      () => (window as any).game.camera().forward,
    );
    const controls = [
      { key: "w", x: forward[0] },
      { key: "s", x: -forward[0] },
      { key: "d", x: -forward[2] },
      { key: "a", x: forward[2] },
    ];
    const direction = key === "d" ? 1 : -1;
    const control = controls.sort((a, b) => direction * (b.x - a.x))[0].key;
    await page.keyboard.down(control);
    await expect
      .poll(() =>
        page.evaluate(
          (x) => Math.abs((window as any).game.state().position.x - x),
          x,
        ),
      )
      .toBeGreaterThan(0.7);
    await page.keyboard.up(control);
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).game.camera().position[1]),
      )
      .toBeGreaterThan(4.4);
    expect(
      await page.evaluate(() => (window as any).game.camera().penetrations),
    ).toBe(0);
    await expect
      .poll(() => page.evaluate(() => (window as any).game.playerVisibility()))
      .toEqual([true, true]);
  }
  await page.evaluate(() => (window as any).game.teleport(-16, 22));
  await page.waitForTimeout(2400);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(700);
  const first = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  await page.waitForTimeout(300);
  const last = await page.evaluate(
    () => (window as any).game.camera().position,
  );
  expect(
    Math.hypot(...last.map((v: number, i: number) => v - first[i])),
  ).toBeLessThan(0.15);
});
