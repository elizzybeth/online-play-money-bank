import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";

test("compiled game renders trees, routes seed-selection input and persists through its save worker", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    can: true,
    shovel: true,
    position: { x: -20, z: 20.6 },
    cropSeeds: { beet: 2 },
  });
  Object.assign(s.plots[1], { stage: "ready", yield: 600 });
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  for (let i = 0; i < 3; i++) await page.clock.fastForward(125);
  const render = await page.evaluate(() => {
    const g = (window as any).game;
    return { stats: g.renderStats(), tree: g.plotModels()[1] };
  });
  expect(render.stats.calls).toBeGreaterThan(0);
  expect(render.tree.stage).toBe("ready");
  expect(render.tree.meshes).toBeGreaterThan(0);
  await expect(page.locator("#prompt")).toContainText("G");
  await page.keyboard.press("g");
  const seed = page.getByRole("button", {
    name: "Select beet seeds · 2 available",
    exact: true,
  });
  await expect(seed.locator("img")).toHaveJSProperty("naturalWidth", 192);
  await seed.click();
  // Observe actual IndexedDB commits, not a timing delay or a mocked save API.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const r = indexedDB.open("money-tree", 1);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        try {
          const packed: any = await new Promise((resolve, reject) => {
            const r = db
              .transaction("saves")
              .objectStore("saves")
              .get("money-tree-v1");
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
          });
          if (!packed) return;
          const raw =
            packed.format === "text"
              ? packed.text
              : await new Response(
                  new Blob([packed.bytes])
                    .stream()
                    .pipeThrough(new DecompressionStream("gzip")),
                ).text();
          return JSON.parse(raw).activeSeed;
        } finally {
          db.close();
        }
      }),
    )
    .toBe("beet");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().activeSeed),
  ).toBe("beet");
  expect(errors).toEqual([]);
});
