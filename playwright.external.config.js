// @ts-check
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,

  expect: {
    timeout: 15_000, // Aumenta la tolerancia de 5 a 15 segundos para elementos lentos
  },

  use: {
    //URL PÚBLICA DEL TÚNEL DE VS CODE
    baseURL: 'https://j7nfxz05-5173.brs.devtunnels.ms/',

    headless: false,
    channel: 'msedge',
    launchOptions: {
      slowMo: 800, // Cámara lenta para que se vea bien la demo
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})