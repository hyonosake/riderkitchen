import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MenuSection } from './components/MenuSection'
import { SetsSection } from './components/SetsSection'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { CartBar } from './components/CartBar'
import { PhoneBubble } from './components/PhoneBubble'
import { DebugPanel } from './components/DebugPanel'
import { useCart } from './hooks/useCart'
import { menu, sets } from './content/menu'

function App() {
  const { cart, handleQtyChange, clear, cartItems, cartTotal, cartCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <DebugPanel />
      <Header
        categories={menu}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onCartOpen={() => setIsCartOpen(true)}
      />
      <Hero />
      <main>
        {/* Сеты — первым разделом: главный продукт для заказа на команду
            (на них ведёт и главный CTA hero), не в хвосте длинного меню. */}
        <SetsSection sets={sets} index={1} cart={cart} onQtyChange={handleQtyChange} />
        {menu.map((category, index) => (
          <MenuSection
            key={category.id}
            category={category}
            index={index + 2}
            cart={cart}
            onQtyChange={handleQtyChange}
          />
        ))}
      </main>
      <Footer />
      <PhoneBubble raised={cartCount > 0} />
      <CartBar count={cartCount} total={cartTotal} onOpen={() => setIsCartOpen(true)} />
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
