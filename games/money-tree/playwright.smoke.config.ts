import { defineConfig } from "@playwright/test";
import full from "./playwright.config";

// Keep one real-browser wiring check; game rules and geometry run in Node.
export default defineConfig(full, {
  testMatch: "smoke.spec.ts",
  timeout: 45000,
  retries: 0,
  fullyParallel: false,
  workers: 1,
  use: {
    ...full.use,
    browserName: "chromium",
    viewport: { width: 800, height: 500 },
    launchOptions: {
      executablePath:
        process.env.MONEY_TREE_CHROMIUM_EXECUTABLE ??
        (process.env.CI
          ? undefined
          : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
});
