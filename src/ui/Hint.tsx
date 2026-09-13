import { useGameStore } from '../stores/gameStore'
import { Panel } from './Panel'
import styles from './Hud.module.css'

export function Hint() {
  const phase = useGameStore((s) => s.phase)

  const text =
    phase === 'intro'
      ? 'initialising'
      : phase === 'spinning'
        ? 'in play'
        : phase === 'result'
          ? 'pull again'
          : 'pull the lever'

  return (
    <Panel>
      <span className={styles.hintLabel}>{text}</span>
    </Panel>
  )
}
