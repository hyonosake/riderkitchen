import { expect, type Page, test } from '@playwright/test'
import { collectRuntimeErrors } from './support'

// Responsive-проверки: «ничего не вылезает / не ломается» на всех
// вьюпортах проекта. Набор вьюпортов — в playwright.config.ts
// (mobile-375x667, narrow-mobile-320x568, tablet-768x1024,
// desktop-1440x900); каждый тест выполняется на каждом из них.
//
// Селекторы сверены с фактической разметкой компонентов:
// Header.tsx (.header__bar/.header__cart), Hero.tsx (.hero__inner),
// MenuSection.tsx / SetsSection.tsx (.menu-section, #sets),
// CartDrawer.tsx (.cart-drawer, .cart-overlay), Footer.tsx (.footer).

// Допуск на округление/скроллбар: 2px не маскирует реальные
// переполнения (те обычно дают десятки-сотни пикселей).
const OVERFLOW_TOLERANCE_PX = 2

// Горизонтальное переполнение документа (нет «едущего вбок» layout).
async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect
    .soft(scrollWidth, `scrollWidth (${scrollWidth}) <= clientWidth (${clientWidth}) + допуск`)
    .toBeLessThanOrEqual(clientWidth + OVERFLOW_TOLERANCE_PX)
}

test.describe('главная страница на всех вьюпортах', () => {
  test('нет горизонтального переполнения', async ({ page }) => {
    await page.goto('/')
    await expectNoHorizontalOverflow(page)
  })

  test('ключевые блоки видимы', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page)
    await page.goto('/')

    // Ключевые блоки: sticky-хедер, hero, 7 секций меню + секция
    // сетов (тоже .menu-section, id=sets), футер.
    await expect(page.locator('.header__bar')).toBeVisible()
    await expect(page.locator('.hero__inner')).toBeVisible()
    await expect(page.locator('main section.menu-section')).toHaveCount(8)
    await expect(page.locator('#sets')).toBeVisible()
    await expect(page.locator('.footer')).toBeVisible()

    // Ни неперехваченных JS-ошибок, ни ошибок консоли (после фильтра шума).
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  // Заголовок hero — ровно 2 строки (hero.titleLines) в каждом
  // шрифтовом варианте: размер подгоняется в 03-hero.css через
  // --hero-title-em. Варианты — src/content/debugVariants.ts.
  for (const fonts of [null, 'f', 'g', 'h', 'i']) {
    test(`заголовок hero в 2 строки (шрифты ${fonts ?? 'B'})`, async ({ page }) => {
      await page.addInitScript((id) => {
        if (id) localStorage.setItem('rk-fonts', id)
      }, fonts)
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const lines = await page.locator('.hero__title').evaluate((title) => {
        const lineHeight = parseFloat(getComputedStyle(title).lineHeight)
        return Math.round(title.getBoundingClientRect().height / lineHeight)
      })
      expect(lines).toBe(2)
    })
  }

  test('фото карточек загружаются (naturalWidth > 0)', async ({ page }) => {
    await page.goto('/')

    // loading="lazy": элементы надо прокрутить в зону видимости, иначе
    // браузер не начнёт загрузку. Берём первую карточку каждой секции.
    // Секции без фото в контенте 2 (гарниры/напитки — см. menu.ts).
    const sections = page.locator('main section.menu-section')
    const sectionCount = await sections.count()

    for (let i = 0; i < sectionCount; i += 1) {
      const image = sections.nth(i).locator('.dish-card__image').first()
      if ((await image.count()) === 0) continue

      await image.scrollIntoViewIfNeeded()
      await expect
        .poll(async () => image.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
          timeout: 10_000,
          message: `фото в секции #${i} должно загрузиться`,
        })
        .toBeGreaterThan(0)
    }

    // Коллаж hero — реальные фото блюд, все загружаются.
    const heroPlates = page.locator('.hero__plate-img')
    await expect(heroPlates).toHaveCount(4)
    await expect
      .poll(
        async () =>
          heroPlates.evaluateAll((els) =>
            Math.min(...els.map((el) => (el as HTMLImageElement).naturalWidth)),
          ),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0)
  })
})

test.describe('корзина-drawer на всех вьюпортах', () => {
  test('открытие/закрытие: не выходит за вьюпорт, переполнения нет', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page)
    await page.goto('/')

    // Добавляем позицию, чтобы drawer открылся с содержимым.
    await page.getByRole('button', { name: /Добавить «.+» в заказ/ }).first().click()
    await page.locator('.header__cart').click()

    const drawer = page.locator('.cart-drawer')
    await expect(drawer).toBeVisible()

    // Drawer доезжает до финальной позиции (transition transform
    // 0.25s — сразу после открытия boundingBox может быть в пути).
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    if (!viewport) return
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox()
        return box ? box.x + box.width : Number.POSITIVE_INFINITY
      }, 'drawer должен доехать до правого края и не выходить за вьюпорт')
      .toBeLessThanOrEqual(viewport.width)

    const box = await drawer.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect.soft(box.x).toBeGreaterThanOrEqual(0)
      expect.soft(box.y).toBeGreaterThanOrEqual(0)
      expect.soft(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    }

    // Страница под drawer тоже без горизонтального переполнения.
    await expectNoHorizontalOverflow(page)

    // Закрытие крестиком — drawer скрывается, переполнения нет.
    await drawer.locator('.cart-drawer__close').click()
    await expect(drawer).toBeHidden()
    await expectNoHorizontalOverflow(page)

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  // Нижняя панель корзины (CartBar.tsx) — только на ≤720px, где у
  // кнопки корзины в хедере нет суммы; на планшете/десктопе её нет.
  test('нижняя панель корзины: мобильные — есть и открывает drawer', async ({ page }) => {
    await page.goto('/')
    const bar = page.locator('.cart-bar')
    await expect(bar).toHaveCount(0)

    await page.getByRole('button', { name: /Добавить «.+» в заказ/ }).first().click()
    const isMobile = (page.viewportSize()?.width ?? 0) <= 720
    if (!isMobile) {
      await expect(bar).toBeHidden()
      return
    }

    await expect(bar).toBeVisible()
    await expect(bar).toContainText('1 позиция')
    await bar.getByRole('button').click()
    await expect(page.locator('.cart-drawer')).toBeVisible()
  })

  test('закрытие кликом по подложке', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Добавить «.+» в заказ/ }).first().click()
    await page.locator('.header__cart').click()
    await expect(page.locator('.cart-drawer')).toBeVisible()

    // Подложка покрывает весь экран; кликаем в левый верхний угол,
    // мимо drawer (он справа) и мимо дебаг-тулбара (справа внизу).
    await page.locator('.cart-overlay').click({ position: { x: 5, y: 5 } })
    await expect(page.locator('.cart-drawer')).toBeHidden()
  })
})
