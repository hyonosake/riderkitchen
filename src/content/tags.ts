import type { DishTag } from './types'

// Подписи тегов блюд — общие для карточек на сайте и PDF-листа заказа.
export const tagLabels: Record<DishTag, string> = {
  vegan: 'vegan',
  seasonal: 'сезонное',
  min5portions: 'заказ от 5 порций',
}
