import type { Page } from '@playwright/test'

// Шумы, которые не считаем ошибками приложения:
// - favicon — в index.html нет favicon-ссылки, браузер сам запрашивает
//   /favicon.ico и получает 404;
// - внешние ресурсы (Google Fonts в index.html) — тесты не должны
//   зависеть от доступности интернета;
// - net::ERR_* — сетевые сбои загрузки ресурсов.
const NOISE_PATTERNS: RegExp[] = [
  /favicon/i,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /net::ERR_/,
]

// Собирает ошибки уровня error из консоли и неперехваченные исключения
// страницы. Накопитель возвращается тесту: в конце сверьте его с
// expect(...).toEqual([]) — падение привяжется к конкретному тесту.
export function collectRuntimeErrors(page: Page): {
  consoleErrors: string[]
  pageErrors: string[]
} {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    // В тексте сетевых ошибок URL ресурса не всегда присутствует —
    // добавляем location.url, чтобы фильтр шума видел адрес.
    const text = `${message.text()} ${message.location().url}`
    if (!NOISE_PATTERNS.some((pattern) => pattern.test(text))) {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })
  return { consoleErrors, pageErrors }
}
