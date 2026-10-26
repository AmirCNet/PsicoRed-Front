// @ts-check
import { defineConfig, devices } from '@playwright/test'

// Config para demo visual: browser visible + lento (800ms entre acciones)
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    launchOptions: {
      slowMo: 800,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] ,
      channel: 'msedge'},
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
