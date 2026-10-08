import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Permite entrar desde un túnel de VS Code (*.devtunnels.ms) para el E2E externo
    allowedHosts: ['.devtunnels.ms']
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false
  }
})

