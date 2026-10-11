import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
test("the full notebook stays inside the viewport and pages never scroll under its buttons", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.journal = [
    "Day 1\n\n" +
      Array.from(
        { length: 20 },
        (_, i) =>
          `Paragraph ${i + 1}. I worked in the garden and came home to spend time with Mom.`,
      ).join("\n\n"),
  ];
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 992, height: 767 },
    { width: 390, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.keyboard.press("j");
    const book = page.locator(".notebook-paper");
    const pages = page.locator(".notebook-spread");
    const buttons = book.locator(".choices");
    await expect(book).toBeVisible();
    const bounds = await book.boundingBox();
    const pageBounds = await pages.boundingBox();
    const controls = await buttons.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
    expect(pageBounds!.y + pageBounds!.height).toBeLessThan(controls!.y);
    await pages.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(
      page.getByRole("button", { name: "Close notebook", exact: true }),
    ).toBeInViewport();
    const after = await buttons.boundingBox();
    expect(after!.y).toBeCloseTo(controls!.y, 1);
    expect(
      await pages.evaluate(
        (el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Close notebook", exact: true })
      .click();
  }
});
