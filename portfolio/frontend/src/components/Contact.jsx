import { useState } from 'react'
import styles from './Contact.module.css'

// Phase 2: replace mailto href with fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
export default function Contact() {
  const [copied, setCopied] = useState(false)
  const email = 'swapnil.wadagave@gmail.com'

  function copyEmail() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section id="contact">
      <div className="container">
        <h2 className="section-title">Contact</h2>
        <div className={styles.wrapper}>
          <p className={styles.intro}>
            Interested in working together or have a question? Reach out —
            I'll get back to you as soon as I can.
          </p>
          <div className={styles.actions}>
            <a
              href={`mailto:${email}`}
              className={styles.btnPrimary}
            >
              Send Email ↗
            </a>
            <button
              className={styles.btnSecondary}
              onClick={copyEmail}
              type="button"
            >
              {copied ? 'Copied!' : 'Copy Email'}
            </button>
          </div>
          <div className={styles.links}>
            <a
              href="https://github.com/swapnilwadagave"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
