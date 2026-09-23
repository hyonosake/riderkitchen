import { useState } from 'react'
import type { DebugVariant } from '../content/debugVariants'

// Дебаг-переключалка вариантов оформления (шрифты, палитры) — временный
// инструмент рядом с тумблером темы, убрать перед презентацией владельцу.
// Выбранный вариант пишется атрибутом на <html> (data-fonts / data-palette,
// сами варианты — в src/index.css) и запоминается в localStorage;
// раннее применение до монтирования React — скрипт в index.html.

type Props = {
  label: string
  attribute: string
  storageKey: string
  variants: readonly DebugVariant[]
}

function readSaved(storageKey: string, variants: readonly DebugVariant[]): string | null {
  try {
    const saved = localStorage.getItem(storageKey)
    // Неизвестные значения (например, старые шрифты A/C/D/E) отбрасываем.
    return variants.some((variant) => variant.id === saved) ? saved : null
  } catch {
    return null
  }
}

export function DebugVariantToggle({ label, attribute, storageKey, variants }: Props) {
  const [selected, setSelected] = useState(() => readSaved(storageKey, variants))

  const select = (next: string | null) => {
    setSelected(next)
    try {
      if (next === null) localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, next)
    } catch {
      // Без localStorage выбор просто не переживёт перезагрузку.
    }
    if (next === null) document.documentElement.removeAttribute(attribute)
    else document.documentElement.setAttribute(attribute, next)
  }

  const active = variants.find((item) => item.id === selected) ?? variants[0]

  return (
    <>
      <div className="debug-toolbar__row" role="group" aria-label={label}>
        {variants.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`debug-toggle${selected === item.id ? ' debug-toggle--active' : ''}`}
            aria-pressed={selected === item.id}
            onClick={() => select(item.id)}
          >
            {item.swatch && (
              <span
                className="debug-toggle__swatch"
                style={{ background: `linear-gradient(135deg, ${item.swatch[0]} 50%, ${item.swatch[1]} 50%)` }}
                aria-hidden="true"
              />
            )}
            {item.label}
          </button>
        ))}
      </div>
      <p className="debug-toolbar__hint">{active.hint}</p>
    </>
  )
}
