import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("pause debug unlock survives refresh and preserves a pre-debug backup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Debug menu", exact: true }).click();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("button", { name: "Unlock Level 3" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "applied",
  );
  const saved = await page.evaluate(() => ({
    current: JSON.parse(localStorage.getItem("money-tree-v1")!),
    backup: JSON.parse(localStorage.getItem("money-tree-v1-debug-backup")!),
  }));
  expect(saved.current.millionaire.unlocked).toBe(true);
  expect(saved.backup.millionaire?.unlocked).toBeFalsy();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(
      () => (window as any).game.state().millionaire.unlocked,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("rejected Chrome save is preserved through begin and refresh instead of overwritten", async ({
  page,
}) => {
  const bad = JSON.stringify({
    ...fresh(),
    day: 17,
    cash: 45678,
    adventure: "invalid",
  });
  await page.addInitScript((raw) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", raw);
  }, bad);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(
    page.getByRole("dialog", { name: "Your saved game needs recovery" }),
  ).toBeVisible();
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem("money-tree-v1"))).toBe(
    bad,
  );
  expect(
    await page.evaluate(() => localStorage.getItem("money-tree-v1-rejected")),
  ).toBe(bad);
});
test("valid backup restores progress after a rejected primary save", async ({
  page,
}) => {
  const valid = { ...fresh(), day: 17, cash: 45678 };
  await page.addInitScript((s) => {
    localStorage.setItem("money-tree-v1", "corrupt");
    localStorage.setItem(
      "money-tree-v1-backups",
      JSON.stringify([JSON.stringify(s)]),
    );
  }, valid);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(await page.evaluate(() => (window as any).game.state().day)).toBe(17);
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    45678,
  );
  expect(
    await page.evaluate(() => localStorage.getItem("money-tree-v1-rejected")),
  ).toBe("corrupt");
});
