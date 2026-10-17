import { assessment, newMillionaire } from "../../src/millionaire";
import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
async function frames(page: Page, n = 10) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(32);
}
async function start(page: Page, extra: any) {
  const s = Object.assign(
    fresh(),
    {
      awake: true,
      metMom: true,
      day: 3,
      cash: 10000,
      position: { x: -2.5, z: 10 },
    },
    extra,
  );
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up", exact: false }).click();
  await frames(page);
  return errors;
}
test("Mom prepares a pan, bed-day cooking routes through her doorway, and food starts after eating", async ({
  page,
}) => {
  const errors = await start(page, {
    groceries: { eggs: 1, rice: 1, beans: 1, tortillas: 1 },
  });
  await page.keyboard.press("e");
  await frames(page);
  await expect(
    page.getByRole("button", { name: "Yes, let’s cook" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Yes, let’s cook" }).click();
  await page.evaluate(() => (window as any).game.teleport(-12.5, 11.2));
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("Cook");
  await page.keyboard.press("e");
  await frames(page, 12);
  const started = await page.evaluate(() => (window as any).game.homeLiving());
  expect(started.cooking.recipe).toBe(15);
  expect(started.cooking.bed).toBe(true);
  expect(started.cooking.route.some((p: any) => p.x > -9)).toBe(true);
  expect(
    (await page.evaluate(() => (window as any).game.state())).foodBuff,
  ).toBeUndefined();
  await page.screenshot({ path: "../../outputs/money-tree-new-cooking.png" });
  for (let i = 0; i < 83; i++) await page.clock.fastForward(250);
  await expect(page.locator("#food-effect")).toContainText(
    "Better breakfast burrito",
  );
  const s = await page.evaluate(() => (window as any).game.state());
  expect(s.pendingMeal).toBeUndefined();
  expect(s.foodBuff.remaining).toBeGreaterThan(175);
  expect(s.groceries).toEqual({ eggs: 0, rice: 0, beans: 0, tortillas: 0 });
  await page.screenshot({ path: "../../outputs/money-tree-new-meal.png" });
  expect(errors).toEqual([]);
});
test("floor furnishings use red/green placement, save and rebuild after refresh", async ({
  page,
}) => {
  const errors = await start(page, {
    position: { x: -15, z: 1 },
    furnitureBag: ["chair"],
  });
  await page.keyboard.press("F5");
  await page
    .getByRole("button", { name: "Preview Velvet reading chair" })
    .click();
  await page.evaluate(() => (window as any).game.setYaw(Math.PI));
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).placing
      .valid,
  ).toBe(true);
  await page.keyboard.press("e");
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.state())).furniture,
  ).toHaveLength(1);
  await page.reload();
  await page.getByRole("button", { name: "Wake up", exact: false }).click();
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).models,
  ).toBe(1);
  expect(errors).toEqual([]);
});
test("parked bike E has a visible one-second hop and the higher first-person viewpoint", async ({
  page,
}) => {
  await start(page, {
    position: { x: 3, z: 30 },
    bikes: ["tassels"],
    selectedBike: "tassels",
  });
  await page.keyboard.press("h");
  await frames(page, 10);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).mounting,
  ).toBeGreaterThan(0);
  expect(
    (await page.evaluate(() => (window as any).game.bicycle())).riding,
  ).toBe(false);
  await frames(page, 45);
  expect(
    (await page.evaluate(() => (window as any).game.bicycle())).riding,
  ).toBe(true);
  await page.keyboard.press("h");
  await frames(page, 5);
  await expect(page.locator("#prompt")).toContainText("Mount bicycle");
  const parkedHeading = (
    await page.evaluate(() => (window as any).game.homeLiving())
  ).parkedHeading;
  await page.evaluate(() => (window as any).game.setYaw(1.2));
  await page.keyboard.press("e");
  await frames(page, 3);
  const hop = await page.evaluate(() => (window as any).game.homeLiving());
  expect(hop.parkedHeading).toBe(parkedHeading);
  expect(hop.playerHeading).toBeCloseTo(parkedHeading + Math.PI, 5);
  await frames(page, 55);
  expect(
    (await page.evaluate(() => (window as any).game.bicycle())).firstPerson,
  ).toBe(true);
  expect((await page.locator("footer").boundingBox())!.y).toBeLessThan(85);
  expect(
    (await page.evaluate(() => (window as any).game.camera())).position[1],
  ).toBeGreaterThan(2);
});

test("painting placement rejects the bedroom window and uses a clear wall", async ({
  page,
}) => {
  await start(page, { position: { x: -15, z: 1 }, furnitureBag: ["sunset"] });
  await page.keyboard.press("F5");
  await page.getByRole("button", { name: "Preview Sunset painting" }).click();
  await page.evaluate(() => (window as any).game.setYaw(0));
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).placing
      .valid,
  ).toBe(false);
  await page.evaluate(() => (window as any).game.teleport(-12, 1));
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).placing
      .valid,
  ).toBe(true);
  await page.keyboard.press("e");
  await frames(page);
  await page.screenshot({ path: "../../outputs/money-tree-new-painting.png" });
  expect(
    (await page.evaluate(() => (window as any).game.state())).furniture,
  ).toHaveLength(1);
});
test("Willow Lane camera stays near the player and desert thoughts stay centered after visiting", async ({
  page,
}) => {
  const m = {
    ...newMillionaire(),
    afterPepe: 10000,
    unlocked: true,
    member: "fire",
    result: "fire",
    answers: assessment.map(() => 2),
    welcomeSeed: true,
    summitSeeds: true,
    titheAccepted: true,
    mountainEarned: 0,
  };
  await start(page, {
    position: { x: 46, z: -80 },
    foundTVSeeds: true,
    foundGardenSeeds: true,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    millionaire: m,
  });
  // Follow the east lane onto the new grove bridge; the old (46,-100) spot is water.
  for (const [x, z] of [
    [46, -90],
    [40, -104],
  ]) {
    await page.evaluate(
      ([x, z]) => (window as any).game.teleport(x, z),
      [x, z],
    );
    await frames(page, 5);
    const v = await page.evaluate(() => ({
      p: (window as any).game.state().position,
      c: (window as any).game.camera().position,
    }));
    expect(Math.hypot(v.c[0] - v.p.x, v.c[2] - v.p.z)).toBeLessThan(9);
  }
  await page.evaluate(() => (window as any).game.teleport(34, -210));
  await frames(page, 10);
  const bubble = page.locator("#thought");
  await expect(bubble).toBeVisible();
  const box = await bubble.boundingBox();
  expect(Math.abs(box!.x + box!.width / 2 - 640)).toBeLessThan(2);
  await expect(bubble).not.toContainText(/who lives|what.*top/i);
});

for (const day of [1, 3]) {
  test(`bedside chair uses the correct prompt on day ${day}`, async ({
    page,
  }) => {
    await start(page, { position: { x: -6.6, z: 11.4 }, day });
    await expect(page.locator("#prompt")).toHaveText(
      day === 3 ? "E Sit nearby Mom" : "E Sit",
    );
    await expect(page.locator("#stats")).toHaveText(`Day ${day}`);
  });
}

test("F5 editor previews models while walking, locks, moves, cancels and retrieves without losing furniture", async ({
  page,
}, info) => {
  const errors = await start(page, {
    position: { x: -15, z: 1 },
    furnitureBag: ["chair", "chair", "pouf"],
  });
  await page.keyboard.press("F5");
  await expect(
    page.getByRole("dialog", { name: "Choose furniture" }),
  ).toBeVisible();
  await expect(page.locator(".editor-card img")).toHaveCount(2);
  await page.screenshot({ path: info.outputPath("furniture-browser.png") });
  await page
    .getByRole("button", { name: "Preview Velvet reading chair", exact: true })
    .click();
  await page.evaluate(() => (window as any).game.setYaw(Math.PI));
  await frames(page);
  const point = (await page.evaluate(() => (window as any).game.homeLiving()))
    .placing.point;
  await page.keyboard.press("l");
  await frames(page);
  await page.evaluate(() => {
    const root = document.querySelector("#furniture-editor")!;
    (window as any).editorMutations = 0;
    const observer = new MutationObserver(
      (records) => ((window as any).editorMutations += records.length),
    );
    observer.observe(root, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
    });
    (window as any).editorObserver = observer;
  });
  const updates = await page.evaluate(
    () => (window as any).game.homeLiving().placing.updates,
  );
  await frames(page, 10);
  expect(
    await page.evaluate(
      () => (window as any).game.homeLiving().placing.updates,
    ),
  ).toBe(updates);
  console.log("stationary furniture preview rebuilds", 0);
  expect(
    await page.evaluate(() => {
      (window as any).editorObserver.disconnect();
      return (window as any).editorMutations;
    }),
  ).toBe(0);
  const origin = await page.evaluate(
    () => (window as any).game.state().position,
  );
  await page.keyboard.down("d");
  await frames(page, 10);
  await page.keyboard.up("d");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.x,
  ).not.toBe(origin.x);
  expect(
    (await page.evaluate(() => (window as any).game.homeLiving())).placing
      .point,
  ).toEqual(point);
  await page.screenshot({ path: info.outputPath("furniture-preview.png") });
  await page.keyboard.press("e");
  await frames(page);
  let state = await page.evaluate(() => (window as any).game.state());
  expect(state.furniture).toHaveLength(1);
  expect(
    state.furnitureBag.filter((id: string) => id === "chair"),
  ).toHaveLength(1);
  await page
    .getByRole("button", { name: "Move Velvet reading chair", exact: true })
    .click();
  await page.keyboard.press("ArrowRight");
  await frames(page);
  await page.keyboard.press("Escape");
  expect(
    (await page.evaluate(() => (window as any).game.state())).furniture[0],
  ).toEqual(point);
  await page
    .getByRole("button", { name: "Move Velvet reading chair", exact: true })
    .click();
  await page.keyboard.press("ArrowRight");
  await frames(page);
  await page.keyboard.press("e");
  await frames(page);
  state = await page.evaluate(() => (window as any).game.state());
  expect(state.furniture).toHaveLength(1);
  expect(state.furniture[0].x).toBeCloseTo(point.x + 0.1);
  await page
    .getByRole("button", { name: "Move Velvet reading chair", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Put back in bag", exact: true })
    .click();
  state = await page.evaluate(() => (window as any).game.state());
  expect(state.furniture).toHaveLength(0);
  expect(
    state.furnitureBag.filter((id: string) => id === "chair"),
  ).toHaveLength(2);
  await page.keyboard.press("F5");
  await expect(page.locator("#furniture-editor")).toBeHidden();
  await page.evaluate(() => (window as any).game.storageFlush());
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.state())).furnitureBag,
  ).toHaveLength(3);
  expect(errors).toEqual([]);
});

test("furniture wheel distance is consistent for pixel and line scrolling", async ({
  page,
}) => {
  await start(page, { position: { x: -15, z: 1 }, furnitureBag: ["chair"] });
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "shortcut-focus-test";
    document.body.append(input);
    input.focus();
  });
  await page.keyboard.press("F5");
  await expect(
    page.getByRole("dialog", { name: "Choose furniture" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "F5",
        repeat: true,
        cancelable: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
      document.querySelector("#shortcut-focus-test")!.remove();
      return event.defaultPrevented;
    }),
  ).toBe(true);
  await expect(
    page.getByRole("dialog", { name: "Choose furniture" }),
  ).toBeVisible();
  const positions = [];
  for (const deltaMode of [0, 1]) {
    await page
      .getByRole("button", {
        name: "Preview Velvet reading chair",
        exact: true,
      })
      .click();
    await page.evaluate((deltaMode) => {
      document.querySelector("#world")!.dispatchEvent(
        new WheelEvent("wheel", {
          deltaMode,
          deltaY: deltaMode === 0 ? 16 : 1,
          bubbles: true,
          cancelable: true,
        }),
      );
    }, deltaMode);
    await frames(page);
    positions.push(
      await page.evaluate(
        () => (window as any).game.homeLiving().placing.point,
      ),
    );
    await page.keyboard.press("Escape");
  }
  expect(positions[0]).toEqual(positions[1]);
  await page.keyboard.press("F5");
});
