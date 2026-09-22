import type { Dish, DishTag } from '../content/types'
import { PriceStepper } from './PriceStepper'

const tagLabels: Record<DishTag, string> = {
  vegan: 'vegan',
  seasonal: 'сезонное',
  min5portions: 'заказ от 5 порций',
}

export function DishCard({
  dish,
  qty,
  onQtyChange,
}: {
  dish: Dish
  qty: number
  onQtyChange: (qty: number) => void
}) {
  return (
    <article className="dish-card">
      {dish.image && (
        <img className="dish-card__image" src={dish.image} alt={dish.name} loading="lazy" />
      )}
      <div className="dish-card__body">
        <h3 className="dish-card__name">{dish.name}</h3>
        {dish.description && <p className="dish-card__description">{dish.description}</p>}
        {dish.tags && dish.tags.length > 0 && (
          <ul className="dish-card__tags">
            {dish.tags.map((tag) => (
              <li key={tag} className={`dish-tag dish-tag--${tag}`}>
                {tagLabels[tag]}
              </li>
            ))}
          </ul>
        )}
        {/* Футер карточки прижат к низу (margin-top: auto), поэтому цена
            стоит в одном месте у всех карточек строки, даже если описания
            разной длины. */}
        <footer className="dish-card__footer">
          {/* Оценка калорийности — нижний левый угол карточки, цена —
              в противоположном (правом); ≈ подчёркивает, что цифра
              приблизительная (см. src/content/menu.ts). */}
          {dish.calories != null && (
            <span className="dish-card__kcal">≈ {dish.calories} ккал</span>
          )}
          <PriceStepper price={dish.price} name={dish.name} qty={qty} onQtyChange={onQtyChange} />
        </footer>
      </div>
    </article>
  )
}
