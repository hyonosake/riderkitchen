import { contacts } from '../content/menu'

// Плавающая кнопка звонка для мобильных: на ≤1099px .header__phone в
// шапке скрыт (не помещается рядом с корзиной/бургером — см.
// 01-header.css), поэтому номер выносим сюда отдельным bubble внизу
// экрана. raised приподнимает её над нижней панелью корзины
// (CartBar.tsx, видна на ≤720px при непустой корзине), чтобы кнопки
// не перекрывали друг друга.
export function PhoneBubble({ raised }: { raised: boolean }) {
  return (
    <a
      href={contacts.phoneHref}
      className={`phone-bubble${raised ? ' phone-bubble--raised' : ''}`}
      aria-label={`Позвонить: ${contacts.phone}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    </a>
  )
}
