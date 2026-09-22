import { contacts } from './menu'

// Тексты Hero-секции: контент отдельно от компонентов (см. AGENTS.md),
// чтобы править формулировки без трогания JSX. Кнопка-телефон берёт
// номер из contacts, чтобы не рассинхронизировалось с футером.
export const hero = {
  kicker: 'Кейтеринг для съёмочных команд',
  title: 'Питание команды',
  subtitle:
    'Райдер артистов: готовим сами и привозим на площадку — завтраки, супы, горячее и готовые сеты.',
  primaryCta: { label: contacts.phone, href: contacts.phoneHref },
  secondaryCta: { label: 'Готовые сеты', href: '#sets' },
  posterAlt: 'Логотип-плакат Rider Kitchen — «Feed Your Team»',
}
