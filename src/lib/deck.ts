/**
 * A deck is what the machine is loaded with: named reels, each holding your own items.
 * UI design is just the first deck that ships — see CONCEPT.md.
 */
export interface DeckItem {
  id: string
  /** the full text, shown in the readout — can be a phrase */
  label: string
  /** optional override for the short label drawn on the drum; longest readable is ~11 chars */
  short?: string
}

export interface DeckReel {
  id: string
  name: string
  items: DeckItem[]
}

export interface Deck {
  id: string
  name: string
  reels: DeckReel[]
}

/** how many characters stay legible on a drum tile */
export const DRUM_LABEL_MAX = 11

export function drumLabel(item: DeckItem): string {
  if (item.short) return item.short
  const label = item.label.trim()
  if (label.length <= DRUM_LABEL_MAX) return label
  const cut = label.slice(0, DRUM_LABEL_MAX - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 4 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** ids are only ever local, so a counter is enough — no crypto needed */
let idCounter = 0
export function newId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

/** stable ids for shipped items, so re-loading never duplicates them */
function items(prefix: string, ...labels: string[]): DeckItem[] {
  return labels.map((label, index) => ({ id: `${prefix}-${index}`, label }))
}

export const SHIPPED_DECKS: Deck[] = [
  {
    id: 'ui',
    name: 'Interface',
    reels: [
      { id: 'ui-type', name: 'Type', items: items('ui-type', 'Inter', 'Space Grotesk', 'IBM Plex Mono', 'Fraunces', 'Archivo', 'JetBrains Mono') },
      {
        id: 'ui-colour',
        name: 'Colour',
        items: [
          { id: 'ui-colour-0', label: 'Cold, high contrast', short: 'COLD' },
          { id: 'ui-colour-1', label: 'Warm neutrals', short: 'WARM' },
          { id: 'ui-colour-2', label: 'One accent only', short: '1 ACCENT' },
          { id: 'ui-colour-3', label: 'Duotone', short: 'DUOTONE' },
          { id: 'ui-colour-4', label: 'Muted pastels', short: 'PASTEL' },
          { id: 'ui-colour-5', label: 'Greyscale plus one hue', short: 'GREY+1' },
        ],
      },
      {
        id: 'ui-component',
        name: 'Component',
        items: items('ui-component', 'Hero', 'Pricing table', 'Navigation', 'Card', 'Empty state', 'Footer', 'Modal', 'Changelog'),
      },
    ],
  },
  {
    id: 'systems',
    name: 'System design',
    reels: [
      { id: 'sys-problem', name: 'Problem', items: items('sys-problem', 'Feed', 'Chat', 'Rate limiter', 'Search', 'Payments', 'Notifications') },
      {
        id: 'sys-scale',
        name: 'Scale',
        items: [
          { id: 'sys-scale-0', label: '1k users', short: '1K' },
          { id: 'sys-scale-1', label: '100k users', short: '100K' },
          { id: 'sys-scale-2', label: '10M writes per day', short: '10M/DAY' },
          { id: 'sys-scale-3', label: '1M concurrent', short: '1M CONC' },
        ],
      },
      {
        id: 'sys-constraint',
        name: 'Constraint',
        items: [
          { id: 'sys-con-0', label: 'No managed services', short: 'NO MANAGED' },
          { id: 'sys-con-1', label: 'Single region', short: '1 REGION' },
          { id: 'sys-con-2', label: 'Read heavy', short: 'READ HEAVY' },
          { id: 'sys-con-3', label: 'Eventual consistency', short: 'EVENTUAL' },
          { id: 'sys-con-4', label: 'Budget: one server', short: '1 SERVER' },
        ],
      },
    ],
  },
  {
    id: 'maths',
    name: 'Maths',
    reels: [
      { id: 'math-topic', name: 'Topic', items: items('math-topic', 'Graphs', 'Probability', 'Number theory', 'Linear algebra', 'Topology') },
      {
        id: 'math-level',
        name: 'Level',
        items: [
          { id: 'math-level-0', label: 'Explain it plainly', short: 'PLAIN' },
          { id: 'math-level-1', label: 'Prove it', short: 'PROOF' },
          { id: 'math-level-2', label: 'Find a counterexample', short: 'DISPROVE' },
          { id: 'math-level-3', label: 'Implement it', short: 'CODE IT' },
        ],
      },
      {
        id: 'math-output',
        name: 'Output',
        items: [
          { id: 'math-out-0', label: 'A diagram', short: 'DIAGRAM' },
          { id: 'math-out-1', label: 'A short note', short: 'NOTE' },
          { id: 'math-out-2', label: 'A worked example', short: 'EXAMPLE' },
          { id: 'math-out-3', label: 'A proof sketch', short: 'SKETCH' },
        ],
      },
    ],
  },
]

/** current shape of the persisted blob, so old saves can be spotted and dropped */
export const STORAGE_VERSION = 1

export interface PersistedDecks {
  version: number
  decks: Deck[]
  activeDeckId: string
}
