import { strategies } from "../../src/market";
import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { newMillionaire } from "../../src/millionaire";
import { buyMansion } from "../../src/housing";
import { createCoin } from "../../src/sigma";
import { newPhoneGame } from "../../src/phone-games";
const base = () =>
  Object.assign(fresh(), {
    awake: true,
    foundTVSeeds: true,
    communityPlanted: true,
    pepePopped: true,
    pepeShowStarted: true,
    pepeInflation: 12,
    cash: 300000,
    metMom: true,
    millionaire: {
      ...newMillionaire(),
      afterPepe: 100000,
      unlocked: true,
      answers: Array(12).fill(2),
      result: "fire" as const,
      member: "fire" as const,
      welcomeSeed: true,
      summitSeeds: true,
      titheAccepted: true,
      mountainEarned: 100000,
      apps: [0, 1, 2, 3, 4, 5],
    },
  });
async function frames(page: Page, n = 20) {
  for (let i = 0; i < n; i++) await page.clock.fastForward(40);
}
async function start(page: Page, s: any) {
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript((s) => {
    if (!localStorage.getItem("money-tree-v1"))
      localStorage.setItem("money-tree-v1", JSON.stringify(s));
  }, s);
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await frames(page);
}
test("keyboard memory game remains playable through three Play again sessions", async ({
  page,
}) => {
  const s = base();
  await start(page, s);
  await page.locator("#membership-hud").click();
  await page
    .getByRole("button", { name: "Memory Ministry", exact: true })
    .click();
  let cursor = 0;
  for (let session = 0; session < 3; session++) {
    const cards = newPhoneGame(4, session === 0 ? 17 : 17 + session).cards;
    for (let value = 0; value < 10; value++) {
      for (let index = 0; index < 20; index++) {
        if (cards[index] !== value) continue;
        while (cursor < index) {
          await page.keyboard.press("d");
          cursor++;
        }
        while (cursor > index) {
          await page.keyboard.press("a");
          cursor--;
        }
        await page.keyboard.press("Enter");
      }
      await frames(page, 2);
    }
    await expect(
      page.getByRole("button", { name: "Play again", exact: true }),
    ).toBeVisible();
    expect((await page.evaluate(() => (window as any).game.state())).cash).toBe(
      300000 + (session + 1) * 100,
    );
    if (session < 2) {
      await page
        .getByRole("button", { name: "Play again", exact: true })
        .click();
      await expect(page.locator("#phone-game")).toBeFocused();
      cursor = 0;
      await page.keyboard.press("ArrowDown");
      cursor = 4;
    }
  }
});
for (const style of ["hearst", "vernon"] as const)
  test(`${style} mansion loads empty, accepts a bed, and exposes mortgage and furnishing store`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const s = base();
    buyMansion(s, style, true);
    s.housing!.movingInSeen = true;
    s.position = { x: 88, z: -335 };
    s.furnitureBag = ["royal-bed"];
    await start(page, s);
    await expect(page.locator("#mortgage-hud")).toContainText("$999000.00");
    expect(
      (await page.evaluate(() => (window as any).game.state())).furniture ?? [],
    ).toHaveLength(0);
    await page.keyboard.press("F5");
    await page
      .getByRole("button", { name: "Preview Carved canopy bed", exact: true })
      .click();
    await frames(page);
    await page.keyboard.press("e");
    await frames(page);
    const state = await page.evaluate(() => (window as any).game.state());
    expect(state.furniture).toHaveLength(1);
    expect(state.housing.momBed).toBe(false);
    expect(
      (await page.evaluate(() => (window as any).game.spaceEstate())).mom[2],
    ).toBeGreaterThan(-5);
    await page.keyboard.press("F5");
    await page.evaluate(() => (window as any).game.teleport(-34, -311));
    await frames(page);
    await page.keyboard.press("e");
    await expect(
      page.getByRole("heading", { name: "Mansion Marvels", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
    if (process.env.MONEY_TREE_CAPTURE) {
      await page.keyboard.press("Escape");
      await page.evaluate(() => (window as any).game.estateView());
      await page.screenshot({
        path: `${process.env.MONEY_TREE_CAPTURE}/${style}-estate.png`,
      });
    }
  });
for (const distant of [false, true])
  test(`meteor makes one crater tree and one price crash and persists through reload (distant=${distant})`, async ({
    page,
  }) => {
    const s = base();
    s.day = 2;
    s.position = distant ? { x: -16, z: 4 } : { x: -75, z: -180 };
    createCoin(s, "SpaceTree");
    s.coin!.price = 10000;
    s.coin!.exactPrice = 10000;
    s.adventure = { meteorCadence: 1, meteorNextDay: 2, meteorNextAt: 0 };
    await start(page, s);
    await page.evaluate(() => (window as any).game.advanceSpace(3));
    await frames(page, 90);
    const state = await page.evaluate(() => (window as any).game.state());
    expect(state.adventure.meteors).toHaveLength(1);
    expect(state.adventure.meteors[0].landed).toBe(true);
    expect(state.adventure.meteors[0].seedPackets).toBe(1023);
    const syncs = await page.evaluate(
      () => (window as any).game.spaceEstate().meteorSyncs,
    );
    await page.evaluate(() => {
      (window as any).game.meteorIdleUpdates(300);
    });
    expect(
      await page.evaluate(() => (window as any).game.spaceEstate().meteorSyncs),
    ).toEqual(syncs);
    console.log("300 unchanged meteor updates", {
      craterSyncs: 0,
      packetSyncs: 0,
    });
    const packet = await page.evaluate(() =>
      (window as any).game.targets.find((t: any) => t.id === "meteor-seed-1-0"),
    );
    expect(packet).toBeTruthy();
    await page.evaluate((p) => (window as any).game.teleport(p.x, p.z), packet);
    await frames(page);
    await frames(page);
    expect(
      (await page.evaluate(() => (window as any).game.state())).seeds,
    ).toBe(state.seeds + 5);

    expect(
      await page.evaluate(() => (window as any).game.spaceEstate().meteorSyncs),
    ).toEqual({
      craterSyncs: syncs.craterSyncs,
      packetSyncs: syncs.packetSyncs + 1,
    });
    expect(state.plots[state.adventure.meteors[0].plot].meteor).toBe(
      state.adventure.meteors[0].id,
    );
    expect(state.coin.price).toBe(8200);
    expect(state.plots[state.adventure.meteors[0].plot].stage).toBe("ready");
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    await frames(page);
    const reloaded = await page.evaluate(() => (window as any).game.state());
    expect(reloaded.coin.price).toBe(8200);
    expect(reloaded.adventure.meteors).toHaveLength(1);
    expect(reloaded.adventure.meteors[0].seedPackets).toBe(1022);
    if (process.env.MONEY_TREE_CAPTURE) {
      await page.evaluate(() => (window as any).game.craterView());
      await page.screenshot({
        path: process.env.MONEY_TREE_CAPTURE + "/crater.png",
      });
    }
  });
async function approach(page: Page, id: string) {
  await page.evaluate((id) => {
    const game = (window as any).game,
      t = game.targets.find((t: any) => t.id === id);
    if (!t) throw Error(`Missing ${id}`);
    for (const [dx, dz] of [
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
      [0.7, 0.7],
    ])
      try {
        game.teleport(t.x + dx, t.z + dz);
        return;
      } catch {}
    throw Error(`No clear approach to ${id}`);
  }, id);
  await frames(page);
}
test("mascot offers a mortgage without moving Mom or the player, and the church buys equity back", async ({
  page,
}) => {
  const s = base();
  await start(page, s);
  await approach(page, "fellowship-fire");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "When are you going to build a mansion?",
  );
  await page
    .getByRole("button", { name: "How much does it cost?", exact: true })
    .click();
  await page
    .getByRole("button", { name: "I don’t have a million", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "But that will take 100,000 days!",
      exact: true,
    })
    .click();
  await expect(page.locator(".speech-bubble")).toContainText("166,667 days");
  await page
    .getByRole("button", { name: "Take the mortgage", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Magnate Mansion", exact: true })
    .click();
  await frames(page, 20);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).film,
  ).toBeNull();
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).mom[2],
  ).toBeGreaterThan(-5);
  const housed = await page.evaluate(() => (window as any).game.state());
  expect(housed.housing.movingInSeen).toBe(true);
  expect(housed.housing.momBed).toBe(false);
  await approach(page, "fellowship-fire");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("$1100.00");
  await page
    .getByRole("button", { name: "Sell my mansion for $1100.00", exact: true })
    .click();
  expect(
    (await page.evaluate(() => (window as any).game.state())).housing.status,
  ).toBe("sold");
});
test("missed daily payment drives the repo man to a permanently locked, empty home", async ({
  page,
}) => {
  const s = base();
  buyMansion(s, "vernon", true);
  s.housing!.movingInSeen = true;
  s.cash = s.bank = 0;
  s.position = { x: 88, z: -326 };
  await start(page, s);
  await page.evaluate(() => (window as any).game.sleep());
  await frames(page);
  await page.keyboard.press("e");
  await frames(page, 60);
  const eviction = await page.evaluate(() =>
    (window as any).game.spaceEstate(),
  );
  expect(eviction.housing.status).toBe("evicted");
  expect(eviction.film.kind).toBe("repo");
  await frames(page, 180);
  expect(
    (await page.evaluate(() => (window as any).game.spaceEstate())).housing
      .evictionSeen,
  ).toBe(true);
  await page.evaluate(() => (window as any).game.teleport(88, -327));
  await page.keyboard.down("w");
  await frames(page, 80);
  await page.keyboard.up("w");
  expect(
    (await page.evaluate(() => (window as any).game.state())).position.z,
  ).toBeGreaterThan(-328.3);
});
test("feather gift retains the hen name and completes after the player reply and handoff", async ({
  page,
}) => {
  const s = base();
  s.cash = 0;
  s.day = 2;
  s.adventure = { feather: { chicken: "Cluck", day: 1 }, lastCuddleDay: 1 };
  await start(page, s);
  await approach(page, "mom");
  if (
    !(await page.locator(".speech-bubble").filter({ hasText: "Cluck" }).count())
  )
    await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText("Cluck");
  await page.keyboard.press("e");
  await frames(page, 90);
  await expect(page.locator(".speech-bubble")).toContainText("good luck");
  const gifted = await page.evaluate(() => (window as any).game.state());
  expect(gifted.adventure.feather).toBeUndefined();
  expect(gifted.adventure.feathersGiven).toBe(1);
});
test("Fancy Chicken takes a berry instead of a cuddle and only Chads offer trading strategy", async ({
  page,
}) => {
  const s = base();
  createCoin(s, "Strategy");
  await start(page, s);
  await approach(page, "chicken-5");
  await page.keyboard.press("e");
  await frames(page, 30);
  expect(
    (await page.evaluate(() => (window as any).game.state())).chickenCuddles ??
      0,
  ).toBe(0);
  await expect(page.locator("#toast")).toContainText("buh-dup");
  await approach(page, "grindset");
  await page.keyboard.press("e");
  await expect(page.locator(".speech-bubble")).toContainText(
    "trading strategy",
  );
  await page
    .getByRole("button", {
      name: "Tell me about your trading strategy",
      exact: true,
    })
    .click();
  const strategy = (
    await page.evaluate(() => (window as any).game.state())
  ).coin.traders.find((t: any) => t.id === "grindset").strategy;
  await expect(page.locator(".speech-bubble")).toContainText(
    strategies[strategy],
  );
  const traders = (await page.evaluate(() => (window as any).game.state())).coin
    .traders;
  expect(traders.some((t: any) => t.id === "npc2")).toBe(false);
});
