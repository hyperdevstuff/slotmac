import { useEffect, useState } from 'react'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { Panel } from './Panel'
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
        <button type="button" className={styles.copy} onClick={copy} aria-label={copied ? 'Brief copied' : 'Copy brief'} title={copied ? 'Copied' : 'Copy brief'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
          </svg>
        </button>
        <span className="sr-only" role="status">{copied ? 'Brief copied' : ''}</span>
      </Panel>
    </div>
  )
}
