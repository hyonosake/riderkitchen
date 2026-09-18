import type { MenuCategory } from '../content/types'
import { DishCard } from './DishCard'

export function MenuSection({ category }: { category: MenuCategory }) {
  return (
    <section id={category.id} className="menu-section">
      <h2 className="menu-section__title">{category.title}</h2>
      <div className="menu-section__grid">
        {category.dishes.map((dish) => (
          <DishCard key={dish.name} dish={dish} />
        ))}
      </div>
    </section>
  )
}
