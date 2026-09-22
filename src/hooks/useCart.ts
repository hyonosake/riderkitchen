import { useMemo, useState } from 'react'
import type { CartItem } from '../content/types'
import { DISH_BY_KEY } from '../lib/catalog'

// Стейт корзины, вынесенный из App.tsx: Map «ключ позиции → количество»
// (useState, без стейт-менеджеров — AGENTS.md), операции над ним и
// производные значения. Ключ — "<id раздела>:<название>", данные позиции
// восстанавливаются из справочника DISH_BY_KEY (src/lib/catalog.ts).
export function useCart() {
    const [cart, setCart] = useState(new Map<string, number>())

    // qty <= 0 удаляет ключ из Map (контракт e2e: позиция исчезает из корзины).
    const handleQtyChange = (key: string, qty: number) => {
        setCart((prev) => {
            const next = new Map(prev)
            if (qty <= 0) next.delete(key)
            else next.set(key, qty)
            return next
        })
    }

    const clear = () => setCart(new Map())

    const cartItems = useMemo<CartItem[]>(
        () =>
            [...cart.entries()]
                .map(([id, qty]) => {
                    const info = DISH_BY_KEY.get(id)
                    // Позиции без данных в справочнике быть не должно — фильтруем на всякий случай.
                    return info ? { id, ...info, qty } : null
                })
                .filter((item): item is CartItem => item !== null),
        [cart],
    )

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

    return { cart, handleQtyChange, clear, cartItems, cartTotal, cartCount }
}
