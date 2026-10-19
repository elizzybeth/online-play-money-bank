import { defineConfig } from "@playwright/test";
import full from "./playwright.config";

// Keep one real-browser wiring check; game rules and geometry run in Node.
export default defineConfig({
  ...full,
  testMatch: "smoke.spec.ts",
  testIgnore: [],
  timeout: 45000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  webServer: process.env.MONEY_TREE_BASE_URL
    ? undefined
    : {
        command: "node tools/serve-game.mjs",
        env: {
          MONEY_TREE_BUILD_DIR: process.env.MONEY_TREE_BUILD_DIR ?? "dist",
        },
        url: "http://127.0.0.1:5173",
        reuseExistingServer: false,
      },
  use: {
    ...full.use,
    baseURL:
      process.env.MONEY_TREE_BASE_URL ?? "http://127.0.0.1:5173/money-tree/",
    browserName: "chromium",
    viewport: { width: 400, height: 250 },
    launchOptions: {
      executablePath:
        process.env.MONEY_TREE_CHROMIUM_EXECUTABLE ??
        (process.env.CI
          ? undefined
          : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      args: ["--enable-unsafe-swiftshader"],
    },
  },
});
