import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function start(
  page: Page,
  state = Object.assign(fresh(), { awake: true, metMom: true }),
) {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, state);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}
test("legacy saves migrate to compressed IndexedDB without losing their journal, then refresh safely", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    day: 150,
    cash: 32100,
  });
  s.journal = Array.from(
    { length: 150 },
    (_, i) =>
      `Day ${i + 1}. ` +
      "Mom and I tended the garden and visited the neighbors. ".repeat(40),
  );
  await start(page, s);
  const stats = await page.evaluate(async () => {
    await (window as any).game.storageFlush();
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("money-tree", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const record = await new Promise<any>((resolve, reject) => {
      const r = db
        .transaction("saves")
        .objectStore("saves")
        .get("money-tree-v1");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    db.close();
    const saved = await (window as any).game.savedState();
    return {
      format: record.format,
      bytes: record.bytes.byteLength,
      raw: new Blob([JSON.stringify(saved)]).size,
      legacy: localStorage.getItem("money-tree-v1"),
      journal: saved.journal,
    };
  });
  expect(stats.format).toBe("gzip");
  expect(stats.bytes).toBeLessThan(stats.raw * 0.2);
  expect(stats.legacy).toBeNull();
  expect(stats.journal).toEqual(s.journal);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
    32100,
  );
});
test("migration commit failure leaves original bytes untouched and does not autosave a fresh replacement", async ({
  page,
}) => {
  const raw = JSON.stringify(Object.assign(fresh(), { cash: 77777 }));
  await page.addInitScript((raw) => {
    localStorage.setItem("money-tree-v1", raw);
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Storage is full", "QuotaExceededError");
    };
  }, raw);
  await page.goto("./?test");
  await expect(page.locator(".intro-card")).toContainText(
    "this session cannot save",
  );
  expect(await page.evaluate(() => localStorage.getItem("money-tree-v1"))).toBe(
    raw,
  );
});
test("refresh immediately after a gameplay change retains the latest position", async ({
  page,
}) => {
  await start(page);
  await page.evaluate(() => (window as any).game.teleport(-16, 5));
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).position,
  ).toEqual({ x: -16, z: 5 });
});
