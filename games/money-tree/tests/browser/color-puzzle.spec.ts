import { test, expect } from "@playwright/test";
import { fresh, momStatus } from "../../src/game";
import { colorPuzzle, puzzleColors } from "../../src/color-puzzle";
test("Mom invites a playable color puzzle with saved progress and paused drink time", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const day = Array.from({ length: 100 }, (_, i) => i + 1).find(
    (day) => momStatus(day).activity === "puzzles",
  )!;
  const s = Object.assign(fresh(), {
    day,
    awake: true,
    drink: { id: "sprint", remaining: 150 },
    position: { x: -16, z: 22 },
  });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.evaluate(() => (window as any).game.teleport(-16, 12));
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  for (let i = 0; i < 30; i++) await page.clock.fastForward(32);
  await page.keyboard.press("e");
  await expect(page.locator("#color-puzzle-grid button")).toHaveCount(81);
  const board = colorPuzzle(day),
    index = board.clues.findIndex((v) => !v);
  await page.locator(".color-puzzle-cell").nth(index).click();
  await page
    .getByRole("button", {
      name: `Place ${puzzleColors[board.solution[index] - 1].name}`,
      exact: true,
    })
    .click();
  expect(
    await page.evaluate(
      (index) => (window as any).game.state().colorPuzzle.cells[index],
      index,
    ),
  ).toBe(board.solution[index]);
  const remaining = await page.evaluate(
    () => (window as any).game.state().drink.remaining,
  );
  await page.clock.fastForward(60000);
  expect(
    await page.evaluate(() => (window as any).game.state().drink.remaining),
  ).toBe(remaining);
  await expect(page.locator("#drink-hud img")).toHaveAttribute(
    "src",
    "./drink.svg",
  );
  await page.screenshot({ path: "../../outputs/money-tree-color-puzzle.png" });
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(
      (index) => (window as any).game.state().colorPuzzle.cells[index],
      index,
    ),
  ).toBe(board.solution[index]);
});
