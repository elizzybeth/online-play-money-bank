import type { Page } from "@playwright/test";
export async function walkTo(page: Page, x: number, z: number) {
  for (let i = 0; i < 200; i++) {
    const info = await page.evaluate(() => ({
      position: (window as any).game.state().position,
      forward: (window as any).game.camera().forward,
    }));
    const p = info.position,
      dx = x - p.x,
      dz = z - p.z,
      d = Math.hypot(dx, dz);
    if (d < 0.18) return;
    const scale = Math.min(1, 1 / d),
      tx = dx * scale,
      tz = dz * scale,
      [fx, , fz] = info.forward;
    const f = tx * fx + tz * fz,
      r = -tx * fz + tz * fx,
      n = Math.hypot(tx, tz),
      keys: string[] = [];
    if (Math.abs(f) > n * 0.38) keys.push(f > 0 ? "w" : "s");
    if (Math.abs(r) > n * 0.38) keys.push(r > 0 ? "d" : "a");
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(80, Math.max(16, (d / 4) * 1000)));
    for (const key of keys) await page.keyboard.up(key);
  }
  throw Error(`Keyboard walk failed to reach ${x},${z}`);
}
