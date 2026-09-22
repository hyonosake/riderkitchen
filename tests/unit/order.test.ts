import { describe, expect, it } from 'vitest'
import { contacts, menu, sets } from '../../src/content/menu'
import type { CartItem } from '../../src/content/types'
import { buildOrderText, buildSectionSummary, buildWhatsAppHref } from '../../src/lib/order'

// Фикстуры собираются из реального контента (src/content/menu.ts):
// это чистые функции над контентом, мокать его незачем. Формат строк —
// контракт e2e (tests/cart.spec.ts проверяет wa.me-ссылку и текст).
const breakfast = menu.find((category) => category.id === 'breakfast')
if (!breakfast) throw new Error('в menu.ts нет раздела «breakfast»')
const omelette = breakfast.dishes[0]
const set1 = sets[0]

const omeletteItem: CartItem = {
  id: `breakfast:${omelette.name}`,
  name: omelette.name,
  sectionTitle: breakfast.title,
  description: omelette.description,
  price: omelette.price,
  calories: omelette.calories,
  qty: 2,
  image: omelette.image,
}

const setItem: CartItem = {
  id: `sets:${set1.name}`,
  name: set1.name,
  sectionTitle: 'Сеты',
  description: set1.items.join(', '),
  price: set1.price,
  calories: set1.calories,
  qty: 1,
  image: set1.image,
}

const PHONE = '+7 (926) 910-10-10'

describe('buildOrderText', () => {
  it('собирает текст заказа: заголовок, позиции, итог, телефон', () => {
    const total = omeletteItem.price * omeletteItem.qty + setItem.price * setItem.qty
    const text = buildOrderText([omeletteItem, setItem], total, PHONE)
    expect(text.split('\n')).toEqual([
      'Заказ Rider Kitchen:',
      `• ${omelette.name} × 2 — ${omelette.price * 2} ₽`,
      `• ${set1.name} × 1 — ${set1.price} ₽`,
      `Итого: ${total} ₽`,
      `Телефон: ${PHONE}`,
    ])
  })

  it('формат строки позиции совпадает с e2e-контрактом «… × N — N ₽»', () => {
    const text = buildOrderText([{ ...omeletteItem, qty: 1 }], omelette.price, PHONE)
    expect(text).toContain(`• ${omelette.name} × 1 — ${omelette.price} ₽`)
    expect(text).toContain(`Итого: ${omelette.price} ₽`)
    expect(text).toContain(`Телефон: ${PHONE}`)
  })

  it('пустой заказ даёт только заголовок, нулевой итог и пустой телефон', () => {
    expect(buildOrderText([], 0, '').split('\n')).toEqual([
      'Заказ Rider Kitchen:',
      'Итого: 0 ₽',
      'Телефон: ',
    ])
  })
})

describe('buildSectionSummary', () => {
  it('суммирует порции по разделам в порядке первого появления', () => {
    const summary = buildSectionSummary([omeletteItem, setItem, { ...omeletteItem, qty: 1 }])
    const expected: Array<[string, number]> = [
      [breakfast.title, 3],
      ['Сеты', 1],
    ]
    expect(summary).toEqual(expected)
  })

  it('пустой заказ → пустая разбивка', () => {
    expect(buildSectionSummary([])).toEqual([])
  })
})

describe('buildWhatsAppHref', () => {
  it('ведёт на номер из contacts с закодированным текстом заказа', () => {
    const text = 'Заказ Rider Kitchen:\n• Блюдо × 1 — 450 ₽'
    const href = buildWhatsAppHref(text)

    expect(href.startsWith(`${contacts.whatsappHref}?text=`)).toBe(true)
    // Пробелы, переводы строк и спецсимволы закодированы — сырых нет.
    expect(href).not.toContain(' ')
    expect(href).not.toContain('\n')
    expect(href).not.toContain('•')

    const url = new URL(href)
    expect(url.pathname).toBe('/+79269101010') // e2e-контракт (cart.spec.ts)
    expect(url.searchParams.get('text')).toBe(text) // URL декодирует параметр
  })
})
