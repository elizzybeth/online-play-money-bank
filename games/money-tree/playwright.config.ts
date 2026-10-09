import { defineConfig } from "@playwright/test";
const browserName = (process.env.MONEY_TREE_BROWSER ?? "chromium") as
  "chromium" | "firefox" | "webkit";
export default defineConfig({
  expect: { timeout: 15000 },
  testDir: "tests/browser",
  timeout: 120000,
  workers: 1,
  use: {
    browserName,
    baseURL: process.env.MONEY_TREE_BASE_URL ?? "http://127.0.0.1:5173/",
    viewport: { width: 1280, height: 800 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
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
        command: "node node_modules/vite/bin/vite.js --host 127.0.0.1",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
      },
});
