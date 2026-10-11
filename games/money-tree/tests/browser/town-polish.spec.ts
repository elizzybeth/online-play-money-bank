import { test, expect } from "@playwright/test";
import { scheduleSurgery } from "../../src/family-story";
import { fresh } from "../../src/game";
async function frames(p: any, n = 20) {
  for (let i = 0; i < n; i++) await p.clock.fastForward(32);
}
async function setup(p: any, s: any) {
  await p.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await p.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await p.addInitScript((s: any) => {
    if (!sessionStorage.getItem("polish-seeded")) {
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
      sessionStorage.setItem("polish-seeded", "1");
    }
  }, s);
  await p.goto("./?test");
  await p.getByRole("button", { name: "Wake up" }).click();
  await frames(p);
}
test("fertilizer remains in its bed through reload, shows doses, and clears overnight", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 10,
    fertilizer: 5,
    position: { x: -20, z: 20.6 },
  });
  s.plots[0].stage = "growing";
  s.plots[0].remaining = 180;
  await setup(page, s);
  await page.keyboard.press("e");
  await frames(page, 65);
  await expect(page.locator("#fertilizer-hud")).toContainText("4");
  expect(
    (await page.evaluate(() => (window as any).game.polish()))
      .fertilizerMarkers,
  ).toEqual([{ name: "fertilized-bed-0", grains: 24 }]);
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.polish()))
      .fertilizerMarkers,
  ).toHaveLength(1);
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.polish()))
      .fertilizerMarkers,
  ).toHaveLength(0);
});
test("wearing hats stay off the rack; hanging closes the menu and animates the model to its hook", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    hats: ["cap", "rabbit"],
    equippedHat: "rabbit",
    equippedHats: ["rabbit"],
    position: { x: -19.5, z: 4.8 },
    metMom: true,
  });
  await setup(page, s);
  expect(
    (await page.evaluate(() => (window as any).game.polish())).rack,
  ).toEqual(["rack-cap"]);
  await page.keyboard.press("e");
  await expect(page.locator(".hat-power").first()).toHaveCSS(
    "color",
    "rgb(255, 240, 200)",
  );
  await page.locator('[data-rack-hat="rabbit"]').click();
  await expect(page.locator("#modal")).toBeHidden();
  await frames(page, 5);
  expect(
    (await page.evaluate(() => (window as any).game.polish())).hanging,
  ).toBe(true);
  await frames(page, 65);
  expect(
    (await page.evaluate(() => (window as any).game.polish())).rack,
  ).toEqual(["rack-cap", "rack-rabbit"]);
  await page.keyboard.press("e");
  await page.locator('[data-rack-hat="rabbit"]').click();
  await frames(page);
  expect(
    (await page.evaluate(() => (window as any).game.polish())).rack,
  ).toEqual(["rack-cap"]);
});
test("Mom accepts typed sentiments; shops have tall roofs and genuinely recessed glass", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    day: 18,
    metMom: true,
    position: { x: -14, z: 10 },
  });
  await setup(page, s);
  const geometry = await page.evaluate(() => (window as any).game.polish());
  expect(geometry.windows).toBeGreaterThan(12);
  expect(geometry.roofs.every((r: any) => r.base > 7 && r.top > 9)).toBe(true);
  await page.evaluate(() => {
    const m = (window as any).game.targets.find((t: any) => t.id === "mom");
    (window as any).game.teleport(m.x, m.z);
  });
  await frames(page);
  await page.keyboard.press("e");
  await frames(page, 60);
  await page
    .getByRole("button", { name: "Add something to Auntie’s letter" })
    .click();
  await page
    .getByLabel("What would you like Mom to add?")
    .fill("Sending you a pocketful of sunshine.");
  await page
    .getByRole("button", { name: "Add to the letter", exact: true })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText(
    "Beautiful sentiment",
  );
});

test("Bea welcomes the recovering family outside and leads them through her doorway", async ({
  page,
}) => {
  const s = fresh();
  s.cash = 1000000;
  scheduleSurgery(s);
  s.day = 7;
  s.awake = true;
  s.familyStory!.called = true;
  s.familyStory!.awakeSeconds = 120;
  s.familyStory!.escort = true;
  s.position = { x: 12, z: 20.5 };
  await setup(page, s);
  await page.evaluate(() => {
    const bea = (window as any).game.targets.find((t: any) => t.id === "npc1");
    (window as any).game.teleport(bea.x + 1.3, bea.z);
  });
  await frames(page, 30);
  await page.keyboard.press("e");
  await frames(page, 60);
  await expect(page.locator(".speech-bubble")).toContainText("both");
  await page.getByRole("button", { name: "Lead us in" }).click();
  expect(
    (await page.evaluate(() => (window as any).game.polish())).guiding,
  ).toBe(true);
  const { walkTo } = await import("./movement");
  await walkTo(page, 12, 19.2);
  await walkTo(page, 12, 16.9);
  const positions: number[][] = [];
  for (let i = 0; i < 80; i++) {
    await page.clock.fastForward(200);
    const bea = await page.evaluate(() =>
      (window as any).game.targets.find((t: any) => t.id === "npc1"),
    );
    positions.push([bea.x, bea.z - 1]);
    if (!(await page.evaluate(() => (window as any).game.polish())).guiding)
      break;
  }
  expect(
    (await page.evaluate(() => (window as any).game.polish())).guiding,
  ).toBe(false);
  await expect(page.locator(".speech-bubble")).toContainText("pour the tea");
});
