import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../src/data/github-repos.json')

const FALLBACK_REPOS = [
  {
    name: 'reminder-reactapp-axios',
    description: 'Reminder app built with React and Axios',
    language: 'JavaScript',
    topics: ['react', 'axios'],
    html_url: 'https://github.com/swapnilwadagave/reminder-reactapp-axios',
    stargazers_count: 0,
    forks_count: 0,
  },
  {
    name: 'React-Todo-App',
    description: 'Todo application built with React',
    language: 'JavaScript',
    topics: ['react'],
    html_url: 'https://github.com/swapnilwadagave/React-Todo-App',
    stargazers_count: 0,
    forks_count: 0,
  },
  {
    name: 'quiz-app',
    description: 'Interactive quiz application',
    language: 'JavaScript',
    topics: ['javascript'],
    html_url: 'https://github.com/swapnilwadagave/quiz-app',
    stargazers_count: 0,
    forks_count: 0,
  },
  {
    name: 'Node3-Notes-App',
    description: 'Notes application built with Node.js',
    language: 'JavaScript',
    topics: ['nodejs'],
    html_url: 'https://github.com/swapnilwadagave/Node3-Notes-App',
    stargazers_count: 1,
    forks_count: 0,
  },
  {
    name: 'node3-weather-website',
    description: 'Weather website built with Node.js',
    language: 'JavaScript',
    topics: ['nodejs', 'weather'],
    html_url: 'https://github.com/swapnilwadagave/node3-weather-website',
    stargazers_count: 1,
    forks_count: 0,
  },
]

async function fetchRepos() {
  const res = await fetch(
    'https://api.github.com/users/swapnilwadagave/repos?sort=updated&per_page=20',
    { headers: { 'User-Agent': 'portfolio-build-script' } }
  )
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
  const raw = await res.json()

  return raw
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      description: r.description || '',
      language: r.language || '',
      topics: r.topics || [],
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
    }))
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })

try {
  const repos = await fetchRepos()
  writeFileSync(OUTPUT_PATH, JSON.stringify(repos, null, 2))
  console.log(`✓ Fetched ${repos.length} repos from GitHub → src/data/github-repos.json`)
} catch (err) {
  console.warn(`⚠ GitHub fetch failed (${err.message}), using fallback snapshot`)
  writeFileSync(OUTPUT_PATH, JSON.stringify(FALLBACK_REPOS, null, 2))
}
