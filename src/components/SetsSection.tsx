import type { MenuSet } from '../content/types'
import { pluralizeRu } from '../lib/format'
import { PriceStepper } from './PriceStepper'

export function SetsSection({
  sets,
  index,
  cart,
  onQtyChange,
}: {
  sets: MenuSet[]
  index: number
  cart: Map<string, number>
  onQtyChange: (key: string, qty: number) => void
}) {
  return (
    <section id="sets" className="menu-section">
      <header className="menu-section__head">
        <span className="menu-section__index" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="menu-section__title">Готовые сеты</h2>
        <span className="menu-section__count">
          {sets.length} {pluralizeRu(sets.length, ['сет', 'сета', 'сетов'])}
        </span>
      </header>
      <div className="menu-section__grid">
        {sets.map((set) => (
          <article key={set.name} className="set-card">
            {set.image && (
              <img className="dish-card__image" src={set.image} alt={set.name} loading="lazy" />
            )}
            <div className="set-card__body">
              <h3 className="dish-card__name">{set.name}</h3>
              <ul className="set-card__items">
                {set.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <footer className="dish-card__footer">
                {/* Калораж — нижний левый угол, цена — в противоположном. */}
                {set.calories != null && (
                  <span className="dish-card__kcal">≈ {set.calories} ккал</span>
                )}
                <PriceStepper
                  price={set.price}
                  name={set.name}
                  qty={cart.get(`sets:${set.name}`) ?? 0}
                  onQtyChange={(qty) => onQtyChange(`sets:${set.name}`, qty)}
                />
              </footer>
            </div>
          </article>
        ))}
      </div>
      <p className="menu-section__note">
        Другие позиции райдера артистов по питанию или бытового райдера обсуждаются
        индивидуально.
      </p>
    </section>
  )
}
