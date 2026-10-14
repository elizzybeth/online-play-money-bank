import { test, expect, type Page } from "@playwright/test";
import { fresh } from "../../src/game";
import { shopCost } from "../../src/family-story";
function state(told?: boolean, ready = false) {
  const s = fresh();
  s.day = 8;
  s.awake = true;
  s.metMom = s.metRobertson = true;
  s.position = { x: 8, z: -30.2 };
  s.cash = ready ? shopCost : 123456;
  s.bank = ready ? 321 : 800000;
  s.familyStory = {
    scheduledDay: 1,
    surgeryDay: 2,
    awakeSeconds: 120,
    called: true,
    escort: false,
    teaStep: 6,
    shopGoal: true,
    ...(told === undefined
      ? {}
      : { shopPlan: told ? ("told" as const) : ("secret" as const) }),
  };
  return s;
}
async function frames(page: Page, n = 8, ms = 64) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(ms);
}
async function start(page: Page, s: ReturnType<typeof state>) {
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await frames(page);
}
async function talk(page: Page) {
  await page.evaluate(() => (window as any).game.teleport(8, -30.2));
  await frames(page);
  await expect(page.locator("#prompt")).toContainText("Robertson");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toBeVisible();
}
test("Robertson remembers his shop and a revealed rescue offers saved exact/vague check-ins", async ({
  page,
}) => {
  await start(page, state());
  await talk(page);
  await expect(page.locator(".speech-bubble")).toContainText("1800s");
  await page
    .getByRole("button", { name: "I’m fighting to save your store" })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("thank you");
  await page.getByRole("button", { name: "Look around", exact: true }).click();
  await talk(page);
  await expect(page.locator(".speech-bubble")).toContainText("Lots more farms");
  await page.getByRole("button", { name: "Here’s exactly where I am" }).click();
  await expect(page.locator(".speech-bubble")).toContainText("$9234.56 saved");
  await expect(page.locator(".speech-bubble")).toContainText("$90765.44");
  await page.reload();
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
  await talk(page);
  await expect(page.locator(".speech-bubble")).toContainText("penny candy");
  await expect(page.locator(".speech-bubble")).toContainText("How’s it going");
  await page.getByRole("button", { name: "I’m still working on it" }).click();
  const after = await page.evaluate(() => (window as any).game.state());
  expect(after.cash + after.bank).toBe(923456);
  expect(after.familyStory.shopPlan).toBe("told");
  expect(after.events.at(-1)).toContain("without giving numbers");
});
for (const told of [false, true])
  test(`${told ? "revealed" : "secret"} rescue pays once and gathers town and wildlife inside the store`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    await start(page, state(told, true));
    await expect(page.locator("#objective")).toHaveText(
      "Go tell Ol’ Man Robertson",
    );
    await talk(page);
    await page.keyboard.press("e");
    await expect(page.locator(".speech-bubble")).toContainText(
      told ? "never gave up" : "without a word",
    );
    const paid = await page.evaluate(() => (window as any).game.state());
    expect(paid.cash).toBe(0);
    expect(paid.bank).toBe(321);
    expect(paid.familyStory.shopSaved).toBe(true);
    await page.keyboard.press("e");
    await frames(page, 22, 200);
    const party = await page.evaluate(
      () => (window as any).game.family().party,
    );
    expect(party.kind).toBe("shop");
    expect(party.people).toBeGreaterThan(7);
    expect(party.birds).toBeGreaterThan(0);
    expect(party.butterflies).toBeGreaterThan(0);
    expect(party.chickens).toBeGreaterThan(0);
    for (const [x, , z] of party.positions) {
      expect(x).toBeGreaterThan(1.5);
      expect(x).toBeLessThan(10.5);
      expect(z).toBeGreaterThan(-32);
      expect(z).toBeLessThan(-24);
    }
    if (process.env.MONEY_TREE_CAPTURE)
      await page.screenshot({ path: process.env.MONEY_TREE_CAPTURE });
    await frames(page, 52, 200);
    expect(
      await page.evaluate(() => (window as any).game.family().celebrating),
    ).toBe(false);
    await expect(page.locator(".speech-bubble")).toContainText(
      "another morning",
    );
    await expect(page.locator("#objective")).toHaveText(
      "Robertsons is here to stay",
    );
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    await frames(page);
    await talk(page);
    await expect(
      page.getByRole("button", { name: /I saved \$100,000/ }),
    ).toHaveCount(0);
    expect((await page.evaluate(() => (window as any).game.state())).bank).toBe(
      321,
    );
    expect(
      await page.evaluate(() => (window as any).game.family().celebrating),
    ).toBe(false);
  });
