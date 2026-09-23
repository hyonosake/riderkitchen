import { useEffect, useReducer, useState } from 'react'
import { hero } from '../content/hero'
import { sets } from '../content/menu'
import { DISH_BY_KEY } from '../lib/catalog'
import { formatPrice, pluralizeRu } from '../lib/format'

// Коллаж из реальных тарелок меню вместо логотипа-плаката: на первом
// экране — продукт. Фото 900×900 с прозрачным фоном; раскладка по
// номеру тарелки — в src/styles/03-hero.css (.hero__plate--N).
//
// Ротация раз в hero.rotationMs (без prefers-reduced-motion): меняется
// окончание надзаголовка «Кормим …», а на десктопе ещё и одна из
// малых тарелок по кругу (центральная остаётся; на мобильном коллаж
// ниже первого экрана — там подмена фото только отвлекает). Пауза —
// пока курсор на надзаголовке или фокус внутри hero (WCAG 2.2.2).
const TEXT_ROTATION_QUERY = '(prefers-reduced-motion: no-preference)'
const PLATE_ROTATION_QUERY = '(min-width: 881px) and (prefers-reduced-motion: no-preference)'

// Подписка на media query. jsdom (юнит-тесты) и старые браузеры без
// matchMedia — false, то есть без ротации.
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// previous — раскладка до последней подмены: в изменившемся слоте
// старое блюдо ещё рендерится и растворяется поверх нового (кроссфейд).
type Rotation = { tick: number; shown: string[]; previous: string[]; queue: string[] }

// Слот 0 (центральное блюдо) не трогаем, слоты 1…N-1 — по кругу;
// снятое блюдо уходит в конец очереди, поэтому повторов на экране нет.
// withPlates = false — такт только для текста (мобильный).
function rotate(state: Rotation, withPlates: boolean): Rotation {
  const slot = 1 + (state.tick % (state.shown.length - 1))
  const [next, ...rest] = state.queue
  if (!withPlates || !next) return { ...state, tick: state.tick + 1, previous: state.shown }
  return {
    tick: state.tick + 1,
    previous: state.shown,
    shown: state.shown.map((key, index) => (index === slot ? next : key)),
    queue: [...rest, state.shown[slot]],
  }
}

function plateByKey(key: string) {
  const dish = DISH_BY_KEY.get(key)
  return dish?.image ? { key, name: dish.name, image: dish.image } : null
}

export function Hero() {
  const minSetPrice = Math.min(...sets.map((set) => set.price))
  const [rotation, advance] = useReducer(rotate, {
    tick: 0,
    shown: hero.plates,
    previous: hero.plates,
    queue: hero.platePool,
  })
  const canRotate = useMediaQuery(TEXT_ROTATION_QUERY)
  const canRotatePlates = useMediaQuery(PLATE_ROTATION_QUERY)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!canRotate || paused) return
    const id = window.setInterval(() => advance(canRotatePlates), hero.rotationMs)
    return () => window.clearInterval(id)
  }, [canRotate, canRotatePlates, paused])

  // Подгружаем фото из пула заранее — иначе подмена мигает пустотой.
  useEffect(() => {
    if (!canRotatePlates) return
    for (const key of hero.platePool) {
      const image = plateByKey(key)?.image
      if (image) new Image().src = image
    }
  }, [canRotatePlates])

  const audiences = hero.kickerAudiences
  const activeAudience = canRotate ? rotation.tick % audiences.length : 0
  const plates = rotation.shown.map((key, index) => ({
    current: plateByKey(key),
    leaving: rotation.previous[index] !== key ? plateByKey(rotation.previous[index]) : null,
  }))

  return (
    <section
      id="top"
      className="hero"
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero__inner">
        <div className="hero__copy">
          <p
            className="hero__kicker"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Скринридер читает весь список один раз, а не каждую смену. */}
            <span className="visually-hidden">
              {hero.kickerLead} {audiences.join(', ')}
            </span>
            <span className="hero__kicker-text" aria-hidden="true">
              {hero.kickerLead}{' '}
              {canRotate ? (
                // Все варианты в одной ячейке грида: ширина плашки = самый
                // длинный вариант, плашка не «дышит» при смене.
                <span className="hero__kicker-words">
                  {audiences.map((audience, index) => (
                    <span
                      key={audience}
                      className={`hero__kicker-word${index === activeAudience ? ' hero__kicker-word--active' : ''}`}
                    >
                      {audience}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="hero__kicker-word">{audiences[0]}</span>
              )}
            </span>
          </p>
          <h1 className="hero__title">
            {hero.titleLines.map((line) => (
              <span key={line} className="hero__title-line">
                {line}{' '}
              </span>
            ))}
          </h1>
          <p className="hero__subtitle">{hero.subtitle}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <a
              className="button button--ghost"
              href={hero.secondaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
          <ul className="hero__facts">
            {hero.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className="hero__media">
          <div className="hero__plates">
            {plates.map(({ current, leaving }, index) => (
              <div key={index} className={`hero__plate hero__plate--${index + 1}`}>
                {leaving && (
                  <img
                    key={leaving.key}
                    className="hero__plate-img hero__plate-img--leaving"
                    src={leaving.image}
                    alt=""
                    aria-hidden="true"
                    width={900}
                    height={900}
                  />
                )}
                {current && (
                  // key = блюдо: при подмене img монтируется заново и
                  // проявляется (--entering), пока старое растворяется.
                  <img
                    key={current.key}
                    className={`hero__plate-img${leaving ? ' hero__plate-img--entering' : ''}`}
                    src={current.image}
                    alt={current.name}
                    width={900}
                    height={900}
                    fetchPriority={index === 0 ? 'high' : undefined}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Бейдж-ссылка к сетам: второстепенный CTA поверх коллажа. */}
          <a className="hero__badge" href={hero.primaryCta.href}>
            {sets.length}{' '}
            {pluralizeRu(sets.length, ['готовый сет', 'готовых сета', 'готовых сетов'])} · от{' '}
            <strong className="hero__badge-price">{formatPrice(minSetPrice)}</strong>
            <span className="hero__badge-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
