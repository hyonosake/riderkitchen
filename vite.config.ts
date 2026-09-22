/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Юнит-тесты (vitest): jsdom глобально — хук- и компонентные тесты
  // работают без docblock-магии; чистые функции от этого не страдают.
  // Глобалы выключены — явные import { describe, it, expect } from 'vitest'.
  // Playwright (e2e) живёт отдельно в playwright.config.ts и этот блок не читает.
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
})
