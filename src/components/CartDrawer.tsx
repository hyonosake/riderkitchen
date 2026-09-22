import { useRef, useState } from 'react'
import type { CartItem } from '../content/types'
import { formatPrice, formatPhoneRu, isPhoneRuComplete, pluralizeRu } from '../lib/format'
import { buildOrderText, buildWhatsAppHref } from '../lib/order'
import { exportElementToPdf } from '../lib/exportPdf'
import { QtyStepper } from './PriceStepper'
import { CartPdfSheet } from './CartPdfSheet'

// Корзина — выезжающая панель справа (drawer): список позиций со
// степперами, телефон РФ, «Сформировать заказ» (открывает WhatsApp
// с готовым текстом) и вторичная «Сохранить в PDF» (генерирует файл
// и скачивает его на ПК пользователя). Скрытый PDF-лист — отдельный
// компонент CartPdfSheet.
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
  const [phone, setPhone] = useState('')
  const [isPdfBusy, setIsPdfBusy] = useState(false)
  const pdfSheetRef = useRef<HTMLDivElement>(null)
  const phoneComplete = isPhoneRuComplete(phone)

  const count = items.reduce((sum, item) => sum + item.qty, 0)

  const whatsappHref = buildWhatsAppHref(buildOrderText(items, total, phone))

  const handlePdf = async () => {
    const sheet = pdfSheetRef.current
    if (!sheet || isPdfBusy) return
    setIsPdfBusy(true)
    try {
      await exportElementToPdf(sheet, 'rider-kitchen-order.pdf')
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
                  <span className="cart-item__name">{item.name}</span>
                  <span className="cart-item__sum">{formatPrice(item.price * item.qty)}</span>
                </div>
                <QtyStepper
                  name={item.name}
                  price={item.price}
                  qty={item.qty}
                  onQtyChange={(qty) => onQtyChange(item.id, qty)}
                />
              </li>
            ))}
          </ul>
        )}

        <footer className="cart-drawer__foot">
          <p className="cart-drawer__total">
            Итого: <strong>{formatPrice(total)}</strong>
          </p>
          <label className="cart-drawer__phone-label" htmlFor="cart-phone">
            Телефон
          </label>
          <input
            id="cart-phone"
            className="cart-drawer__phone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(event) => setPhone(formatPhoneRu(event.target.value))}
          />
          <a
            className="button button--primary cart-drawer__submit"
            href={phoneComplete ? whatsappHref : undefined}
            aria-disabled={!phoneComplete}
            onClick={(event) => {
              if (!phoneComplete) event.preventDefault()
            }}
          >
            Сформировать заказ
          </a>
          {/* Генерация PDF и скачивание файла: снимок скрытого
              pdf-листа (CartPdfSheet) → файл на ПК. */}
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

      <CartPdfSheet items={items} total={total} phone={phone} sheetRef={pdfSheetRef} />
    </>
  )
}
