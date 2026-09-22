import { describe, expect, it } from 'vitest'
import { menu, sets } from '../../src/content/menu'
import { DISH_BY_KEY } from '../../src/lib/catalog'

// Справочник — чистая функция над реальным контентом, поэтому проверяем
// его на настоящих menu.ts/sets: каждое блюдо и каждый сет обязаны
// находиться по ключу корзины «<id раздела>:<название>» (для сетов —
// «sets:<название>»), а поля — совпадать с контентом.
describe('DISH_BY_KEY: полнота справочника', () => {
  it('каждое блюдо каждого раздела находится по своему ключу', () => {
    for (const category of menu) {
      for (const dish of category.dishes) {
        const key = `${category.id}:${dish.name}`
        const info = DISH_BY_KEY.get(key)
        expect(info, `ключ «${key}» должен быть в справочнике`).toBeDefined()
        expect(info?.name, key).toBe(dish.name)
        expect(info?.sectionTitle, key).toBe(category.title)
        expect(info?.description, key).toBe(dish.description)
        expect(info?.price, key).toBe(dish.price)
        expect(info?.calories, key).toBe(dish.calories)
        expect(info?.image, key).toBe(dish.image)
      }
    }
  })

  it('каждый сет находится по ключу «sets:<название>»', () => {
    for (const set of sets) {
      const key = `sets:${set.name}`
      const info = DISH_BY_KEY.get(key)
      expect(info, `ключ «${key}» должен быть в справочнике`).toBeDefined()
      expect(info?.name, key).toBe(set.name)
      expect(info?.sectionTitle, key).toBe('Сеты')
      // Описание сета — состав через запятую (поведение из App.tsx).
      expect(info?.description, key).toBe(set.items.join(', '))
      expect(info?.price, key).toBe(set.price)
      expect(info?.calories, key).toBe(set.calories)
      expect(info?.image, key).toBe(set.image)
    }
  })

  it('в справочнике нет лишних и дублирующихся ключей', () => {
    const dishCount = menu.reduce((sum, category) => sum + category.dishes.length, 0)
    expect(DISH_BY_KEY.size).toBe(dishCount + sets.length)
  })

  it('несуществующий ключ возвращает undefined', () => {
    expect(DISH_BY_KEY.get('unknown:Такого блюда нет')).toBeUndefined()
    expect(DISH_BY_KEY.get('')).toBeUndefined()
  })

  it('санити на реальном контенте: завтраки и сеты читаются по ключам', () => {
    const breakfast = menu.find((category) => category.id === 'breakfast')
    expect(breakfast).toBeDefined()
    if (!breakfast) return
    const first = breakfast.dishes[0]
    expect(DISH_BY_KEY.get(`breakfast:${first.name}`)?.price).toBe(first.price)

    expect(DISH_BY_KEY.get(`sets:${sets[0].name}`)?.sectionTitle).toBe('Сеты')
  })
})
