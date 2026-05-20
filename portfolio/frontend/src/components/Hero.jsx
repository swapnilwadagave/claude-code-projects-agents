import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <p className={styles.greeting}>Hi, I'm</p>
        <h1 className={styles.name}>Swapnil Wadagave</h1>
        <p className={styles.role}>Software Developer</p>
        <p className={styles.tagline}>
          Building web apps with JavaScript, React, and Node.js.
        </p>
        <div className={styles.actions}>
          <a href="#projects" className={styles.btnPrimary}>
            View Projects
          </a>
          <a href="#contact" className={styles.btnSecondary}>
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
