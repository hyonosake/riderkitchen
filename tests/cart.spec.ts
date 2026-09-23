import { readFileSync } from 'node:fs'
import { expect, type Page, test } from '@playwright/test'
import { collectRuntimeErrors } from './support'

// E2E-сценарии корзины. Выполняются ТОЛЬКО на десктопном вьюпорте
// (1440×900): в playwright.config.ts остальные проекты исключают
// этот файл через testIgnore.
//
// Поведение сверено с исходниками:
// - PriceStepper.tsx: пилюля цены (aria-label «Добавить «X» в заказ —
//   N ₽») кликом превращается в степпер «− цена +» с «× N» сбоку;
// - Header.tsx: кнопка .header__cart, сумма .header__cart-total,
//   бейдж .header__cart-badge появляется при count > 0;
// - CartDrawer.tsx: «Сформировать заказ» — <a>, href подставляется
//   только при полном телефоне РФ (isPhoneRuComplete, 11 цифр),
//   иначе клик предотвращается; ссылка ведёт на
//   wa.me/<телефон>?text=<заказ> (contacts.whatsappHref);
// - exportPdf.ts: jsPDF сохраняет файл rider-kitchen-order.pdf
//   (page.waitForEvent('download')).

// Первая карточка меню — стабильная позиция для сценариев. Именно
// .dish-card: у сетов (первый раздел) тоже .dish-card__name, но
// карточка — .set-card.
async function firstDish(page: Page): Promise<{ name: string; price: number }> {
  const name = (await page.locator('.dish-card .dish-card__name').first().innerText()).trim()
  const addLabel = await page
    .getByRole('button', { name: `Добавить «${name}» в заказ` })
    .first()
    .getAttribute('aria-label')
  expect(addLabel).not.toBeNull()
  const match = addLabel?.match(/— (\d+) ₽$/)
  expect(match, `в aria-label пилюли «${name}» должна быть цена «— N ₽»`).not.toBeNull()
  return { name, price: Number(match![1]) }
}

async function openCart(page: Page): Promise<void> {
  await page.locator('.header__cart').click()
  await expect(page.locator('.cart-drawer')).toBeVisible()
}

test.describe('степперы на карточках и хедер', () => {
  test('клик по цене добавляет порцию, бейдж и сумма обновляются', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page)
    await page.goto('/')
    const { name, price } = await firstDish(page)

    const card = page.locator('.dish-card').filter({ hasText: name }).first()
    const pill = card.getByRole('button', { name: `Добавить «${name}» в заказ` })

    // До клика бейджа нет (рендерится только при cartCount > 0).
    await expect(page.locator('.header__cart-badge')).toHaveCount(0)

    await pill.click()
    const count = card.locator('.price-pill__count')
    await expect(count).toHaveText('× 1')
    await expect(page.locator('.header__cart-badge')).toHaveText('1')
    await expect(page.locator('.header__cart-total')).toHaveText(`${price} ₽`)

    // Вторая порция — уже через «+» степпера.
    await card.getByRole('button', { name: 'Добавить порцию' }).click()
    await expect(count).toHaveText('× 2')
    await expect(page.locator('.header__cart-badge')).toHaveText('2')
    await expect(page.locator('.header__cart-total')).toHaveText(`${price * 2} ₽`)

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})

test.describe('drawer корзины', () => {
  test('позиции в списке, степперы меняют количество, удаление до нуля', async ({ page }) => {
    await page.goto('/')
    const { name, price } = await firstDish(page)

    const card = page.locator('.dish-card').filter({ hasText: name }).first()
    await card.getByRole('button', { name: `Добавить «${name}» в заказ` }).click()
    await card.getByRole('button', { name: 'Добавить порцию' }).click()
    await openCart(page)

    const item = page.locator('.cart-item').filter({ hasText: name })
    await expect(item).toHaveCount(1)
    await expect(item.locator('.cart-item__name')).toHaveText(name)
    await expect(item.locator('.cart-item__sum')).toHaveText(`${price * 2} ₽`)
    await expect(page.locator('.cart-drawer__count')).toContainText('2')

    // + внутри корзины: сумма позиции пересчитывается.
    await item.getByRole('button', { name: 'Добавить порцию' }).click()
    await expect(item.locator('.cart-item__sum')).toHaveText(`${price * 3} ₽`)

    // − до нуля: позиция исчезает из списка (App: qty <= 0 → delete),
    // бейдж в хедере пропадает. Сейчас в корзине 3 порции, поэтому
    // три клика «−»: 3 → 2 → 1 → 0.
    const minus = item.locator('.price-pill__step').first()
    await minus.click()
    await expect(item.locator('.cart-item__sum')).toHaveText(`${price * 2} ₽`)
    await minus.click()
    await expect(item.locator('.cart-item__sum')).toHaveText(`${price} ₽`)
    await minus.click()
    await expect(item).toHaveCount(0)
    await expect(page.locator('.header__cart-badge')).toHaveCount(0)
    await expect(page.locator('.cart-drawer__empty')).toBeVisible()
  })
})

test.describe('формирование заказа (WhatsApp)', () => {
  test('полный телефон РФ открывает wa.me с текстом заказа', async ({ page }) => {
    await page.goto('/')
    const { name, price } = await firstDish(page)
    await page.getByRole('button', { name: `Добавить «${name}» в заказ` }).first().click()
    await openCart(page)

    // Внешний переход перехватываем: реальный сайт не нужен,
    // проверяем сам запрос.
    await page.route(/^https:\/\/wa\.me\//, (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' }),
    )

    // Маска formatPhoneRu: «9269101010» → «+7 (926) 910-10-10».
    const phone = page.locator('#cart-phone')
    await phone.pressSequentially('9269101010')
    await expect(phone).toHaveValue('+7 (926) 910-10-10')

    const submit = page.locator('.cart-drawer__submit')
    await expect(submit).toHaveAttribute('aria-disabled', 'false')
    expect(await submit.getAttribute('href')).toContain('wa.me/+79269101010')

    const requestPromise = page.waitForRequest((req) => req.url().startsWith('https://wa.me/'))
    await submit.click()
    const request = await requestPromise

    const url = new URL(request.url())
    expect(url.pathname).toBe('/+79269101010')
    const text = url.searchParams.get('text') ?? ''
    expect(text).toContain('Заказ Rider Kitchen:')
    expect(text).toContain(`${name} × 1 — ${price} ₽`)
    expect(text).toContain(`Итого: ${price} ₽`)
    expect(text).toContain('Телефон: +7 (926) 910-10-10')
  })

  test('пустой/неполный телефон блокирует формирование заказа', async ({ page }) => {
    await page.goto('/')
    const { name } = await firstDish(page)
    await page.getByRole('button', { name: `Добавить «${name}» в заказ` }).first().click()
    await openCart(page)

    const submit = page.locator('.cart-drawer__submit')

    // Пустой телефон: href не подставляется, клик предотвращается
    // (CartDrawer: preventDefault при !phoneComplete).
    await expect(submit).toHaveAttribute('aria-disabled', 'true')
    await expect(submit).not.toHaveAttribute('href', /.+/)
    await submit.click()
    expect(page.url()).not.toContain('wa.me')

    // Неполный номер (6 цифр из 10 значащих) — по-прежнему заблокировано.
    const phone = page.locator('#cart-phone')
    await phone.pressSequentially('926910')
    await expect(phone).toHaveValue('+7 (926) 910')
    await expect(submit).toHaveAttribute('aria-disabled', 'true')
    await expect(submit).not.toHaveAttribute('href', /.+/)
    await submit.click()
    expect(page.url()).not.toContain('wa.me')
  })
})

test.describe('экспорт в PDF', () => {
  test('клик скачивает файл rider-kitchen-order.pdf', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page)
    await page.goto('/')
    const { name } = await firstDish(page)
    await page.getByRole('button', { name: `Добавить «${name}» в заказ` }).first().click()
    await openCart(page)

    const pdfButton = page.locator('.cart-drawer__pdf')
    await expect(pdfButton).toBeEnabled()

    // exportPdf.ts динамически импортирует jspdf, рисует лист векторно
    // и вызывает pdf.save('rider-kitchen-order.pdf') → download-событие.
    const downloadPromise = page.waitForEvent('download')
    await pdfButton.click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('rider-kitchen-order.pdf')

    // Векторный PDF, а не снимок-картинка: текст набран встроенными
    // шрифтами сайта (Onest) — есть FontFile2 и имя шрифта.
    const pdfText = readFileSync(await download.path(), 'latin1')
    expect(pdfText).toContain('/FontFile2')
    expect(pdfText).toContain('Onest')

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})

test.describe('пустая корзина', () => {
  test('drawer в пустом состоянии не ломается', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectRuntimeErrors(page)
    await page.goto('/')
    await openCart(page)

    await expect(page.locator('.cart-drawer__empty')).toHaveText(
      'Корзина пуста — добавьте блюда из меню.',
    )
    await expect(page.locator('.cart-drawer__count')).toContainText('0')
    // PDF-кнопка задизейблена без позиций (disabled={… || items.length === 0}).
    await expect(page.locator('.cart-drawer__pdf')).toBeDisabled()
    // Кнопка «Очистить корзину» рендерится только при items.length > 0.
    await expect(page.locator('.cart-drawer__clear')).toHaveCount(0)

    await expect(page.locator('.cart-drawer__submit')).toHaveAttribute('aria-disabled', 'true')

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})
