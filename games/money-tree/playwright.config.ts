import { defineConfig } from "@playwright/test";
const browserName = (process.env.MONEY_TREE_BROWSER ?? "chromium") as
  "chromium" | "firefox" | "webkit";
const compiled = !!process.env.MONEY_TREE_BUILD_DIR;
export default defineConfig({
  expect: { timeout: 15000 },
  testDir: "tests/browser",
  testIgnore: "**/smoke.spec.ts",
  // Software WebGL on shared CI runners renders the expanded town more slowly.
  timeout: process.env.CI ? 240000 : 120000,
  workers: 1,
  // Let shards divide individual independent cases, not entire slow files.
  fullyParallel: true,
  reporter: [["line"], ["./tools/browser-timing-reporter.ts"]],
  use: {
    browserName,
    baseURL:
      process.env.MONEY_TREE_BASE_URL ??
      (compiled
        ? "http://127.0.0.1:5173/money-tree/"
        : "http://127.0.0.1:5173/"),
    viewport: { width: 1280, height: 800 },
    screenshot: "only-on-failure",
    // Keep API/network timing traces and failure screenshots. Capturing a DOM
    // snapshot and GPU screenshot for every clock step dominates long films.
    trace: process.env.MONEY_TREE_FULL_TRACE
      ? "retain-on-failure"
      : {
          mode: "retain-on-failure",
          screenshots: false,
          snapshots: false,
          sources: false,
        },
    launchOptions: {
      ...(browserName === "firefox"
        ? { firefoxUserPrefs: { "webgl.force-enabled": true } }
        : {}),
      ...(process.env.CI || browserName !== "chromium"
        ? {}
        : {
            executablePath:
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          }),
      args:
        browserName === "chromium"
          ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
          : [],
    },
  },
  webServer: process.env.MONEY_TREE_BASE_URL
    ? undefined
    : {
        command: compiled
          ? "node tools/serve-game.mjs"
          : "node node_modules/vite/bin/vite.js --host 127.0.0.1",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: !compiled,
      },
});
