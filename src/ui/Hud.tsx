import { useState } from 'react'
import { THEME } from '../theme/definitions'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { BriefPanel } from './BriefPanel'
import { Button } from './Button'
import { DeckPanel } from './DeckPanel'
import { Hint } from './Hint'
import { Panel } from './Panel'
import { SoundToggle } from './SoundToggle'
import styles from './Hud.module.css'

export function Hud() {
  const view = useGameStore((s) => s.view)
  const phase = useGameStore((s) => s.phase)
  const reels = useGameStore((s) => s.reels)
  const deck = useDeckStore(activeDeck)
  const briefsTaken = useDeckStore((s) => s.briefsTaken)
  const [decksOpen, setDecksOpen] = useState(false)

  const visible = view === 'play'
  const announcement =
    phase === 'result' && reels.every(Boolean)
      ? `${deck.name}: ${deck.reels.map((reel, i) => `${reel.name} ${reels[i]?.label}`).join(', ')}`
      : ''

  return (
    <div className={styles.hud} data-visible={visible} inert={!visible}>
      <div className={`${styles.corner} ${styles.tl}`}>
        <Panel>
          <span className={styles.brand}>SLOT</span>
          <span className={styles.brandSub}>{THEME.tagline}</span>
        </Panel>
      </div>

      <div className={`${styles.corner} ${styles.tr}`}>
        <Panel>
          <span className={styles.readoutLabel}>deck</span>
          <span className={styles.readoutValue}>{deck.name}</span>
          <span className={styles.readoutLabel}>briefs taken {briefsTaken}</span>
        </Panel>
      </div>

      <BriefPanel />

      <div className={`${styles.corner} ${styles.bl}`}>
        <Hint />
      </div>

      <div className={`${styles.corner} ${styles.br}`}>
        <Button onClick={() => setDecksOpen(true)}>decks</Button>
        <SoundToggle />
      </div>

      <DeckPanel open={decksOpen} onClose={() => setDecksOpen(false)} />

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
