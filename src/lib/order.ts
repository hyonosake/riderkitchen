import { contacts } from '../content/menu'
import type { CartItem } from '../content/types'
import { formatPrice } from './format'

// Текст WhatsApp-заказа: заголовок, позиции с суммами, итог, телефон.
// Формат строк — контракт e2e (tests/cart.spec.ts): «• <название> × N — N ₽».
export function buildOrderText(items: CartItem[], total: number, phone: string): string {
    return [
        'Заказ Rider Kitchen:',
        ...items.map((item) => `• ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}`),
        `Итого: ${formatPrice(total)}`,
        `Телефон: ${phone}`,
    ].join('\n')
}

// Разбивка заказа по разделам для итога PDF: «Закуски — 2 · Супы — 1».
// Порядок — по первому появлению раздела в заказе (как Object.entries
// у исходной реализации).
export function buildSectionSummary(items: CartItem[]): Array<[string, number]> {
    return Object.entries(
        items.reduce<Record<string, number>>((acc, item) => {
            acc[item.sectionTitle] = (acc[item.sectionTitle] ?? 0) + item.qty
            return acc
        }, {}),
    )
}

// Ссылка WhatsApp: ресторанный номер — константа из contacts
// (contacts.whatsappHref), телефон клиента живёт только в тексте заказа.
export function buildWhatsAppHref(text: string): string {
    return `${contacts.whatsappHref}?text=${encodeURIComponent(text)}`
}
