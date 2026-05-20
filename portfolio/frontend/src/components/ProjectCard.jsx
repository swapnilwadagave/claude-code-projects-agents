import styles from './ProjectCard.module.css'

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
}

export default function ProjectCard({ project }) {
  const { name, description, language, topics, html_url, stargazers_count } = project

  return (
    <a
      href={html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.header}>
        <svg className={styles.repoIcon} viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
        </svg>
        <span className={styles.name}>{name}</span>
        <svg className={styles.arrow} viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
        </svg>
      </div>

      <p className={styles.description}>
        {description || 'No description provided.'}
      </p>

      <div className={styles.footer}>
        {language && (
          <span className={styles.lang}>
            <span
              className={styles.langDot}
              style={{ background: LANG_COLORS[language] || '#888' }}
            />
            {language}
          </span>
        )}
        {stargazers_count > 0 && (
          <span className={styles.stars}>★ {stargazers_count}</span>
        )}
        {topics.slice(0, 3).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </a>
  )
}
