import { formatPrice } from '../lib/format'

const MAX_QTY = 99

export interface QtyControlProps {
  name: string
  price: number
  qty: number
  onQtyChange: (qty: number) => void
}

// Голый степпер «− цена +» — используется в корзине и внутри
// PriceStepper. Количество живёт в общей корзине (App), поэтому
// компонент контролируемый.
export function QtyStepper({ name, price, qty, onQtyChange }: QtyControlProps) {
  return (
    <div className="price-pill price-pill--active" role="group" aria-label={`Порции «${name}»`}>
      <button
        type="button"
        className="price-pill__step"
        aria-label={qty === 1 ? `Убрать «${name}» из заказа` : 'Убрать порцию'}
        onClick={() => onQtyChange(qty - 1)}
      >
        −
      </button>
      {/* В центре — цена за единицу (как в референсе). */}
      <span className="price-pill__unit">{formatPrice(price)}</span>
      <button
        type="button"
        className="price-pill__step"
        aria-label="Добавить порцию"
        onClick={() => onQtyChange(Math.min(qty + 1, MAX_QTY))}
      >
        +
      </button>
    </div>
  )
}

// Цена-кнопка со степпером (как на референс-сайте): пока позиция не
// в корзине — просто цена, по клику добавляет 1 порцию; в активном
// состоянии в центре остаётся цена за единицу, количество — «× N»
// сбоку. Ноль возвращает кнопку в состояние цены.
export function PriceStepper({ name, price, qty, onQtyChange }: QtyControlProps) {
  if (qty === 0) {
    return (
      <button
        type="button"
        className="price-pill"
        aria-label={`Добавить «${name}» в заказ — ${formatPrice(price)}`}
        onClick={() => onQtyChange(1)}
      >
        {formatPrice(price)}
      </button>
    )
  }

  return (
    <div className="price-stepper">
      <span className="price-pill__count" aria-live="polite">
        {qty} ×
      </span>
      <QtyStepper name={name} price={price} qty={qty} onQtyChange={onQtyChange} />
    </div>
  )
}
