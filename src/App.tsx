import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MenuSection } from './components/MenuSection'
import { SetsSection } from './components/SetsSection'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { ThemeDebugToggle } from './components/ThemeDebugToggle'
import { FontDebugToggle } from './components/FontDebugToggle'
import { useCart } from './hooks/useCart'
import { menu, sets } from './content/menu'

function App() {
  const { cart, handleQtyChange, clear, cartItems, cartTotal, cartCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      {/* Временные дебаг-инструменты (тема + шрифтовые варианты A–E) —
          убрать перед презентацией владельцу. */}
      <div className="debug-toolbar">
        <ThemeDebugToggle />
        <FontDebugToggle />
      </div>
      <Header
        categories={menu}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onCartOpen={() => setIsCartOpen(true)}
      />
      <Hero />
      <main>
        {menu.map((category, index) => (
          <MenuSection
            key={category.id}
            category={category}
            index={index + 1}
            cart={cart}
            onQtyChange={handleQtyChange}
          />
        ))}
        <SetsSection sets={sets} index={menu.length + 1} cart={cart} onQtyChange={handleQtyChange} />
      </main>
      <Footer />
      <CartDrawer
        items={cartItems}
        total={cartTotal}
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onQtyChange={handleQtyChange}
        onClear={clear}
      />
    </>
  )
}

export default App
