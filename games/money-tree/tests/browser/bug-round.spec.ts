import { test, expect, type Page } from "@playwright/test";
import { fresh, decode } from "../../src/game";
import { applyDebugAction } from "../../src/debug-menu";
import { mazePacket } from "../../src/farm-layout";
async function open(page: Page, s: ReturnType<typeof fresh>) {
  expect(decode(JSON.stringify(s))).not.toBeNull();
  await page.clock.install({ time: new Date("2026-01-01") });
  await page.clock.pauseAt(new Date("2026-01-02"));
  await page.addInitScript(
    (s) => localStorage.setItem("money-tree-v1", JSON.stringify(s)),
    s,
  );
  await page.goto("./?test");
  await page.getByRole("button", { name: "Wake up" }).click();
  await page.clock.fastForward(32);
}
test("maze packet respawning beneath a stationary player is collected once", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    seeds: 0,
    mazeSeedCooldown: 0.5,
    position: { ...mazePacket },
  });
  await open(page, s);
  for (let i = 0; i < 30; i++) await page.clock.fastForward(100);
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    5,
  );
  for (let i = 0; i < 5; i++) await page.clock.fastForward(100);
  expect((await page.evaluate(() => (window as any).game.state())).seeds).toBe(
    5,
  );
});
test("saved Pepe explosion stays settled after reload", async ({ page }) => {
  const s = fresh();
  applyDebugAction(s, "level3");
  Object.assign(s, { awake: true, metMom: true });
  await open(page, s);
  const packets = await page.evaluate(() => (window as any).game.pepePackets());
  expect(packets.filter((p: any) => p.visible)).toHaveLength(25);
  for (const packet of packets) expect(packet.position[1]).toBeLessThan(0.65);
});
test("removed garden beds release uploaded geometry without discarding shared textures", async ({
  page,
}) => {
  const s = Object.assign(fresh(), {
    awake: true,
    metMom: true,
    position: { x: -16, z: 21 },
  });
  await open(page, s);
  const memory = await page.evaluate(() =>
    (window as any).game.bedLifecycleCheck(),
  );
  console.log("bed lifecycle resource counts", memory);
  for (const sample of memory.slice(1)) expect(sample).toEqual(memory[0]);
});
