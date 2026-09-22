import { defineConfig } from '@playwright/test'

// Порт dev-сервера Vite зафиксирован (--strictPort): если порт занят,
// сервер не молча переедет на 5174 (и baseURL не разъедется),
// а упадёт с явной ошибкой.
const PORT = 5173
const BASE_URL = `http://localhost:${PORT}`

// Сценарии корзины пишутся под десктоп (1440×900) — на остальных
// вьюпортах cart.spec.ts исключается, там работает responsive.spec.ts.
const CART_SPEC = /cart\.spec\.ts$/

export default defineConfig({
  testDir: './tests',
  // Только e2e-спеки (*.spec.ts). Юнит-тесты (*.test.ts) в tests/unit/
  // — зона Vitest (npm run test:unit): без этого Playwright подхватил
  // бы их и упал на импорте 'vitest'.
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'mobile-375x667',
      use: { viewport: { width: 375, height: 667 } },
      testIgnore: CART_SPEC,
    },
    {
      name: 'narrow-mobile-320x568',
      use: { viewport: { width: 320, height: 568 } },
      testIgnore: CART_SPEC,
    },
    {
      name: 'tablet-768x1024',
      use: { viewport: { width: 768, height: 1024 } },
      testIgnore: CART_SPEC,
    },
    {
      name: 'desktop-1440x900',
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],

  // Dev-сервер вместо vite preview: не требует предварительного build
  // и всегда тестирует актуальный код — надёжнее для повторных прогонов.
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
