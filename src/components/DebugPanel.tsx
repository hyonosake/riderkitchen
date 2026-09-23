import { useState } from 'react'
import { ThemeDebugToggle } from './ThemeDebugToggle'
import { DebugVariantToggle } from './DebugVariantToggle'
import { fontVariants, paletteVariants } from '../content/debugVariants'

// Дебаг-инструменты (тема, палитры, шрифты) спрятаны за кнопкой-жучком —
// как виджет «сообщить о баге»: не мешают обычному просмотру сайта,
// но доступны в один клик для теста/показа вариантов владельцу.
export function DebugPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="debug-panel">
      {open && (
        <div className="debug-toolbar" role="dialog" aria-label="Панель отладки">
          <ThemeDebugToggle />
          <DebugVariantToggle
            label="Цветовые палитры"
            attribute="data-palette"
            storageKey="rk-palette"
            variants={paletteVariants}
          />
          <DebugVariantToggle
            label="Шрифтовые варианты"
            attribute="data-fonts"
            storageKey="rk-fonts"
            variants={fontVariants}
          />
        </div>
      )}
      <button
        type="button"
        className="debug-panel__trigger"
        aria-expanded={open}
        aria-label={open ? 'Скрыть панель отладки' : 'Открыть панель отладки'}
        onClick={() => setOpen((value) => !value)}
      >
        🐞
      </button>
    </div>
  )
}
