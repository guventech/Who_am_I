import { defineConfig, devices } from "@playwright/test";
const production = process.env.PLAYWRIGHT_PRODUCTION === "true";

export default defineConfig({
  testDir: "./e2e",
  testMatch: production ? "production.spec.ts" : "**/*.spec.ts",
  testIgnore: production ? [] : ["**/production.spec.ts"],
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL,
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: production
      ? "pnpm exec next start --port 3001"
      : "pnpm exec next dev --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
