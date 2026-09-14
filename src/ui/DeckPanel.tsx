import { useState } from 'react'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { SHORT_LABEL_MAX, shortLabel } from '../lib/deck'
import { iconFor, iconIdFor } from '../lib/icons'
import { Button } from './Button'
import { Icon } from './Icon'
import { IconPicker } from './IconPicker'
import styles from './DeckPanel.module.css'

/**
 * Load the machine. Each deck is a set of reels, each reel is a list of items — this is
 * the only place the user writes anything; the machine just draws from it.
 *
 * An item is a label *and* a mark: the label is what the brief spells out, the icon is
 * what the drum shows. Both are editable here.
 */
export function DeckPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const decks = useDeckStore((s) => s.decks)
  const activeDeckId = useDeckStore((s) => s.activeDeckId)
  const setActiveDeck = useDeckStore((s) => s.setActiveDeck)
  const addItem = useDeckStore((s) => s.addItem)
  const removeItem = useDeckStore((s) => s.removeItem)
  const setItemIcon = useDeckStore((s) => s.setItemIcon)
  const resetDecks = useDeckStore((s) => s.resetDecks)

  const deck = useDeckStore(activeDeck)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [picking, setPicking] = useState<string | null>(null)

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
                  <div className={styles.itemRow}>
                    <button
                      type="button"
                      className={styles.itemIcon}
                      aria-expanded={picking === item.id}
                      aria-label={`Icon for ${item.label}`}
                      title="Choose the mark drawn on the drum"
                      onClick={() => setPicking((current) => (current === item.id ? null : item.id))}
                    >
                      <Icon icon={iconFor(item)} size={18} />
                    </button>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span
                      className={styles.itemReadout}
                      title={`The readout shows "${shortLabel(item)}"`}
                    >
                      {shortLabel(item)}
                    </span>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove ${item.label}`}
                      onClick={() => removeItem(reel.id, item.id)}
                    >
                      ×
                    </button>
                  </div>

                  {picking === item.id && (
                    <IconPicker
                      value={iconIdFor(item)}
                      onSelect={(icon) => setItemIcon(reel.id, item.id, icon)}
                    />
                  )}
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
          Icons are drawn on the drums; the readout shortens labels to {SHORT_LABEL_MAX} characters and
          the brief spells them out in full.
        </span>
        <Button onClick={resetDecks}>reset decks</Button>
      </footer>
    </aside>
  )
}
