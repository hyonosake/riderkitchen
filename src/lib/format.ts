export function formatPrice(price: number): string {
  return `${price} ₽`
}

// Дата заказа из <input type="date"> (ISO «YYYY-MM-DD») → «ДД.ММ.ГГГГ»
// для текста заказа и PDF. Пустая/некорректная строка — как есть.
export function formatDateRu(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : iso
}

// Маска даты для ручного ввода: цифры → «ДД.ММ.ГГГГ» (8 цифр максимум).
// Backspace на границе маски обрабатывается как в formatPhoneRuOnChange.
export function formatDateRuOnChange(raw: string, prev: string): string {
  const isDeletion = raw.length < prev.length
  let digits = raw.replace(/\D/g, '')
  if (isDeletion) {
    const prevDigits = prev.replace(/\D/g, '')
    if (digits.length > 0 && digits.length >= prevDigits.length) {
      digits = digits.slice(0, -1)
    }
  }
  digits = digits.slice(0, 8)

  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  let out = day
  if (day.length === 2) out += '.'
  out += month
  if (month.length === 2) out += '.'
  out += year
  return out
}

// «ДД.ММ.ГГГГ» → ISO («YYYY-MM-DD»), только если дата реально
// существует в календаре (отсекает 31.02 и т.п.). Иначе — ''.
export function parseDateRuToIso(masked: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(masked)
  if (!match) return ''
  const [, dd, mm, yyyy] = match
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)
  const date = new Date(year, month - 1, day)
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isRealDate ? `${yyyy}-${mm}-${dd}` : ''
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

// Обработчик onChange для маскированного поля: formatPhoneRu сам по
// себе ломает Backspace на границе маски — когда курсор стоит сразу
// после «)»/«-»/пробела, удаляется только этот символ маски, а
// formatPhoneRu, пересобирая строку из цифр, тут же рисует его
// обратно (набор цифр не изменился), и поле визуально не реагирует
// на нажатие. Здесь сравниваем количество цифр до и после: если при
// удалении символов цифр стало не меньше — значит, стёрли символ
// маски вхолостую, и нужно убрать ещё и последнюю цифру.
export function formatPhoneRuOnChange(raw: string, prev: string): string {
  const isDeletion = raw.length < prev.length
  let digits = raw.replace(/\D/g, '')
  if (isDeletion) {
    const prevDigits = prev.replace(/\D/g, '')
    if (digits.length > 0 && digits.length >= prevDigits.length) {
      digits = digits.slice(0, -1)
    }
  }
  return formatPhoneRu(digits)
}
