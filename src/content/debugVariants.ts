// Варианты для дебаг-переключалок (DebugVariantToggle). id — значение
// атрибута на <html>, null — дефолт из :root в src/index.css.
// При изменении id синхронизировать список допустимых значений в
// раннем скрипте index.html.

export type DebugVariant = {
  id: string | null
  label: string
  hint: string
  /** [фон, акцент] светлой темы — мини-образец на кнопке. */
  swatch?: readonly [string, string]
}

export const fontVariants: readonly DebugVariant[] = [
  { id: null, label: 'F', hint: 'F (дефолт): Unbounded + Onest — широкий «афишный» гротеск, как буквы логотипа.' },
  { id: 'b', label: 'B', hint: 'B (прежний дефолт): Philosopher в разделах, Onest в блюдах и тексте.' },
  { id: 'g', label: 'G', hint: 'G: Montserrat + Golos Text — геометрия, ближайшая к логотипу.' },
  { id: 'h', label: 'H', hint: 'H: Playfair Display + Onest — ресторанная классика, антиква.' },
  { id: 'i', label: 'I', hint: 'I: Rubik целиком — мягкие скруглённые формы, дружелюбно.' },
]

export const mobileLayoutVariants: readonly DebugVariant[] = [
  { id: null, label: 'Список', hint: 'Список (дефолт): карточки блюд в сетке 2 колонки, как сейчас.' },
  {
    id: 'carousel',
    label: 'Карусель',
    hint: 'Карусель: на мобильных и небольших экранах (≤720px) карточки каждой категории — горизонтальная лента со свайпом вместо сетки.',
  },
]

export const paletteVariants: readonly DebugVariant[] = [
  {
    id: null,
    label: 'Терракота',
    hint: 'Терракота (дефолт): крем + ржавчина — тёплый тренд 2026.',
    swatch: ['#f5ece3', '#a8492a'],
  },
  {
    id: 'peach',
    label: 'Персик',
    hint: 'Персик (прежний дефолт): персиковый #FFE8DB + травяной зелёный.',
    swatch: ['#ffe8db', '#3a7d44'],
  },
  {
    id: 'sage',
    label: 'Шалфей',
    hint: 'Шалфей: зелёные «органик»-тона + глубокий лесной акцент.',
    swatch: ['#eef0e6', '#2f5d3a'],
  },
  {
    id: 'backstage',
    label: 'Бэкстейдж',
    hint: 'Бэкстейдж: ч/б как логотип + красный «REC» (в тёмной — жёлтый гаффер).',
    swatch: ['#f3f1ec', '#c62f1c'],
  },
  {
    id: 'espresso',
    label: 'Эспрессо',
    hint: 'Эспрессо: шоколадные коричневые + янтарный акцент.',
    swatch: ['#f4ede4', '#9a5b00'],
  },
]
