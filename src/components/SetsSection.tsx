import type { MenuSet } from '../content/types'
import { formatPrice } from '../lib/format'

export function SetsSection({ sets }: { sets: MenuSet[] }) {
  return (
    <section id="sets" className="menu-section">
      <h2 className="menu-section__title">Готовые сеты</h2>
      <div className="menu-section__grid">
        {sets.map((set) => (
          <article key={set.name} className="set-card">
            {set.image && (
              <img className="dish-card__image" src={set.image} alt={set.name} loading="lazy" />
            )}
            <div className="set-card__body">
              <div className="dish-card__heading">
                <h3 className="dish-card__name">{set.name}</h3>
                <span className="dish-card__price">{formatPrice(set.price)}</span>
              </div>
              <ul className="set-card__items">
                {set.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
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
