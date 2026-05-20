import styles from './Skills.module.css'

const SKILL_GROUPS = [
  {
    category: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Java', 'HTML', 'CSS'],
  },
  {
    category: 'Frontend',
    items: ['React', 'Vite', 'CSS Modules'],
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Express'],
  },
  {
    category: 'Tools & Infra',
    items: ['Git', 'Docker', 'nginx', 'Linux'],
  },
]

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <div className={styles.groups}>
          {SKILL_GROUPS.map(({ category, items }) => (
            <div key={category} className={styles.group}>
              <h3 className={styles.category}>{category}</h3>
              <div className={styles.tags}>
                {items.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
