import { useState } from 'react'

// Тестовая переключалка шрифтовых вариантов A–E — временный инструмент
// рядом с переключателем темы, убрать после выбора финальной пары.
// Сами варианты описаны в src/index.css через :root[data-fonts='…'],
// шрифты подключены в index.html (Google Fonts).

const STORAGE_KEY = 'rk-fonts'

const variants = [
  {
    id: null,
    label: 'тек.',
    hint: 'Дефолт (= B): Philosopher в разделах, Onest в блюдах и тексте.',
  },
  {
    id: 'a',
    label: 'A',
    hint: 'A: Philosopher 700 и в разделах, и в названиях блюд + Onest.',
  },
  {
    id: 'c',
    label: 'C',
    hint: 'C: Philosopher + Alegreya Sans, метки — капитель Alegreya Sans SC.',
  },
  {
    id: 'd',
    label: 'D',
    hint: 'D: Alegreya + Alegreya Sans — серифный контроль (ближе к Fraunces).',
  },
  {
    id: 'e',
    label: 'E',
    hint: 'E: Philosopher + Manrope — строгий «дорогой» геометричный контраст.',
  },
] as const

type VariantId = (typeof variants)[number]['id']

function initialVariant(): VariantId {
  const saved = localStorage.getItem(STORAGE_KEY)
  return variants.some((variant) => variant.id === saved) ? (saved as VariantId) : null
}

export function FontDebugToggle() {
  // Вариант B стал дефолтом (зашит в :root в index.css). Сохранённое
  // 'b' из старых сессий initialVariant() уже отбрасывает как
  // неизвестное — в списке вариантов его больше нет.
  const [variant, setVariant] = useState<VariantId>(initialVariant)

  const select = (next: VariantId) => {
    setVariant(next)
    if (next === null) {
      localStorage.removeItem(STORAGE_KEY)
      document.documentElement.removeAttribute('data-fonts')
    } else {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.setAttribute('data-fonts', next)
    }
  }

  const active = variants.find((item) => item.id === variant) ?? variants[0]

  return (
    <>
      <div className="debug-toolbar__row" role="group" aria-label="Шрифтовые варианты">
        {variants.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`debug-toggle${variant === item.id ? ' debug-toggle--active' : ''}`}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="debug-toolbar__hint">{active.hint}</p>
    </>
  )
}
