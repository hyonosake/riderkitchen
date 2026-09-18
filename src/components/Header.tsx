import { useState } from 'react'
import type { MenuCategory } from '../content/types'
import { contacts } from '../content/menu'

export function Header({ categories }: { categories: MenuCategory[] }) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__bar">
        <a href="#top" className="header__logo" onClick={() => setIsNavOpen(false)}>
          Rider Kitchen
        </a>
        <nav className={`header__nav${isNavOpen ? ' header__nav--open' : ''}`}>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <a href={`#${category.id}`} onClick={() => setIsNavOpen(false)}>
                  {category.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#sets" onClick={() => setIsNavOpen(false)}>
                Сеты
              </a>
            </li>
          </ul>
        </nav>
        <a className="header__phone" href={contacts.phoneHref}>
          {contacts.phone}
        </a>
        <button
          type="button"
          className="header__burger"
          aria-label={isNavOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
