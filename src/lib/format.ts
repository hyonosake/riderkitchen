export function formatPrice(price: number): string {
  return `${price} ₽`
}

// Русские формы множественного числа: pluralizeRu(3, ['сет', 'сета', 'сетов'])
// → 'сета'. Учитывает исключения 11–14.
export function pluralizeRu(count: number, forms: readonly [string, string, string]): string {
  const last = Math.abs(count) % 10
  const lastTwo = Math.abs(count) % 100
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2]
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}

// Маска телефона РФ из сырого ввода: «8926…» и «926…» приводятся к
// «+7 (926) 910-10-10». Лишние цифры отбрасываются (11 максимум).
export function formatPhoneRu(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (digits && !digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)

  const part1 = digits.slice(1, 4)
  const part2 = digits.slice(4, 7)
  const part3 = digits.slice(7, 9)
  const part4 = digits.slice(9, 11)

  let out = '+7'
  if (part1) out += ` (${part1}`
  if (part1.length === 3) out += ')'
  if (part2) out += ` ${part2}`
  if (part3) out += `-${part3}`
  if (part4) out += `-${part4}`
  return out
}

// Телефон введён полностью (10 значащих цифр после +7)?
export function isPhoneRuComplete(formatted: string): boolean {
  return formatted.replace(/\D/g, '').length === 11
}
