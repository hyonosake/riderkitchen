import { describe, expect, it } from 'vitest'

// Smoke-тест инфраструктуры Vitest (этап R1): проверяет, что раннер,
// jsdom-окружение и типизация тестов работают. Удалять не обязательно —
// он же проверяет сам юнит-контур при любом прогоне.
describe('vitest infra', () => {
  it('раннер работает и jsdom доступен', () => {
    expect(typeof document).toBe('object')
    expect(document.createElement('div').tagName).toBe('DIV')
    expect(1 + 1).toBe(2)
  })
})
