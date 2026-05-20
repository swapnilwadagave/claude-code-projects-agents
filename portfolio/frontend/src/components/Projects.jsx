import ProjectCard from './ProjectCard.jsx'
import repos from '../data/github-repos.json'
import styles from './Projects.module.css'

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className={styles.grid}>
          {repos.map((repo) => (
            <ProjectCard key={repo.name} project={repo} />
          ))}
        </div>
        <p className={styles.ghNote}>
          <a
            href="https://github.com/swapnilwadagave"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all repositories on GitHub ↗
          </a>
        </p>
      </div>
    </section>
  )
}
