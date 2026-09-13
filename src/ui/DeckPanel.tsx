import { useState } from 'react'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { DRUM_LABEL_MAX, drumLabel } from '../lib/deck'
import { Button } from './Button'
import styles from './DeckPanel.module.css'

/**
 * Load the machine. Each deck is a set of reels, each reel is a list of items — this is
 * the only place the user writes anything; the machine just draws from it.
 */
export function DeckPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const decks = useDeckStore((s) => s.decks)
  const activeDeckId = useDeckStore((s) => s.activeDeckId)
  const setActiveDeck = useDeckStore((s) => s.setActiveDeck)
  const addItem = useDeckStore((s) => s.addItem)
  const removeItem = useDeckStore((s) => s.removeItem)
  const resetDecks = useDeckStore((s) => s.resetDecks)

  const deck = useDeckStore(activeDeck)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const submit = (reelId: string) => {
    const value = drafts[reelId] ?? ''
    addItem(reelId, value)
    setDrafts((current) => ({ ...current, [reelId]: '' }))
  }

  return (
    <aside className={styles.root} data-open={open} inert={!open} aria-label="Deck editor">
      <header className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Decks</span>
          <span className={styles.hint}>what the machine draws from</span>
        </div>
        <Button onClick={onClose}>close</Button>
      </header>

      <div className={styles.tabs}>
        {decks.map((entry) => (
          <Button
            key={entry.id}
            active={entry.id === activeDeckId}
            onClick={() => setActiveDeck(entry.id)}
          >
            {entry.name}
          </Button>
        ))}
      </div>

      <div className={styles.reels}>
        {deck.reels.map((reel) => (
          <section key={reel.id} className={styles.reel}>
            <h3 className={styles.reelName}>
              {reel.name}
              <span className={styles.count}>{reel.items.length}</span>
            </h3>

            <ul className={styles.items}>
              {reel.items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <span className={styles.itemLabel}>{item.label}</span>
                  <span className={styles.itemDrum} title={`drawn on the drum as "${drumLabel(item)}"`}>
                    {drumLabel(item)}
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove ${item.label}`}
                    onClick={() => removeItem(reel.id, item.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {reel.items.length === 0 && <li className={styles.empty}>No items — this reel will not spin.</li>}
            </ul>

            <form
              className={styles.add}
              onSubmit={(event) => {
                event.preventDefault()
                submit(reel.id)
              }}
            >
              <input
                type="text"
                value={drafts[reel.id] ?? ''}
                placeholder={`Add to ${reel.name.toLowerCase()}…`}
                maxLength={64}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [reel.id]: event.target.value }))
                }
              />
              <Button type="submit">add</Button>
            </form>
          </section>
        ))}
      </div>

      <footer className={styles.foot}>
        <span className={styles.note}>
          Drum labels are shortened to {DRUM_LABEL_MAX} characters; the full text shows in the brief.
        </span>
        <Button onClick={resetDecks}>reset decks</Button>
      </footer>
    </aside>
  )
}
