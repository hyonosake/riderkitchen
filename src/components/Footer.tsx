import { contacts } from '../content/menu'

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__tagline">Делаем вкусно вам и вашей команде</p>
      <div className="footer__links">
        <a href={contacts.phoneHref}>{contacts.phone}</a>
        <a href={contacts.instagramHref} target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href={contacts.whatsappHref} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </footer>
  )
}
