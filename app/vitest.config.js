import { defineConfig } from 'vitest/config'

// Test-only config (the app itself is built by electron.vite.config.js).
// Component tests render real .jsx sources, which don't import React — so the
// automatic JSX runtime is required, same as the react plugin gives the app.
export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  }
})
