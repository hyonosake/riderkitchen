import { describe, expect, it } from 'vitest'
import { formatPhoneRu, formatPrice, isPhoneRuComplete, pluralizeRu } from '../../src/lib/format'

describe('formatPrice', () => {
    it('добавляет знак ₽ к числу', () => {
        expect(formatPrice(450)).toBe('450 ₽')
        expect(formatPrice(0)).toBe('0 ₽')
        expect(formatPrice(1650)).toBe('1650 ₽')
    })
})

describe('pluralizeRu', () => {
    const forms: readonly [string, string, string] = ['порция', 'порции', 'порций']

    it.each([
        [1, 'порция'],
        [21, 'порция'],
        [101, 'порция'],
        [2, 'порции'],
        [3, 'порции'],
        [4, 'порции'],
        [22, 'порции'],
        [104, 'порции'],
        [0, 'порций'],
        [5, 'порций'],
        [11, 'порций'],
        [12, 'порций'],
        [13, 'порций'],
        [14, 'порций'],
        [25, 'порций'],
        [100, 'порций'],
        [111, 'порций'],
        [114, 'порций'],
    ] as const)('%i → «%s»', (count, expected) => {
        expect(pluralizeRu(count, forms)).toBe(expected)
    })
})

describe('formatPhoneRu', () => {
    it.each([
        // e2e-контракт (tests/cart.spec.ts): ввод «9269101010» даёт полный формат.
        ['9269101010', '+7 (926) 910-10-10'],
        ['+7 926 910-10-10', '+7 (926) 910-10-10'],
        ['79269101010', '+7 (926) 910-10-10'],
        ['89269101010', '+7 (926) 910-10-10'], // 8-ка нормализуется в 7
        ['926910', '+7 (926) 910'], // частичный ввод — как во втором e2e-сценарии
        ['926', '+7 (926)'],
        ['92', '+7 (92'],
        ['9', '+7 (9'],
        ['', '+7'],
        ['abc', '+7'], // нецифры отбрасываются
        ['8', '+7'],
        ['5551234567', '+7 (555) 123-45-67'], // без 7/8 — семёрка добавляется
        ['9269101010999', '+7 (926) 910-10-10'], // лишние цифры обрезаются (11 максимум)
    ])('«%s» → «%s»', (raw, expected) => {
        expect(formatPhoneRu(raw)).toBe(expected)
    })
})

describe('isPhoneRuComplete', () => {
    it.each([
        ['+7 (926) 910-10-10', true],
        ['+7 (926) 910', false],
        ['', false],
        ['+7', false],
        ['+7 (926) 910-10-101', false], // 12 цифр — перебор
    ])('«%s» → %p', (input, expected) => {
        expect(isPhoneRuComplete(input)).toBe(expected)
    })
})
