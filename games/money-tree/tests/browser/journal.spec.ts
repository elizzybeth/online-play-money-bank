import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { journalContext, temporaryEntry } from "../../src/journal";
const natural =
  "I didn't earn any money today. I kept thinking about Mom while I was outside. I wanted to ask her if the operation would hurt, but I got scared and didn't ask. I don't know why it's easier to dig in the dirt than to say something like that. Maybe tomorrow I can sit with her for a bit. I miss when she could come everywhere with me.";
test("sleep calls the writer, saves a fresh entry, and numbers the opening Day 1", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.position = { x: -16, z: 2 };
  await page.addInitScript(
    ({ s, natural }) => {
      if (!localStorage.getItem("money-tree-v1"))
        localStorage.setItem("money-tree-v1", JSON.stringify(s));
      (window as any).journalCalls = [];
      (window as any).journalTestComplete = async (messages: any[]) => {
        (window as any).journalCalls.push(messages);
        return JSON.stringify({ entry: natural });
      };
    },
    { s, natural },
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#prompt")).toContainText("Sleep until tomorrow");
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "Sleep until tomorrow" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).game.state().journalDrafts.length),
    )
    .toBe(0);
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page h3")).toHaveText("Day 2");
  await expect(page.locator(".notebook-page")).toContainText(
    "I miss when she could come everywhere with me.",
  );
  expect(await page.evaluate(() => (window as any).journalCalls.length)).toBe(
    1,
  );
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.locator(".notebook-page h3")).toHaveText("Day 1");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page h3")).toHaveText("Day 2");
});
test("failed writer leaves an entry and pending facts that can resume after reload", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  const c = journalContext(s);
  s.day = 2;
  s.journal.push(temporaryEntry(c));
  s.journalDrafts = [c];
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
    (window as any).journalTestComplete = async () => {
      throw Error("Writer offline; your entry is saved.");
    };
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator("#journal-status")).toContainText("Writer offline");
  await expect(
    page.getByRole("button", { name: "Try writing again" }),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator("#journal-status")).toContainText("Writer offline");
  await page.evaluate(
    (natural) =>
      ((window as any).journalTestComplete = async () =>
        JSON.stringify({ entry: natural })),
    natural,
  );
  await page.getByRole("button", { name: "Try writing again" }).click();
  await expect(page.locator(".notebook-page")).toContainText("I miss when she");
  await expect(page.locator("#journal-status")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).game.state().bank)).toBe(
    433,
  );
});
test("a late model response cannot overwrite a new game", async ({ page }) => {
  const s = fresh();
  s.awake = true;
  const c = journalContext(s);
  s.day = 2;
  s.journal.push(temporaryEntry(c));
  s.journalDrafts = [c];
  await page.addInitScript((s) => {
    localStorage.setItem("money-tree-v1", JSON.stringify(s));
    (window as any).journalTestComplete = () =>
      new Promise((resolve) => ((window as any).finishJournal = resolve));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect
    .poll(() => page.evaluate(() => typeof (window as any).finishJournal))
    .toBe("function");
  await page.evaluate(() => (window as any).game.reset());
  await page.evaluate(
    (natural) =>
      (window as any).finishJournal(JSON.stringify({ entry: natural })),
    natural,
  );
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => (window as any).game.state().journal.length),
  ).toBe(1);
  expect(await page.evaluate(() => (window as any).game.state().bank)).toBe(
    433,
  );
});
