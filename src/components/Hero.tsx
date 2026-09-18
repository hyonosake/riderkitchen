import heroImage from '../assets/hero.webp'

export function Hero() {
  return (
    <section id="top" className="hero">
      <img className="hero__image" src={heroImage} alt="Rider Kitchen" />
      <div className="hero__text">
        <h1>Питание команды</h1>
        <p>Райдер артистов</p>
      </div>
    </section>
  )
}
