import type { MenuCategory } from '../content/types'
import { DishCard } from './DishCard'
import { pluralizeRu } from '../lib/format'

export function MenuSection({
  category,
  index,
  cart,
  onQtyChange,
}: {
  category: MenuCategory
  index: number
  cart: Map<string, number>
  onQtyChange: (key: string, qty: number) => void
}) {
  return (
    <section id={category.id} className="menu-section">
      <header className="menu-section__head">
        <span className="menu-section__index" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="menu-section__title">{category.title}</h2>
        <span className="menu-section__count">
          {category.dishes.length} {pluralizeRu(category.dishes.length, ['позиция', 'позиции', 'позиций'])}
        </span>
      </header>
      <div className="menu-section__grid">
        {category.dishes.map((dish) => (
          <DishCard
            key={dish.name}
            dish={dish}
            qty={cart.get(`${category.id}:${dish.name}`) ?? 0}
            onQtyChange={(qty) => onQtyChange(`${category.id}:${dish.name}`, qty)}
          />
        ))}
      </div>
    </section>
  )
}
