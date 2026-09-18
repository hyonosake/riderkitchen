import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MenuSection } from './components/MenuSection'
import { SetsSection } from './components/SetsSection'
import { Footer } from './components/Footer'
import { menu, sets } from './content/menu'

// Дебаг-переключатель темы — временный инструмент, чтобы посмотреть
// инверсию цветов (#262626 / #FFE8DB) без смены системной темы.
// Не финальная фича, можно убрать перед презентацией владельцу.
function ThemeDebugToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button type="button" className="theme-debug-toggle" onClick={toggle}>
      debug: {theme === 'light' ? '☀️ light' : '🌙 dark'}
    </button>
  )
}

function App() {
  return (
    <>
      <ThemeDebugToggle />
      <Header categories={menu} />
      <Hero />
      <main>
        {menu.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
        <SetsSection sets={sets} />
      </main>
      <Footer />
    </>
  )
}

export default App
