import styles from './About.module.css'

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <h2 className="section-title">About</h2>
        <div className={styles.grid}>
          <div className={styles.text}>
            <p>
              I'm a software developer with experience building web applications
              using JavaScript, React, and Node.js. I enjoy solving problems and
              turning ideas into working products.
            </p>
            <p>
              My projects range from interactive React apps to server-side Node.js
              applications. I'm always looking to learn new technologies and improve
              my craft.
            </p>
            <p>
              When I'm not coding, I'm exploring new tools and contributing to
              open-source projects.
            </p>
          </div>
          <div className={styles.avatar}>
            <img
              src="https://avatars.githubusercontent.com/u/7070082?v=4"
              alt="Swapnil Wadagave"
              className={styles.avatarImg}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
