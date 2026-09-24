import { contacts } from '../content/menu'
import type { CartItem } from '../content/types'
import { formatDateRu, formatPrice } from './format'

// Текст WhatsApp-заказа: заголовок, имя и дата (если заполнены),
// позиции с суммами, итог, телефон. Формат строк позиций — контракт
// e2e (tests/cart.spec.ts): «• <название> × N — N ₽».
export function buildOrderText(
    items: CartItem[],
    total: number,
    phone: string,
    name = '',
    date = '',
): string {
    return [
        'Заказ Rider Kitchen:',
        ...(name ? [`Имя: ${name}`] : []),
        ...(date ? [`Дата: ${formatDateRu(date)}`] : []),
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

// Уведомление в Telegram-группу заказов (riderkitchen-bot, см. соседний
// проект ../riderkitchen-bot): лучшее старание, не должно мешать
// основному сценарию (переходу в WhatsApp) — ошибки проглатываются.
// keepalive: true — запрос переживает уход со страницы по клику на
// ссылку WhatsApp. Путь относительный: в проде nginx проксирует
// /riderkitchen/api/ на бота (тот же origin, что и сайт).
export function notifyTelegramOrder(
    items: CartItem[],
    total: number,
    phone: string,
    name = '',
    date = '',
): void {
    const payload = {
        name,
        phone,
        date,
        items: items.map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
        total,
    }
    fetch(`${import.meta.env.BASE_URL}api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
    }).catch(() => {})
}
