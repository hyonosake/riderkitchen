import type { RefObject } from 'react'
import type { CartItem } from '../content/types'
import { formatPrice } from '../lib/format'
import { buildSectionSummary } from '../lib/order'

// Скрытый PDF-лист: рендерится постоянно (off-screen), чтобы экспорт
// работал без предварительных манипуляций с DOM. exportPdf.ts снимает
// `.pdf-sheet__page` в canvas — DOM-структура и классы pdf-sheet* —
// часть контракта, не менять.
// Позиции с фото идут первыми, без фото — компактными строками
// в конце списка. Ref на страницу передаётся из CartDrawer, там же
// вызывается exportElementToPdf.
export function CartPdfSheet({
    items,
    total,
    phone,
    sheetRef,
}: {
    items: CartItem[]
    total: number
    phone: string
    sheetRef: RefObject<HTMLDivElement | null>
}) {
    // Позиции без фото (гарниры/напитки) — компактным блоком в конце PDF-листа.
    const noPhotoItems = items.filter((item) => !item.image)
    const totalKcal = items.reduce((sum, item) => sum + (item.calories ?? 0) * item.qty, 0)
    // Разбивка заказа по разделам для итога PDF: «Закуски — 2 · Супы — 1».
    const sectionSummary = buildSectionSummary(items)

    return (
        <div className="pdf-sheet" aria-hidden="true">
            <div className="pdf-sheet__page" ref={sheetRef}>
                <header className="pdf-sheet__head">
                    <div>
                        <p className="pdf-sheet__brand">Rider Kitchen</p>
                        <p className="pdf-sheet__caption">Состав заказа</p>
                    </div>
                    {phone && (
                        <p className="pdf-sheet__phone">
                            Телефон: <strong>{phone}</strong>
                        </p>
                    )}
                </header>

                <ul className="pdf-sheet__list">
                    {items
                        .filter((item) => item.image)
                        .map((item) => (
                            <li key={item.id} className="pdf-row">
                                <img className="pdf-row__photo" src={item.image} alt="" />
                                <div className="pdf-row__info">
                                    <p className="pdf-row__name">{item.name}</p>
                                    <p className="pdf-row__desc">{item.description}</p>
                                </div>
                                <span className="pdf-row__qty">
                                    × {item.qty}
                                    {item.calories != null && (
                                        <span className="pdf-row__kcal">≈ {item.calories * item.qty} ккал</span>
                                    )}
                                </span>
                                <span className="pdf-row__sum">{formatPrice(item.price * item.qty)}</span>
                            </li>
                        ))}
                </ul>

                {noPhotoItems.length > 0 && (
                    <ul className="pdf-sheet__compact">
                        {noPhotoItems.map((item) => (
                            <li key={item.id} className="pdf-compact-row">
                                <span className="pdf-compact-row__name">{item.name}</span>
                                <span className="pdf-compact-row__qty">× {item.qty}</span>
                                <span className="pdf-compact-row__sum">{formatPrice(item.price * item.qty)}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <footer className="pdf-sheet__footer">
                    <p className="pdf-sheet__positions">
                        {sectionSummary.map(([title, qty]) => `${title} — ${qty}`).join(' · ')}
                        {totalKcal > 0 && <> · ≈ {totalKcal} ккал</>}
                    </p>
                    <p className="pdf-sheet__total">
                        Итого: <strong>{formatPrice(total)}</strong>
                    </p>
                </footer>
            </div>
        </div>
    )
}
