// @ts-check
import { defineConfig, devices } from '@playwright/test'

// E2E EXTERNO: corre los mismos tests de e2e/ contra la app publicada en un túnel,
// o sea, entrando "desde afuera" como lo haría cualquier usuario por internet.
//
// La URL del túnel cambia según quién lo abra, por eso se pasa por variable:
//   E2E_BASE_URL=https://xxxx-5173.brs.devtunnels.ms npm run test:e2e:external
const BASE_URL = process.env.E2E_BASE_URL || 'https://j7nfxz05-5173.brs.devtunnels.ms/'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'list',

  expect: {
    timeout: 15_000, // el túnel agrega demora, damos más margen a cada espera
  },

  use: {
    baseURL: BASE_URL,
    // Evita la pantalla de aviso "You are about to connect to a developer tunnel"
    extraHTTPHeaders: { 'X-Tunnel-Skip-AntiPhishing-Page': 'true' },
    headless: false,
    channel: 'msedge',
    launchOptions: {
      slowMo: 800, // cámara lenta para que se vea bien en la demo
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

