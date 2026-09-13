import { useGameStore } from '../stores/gameStore'
import { ComponentIcon, ColourIcon, LeverIcon, TypeIcon } from './icons'
import { SoundToggle } from './SoundToggle'
import styles from './Landing.module.css'

const AXES = [
  {
    key: 'type',
    label: 'Type',
    Icon: TypeIcon,
    note: 'A typeface, or a pairing.',
  },
  {
    key: 'colour',
    label: 'Colour',
    Icon: ColourIcon,
    note: 'A dominant, an accent, a neutral.',
  },
  {
    key: 'component',
    label: 'Component',
    Icon: ComponentIcon,
    note: 'Hero, pricing, nav, empty state.',
  },
]

export function Landing() {
  const view = useGameStore((s) => s.view)
  const phase = useGameStore((s) => s.phase)
  const enter = useGameStore((s) => s.enter)

  const ready = view === 'landing' && phase !== 'intro'

  return (
    <div className={styles.root} data-visible={ready} inert={!ready}>
      <div className={styles.meta}>
        <span className={styles.eyebrow}>Slot / UI</span>
        <span className={styles.rule} />
        <span className={styles.eyebrowDim}>No. 01</span>
      </div>

      <div className={styles.topRight}>
        <SoundToggle />
      </div>

      <div className={styles.copy}>
        <h1 className={styles.headline}>
          <span>Spin a brief.</span>
          <span>Build it today.</span>
        </h1>

        <p className={styles.body}>
          Three reels decide what you make — a typeface, a palette, a component. No choosing.
          Pull the lever, take the constraint, go design it.
        </p>

        <ul className={styles.axes}>
          {AXES.map(({ key, label, Icon, note }, index) => (
            <li key={key} className={styles.axis}>
              <span className={styles.axisIndex}>{String(index + 1).padStart(2, '0')}</span>
              <Icon className={styles.axisIcon} />
              <span className={styles.axisLabel}>{label}</span>
              <span className={styles.axisNote}>{note}</span>
            </li>
          ))}
        </ul>

        <button type="button" className={styles.cta} onClick={enter}>
          <LeverIcon className={styles.ctaIcon} />
          <span>Pull to start</span>
          <span aria-hidden="true" className={styles.ctaArrow}>
            →
          </span>
        </button>
      </div>

      <p className={styles.foot}>Daily practice · three.js · one machine</p>
    </div>
  )
}
