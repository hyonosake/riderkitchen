import { formatPrice, pluralizeRu } from '../lib/format'

// Нижняя панель корзины на мобильном (≤720px — там в хедере у кнопки
// корзины нет суммы): после первого добавления видно итог и путь к
// оформлению с любого места страницы. Вся панель — одна кнопка,
// открывает тот же drawer. sticky в конце страницы: над футером не
// висит и не требует отступа-заглушки. Стили — src/styles/08-cart.css.
export function CartBar({
  count,
  total,
  onOpen,
}: {
  count: number
  total: number
  onOpen: () => void
}) {
  if (count === 0) return null

  return (
    <div className="cart-bar">
      <button type="button" className="cart-bar__button" onClick={onOpen}>
        <span className="cart-bar__summary">
          {count} {pluralizeRu(count, ['позиция', 'позиции', 'позиций'])} ·{' '}
          <strong className="cart-bar__total">{formatPrice(total)}</strong>
        </span>
        <span className="cart-bar__action">
          Оформить
          <span aria-hidden="true"> →</span>
        </span>
      </button>
    </div>
  )
}
