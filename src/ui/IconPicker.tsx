import { useMemo, useState } from 'react'
import { ICONS, type IconSource } from '../lib/icons'
import { Icon } from './Icon'
import styles from './IconPicker.module.css'

const SOURCES: { id: IconSource | 'all'; label: string }[] = [
  { id: 'all', label: 'all' },
  { id: 'rune', label: 'rune' },
  { id: 'lucide', label: 'lucide' },
]

/**
 * The mark library, as a grid. Every icon the machine knows about is here — the only
 * way an item gets a mark that means something is if you can see them and pick one.
 */
export function IconPicker({ value, onSelect }: { value: string; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<IconSource | 'all'>('all')

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ICONS.filter(
      (icon) =>
        (source === 'all' || icon.source === source) &&
        (needle === '' ||
          icon.name.toLowerCase().includes(needle) ||
          icon.group.includes(needle) ||
          icon.id.toLowerCase().includes(needle)),
    )
  }, [query, source])

  return (
    <div className={styles.picker}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          value={query}
          placeholder="search icons…"
          aria-label="Search icons"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.sources}>
          {SOURCES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={styles.source}
              data-active={entry.id === source}
              onClick={() => setSource(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <p className={styles.empty}>No icon matches “{query}”.</p>
      ) : (
        <div className={styles.grid}>
          {matches.map((icon) => (
            <button
              key={icon.id}
              type="button"
              className={styles.icon}
              data-active={icon.id === value}
              title={`${icon.name} — ${icon.source}`}
              aria-label={`${icon.name} (${icon.source})`}
              aria-pressed={icon.id === value}
              onClick={() => onSelect(icon.id)}
            >
              <Icon icon={icon} size={17} />
            </button>
          ))}
        </div>
      )}

      <span className={styles.count}>
        {matches.length} icons · {ICONS.length} total
      </span>
    </div>
  )
}
