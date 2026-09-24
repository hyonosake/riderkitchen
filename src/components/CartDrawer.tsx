import { useEffect, useState } from 'react'
import type { CartItem } from '../content/types'
import { formatPrice, formatPhoneRuOnChange, isPhoneRuComplete, pluralizeRu } from '../lib/format'
import { buildOrderText, buildWhatsAppHref, notifyTelegramOrder } from '../lib/order'
import { exportOrderPdf } from '../lib/exportPdf'
import { QtyStepper } from './PriceStepper'

// Сегодняшняя дата в ISO («YYYY-MM-DD») — минимум для <input type="date">,
// заказ задним числом не оформить.
function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Корзина — выезжающая панель справа (drawer): список позиций со
// степперами, телефон РФ, «Сформировать заказ» (открывает WhatsApp
// с готовым текстом) и вторичная «Сохранить в PDF» (рисует векторный
// PDF в src/lib/exportPdf.ts и скачивает его на ПК пользователя).
export function CartDrawer({
  items,
  total,
  open,
  onClose,
  onQtyChange,
  onClear,
}: {
  items: CartItem[]
  total: number
  open: boolean
  onClose: () => void
  onQtyChange: (key: string, qty: number) => void
  onClear: () => void
}) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [phone, setPhone] = useState('')
  const [isPdfBusy, setIsPdfBusy] = useState(false)
  const phoneComplete = isPhoneRuComplete(phone)

  // На мобильных overflow:hidden на body не блокирует скролл под
  // открытой панелью (жест уходит на сайт под ней) — фиксируем body
  // на текущей позиции и возвращаем скролл на место при закрытии.
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    const prev = { position: style.position, top: style.top, width: style.width }
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'
    return () => {
      style.position = prev.position
      style.top = prev.top
      style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const count = items.reduce((sum, item) => sum + item.qty, 0)

  const whatsappHref = buildWhatsAppHref(buildOrderText(items, total, phone, name, date))

  const handlePdf = async () => {
    if (isPdfBusy || items.length === 0) return
    setIsPdfBusy(true)
    try {
      await exportOrderPdf({ items, total, name, date }, 'rider-kitchen-order.pdf')
    } finally {
      setIsPdfBusy(false)
    }
  }

  return (
    <>
      {/* Полупрозрачная подложка поверх страницы; клик по ней закрывает. */}
      <div
        className={`cart-overlay${open ? ' cart-overlay--open' : ''}`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`cart-drawer${open ? ' cart-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        aria-hidden={!open}
      >
        <header className="cart-drawer__head">
          <h2 className="cart-drawer__title">
            Корзина{' '}
            <span className="cart-drawer__count">
              {count} {pluralizeRu(count, ['порция', 'порции', 'порций'])}
            </span>
          </h2>
          <button
            type="button"
            className="cart-drawer__close"
            aria-label="Закрыть корзину"
            onClick={onClose}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </header>
        {items.length > 0 && (
          <button type="button" className="cart-drawer__clear" onClick={onClear}>
            Очистить корзину
          </button>
        )}

        {items.length === 0 ? (
          <p className="cart-drawer__empty">Корзина пуста — добавьте блюда из меню.</p>
        ) : (
          <ul className="cart-drawer__list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item__info">
                  <span className="cart-item__name-group">
                    <span className="cart-item__name">{item.name}</span>
                    <span className="cart-item__qty">
                      {item.qty} {pluralizeRu(item.qty, ['порция', 'порции', 'порций'])}
                    </span>
                  </span>
                  <span className="cart-item__sum">{formatPrice(item.price * item.qty)}</span>
                </div>
                <div className="cart-item__controls">
                  <QtyStepper
                    name={item.name}
                    price={item.price}
                    qty={item.qty}
                    onQtyChange={(qty) => onQtyChange(item.id, qty)}
                  />
                  <button
                    type="button"
                    className="cart-item__remove"
                    aria-label={`Удалить «${item.name}» из корзины`}
                    onClick={() => onQtyChange(item.id, 0)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.5 3.75h10M5.625 3.75V2.5a.625.625 0 0 1 .625-.625h2.5a.625.625 0 0 1 .625.625v1.25M11.875 3.75l-.494 8.4a1.25 1.25 0 0 1-1.248 1.175H4.867a1.25 1.25 0 0 1-1.248-1.175l-.494-8.4" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="cart-drawer__foot">
          <p className="cart-drawer__total">
            Итого: <strong>{formatPrice(total)}</strong>
          </p>
          <label className="cart-drawer__label" htmlFor="cart-name">
            Имя
          </label>
          <input
            id="cart-name"
            className="cart-drawer__input"
            type="text"
            autoComplete="name"
            placeholder="Как к вам обращаться"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label className="cart-drawer__label" htmlFor="cart-date">
            Дата заказа
          </label>
          <input
            id="cart-date"
            className="cart-drawer__input"
            type="date"
            min={todayIso()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <label className="cart-drawer__label" htmlFor="cart-phone">
            Телефон
          </label>
          <input
            id="cart-phone"
            className="cart-drawer__input"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(event) => setPhone(formatPhoneRuOnChange(event.target.value, phone))}
          />
          <a
            className="button button--primary cart-drawer__submit"
            href={phoneComplete ? whatsappHref : undefined}
            aria-disabled={!phoneComplete}
            onClick={(event) => {
              if (!phoneComplete) {
                event.preventDefault()
                return
              }
              notifyTelegramOrder(items, total, phone, name, date)
            }}
          >
            Сформировать заказ
          </a>
          {/* Генерация векторного PDF и скачивание файла на ПК. */}
          <button
            type="button"
            className="button button--ghost cart-drawer__pdf"
            disabled={isPdfBusy || items.length === 0}
            onClick={handlePdf}
          >
            {isPdfBusy ? 'Готовим PDF…' : 'Сохранить в PDF'}
          </button>
        </footer>
      </aside>

    </>
  )
}
