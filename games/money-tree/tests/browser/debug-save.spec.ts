import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fresh } from "../../src/game";
test("pause debug unlock survives refresh and preserves a pre-debug backup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Debug menu", exact: true }).click();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("button", { name: "Unlock Level 3" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "applied",
  );
  const saved = await page.evaluate(async () => ({
    current: await (window as any).game.savedState("money-tree-v1"),
    backup: await (window as any).game.savedState("money-tree-v1-debug-backup"),
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
  // Slow storage exposes Firefox restoring an enabled button before startup
  // installs its handler. Clicking after refresh must still open recovery.
  await page.addInitScript(() => {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (name: string, version?: number) => {
      const r = version === undefined ? open(name) : open(name, version);
      let success: ((this: IDBOpenDBRequest, event: Event) => unknown) | null =
        null;
      Object.defineProperty(r, "onsuccess", {
        get: () => success,
        set: (callback) => {
          success = callback;
        },
      });
      r.addEventListener("success", (event) =>
        setTimeout(() => success?.call(r, event), 700),
      );
      return r;
    };
  });
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
  await expect(page.locator("#intro")).toBeHidden();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export preserved save" }).click();
  const download = await downloadPromise;
  expect(await readFile((await download.path())!, "utf8")).toBe(bad);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator("#intro")).toBeVisible();
  await expect(page.getByRole("button", { name: "Wake up" })).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.locator("#intro")).toBeHidden();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  expect(
    await page.evaluate(
      async () => await (window as any).game.savedRaw("money-tree-v1"),
    ),
  ).toBe(bad);
  expect(
    await page.evaluate(
      async () => await (window as any).game.savedRaw("money-tree-v1-rejected"),
    ),
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
  expect(
    await page.evaluate(async () => (window as any).game.state().day),
  ).toBe(17);
  expect(
    await page.evaluate(async () => (window as any).game.state().cash),
  ).toBe(45678);
  expect(
    await page.evaluate(
      async () => await (window as any).game.savedRaw("money-tree-v1-rejected"),
    ),
  ).toBe("corrupt");
});

test("recovery imports a valid save directly and keeps it after refresh", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(() => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", "broken");
  });
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import save", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "recovered.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ ...fresh(), day: 21, bank: 116837, cash: 810 }),
    ),
  });
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page.evaluate(
      async () => (await (window as any).game.savedState("money-tree-v1")).day,
    ),
  ).toBe(21);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(async () => (window as any).game.state().bank),
  ).toBe(116837);
  expect(
    await page.evaluate(
      async () => await (window as any).game.savedRaw("money-tree-v1-rejected"),
    ),
  ).toBe("broken");
});
