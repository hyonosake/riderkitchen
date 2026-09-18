export type DishTag = 'vegan' | 'seasonal' | 'min5portions'

export interface Dish {
  name: string
  description: string
  price: number
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
  items: string[]
  image?: string
}
