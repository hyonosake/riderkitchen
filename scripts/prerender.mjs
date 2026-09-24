// Пререндер для краулеров без JS (см. docs/PLAN.md, этап 4 — SEO):
// поднимаем собранный dist через `vite preview` (уважает base из
// vite.config.ts), открываем страницу headless-браузером, дожидаемся
// React-рендера и подменяем dist/index.html полным HTML вместо пустого
// <div id="root">. В браузере createRoot() всё равно перерисует то же
// самое поверх при загрузке — сайт остаётся обычным CSR, просто
// краулер без JS в первом же ответе видит меню, а не пустышку.
import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const PORT = 4321
const READY_TIMEOUT_MS = 15_000

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}

// URL берём из вывода `vite preview`, а не собираем сами из base —
// иначе при переезде на прод (base меняется на '/') пришлось бы
// не забыть поправить и этот скрипт.
function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const timer = setTimeout(() => {
      proc.kill()
      reject(new Error(`vite preview не вышел на связь за ${READY_TIMEOUT_MS}мс`))
    }, READY_TIMEOUT_MS)

    let buffered = ''
    const onData = (chunk) => {
      buffered += stripAnsi(chunk.toString())
      const match = buffered.match(/Local:\s+(http:\/\/localhost:\d+\/\S*)/)
      if (match) {
        clearTimeout(timer)
        proc.stdout.off('data', onData)
        resolve({ proc, url: match[1] })
      }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', (chunk) => process.stderr.write(chunk))
    proc.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    proc.once('exit', (code) => {
      if (code) {
        clearTimeout(timer)
        reject(new Error(`vite preview завершился с кодом ${code}`))
      }
    })
  })
}

const { url } = await startPreview()

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(url, { waitUntil: 'domcontentloaded' })
// Ждём реальный признак того, что React смонтировался и отрисовал
// меню, а не networkidle — иначе пререндер завязан на загрузку
// шрифтов с Google Fonts (медленно и не нужно для самого HTML).
await page.waitForSelector('.dish-card__name')
const html = await page.evaluate(() => document.documentElement.outerHTML)
await writeFile('dist/index.html', `<!doctype html>\n${html}\n`)
console.log('Пререндер: dist/index.html обновлён статическим HTML.')

// Файл уже записан — дальше graceful browser.close()/proc.kill() не
// нужны. В Docker-сборке (RUN npm run build) PID 1 — голый `sh -c`,
// который не пожинает зомби-процессы Chromium (zygote/рендереры), и
// ожидание закрытия браузера виснет навсегда. Контейнер сборки всё
// равно останавливается сразу после этого шага — process.exit()
// обрывает vite preview и Chromium вместе с ним.
process.exit(0)
