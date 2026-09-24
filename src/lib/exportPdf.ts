import type { jsPDF as JsPdf } from 'jspdf'
import type { CartItem } from '../content/types'
import { tagLabels } from '../content/tags'
import { contacts } from '../content/menu'
import { formatDateRu, formatPrice } from './format'
import { buildSectionSummary } from './order'

// Векторный PDF состава заказа: лист рисуется примитивами jsPDF —
// текст остаётся текстом (чёткий в любом зуме, выделяется и ищется),
// рамки и линии векторные; растровые только фото блюд. Раньше лист
// снимался html2canvas в картинку и пикселил при увеличении.
//
// jsPDF и шрифты грузятся только по клику «Сохранить в PDF»
// (динамический import + fetch). Шрифты — те же, что на сайте в
// активном варианте (роли --font-heading/--font-dish/… и веса
// --w-dish/--w-price/--w-label из src/index.css); кириллице нужны
// встроенные TTF — они в src/assets/fonts (Семейство-Начертание.ttf).
// Цвета — токены активной палитры в светлом наборе (см. .pdf-sheet
// в src/index.css).

type Rgb = [number, number, number]

// TTF-файлы шрифтов: имя «GolosText-SemiBold.ttf» → семейство + вес.
// URL-ы собираются при сборке, сами файлы качаются только при экспорте.
const FONT_FILES = import.meta.glob('../assets/fonts/*.ttf', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>
const WEIGHT_BY_NAME: Record<string, number> = {
  Light: 300,
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
}
const FONT_URLS = new Map<string, Map<number, string>>()
for (const [path, url] of Object.entries(FONT_FILES)) {
  const match = /\/([A-Za-z]+)-([A-Za-z]+)\.ttf$/.exec(path)
  const weight = match && WEIGHT_BY_NAME[match[2]]
  if (!match || !weight) continue
  if (!FONT_URLS.has(match[1])) FONT_URLS.set(match[1], new Map())
  FONT_URLS.get(match[1])?.set(weight, url)
}
const FALLBACK_FAMILY = 'Onest'

type FontRef = { family: string; weight: number }

// Семейство из CSS («'Golos Text', system-ui, sans-serif») + вес →
// доступный TTF: нет семейства — Onest, нет веса — ближайший.
function resolveFont(cssFamily: string, weight: number): FontRef {
  const name = cssFamily.split(',')[0].trim().replace(/['"]/g, '').replace(/\s+/g, '')
  const family = FONT_URLS.has(name) ? name : FALLBACK_FAMILY
  const weights = [...(FONT_URLS.get(family)?.keys() ?? [400])]
  const nearest = weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best))
  return { family, weight: nearest }
}

// Шрифтовые роли PDF — как на сайте: заголовок (бренд), названия блюд,
// основной текст, цены, метки.
type Fonts = {
  heading: string
  dish: string
  body: string
  price: string
  label: string
  dishWeight: number
  priceWeight: number
  labelWeight: number
}

type Palette = {
  text: Rgb
  muted: Rgb
  bg: Rgb
  surface: Rgb
  border: Rgb
  accent: Rgb
}

// Раскладка листа в pt (A4 595×842). Пропорции — как у прежнего
// HTML-листа, пересчитанные из px (×0.75).
const PAGE = { marginX: 36, marginTop: 32, marginBottom: 32 }
const ROW = { padding: 8, photo: 72, gap: 10, qtyWidth: 46, sumWidth: 70, radius: 8, spacing: 10 }
// Фото растеризуются с запасом (×3 от размера в pt) — чёткие при печати.
const PHOTO_PX = ROW.photo * 3

// Токены берутся с временного узла .pdf-sheet: для него index.css
// всегда отдаёт светлый набор активной палитры, шрифтовые роли —
// активного варианта (data-fonts на <html>). Любой CSS-цвет приводится
// к #rrggbb через canvas.
function readTheme(): { colors: Palette; fonts: Fonts } {
  const probe = document.createElement('div')
  probe.className = 'pdf-sheet'
  document.body.append(probe)
  const style = getComputedStyle(probe)
  const ctx = document.createElement('canvas').getContext('2d')
  const toRgb = (name: string, fallback: string): Rgb => {
    const value = style.getPropertyValue(name).trim() || fallback
    let hex = fallback
    if (ctx) {
      ctx.fillStyle = fallback
      ctx.fillStyle = value
      hex = String(ctx.fillStyle)
    }
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : [0, 0, 0]
  }
  const colors: Palette = {
    text: toRgb('--text', '#262626'),
    muted: toRgb('--text-muted', '#6b6560'),
    bg: toRgb('--bg', '#ffe8db'),
    surface: toRgb('--surface', '#fff6ef'),
    border: toRgb('--border', '#f0d2be'),
    accent: toRgb('--accent', '#3a7d44'),
  }
  const fontVar = (name: string) => style.getPropertyValue(name).trim() || FALLBACK_FAMILY
  const weightVar = (name: string, fallback: number) =>
    Number(style.getPropertyValue(name).trim()) || fallback
  const fonts: Fonts = {
    heading: fontVar('--font-heading'),
    dish: fontVar('--font-dish'),
    body: fontVar('--font-body'),
    price: fontVar('--font-price'),
    label: fontVar('--font-label'),
    dishWeight: weightVar('--w-dish', 600),
    priceWeight: weightVar('--w-price', 700),
    labelWeight: weightVar('--w-label', 600),
  }
  probe.remove()
  return { colors, fonts }
}

async function fetchBase64(url: string): Promise<string> {
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer())
  let binary = ''
  // Кусками: String.fromCharCode(...bytes) на 100 КБ переполнит стек.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

// Встраивает только реально используемые начертания; имя шрифта в
// jsPDF — семейство, стиль — «w<вес>».
async function registerFonts(pdf: JsPdf, refs: FontRef[]): Promise<void> {
  const unique = [...new Map(refs.map((ref) => [`${ref.family}-${ref.weight}`, ref])).values()]
  const data = await Promise.all(
    unique.map((ref) => fetchBase64(FONT_URLS.get(ref.family)?.get(ref.weight) ?? '')),
  )
  unique.forEach((ref, index) => {
    const file = `${ref.family}-${ref.weight}.ttf`
    pdf.addFileToVFS(file, data[index])
    pdf.addFont(file, ref.family, `w${ref.weight}`)
  })
}

// Фото → квадратный JPEG: object-fit: cover, скруглённые углы, фон
// карточки под прозрачными краями тарелок (JPEG без альфы).
async function photoToJpeg(src: string, background: Rgb): Promise<string | null> {
  const image = new Image()
  image.src = src
  try {
    await image.decode()
  } catch {
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = PHOTO_PX
  canvas.height = PHOTO_PX
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = `rgb(${background.join(' ')})`
  ctx.fillRect(0, 0, PHOTO_PX, PHOTO_PX)
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(0, 0, PHOTO_PX, PHOTO_PX, (6 / ROW.photo) * PHOTO_PX)
  ctx.clip()
  ctx.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_PX,
    PHOTO_PX,
  )
  ctx.restore()
  return canvas.toDataURL('image/jpeg', 0.9)
}

export async function exportOrderPdf(
  order: { items: CartItem[]; total: number; name?: string; date?: string },
  fileName: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const { colors, fonts } = readTheme()
  // Роль + вес → конкретное начертание (с запасным вариантом).
  const role = {
    brand: resolveFont(fonts.heading, 700),
    dish: resolveFont(fonts.dish, fonts.dishWeight),
    body: resolveFont(fonts.body, 400),
    bodyLight: resolveFont(fonts.body, 300),
    bodyBold: resolveFont(fonts.body, 700),
    price: resolveFont(fonts.price, fonts.priceWeight),
    label: resolveFont(fonts.label, fonts.labelWeight),
  }
  await registerFonts(pdf, Object.values(role))

  const withPhoto = order.items.filter((item) => item.image)
  const noPhoto = order.items.filter((item) => !item.image)
  const photos = await Promise.all(
    withPhoto.map((item) => photoToJpeg(item.image as string, colors.surface)),
  )

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const left = PAGE.marginX
  const right = pageWidth - PAGE.marginX
  const contentWidth = right - left
  const bottomLimit = pageHeight - PAGE.marginBottom

  const font = (ref: FontRef, size: number, color: Rgb) => {
    pdf.setFont(ref.family, `w${ref.weight}`)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
  }
  const paintBackground = () => {
    pdf.setFillColor(...colors.bg)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
  }
  let y = PAGE.marginTop
  // Новая страница, если блок высотой height не влезает.
  const ensureSpace = (height: number) => {
    if (y + height <= bottomLimit) return
    pdf.addPage()
    paintBackground()
    y = PAGE.marginTop
  }
  // Метка тега (vegan) — контурная пилюля акцентом, как .dish-tag на сайте.
  const drawTag = (label: string, x: number, baselineY: number) => {
    font(role.label, 7, colors.accent)
    pdf.setCharSpace(0.4)
    const text = label.toUpperCase()
    const width = pdf.getTextWidth(text) + 10
    pdf.setDrawColor(...colors.accent)
    pdf.setLineWidth(0.75)
    pdf.roundedRect(x, baselineY - 8, width, 11, 5.5, 5.5, 'S')
    pdf.text(text, x + 5, baselineY)
    pdf.setCharSpace(0)
  }
  const isVegan = (item: CartItem) => item.tags?.includes('vegan') ?? false

  paintBackground()

  // ─── Шапка: бренд + подпись слева, имя/дата/телефон справа
  // (построчно, сверху вниз), акцентная линия.
  font(role.brand, 17, colors.text)
  pdf.text('Rider Kitchen', left, y + 14)
  font(role.body, 10, colors.muted)
  pdf.text('Состав заказа', left, y + 30)

  const fields: Array<[string, string]> = [
    ...(order.name ? [['Имя: ', order.name] as [string, string]] : []),
    ...(order.date ? [['Дата: ', formatDateRu(order.date)] as [string, string]] : []),
    ['Телефон: ', contacts.phone],
  ]
  fields.forEach(([label, value], index) => {
    const lineY = y + 14 + index * 14
    font(role.bodyBold, 10, colors.text)
    pdf.text(value, right, lineY, { align: 'right' })
    const valueWidth = pdf.getTextWidth(value)
    font(role.body, 10, colors.muted)
    pdf.text(label, right - valueWidth, lineY, { align: 'right' })
  })

  y += Math.max(42, 14 + fields.length * 14 + 12)
  pdf.setDrawColor(...colors.accent)
  pdf.setLineWidth(1.5)
  pdf.line(left, y, right, y)
  y += 16

  // ─── Позиции с фото: карточка фото | название+описание | кол-во | сумма.
  const infoX = left + ROW.padding + ROW.photo + ROW.gap
  const sumRight = right - ROW.padding
  const qtyCenter = sumRight - ROW.sumWidth - ROW.gap - ROW.qtyWidth / 2
  const infoWidth = qtyCenter - ROW.qtyWidth / 2 - ROW.gap - infoX

  withPhoto.forEach((item, index) => {
    font(role.body, 9, colors.muted)
    const descLines: string[] = item.description ? pdf.splitTextToSize(item.description, infoWidth) : []
    font(role.dish, 10.5, colors.text)
    const tagWidth = isVegan(item) ? 50 : 0
    const nameLines: string[] = pdf.splitTextToSize(item.name, infoWidth - tagWidth)
    const textHeight = nameLines.length * 13 + (descLines.length ? 3 + descLines.length * 12.5 : 0)
    const rowHeight = Math.max(ROW.photo, textHeight) + ROW.padding * 2
    ensureSpace(rowHeight)

    pdf.setFillColor(...colors.surface)
    pdf.setDrawColor(...colors.border)
    pdf.setLineWidth(0.75)
    pdf.roundedRect(left, y, contentWidth, rowHeight, ROW.radius, ROW.radius, 'FD')

    const photo = photos[index]
    if (photo) {
      pdf.addImage(photo, 'JPEG', left + ROW.padding, y + (rowHeight - ROW.photo) / 2, ROW.photo, ROW.photo)
    }

    let textY = y + (rowHeight - textHeight) / 2 + 10
    font(role.dish, 10.5, colors.text)
    nameLines.forEach((line, lineIndex) => {
      pdf.text(line, infoX, textY)
      if (lineIndex === nameLines.length - 1 && isVegan(item)) {
        drawTag(tagLabels.vegan, infoX + pdf.getTextWidth(line) + 6, textY)
        font(role.dish, 10.5, colors.text)
      }
      textY += 13
    })
    if (descLines.length) {
      textY += 3
      font(role.body, 9, colors.muted)
      descLines.forEach((line) => {
        pdf.text(line, infoX, textY)
        textY += 12.5
      })
    }

    const middle = y + rowHeight / 2
    font(role.body, 10.5, colors.text)
    pdf.text(`× ${item.qty}`, qtyCenter, middle + 4, { align: 'center' })
    font(role.price, 11.5, colors.accent)
    pdf.text(formatPrice(item.price * item.qty), sumRight, middle + 4, { align: 'right' })

    y += rowHeight + ROW.spacing
  })

  // ─── Позиции без фото (гарниры, напитки) — компактные строки после
  // пунктирной линии.
  if (noPhoto.length) {
    ensureSpace(30)
    pdf.setDrawColor(...colors.border)
    pdf.setLineWidth(0.75)
    pdf.setLineDashPattern([3, 3], 0)
    pdf.line(left, y, right, y)
    pdf.setLineDashPattern([], 0)
    y += 18
    noPhoto.forEach((item) => {
      ensureSpace(18)
      font(role.dish, 10, colors.text)
      pdf.text(item.name, left + ROW.padding, y)
      if (isVegan(item)) drawTag(tagLabels.vegan, left + ROW.padding + pdf.getTextWidth(item.name) + 6, y)
      font(role.body, 10, colors.muted)
      pdf.text(`× ${item.qty}`, qtyCenter, y, { align: 'center' })
      font(role.price, 10, colors.accent)
      pdf.text(formatPrice(item.price * item.qty), sumRight, y, { align: 'right' })
      y += 18
    })
  }

  // ─── Итог: разбивка по разделам списком (тонким шрифтом) слева,
  // «Итого» справа внизу блока.
  const summary = buildSectionSummary(order.items)
  const summaryHeight = 16 + summary.length * 14
  ensureSpace(summaryHeight + 10)
  y += 4
  pdf.setDrawColor(...colors.border)
  pdf.setLineWidth(0.75)
  pdf.line(left, y, right, y)
  y += 18

  const listRight = left + 170
  summary.forEach(([title, qty]) => {
    font(role.bodyLight, 10, colors.muted)
    pdf.text(title, left, y)
    font(role.body, 10, colors.text)
    pdf.text(String(qty), listRight, y, { align: 'right' })
    y += 14
  })

  const totalText = formatPrice(order.total)
  font(role.price, 18, colors.accent)
  pdf.text(totalText, right, y, { align: 'right' })
  const totalWidth = pdf.getTextWidth(totalText)
  font(role.body, 10.5, colors.text)
  pdf.text('Итого:', right - totalWidth - 6, y, { align: 'right' })

  pdf.save(fileName)
}
