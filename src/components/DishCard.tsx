import type { Dish, DishTag } from '../content/types'
import { formatPrice } from '../lib/format'

const tagLabels: Record<DishTag, string> = {
  vegan: 'vegan',
  seasonal: 'сезонное',
  min5portions: 'заказ от 5 порций',
}

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <article className="dish-card">
      {dish.image && (
        <img className="dish-card__image" src={dish.image} alt={dish.name} loading="lazy" />
      )}
      <div className="dish-card__body">
        <div className="dish-card__heading">
          <h3 className="dish-card__name">{dish.name}</h3>
          <span className="dish-card__price">{formatPrice(dish.price)}</span>
        </div>
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
      </div>
    </article>
  )
}
