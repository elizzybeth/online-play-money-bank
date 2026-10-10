import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { journalContext } from "../../src/journal";
test("sleep writes a permanent branching page without downloading a model", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.position = { x: -16, z: 2 };
  s.boughtSeeds = true;
  s.events = ["Bought five mysterious seeds."];
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).not.toContainText("GB");
  await page.getByRole("button", { name: "Sleep until tomorrow" }).click();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page h3")).toHaveText("Day 2");
  await expect(page.locator(".notebook-page")).toContainText("Auntie");
  const entry = await page.locator(".notebook-page").innerText();
  await expect(page.locator("#journal-status")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  expect(await page.locator(".notebook-page").innerText()).toBe(entry);
  expect(
    requests.filter((u) =>
      /huggingface|web-llm|journal-model|journal-worker|\.wasm/.test(u),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.locator(".notebook-page h3")).toHaveText("Day 1");
});
test("old pending entries remain readable and new-game reset clears narrative memory", async ({
  page,
}) => {
  const s = fresh();
  s.awake = true;
  s.day = 2;
  s.journal.push("Day 1\n\nI kept my old page.");
  s.journalDrafts = [journalContext(fresh())];
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("j");
  await expect(page.locator(".notebook-page")).toContainText(
    "I kept my old page.",
  );
  await expect(
    page.getByRole("button", { name: "Try writing again" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as any).game.state().journalDrafts),
  ).toEqual([]);
  await page.evaluate(() => (window as any).game.reset());
  expect(
    await page.evaluate(() => (window as any).game.state().journal.length),
  ).toBe(1);
  expect(
    await page.evaluate(() => (window as any).game.state().journalNarrative),
  ).toBeUndefined();
});
