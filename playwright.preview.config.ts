import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: /preview-smoke\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-preview' }]],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-preview',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-preview',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm exec vite preview --host 0.0.0.0 --port 5174',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
  ...(isCI ? { workers: 1 } : {}),
});