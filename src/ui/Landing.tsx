import { SoundToggle } from './SoundToggle'
import { PlayIcon } from './icons'
import styles from './Landing.module.css'

const GITHUB_URL = 'https://github.com/hyperdevstuff/slotmac'

const TAGS = ['UI-elements', 'Colors', 'Fonts', 'Anything from Deck']

interface LandingProps {
  visible: boolean
  onPlay: () => void
}

export function Landing({ visible, onPlay }: LandingProps) {
  return (
    <div className={styles.root} data-visible={visible} inert={!visible}>
      <div className={styles.meta}>
        <span className={styles.eyebrow}>Slot Machine</span>
      </div>

      <div className={styles.topRight}>
        <SoundToggle />
      </div>

      <main className={styles.copy}>
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>Randomizing</span>
          <span className={styles.headlineLine}>Anything</span>
        </h1>

        <p className={styles.body}>
          A slot machine that decides so you don't have to.
          Randomize elements with customized decks.
        </p>

        <ul className={styles.tags} role="list">
          {TAGS.map((tag, index) => (
            <li key={tag} className={styles.tag} style={{ animationDelay: `${index * 80}ms` }}>
              {tag}
            </li>
          ))}
        </ul>

        <button type="button" className={styles.cta} onClick={onPlay}>
          <PlayIcon className={styles.ctaIcon} />
          <span>Play</span>
          <span aria-hidden="true" className={styles.ctaArrow}>
            →
          </span>
        </button>
      </main>

      <a
        className={styles.github}
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub (opens in new tab)"
      >
        <svg
          className={styles.githubIcon}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span>GitHub</span>
      </a>

      <footer className={styles.foot}>Three JS</footer>
    </div>
  )
}
