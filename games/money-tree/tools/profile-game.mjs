// Run with node --import tsx. Raw native profiles stay in the requested local directory.
import { chromium } from "@playwright/test";
import { fresh } from "../src/game.ts";
import { applyDebugAction } from "../src/debug-menu.ts";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const output = path.resolve(
  process.env.MONEY_TREE_PROFILE_DIR ?? "/private/tmp/money-tree-profiles",
);
await mkdir(output, { recursive: true });
const base = process.env.MONEY_TREE_BASE_URL ?? "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CI
    ? undefined
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const reports = [];
try {
  for (const instrumented of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    const state = Object.assign(fresh(), { awake: true, metMom: true, day: 4 });
    applyDebugAction(state, "level3");
    await page.addInitScript((s) => {
      if (!localStorage.getItem("money-tree-v1"))
        localStorage.setItem("money-tree-v1", JSON.stringify(s));
    }, state);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Network.enable");
    const network = { requests: 0, bytes: 0, failed: 0, cached: 0 };
    cdp.on("Network.requestServedFromCache", () => network.cached++);
    cdp.on("Network.requestWillBeSent", () => network.requests++);
    cdp.on(
      "Network.loadingFinished",
      (e) => (network.bytes += e.encodedDataLength),
    );
    cdp.on("Network.loadingFailed", () => network.failed++);
    await page.goto(base + "?test" + (instrumented ? "&profile" : ""));
    await page.getByRole("button", { name: "Wake up" }).click();
    await page.waitForTimeout(1500);
    const startupNetwork = { ...network };
    for (const [name, x, z] of [
      ["town", 3, -20],
      ["maze", -57, -34.7],
      ["mountain", 34, -370],
    ]) {
      await page.evaluate(([x, z]) => window.game.teleport(x, z), [x, z]);
      await page.waitForTimeout(1200);
      await cdp.send("HeapProfiler.collectGarbage");
      const before = await cdp.send("Performance.getMetrics");
      await page.evaluate(() => window.moneyTreeProfile?.reset());
      const netBefore = { ...network };
      await cdp.send("Profiler.enable");
      await cdp.send("Profiler.start");
      await cdp.send("HeapProfiler.startSampling", { samplingInterval: 32768 });
      await cdp.send("Tracing.start", {
        categories: "devtools.timeline,v8,gpu",
        transferMode: "ReturnAsStream",
      });
      const started = Date.now();
      await page.waitForTimeout(4000);
      await page.keyboard.down("w");
      await page.waitForTimeout(2000);
      await page.keyboard.up("w");
      const cpu = await cdp.send("Profiler.stop");
      const heap = await cdp.send("HeapProfiler.stopSampling");
      const traceDone = new Promise((resolve) =>
        cdp.once("Tracing.tracingComplete", resolve),
      );
      await cdp.send("Tracing.end");
      const { stream } = await traceDone;
      let trace = "";
      while (true) {
        const part = await cdp.send("IO.read", { handle: stream });
        trace += part.data;
        if (part.eof) break;
      }
      await cdp.send("IO.close", { handle: stream });
      const tag = `${instrumented ? "instrumented" : "baseline"}-${name}`;
      await writeFile(
        path.join(output, tag + ".cpuprofile"),
        JSON.stringify(cpu.profile),
      );
      await writeFile(
        path.join(output, tag + ".heapprofile"),
        JSON.stringify(heap.profile),
      );
      await writeFile(path.join(output, tag + ".trace.json"), trace);
      await cdp.send("HeapProfiler.collectGarbage");
      const after = await cdp.send("Performance.getMetrics");
      const program = await page.evaluate(async () => ({
        profile: window.moneyTreeProfile?.snapshot(),
        render: window.game.renderStats(),
        updates: window.game.updateWork(),
        storage: await navigator.storage.estimate(),
        snapshotBytes: (await window.game.savedRaw())?.length ?? 0,
      }));
      const metrics = Object.fromEntries(
        after.metrics.map((m) => [m.name, m.value]),
      );
      const old = Object.fromEntries(
        before.metrics.map((m) => [m.name, m.value]),
      );
      reports.push({
        tag,
        wallMs: Date.now() - started,
        startupNetwork,
        network: {
          requests: network.requests - netBefore.requests,
          bytes: network.bytes - netBefore.bytes,
          failed: network.failed - netBefore.failed,
        },
        native: {
          heapUsed: metrics.JSHeapUsedSize,
          heapDelta: metrics.JSHeapUsedSize - old.JSHeapUsedSize,
          taskSeconds: metrics.TaskDuration - old.TaskDuration,
          layoutCount: metrics.LayoutCount - old.LayoutCount,
          nodes: metrics.Nodes,
        },
        program,
      });
      console.log(JSON.stringify(reports.at(-1)));
    }
    const retention = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const [x, z] of [
        [3, -20],
        [-57, -34.7],
        [34, -370],
      ]) {
        await page.evaluate(([x, z]) => window.game.teleport(x, z), [x, z]);
        await page.waitForTimeout(500);
      }
      await cdp.send("HeapProfiler.collectGarbage");
      const metrics = await cdp.send("Performance.getMetrics");
      retention.push({
        cycle,
        heap: metrics.metrics.find((m) => m.name === "JSHeapUsedSize")?.value,
        render: await page.evaluate(() => window.game.renderStats()),
      });
    }
    const preReload = { ...network };
    await page.reload();
    await page.getByRole("button", { name: "Wake up" }).click();
    await page.waitForTimeout(500);
    await writeFile(
      path.join(
        output,
        `${instrumented ? "instrumented" : "baseline"}-retention.json`,
      ),
      JSON.stringify(
        {
          retention,
          cold: startupNetwork,
          warmReload: {
            requests: network.requests - preReload.requests,
            bytes: network.bytes - preReload.bytes,
            cached: network.cached - preReload.cached,
          },
        },
        null,
        2,
      ),
    );
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "summary.json"),
    JSON.stringify(reports, null, 2),
  );
}
