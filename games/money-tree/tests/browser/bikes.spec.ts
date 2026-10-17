import { test, expect } from "@playwright/test";
import { fresh } from "../../src/game";
import { bikes, bikeFeatures } from "../../src/bikes";
async function start(page: any, extra: any = {}) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  const s = fresh();
  Object.assign(
    s,
    { awake: true, metMom: true, cash: 200000, position: { x: -18, z: -19 } },
    extra,
  );
  await page.addInitScript((s: any) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
}
async function frames(page: any, n = 30) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(32);
}
test("walk-in showroom has seven physical bikes, mixed wall/floor displays, purchases and saved selection", async ({
  page,
}) => {
  await start(page);
  const displays = await page.evaluate(
    () => (window as any).game.bicycle().displays,
  );
  expect(displays).toHaveLength(7);
  expect(displays.filter((b: any) => b.hung)).toHaveLength(3);
  for (const bike of bikes) {
    const target = await page.evaluate(
      (id) =>
        (window as any).game.targets.find((t: any) => t.id === "bike-" + id),
      bike.id,
    );
    await page.evaluate((t) => (window as any).game.teleport(t.x, t.z), target);
    await frames(page, 12);
    await expect(page.locator("#prompt")).toContainText("Inspect " + bike.name);
    await page.keyboard.press("e");
    await expect(
      page.getByRole("heading", { name: bike.name, exact: true }),
    ).toBeVisible();
    await page.keyboard.press("e");
    expect(
      await page.evaluate(() => (window as any).game.state().bikes),
    ).toContain(bike.id);
  }
  expect(await page.evaluate(() => (window as any).game.state().cash)).toBe(
    55000,
  );
  await page.keyboard.press("h");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    false,
  );
  await page.evaluate(() => (window as any).game.teleport(-18, -26));
  await page.evaluate(() => (window as any).game.setYaw(0));
  await frames(page, 90);
  await page.screenshot({ path: "../../outputs/money-tree-bike-shop.png" });
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(
    await page.evaluate(() => (window as any).game.state().bikes),
  ).toHaveLength(7);
  expect(
    await page.evaluate(() => (window as any).game.state().selectedBike),
  ).toBe("road");
});
test("H gives a first-person cockpit, slowest bike beats running, B rings, walls block and dismount restores walking", async ({
  page,
}) => {
  await start(page, {
    bikes: ["tassels"],
    selectedBike: "tassels",
    position: { x: 3, z: 30 },
  });
  await page.evaluate(() => (window as any).game.setYaw(0));
  await frames(page);
  await page.keyboard.press("h");
  await frames(page, 55);
  expect(
    await page.evaluate(() => (window as any).game.bicycle().firstPerson),
  ).toBe(true);
  await page.keyboard.down("w");
  await frames(page, 45);
  await page.keyboard.up("w");
  const riding = await page.evaluate(() => (window as any).game.bicycle());
  expect(riding.speed).toBeGreaterThan(11.4);
  const pose = await page.evaluate(() => ({
    p: (window as any).game.state().position,
    c: (window as any).game.camera().position,
  }));
  expect(Math.hypot(pose.c[0] - pose.p.x, pose.c[2] - pose.p.z)).toBeLessThan(
    0.05,
  );
  await page.keyboard.press("b");
  expect(
    await page.evaluate(() => (window as any).game.bicycle().bellRings),
  ).toBe(1);
  await page.screenshot({ path: "../../outputs/money-tree-bike-cockpit.png" });
  await page.keyboard.press("h");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    false,
  );
  expect(
    await page.evaluate(() => (window as any).game.bicycle().firstPerson),
  ).toBe(false);
  await page.evaluate(() => (window as any).game.teleport(17, -28));
  await page.keyboard.press("h");
  await frames(page, 55);
  await page.evaluate(() => (window as any).game.setYaw(Math.PI / 2));
  await page.keyboard.down("w");
  await frames(page, 90);
  await page.keyboard.up("w");
  expect(
    await page.evaluate(() => (window as any).game.state().position.x),
  ).toBeGreaterThan(16.4);
  expect(await page.evaluate(() => (window as any).game.bicycle().speed)).toBe(
    0,
  );
  await page.keyboard.press("h");
  await page.evaluate(() => (window as any).game.teleport(-18, -19));
  await page.evaluate(() => (window as any).game.setYaw(0));
  await page.keyboard.press("h");
  await frames(page, 55);
  await page.keyboard.down("w");
  await frames(page, 35);
  await page.keyboard.up("w");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    false,
  );
  expect(
    await page.evaluate(() => (window as any).game.state().position.z),
  ).toBeLessThan(-21);
});
test("penny-farthing rides higher and owned bike cards allow switching", async ({
  page,
}) => {
  await start(page, {
    bikes: ["tassels", "penny"],
    selectedBike: "tassels",
    position: { x: 3, z: 30 },
  });
  await page.keyboard.press("i");
  await page.locator('[data-bicycle="penny"]').click();
  await frames(page, 55);
  expect(
    await page.evaluate(() => (window as any).game.state().selectedBike),
  ).toBe("penny");
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    true,
  );
  expect(
    await page.evaluate(() => (window as any).game.camera().position[1]),
  ).toBeCloseTo(2.8, 2);
  await expect(page.locator("#bike-bell-help")).toBeVisible();
  await page.keyboard.press("h");
  await frames(page, 1);
  await expect(page.locator("#bike-bell-help")).toBeHidden();
});

test("outside rack swaps owned bicycles and F activates only the riding bike", async ({
  page,
}) => {
  await start(page, {
    bikes: ["tassels", "road"],
    selectedBike: "tassels",
    position: { x: -4.7, z: 18.4 },
  });
  await frames(page, 5);
  expect(await page.evaluate(() => (window as any).game.bikeRack())).toEqual([
    "tassels",
    "road",
  ]);
  await page.screenshot({
    path: "../../outputs/money-tree-owned-bike-rack.png",
  });
  await page.keyboard.press("f");
  expect(
    await page.evaluate(() => (window as any).game.bikeSpecial().uses),
  ).toBe(0);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Your bike rack" }),
  ).toBeVisible();
  await expect(page.locator('[data-rack-bike="road"]')).toContainText("Turbo");
  await page.locator('[data-rack-bike="road"]').click();
  await frames(page, 55);
  expect(await page.evaluate(() => (window as any).game.bicycle().riding)).toBe(
    true,
  );
  expect(await page.evaluate(() => (window as any).game.bikeRack())).toEqual([
    "tassels",
  ]);
  await expect(page.locator("#bike-special-help")).toBeVisible();
  await page.keyboard.press("f");
  expect(
    await page.evaluate(() => (window as any).game.bikeSpecial().multiplier),
  ).toBe(1.5);
  await page.keyboard.press("f");
  expect(
    await page.evaluate(() => (window as any).game.bikeSpecial().uses),
  ).toBe(1);
  await page.keyboard.press("h");
  await frames(page, 2);
  await expect(page.locator("#bike-special-help")).toBeHidden();
  expect(
    await page.evaluate(() => (window as any).game.bikeSpecial().multiplier),
  ).toBe(1);
  await page.evaluate(() => (window as any).game.teleport(-4.7, 18.4));
  await frames(page, 5);
  await page.keyboard.press("e");
  expect(await page.evaluate(() => (window as any).game.bikeRack())).toEqual([
    "tassels",
    "road",
  ]);
  await page.keyboard.press("e");
  const quicksaveDownload = page.waitForEvent("download");
  await page.keyboard.press("q");
  await (await quicksaveDownload).path();
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  expect(await page.evaluate(() => (window as any).game.state().bikes)).toEqual(
    ["tassels", "road"],
  );
});

test.describe("individual bike features", () => {
  test.describe.configure({ mode: "parallel" });
  for (const bike of bikes) {
    test(`F triggers ${bike.id}: ${bikeFeatures[bike.id].name}`, async ({
      page,
    }) => {
      await start(page, {
        bikes: bikes.map((b) => b.id),
        selectedBike: "tassels",
        position: { x: 3, z: 30 },
      });
      await page.keyboard.press("i");
      await page.locator(`[data-bicycle="${bike.id}"]`).click();
      await frames(page, 55);
      const before = await page.evaluate(
        () => (window as any).game.camera().position[1],
      );
      await page.keyboard.press("f");
      expect(
        await page.evaluate(() => (window as any).game.bikeSpecial().active),
      ).toBe(bike.id);
      await expect(page.locator("#bike-special-name")).toContainText(
        bikeFeatures[bike.id].name,
      );
      await frames(page, 10);
      if (bike.id === "bmx") {
        expect(
          await page.evaluate(() => (window as any).game.camera().position[1]),
        ).toBeGreaterThan(before + 0.4);
        await frames(page, 25);
        expect(
          await page.evaluate(() => (window as any).game.camera().position[1]),
        ).toBeCloseTo(before, 2);
      } else {
        expect(
          await page.evaluate(
            () => (window as any).game.bikeSpecial().particles,
          ),
        ).toBeGreaterThan(0);
      }
      if (bike.id === "tassels")
        await page.screenshot({
          path: "../../outputs/money-tree-bike-confetti.png",
        });
      await page.keyboard.press("h");
      await frames(page, 1);
    });
  }
});
