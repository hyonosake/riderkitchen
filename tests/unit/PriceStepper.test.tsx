import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PriceStepper, QtyStepper } from '../../src/components/PriceStepper'
import { formatPrice } from '../../src/lib/format'

// При globals: false авто-cleanup Testing Library не включён — рендеры
// накапливались бы в document.body между тестами и ломали getBy* запросы.
afterEach(cleanup)

const NAME = 'Сырники, сметана/джем'
const PRICE = 360

// PriceStepper — контролируемый компонент: количество живёт в корзине
// (useCart), компонент только зовёт onQtyChange. Тесты фиксируют
// поведенческий и aria-контракт, на который завязаны e2e-тесты
// (docs/REFACTOR_PLAN.md, раздел «Контракт e2e-селекторов»).
describe('PriceStepper: qty = 0 — пилюля-цена', () => {
    it('рендерит кнопку с ценой (formatPrice) и aria-label добавления', () => {
        render(<PriceStepper name={NAME} price={PRICE} qty={0} onQtyChange={() => { }} />)

        const pill = screen.getByRole('button', {
            name: `Добавить «${NAME}» в заказ — ${formatPrice(PRICE)}`,
        })
        expect(pill.textContent).toBe(formatPrice(PRICE))
        // Степпера ещё нет — только пилюля-цена.
        expect(screen.queryByRole('button', { name: 'Добавить порцию' })).toBeNull()
        expect(screen.queryByRole('button', { name: 'Убрать порцию' })).toBeNull()
    })

    it('клик по пилюле вызывает onQtyChange(1)', () => {
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<PriceStepper name={NAME} price={PRICE} qty={0} onQtyChange={onQtyChange} />)

        fireEvent.click(
            screen.getByRole('button', { name: `Добавить «${NAME}» в заказ — ${formatPrice(PRICE)}` }),
        )

        expect(onQtyChange).toHaveBeenCalledTimes(1)
        expect(onQtyChange).toHaveBeenCalledWith(1)
    })
})

describe('PriceStepper: qty > 0 — степпер с «× N»', () => {
    it('показывает кнопки «+»/«−» и счётчик «× N», пилюли-цены больше нет', () => {
        render(<PriceStepper name={NAME} price={PRICE} qty={2} onQtyChange={() => { }} />)

        expect(screen.getByRole('button', { name: 'Добавить порцию' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Убрать порцию' })).toBeTruthy()
        expect(screen.getByText('2 ×').getAttribute('aria-live')).toBe('polite')
        expect(
            screen.queryByRole('button', { name: `Добавить «${NAME}» в заказ — ${formatPrice(PRICE)}` }),
        ).toBeNull()
    })

    it('клик «+» вызывает onQtyChange(qty + 1)', () => {
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<PriceStepper name={NAME} price={PRICE} qty={2} onQtyChange={onQtyChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Добавить порцию' }))

        expect(onQtyChange).toHaveBeenCalledTimes(1)
        expect(onQtyChange).toHaveBeenCalledWith(3)
    })

    it('клик «−» вызывает onQtyChange(qty − 1)', () => {
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<PriceStepper name={NAME} price={PRICE} qty={2} onQtyChange={onQtyChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Убрать порцию' }))

        expect(onQtyChange).toHaveBeenCalledTimes(1)
        expect(onQtyChange).toHaveBeenCalledWith(1)
    })

    it('при qty = 1 кнопка «−» помечена aria-label «Убрать «X» из заказа» и зовёт onQtyChange(0)', () => {
        // Сам компонент позицию не удаляет: 0 уходит в корзину, где qty <= 0
        // удаляет ключ (useCart). Фиксируем контракт для e2e.
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<PriceStepper name={NAME} price={PRICE} qty={1} onQtyChange={onQtyChange} />)

        const minus = screen.getByRole('button', { name: `Убрать «${NAME}» из заказа` })
        fireEvent.click(minus)

        expect(onQtyChange).toHaveBeenCalledTimes(1)
        expect(onQtyChange).toHaveBeenCalledWith(0)
    })

    it('счётчик обновляется при изменении qty (aria-live)', () => {
        const { rerender } = render(<PriceStepper name={NAME} price={PRICE} qty={2} onQtyChange={() => { }} />)

        rerender(<PriceStepper name={NAME} price={PRICE} qty={3} onQtyChange={() => { }} />)

        expect(screen.getByText('3 ×')).toBeTruthy()
    })
})

describe('QtyStepper: степпер внутри корзины', () => {
    it('группа «Порции «X»» с «+»/«−» и ценой за единицу в центре', () => {
        render(<QtyStepper name={NAME} price={PRICE} qty={1} onQtyChange={() => { }} />)

        expect(screen.getByRole('group', { name: `Порции «${NAME}»` })).toBeTruthy()
        expect(screen.getByText(formatPrice(PRICE))).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Добавить порцию' })).toBeTruthy()
        expect(screen.getByRole('button', { name: `Убрать «${NAME}» из заказа` })).toBeTruthy()
    })

    it('кнопки «+»/«−» зовут колбэк с qty ± 1', () => {
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<QtyStepper name={NAME} price={PRICE} qty={5} onQtyChange={onQtyChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Добавить порцию' }))
        fireEvent.click(screen.getByRole('button', { name: 'Убрать порцию' }))

        expect(onQtyChange).toHaveBeenNthCalledWith(1, 6)
        expect(onQtyChange).toHaveBeenNthCalledWith(2, 4)
    })

    it('потолок 99 порций: «+» при qty = 99 зовёт onQtyChange(99), а не 100', () => {
        const onQtyChange = vi.fn<(qty: number) => void>()
        render(<QtyStepper name={NAME} price={PRICE} qty={99} onQtyChange={onQtyChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Добавить порцию' }))

        expect(onQtyChange).toHaveBeenCalledTimes(1)
        expect(onQtyChange).toHaveBeenCalledWith(99)
    })
})
