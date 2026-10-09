import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("notebook opens latest entry, turns pages with buttons and arrows, and reopens latest", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.day = 3;
  s.journal.push(
    "Day 1\n\nI wondered about the seeds.",
    "Day 2\n\nIt really grew money.",
  );
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page")).toContainText("Day 2");
  await expect(page.locator(".notebook-page")).not.toContainText("Day 1");
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await expect(page.locator(".page-number")).toHaveText("Page 3 of 3");
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.locator(".notebook-page")).toContainText("Day 1");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".notebook-page")).toContainText("Need $ for mom");
  await expect(
    page.getByRole("button", { name: "Previous page" }),
  ).toBeDisabled();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".notebook-page")).toContainText("Day 1");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator(".notebook-page")).toContainText("Day 2");
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page")).toContainText("Day 2");
  await page.screenshot({
    path: "../../outputs/money-tree-notebook-pages.png",
  });
});
test("saved zero-income entry shows an honest reflection", async ({ page }) => {
  const s = fresh();
  s.awake = true;
  s.journal.push(
    "Day 1 — I planted five seeds. I made $0.00 today. It’s only a drop in the bucket compared to what Mom’s surgery will cost. Still, it’s a beginning. I have to keep going.",
  );
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page")).toContainText(
    "I planted five seeds.",
  );
  await expect(page.locator(".notebook-page")).toContainText(
    "haven’t earned anything",
  );
  await expect(page.locator(".notebook-page")).not.toContainText(
    "drop in the bucket",
  );
  await expect(page.locator(".notebook-page")).not.toContainText("beginning");
});
