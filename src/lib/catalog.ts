import { menu, sets } from '../content/menu'
import type { CartItem } from '../content/types'

// Значение справочника: всё, что нужно корзине/PDF/WhatsApp-тексту,
// кроме id (он же ключ) и qty (лежит в стейте корзины).
export type DishInfo = Omit<CartItem, 'id' | 'qty'>

// Справочник позиций по ключу корзины ("<раздел>:<название>") —
// чтобы восстановить имя/цену/описание/калораж/фото/раздел из стейта
// Map<string, number>.
export const DISH_BY_KEY = new Map<string, DishInfo>()
for (const category of menu) {
    for (const dish of category.dishes) {
        DISH_BY_KEY.set(`${category.id}:${dish.name}`, {
            name: dish.name,
            sectionTitle: category.title,
            description: dish.description,
            price: dish.price,
            calories: dish.calories,
            image: dish.image,
        })
    }
}
for (const set of sets) {
    DISH_BY_KEY.set(`sets:${set.name}`, {
        name: set.name,
        sectionTitle: 'Сеты',
        description: set.items.join(', '),
        price: set.price,
        calories: set.calories,
        image: set.image,
    })
}
