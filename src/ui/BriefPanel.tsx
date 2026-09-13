import { useEffect, useState } from 'react'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { Panel } from './Panel'
import { Button } from './Button'
import styles from './BriefPanel.module.css'

/**
 * The full text of the draw. The machine's own readout can only fit abbreviated labels
 * on the drums, so this is where the brief is spelled out and taken away.
 */
export function BriefPanel() {
  const deck = useDeckStore(activeDeck)
  const briefsTaken = useDeckStore((s) => s.briefsTaken)
  const reels = useGameStore((s) => s.reels)
  const phase = useGameStore((s) => s.phase)
  const [copied, setCopied] = useState(false)

  const complete = reels.every(Boolean)
  const show = phase === 'result' && complete

  useEffect(() => {
    if (!show) setCopied(false)
  }, [show])

  const brief = [
    `${deck.name} — brief ${briefsTaken}`,
    ...deck.reels.map((reel, index) => `${reel.name}: ${reels[index]?.label ?? '—'}`),
  ].join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the brief is on screen either way */
    }
  }

  return (
    <div className={styles.root} data-show={show} inert={!show}>
      <Panel className={styles.panel}>
        <span className={styles.caption}>{deck.name}</span>
        <ul className={styles.rows}>
          {deck.reels.map((reel, index) => (
            <li key={reel.id} className={styles.row}>
              <span className={styles.reel}>{reel.name}</span>
              <span className={styles.item}>{reels[index]?.label ?? '—'}</span>
            </li>
          ))}
        </ul>
        <Button className={styles.copy} onClick={copy}>
          {copied ? 'copied' : 'copy brief'}
        </Button>
      </Panel>
    </div>
  )
}
