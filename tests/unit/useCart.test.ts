import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { menu, sets } from '../../src/content/menu'
import { useCart } from '../../src/hooks/useCart'

// При globals: false авто-cleanup Testing Library не включён — снимаем
// смонтированные renderHook-рендеры вручную между тестами. localStorage
// в jsdom переживает между тестами одного файла — useCart персистит в
// него корзину (rk-cart), поэтому чистим и его, иначе следующий
// renderHook() подхватывает состояние из предыдущего теста.
afterEach(() => {
    cleanup()
    localStorage.clear()
})

// Хук восстанавливает позиции из DISH_BY_KEY (src/lib/catalog.ts), поэтому
// проверяем его на реальном контенте: ключи и ожидаемые поля берём
// программно из menu.ts/sets, чтобы тесты не ломались от правки цен/названий.
function requireSection(id: string) {
    const category = menu.find((item) => item.id === id)
    if (!category) throw new Error(`Раздел «${id}» не найден в menu.ts`)
    return category
}

const setKey = `sets:${sets[0].name}`

describe('useCart: начальное состояние', () => {
    it('пустая корзина: Map без ключей, позиций нет, итоги нулевые', () => {
        const { result } = renderHook(() => useCart())

        expect(result.current.cart.size).toBe(0)
        expect(result.current.cartItems).toEqual([])
        expect(result.current.cartTotal).toBe(0)
        expect(result.current.cartCount).toBe(0)
    })
})

describe('useCart: добавление и замена количества', () => {
    it('handleQtyChange(key, 1) добавляет позицию с полями из справочника', () => {
        const breakfast = requireSection('breakfast')
        const dish = breakfast.dishes[0]
        const key = `${breakfast.id}:${dish.name}`
        const { result } = renderHook(() => useCart())

        act(() => result.current.handleQtyChange(key, 1))

        expect(result.current.cart.get(key)).toBe(1)
        expect(result.current.cartItems).toHaveLength(1)
        const item = result.current.cartItems[0]
        expect(item.id).toBe(key)
        expect(item.name).toBe(dish.name)
        expect(item.price).toBe(dish.price)
        expect(item.sectionTitle).toBe(breakfast.title)
        expect(item.qty).toBe(1)
        expect(result.current.cartTotal).toBe(dish.price)
        expect(result.current.cartCount).toBe(1)
    })

    it('повторный handleQtyChange на тот же ключ заменяет количество, а не суммирует', () => {
        const breakfast = requireSection('breakfast')
        const dish = breakfast.dishes[0]
        const key = `${breakfast.id}:${dish.name}`
        const { result } = renderHook(() => useCart())

        act(() => result.current.handleQtyChange(key, 1))
        act(() => result.current.handleQtyChange(key, 3))

        expect(result.current.cart.get(key)).toBe(3)
        expect(result.current.cartItems).toHaveLength(1)
        expect(result.current.cartItems[0].qty).toBe(3)
        expect(result.current.cartTotal).toBe(dish.price * 3)
        expect(result.current.cartCount).toBe(3)
    })

    it('позиции из разных разделов живут вместе, итоги суммируются', () => {
        const breakfast = requireSection('breakfast')
        const poke = requireSection('poke')
        const dish = breakfast.dishes[0]
        const pokeDish = poke.dishes[0]
        const { result } = renderHook(() => useCart())

        act(() => {
            result.current.handleQtyChange(`${breakfast.id}:${dish.name}`, 1)
            result.current.handleQtyChange(`${poke.id}:${pokeDish.name}`, 2)
            result.current.handleQtyChange(setKey, 1)
        })

        expect(result.current.cart.size).toBe(3)
        expect(result.current.cartItems).toHaveLength(3)
        expect(result.current.cartCount).toBe(4)
        expect(result.current.cartTotal).toBe(dish.price + pokeDish.price * 2 + sets[0].price)

        const sectionTitles = result.current.cartItems.map((item) => item.sectionTitle)
        expect(sectionTitles).toContain(breakfast.title)
        expect(sectionTitles).toContain(poke.title)
        expect(sectionTitles).toContain('Сеты')
    })
})

describe('useCart: удаление (контракт e2e «qty <= 0 удаляет ключ»)', () => {
    it('handleQtyChange(key, 0) удаляет ключ, остальные позиции остаются', () => {
        const breakfast = requireSection('breakfast')
        const poke = requireSection('poke')
        const key = `${breakfast.id}:${breakfast.dishes[0].name}`
        const otherKey = `${poke.id}:${poke.dishes[0].name}`
        const { result } = renderHook(() => useCart())

        act(() => {
            result.current.handleQtyChange(key, 2)
            result.current.handleQtyChange(otherKey, 1)
        })
        act(() => result.current.handleQtyChange(key, 0))

        expect(result.current.cart.has(key)).toBe(false)
        expect(result.current.cart.get(otherKey)).toBe(1)
        expect(result.current.cartItems).toHaveLength(1)
        expect(result.current.cartItems[0].id).toBe(otherKey)
        expect(result.current.cartCount).toBe(1)
    })

    it('отрицательное количество тоже удаляет ключ', () => {
        const breakfast = requireSection('breakfast')
        const key = `${breakfast.id}:${breakfast.dishes[0].name}`
        const { result } = renderHook(() => useCart())

        act(() => result.current.handleQtyChange(key, 1))
        act(() => result.current.handleQtyChange(key, -1))

        expect(result.current.cart.size).toBe(0)
        expect(result.current.cartItems).toEqual([])
        expect(result.current.cartCount).toBe(0)
    })

    it('clear() опустошает корзину целиком', () => {
        const breakfast = requireSection('breakfast')
        const { result } = renderHook(() => useCart())

        act(() => {
            result.current.handleQtyChange(`${breakfast.id}:${breakfast.dishes[0].name}`, 2)
            result.current.handleQtyChange(setKey, 1)
        })
        act(() => result.current.clear())

        expect(result.current.cart.size).toBe(0)
        expect(result.current.cartItems).toEqual([])
        expect(result.current.cartTotal).toBe(0)
        expect(result.current.cartCount).toBe(0)
    })
})

describe('useCart: неизвестный ключ', () => {
    it('ключ без записи в DISH_BY_KEY лежит в cart, но отфильтровывается из cartItems и не растит итоги', () => {
        // Фактическая семантика (src/hooks/useCart.ts): handleQtyChange кладёт в
        // Map любой ключ без проверки, а cartItems отбрасывает позиции, которых
        // нет в справочнике (защитный фильтр `info ? { ...info, qty } : null`).
        // Итоги считаются только по cartItems, поэтому не растут. Фиксируем
        // поведение как есть — без выдуманной валидации ключей.
        const unknownKey = 'unknown:Такого блюда нет'
        const { result } = renderHook(() => useCart())

        act(() => result.current.handleQtyChange(unknownKey, 2))

        expect(result.current.cart.get(unknownKey)).toBe(2)
        expect(result.current.cartItems).toEqual([])
        expect(result.current.cartTotal).toBe(0)
        expect(result.current.cartCount).toBe(0)
    })
})
