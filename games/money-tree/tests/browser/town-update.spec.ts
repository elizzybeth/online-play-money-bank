import { test, expect, type Page } from "@playwright/test";
import { applyDebugAction } from "../../src/debug-menu";
import { fresh, momStatus, type State } from "../../src/game";
async function open(page: Page, s: State) {
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
test("full third-person sleeping body and compact couch seating, stand without restarting", async ({
  page,
}) => {
  await open(page, fresh());
  const bed = await page.evaluate(() => (window as any).game.sleepingBounds());
  expect(bed.max[2] - bed.min[2]).toBeGreaterThan(1.7);
  const camera = await page.evaluate(() => (window as any).game.camera());
  expect(camera.position[1]).toBeGreaterThan(3);
  await page.screenshot({ path: "../../outputs/money-tree-new-wake-up.png" });
  await page.keyboard.press("e");
  await page.evaluate(() => (window as any).game.teleport(-17.2, 11.1));
  await expect(page.locator("#prompt")).toContainText("Sit on the couch");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).game
          .state()
          .events.some((e: string) => e.startsWith("Talked with Mom")),
      ),
    )
    .toBe(true);
  for (let i = 0; i < 3 && (await page.locator(".speech-bubble").count()); i++)
    await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
  await page.keyboard.press("e");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.seated()))
    .toBe(true);
  expect(
    await page.evaluate(() => (window as any).game.npcHeadPenetrations()),
  ).toBe(0);
  await expect(page.locator("#prompt")).toContainText("Stand up");
  const view = await page.evaluate(() => (window as any).game.camera());
  expect(view.forward[0]).toBeGreaterThan(0.9);
  expect(view.forward[2]).toBeLessThan(0);
  expect(view.position[0]).toBeCloseTo(-18.9, 1);
  expect(view.position[1]).toBeCloseTo(2.39, 1);
  await expect(page.locator("#prompt")).toHaveClass(/seated/);
  if (await page.locator("#thought").isVisible()) {
    const thought = await page.locator("#thought").boundingBox(),
      prompt = await page.locator("#prompt").boundingBox();
    expect(
      thought &&
        prompt &&
        (prompt.x + prompt.width <= thought.x ||
          prompt.y >= thought.y + thought.height ||
          prompt.x >= thought.x + thought.width ||
          prompt.y + prompt.height <= thought.y),
    ).toBe(true);
  }
  await page.screenshot({
    path: "../../outputs/money-tree-couch-together.png",
  });
  await page.keyboard.press("e");
  await expect
    .poll(() => page.evaluate(() => (window as any).game.seated()))
    .toBe(false);
  const stood = await page.evaluate(
    () => (window as any).game.state().position,
  );
  await page.keyboard.down("d");
  await expect
    .poll(() =>
      page.evaluate((p) => {
        const q = (window as any).game.state().position;
        return Math.hypot(q.x - p.x, q.z - p.z);
      }, stood),
    )
    .toBeGreaterThan(0.3);
  await page.keyboard.up("d");
});
test("bedroom rack swaps a full stack and keeps decorative hats at top", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    hats: ["wizard", "cap", "propeller", "rabbit"],
    equippedHats: ["wizard", "cap", "propeller"],
    equippedHat: "propeller",
    position: { x: -19.5, z: 4.8 },
  });
  await open(page, s);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.hatStack().at(-1)?.id))
    .toBe("propeller");
  await expect(page.locator("#prompt")).toContainText("Manage your hats");
  await page.keyboard.press("e");
  await page.locator("[data-rack-hat=cap]").click();
  await expect(page.locator("#modal")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => (window as any).game.polish().hanging))
    .toBe(false);
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeVisible();
  await page.locator("[data-rack-hat=rabbit]").click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).equippedHats,
  ).toHaveLength(3);
  await page.keyboard.press("e");
  await expect(page.locator("#modal")).toBeHidden();
  const stack = await page.evaluate(() => (window as any).game.hatStack());
  expect(["propeller", "rabbit"]).toContain(stack.at(-1).id);
  expect(stack.map((h: any) => h.y)).toEqual(
    [...stack.map((h: any) => h.y)].sort((a: number, b: number) => a - b),
  );
  await expect
    .poll(() => page.evaluate(() => (window as any).game.playerVisibility()))
    .toEqual([true, true]);
  await page.screenshot({ path: "../../outputs/money-tree-three-hats.png" });
});
test("third retained packet unlocks Sigma in Bea’s flowerbed and persists", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    boughtSeeds: true,
    foundCapSeeds: true,
    foundForestSeeds: true,
    position: { x: 7.8, z: 20.8 },
  });
  await open(page, s);
  await expect(page.locator("#prompt")).toContainText("flowerbed");
  await page.keyboard.press("e");
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    5,
  );
  expect(
    (await page.evaluate(() => (window as any).game.state())).foundTVSeeds,
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      (window as any).game.targets.some((t: any) =>
        ["store-seeds", "tv-seeds"].includes(t.id),
      ),
    ),
  ).toBe(false);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).foundTVSeeds,
  ).toBe(true);
});
test("Mom rests in separate bedroom, birdhouses remain outside, interior camera rises above walls", async ({
  page,
}) => {
  const s = fresh();
  Object.assign(s, {
    day: 3,
    awake: true,
    birdhousesBuilt: 1,
    position: { x: -6, z: 10 },
  });
  await open(page, s);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.camera().position[1]))
    .toBeGreaterThan(1.3);
  expect(await page.evaluate(() => (window as any).game.birdhouses())).toBe(1);
  await page.evaluate(() => (window as any).game.teleport(-2.5, 10));
  await expect(page.locator("#prompt")).toContainText("Mom");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("bed");
  // Speech takes priority over Mom's accompanying private thought.
  await expect(page.locator("#thought")).toBeHidden();
  expect(
    (await page.evaluate(() => (window as any).game.state())).events.some(
      (e: string) => e.includes("exhausted in bed"),
    ),
  ).toBe(true);
  await expect
    .poll(() => page.evaluate(() => (window as any).game.playerVisibility()))
    .toEqual([true, true]);
  await page.screenshot({ path: "../../outputs/money-tree-moms-bedroom.png" });
});

test("garden beds belong outside both bedrooms", async ({ page }) => {
  const s = fresh();
  Object.assign(s, {
    awake: true,
    day: 2,
    gardenBeds: 1,
    position: { x: -6, z: 10 },
  });
  await open(page, s);
  const preview = await page.evaluate(() => (window as any).game.bedPreview());
  expect(preview.valid).toBe(false);
  await page.evaluate(() => (window as any).game.teleport(-24, 21));
  expect(
    (await page.evaluate(() => (window as any).game.bedPreview())).valid,
  ).toBe(true);
});

test("Mom stays in the garden when the player goes indoors", async ({
  page,
}) => {
  const day = Array.from({ length: 100 }, (_, i) => i + 1).find(
    (d) => momStatus(d).activity === "garden",
  )!;
  const s = fresh();
  Object.assign(s, {
    day,
    awake: true,
    metMom: true,
    position: { x: -10.2, z: 20 },
  });
  await open(page, s);
  const before = await page.evaluate(() =>
    (window as any).game.targets.find((t: any) => t.id === "mom"),
  );
  expect(before.z).toBeGreaterThan(14);
  await page.evaluate(() => (window as any).game.teleport(-16, 12));
  await page.waitForTimeout(500);
  const after = await page.evaluate(() =>
    (window as any).game.targets.find((t: any) => t.id === "mom"),
  );
  expect(after).toEqual(before);
  await expect(page.locator(".speech-bubble")).toHaveCount(0);
});

for (const level of [2, 3])
  test(`level ${level} adds a hat slot at the rack and saves the larger stack`, async ({
    page,
  }) => {
    const s = fresh();
    applyDebugAction(s, level === 3 ? "level3" : "level2");
    s.metMom = true;
    s.hats = ["cap", "propeller", "rabbit", "wizard", "inspector", "hardhat"];
    s.equippedHats = ["cap", "propeller", "rabbit"];
    s.equippedHat = "rabbit";
    s.position = { x: -19.5, z: 4.8 };
    await open(page, s);
    await page.keyboard.press("e");
    await expect(page.locator("#modal")).toContainText(
      `Wear up to ${level + 2} hats`,
    );
    await page.locator("[data-rack-hat=wizard]").click();
    if (level === 3) await page.locator("[data-rack-hat=inspector]").click();
    expect(
      await page.evaluate(() => (window as any).game.state().equippedHats),
    ).toHaveLength(level + 2);
    await page
      .locator(
        level === 3 ? "[data-rack-hat=hardhat]" : "[data-rack-hat=inspector]",
      )
      .click();
    expect(
      await page.evaluate(() => (window as any).game.state().equippedHats),
    ).toHaveLength(level + 2);
    await expect(page.locator("#toast")).toContainText(
      `${level + 2} hat slots are full`,
    );
    await page.evaluate(() => (window as any).game.storageFlush());
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    expect(
      await page.evaluate(() => (window as any).game.state().equippedHats),
    ).toHaveLength(level + 2);
    expect(
      await page.evaluate(() => (window as any).game.hatStack()),
    ).toHaveLength(level + 2);
  });
