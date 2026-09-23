export type DishTag = 'vegan' | 'seasonal' | 'min5portions'

export interface Dish {
  name: string
  description: string
  price: number
  // Приблизительная оценка калорийности порции (ккал): рассчитана по
  // составу, не от владельца — показать владельцу и уточнить.
  calories?: number
  tags?: DishTag[]
  image?: string
}

export interface MenuCategory {
  id: string
  title: string
  dishes: Dish[]
}

export interface MenuSet {
  name: string
  price: number
  // Сумма оценок калорийности позиций сета.
  calories?: number
  items: string[]
  tags?: DishTag[]
  image?: string
}

// Позиция корзины: id = "<раздел>:<название>" (гарантированно уникален,
// т.к. названия блюд уникальны в пределах раздела). description/image
// нужны для PDF-выгрузки заказа (фото + описание в таблице),
// sectionTitle — для разбивки итога по разделам.
export interface CartItem {
  id: string
  name: string
  sectionTitle: string
  description: string
  price: number
  calories?: number
  tags?: DishTag[]
  qty: number
  image?: string
}
