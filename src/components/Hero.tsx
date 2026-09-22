import { hero } from '../content/hero'
import { sets } from '../content/menu'
import { formatPrice, pluralizeRu } from '../lib/format'
import heroImage from '../assets/hero.webp'

// Постер hero.webp — 1680×994, логотип-плакат («Feed Your Team»),
// а не фотография: показываем отдельным элементом на натуральной
// пропорции, без object-fit: cover (иначе обрезается — см. docs/PLAN.md).
// width/height нужны браузеру до загрузки, чтобы не прыгала раскладка.
export function Hero() {
  const minSetPrice = Math.min(...sets.map((set) => set.price))

  return (
    <section id="top" className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__kicker">{hero.kicker}</p>
          <h1 className="hero__title">{hero.title}</h1>
          <p className="hero__subtitle">{hero.subtitle}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <a className="button button--ghost" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
        <figure className="hero__media">
          <img
            src={heroImage}
            alt={hero.posterAlt}
            width={1680}
            height={994}
            fetchPriority="high"
          />
          <figcaption className="hero__badge">
            {sets.length}{' '}
            {pluralizeRu(sets.length, ['готовый сет', 'готовых сета', 'готовых сетов'])} · от{' '}
            {formatPrice(minSetPrice)}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
