import { useState } from 'react'

// Дебаг-переключатель темы — временный инструмент, чтобы посмотреть
// тёмную инверсию (#262626 / #FFE8DB). Дефолт сайта — светлая тема,
// тёмная включается только явно (data-theme='dark' в index.css),
// без привязки к системной prefers-color-scheme.
// Не финальная фича, можно убрать перед презентацией владельцу.
export function ThemeDebugToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
    }

    return (
        <button type="button" className="debug-toggle" onClick={toggle}>
            debug: {theme === 'light' ? '☀️ light' : '🌙 dark'}
        </button>
    )
}

