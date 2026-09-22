import { useState } from 'react'
import type { MenuCategory } from '../content/types'
import { contacts } from '../content/menu'
import { formatPrice, pluralizeRu } from '../lib/format'

export function Header({
  categories,
  cartCount,
  cartTotal,
  onCartOpen,
}: {
  categories: MenuCategory[]
  cartCount: number
  cartTotal: number
  onCartOpen: () => void
}) {
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
        {/* Корзина справа вверху: иконка + сумма + бейдж с количеством
            позиций; на мобильных остаётся справа от бургера. */}
        <button
          type="button"
          className="header__cart"
          aria-label={`Открыть корзину: ${cartCount} ${pluralizeRu(cartCount, ['позиция', 'позиции', 'позиций'])} на ${formatPrice(cartTotal)}`}
          onClick={onCartOpen}
        >
          <svg
            className="header__cart-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Корзина */}
            <path d="M4 7h16l-1.5 12.5a1.5 1.5 0 0 1-1.5 1.3H7a1.5 1.5 0 0 1-1.5-1.3L4 7Z" />
            <path d="M9 10V5.5a3 3 0 0 1 6 0V10" />
          </svg>
          <span className="header__cart-total">{formatPrice(cartTotal)}</span>
          {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
        </button>
        <button
          type="button"
          className={`header__burger${isNavOpen ? ' header__burger--open' : ''}`}
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
