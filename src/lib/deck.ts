/**
 * A deck is what the machine is loaded with: named reels, each holding your own items.
 * UI design is just the first deck that ships — see CONCEPT.md.
 */
export interface DeckItem {
  id: string
  /** the full text, shown in the readout — can be a phrase */
  label: string
  /** the mark drawn on the drum, e.g. `rune/nature-sun`. Unset falls back to a
   *  deterministic pick, so an item always shows something. */
  icon?: string
  /** optional override for the abbreviated label the result readout shows */
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

/** how many characters the result readout can fit per column */
export const SHORT_LABEL_MAX = 11

export function shortLabel(item: DeckItem): string {
  if (item.short) return item.short
  const label = item.label.trim()
  if (label.length <= SHORT_LABEL_MAX) return label
  const cut = label.slice(0, SHORT_LABEL_MAX - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 4 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** ids are only ever local, so a counter is enough — no crypto needed */
let idCounter = 0
export function newId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

/** [label, icon, abbreviated form?] — the abbreviation is only needed for long labels */
type ShippedItem = [string, string] | [string, string, string]

/** stable ids for shipped items, so re-loading never duplicates them */
function items(prefix: string, entries: ShippedItem[]): DeckItem[] {
  return entries.map(([label, icon, short], index) => ({ id: `${prefix}-${index}`, label, icon, short }))
}

export const SHIPPED_DECKS: Deck[] = [
  {
    id: 'ui',
    name: 'Interface',
    reels: [
      {
        id: 'ui-type',
        name: 'Type',
        items: items('ui-type', [
          ['Inter', 'lucide/type'],
          ['Space Grotesk', 'lucide/baseline'],
          ['IBM Plex Mono', 'lucide/terminal'],
          ['Fraunces', 'lucide/italic'],
          ['Archivo', 'lucide/align-left'],
          ['JetBrains Mono', 'lucide/braces'],
        ]),
      },
      {
        id: 'ui-colour',
        name: 'Colour',
        items: items('ui-colour', [
          ['Cold, high contrast', 'lucide/snowflake', 'COLD'],
          ['Warm neutrals', 'lucide/flame', 'WARM'],
          ['One accent only', 'lucide/target', '1 ACCENT'],
          ['Duotone', 'lucide/aperture', 'DUOTONE'],
          ['Muted pastels', 'lucide/flower', 'PASTEL'],
          ['Greyscale plus one hue', 'lucide/palette', 'GREY+1'],
        ]),
      },
      {
        id: 'ui-component',
        name: 'Component',
        items: items('ui-component', [
          ['Hero', 'lucide/layout-dashboard'],
          ['Pricing table', 'lucide/receipt'],
          ['Navigation', 'rune/layouts-menu'],
          ['Card', 'lucide/square'],
          ['Empty state', 'lucide/inbox'],
          ['Footer', 'rune/layouts-panel-bottom'],
          ['Modal', 'lucide/layout-template'],
          ['Changelog', 'rune/schedule-history'],
        ]),
      },
    ],
  },
  {
    id: 'systems',
    name: 'System design',
    reels: [
      {
        id: 'sys-problem',
        name: 'Problem',
        items: items('sys-problem', [
          ['Feed', 'lucide/waves'],
          ['Chat', 'rune/messaging-message-square'],
          ['Rate limiter', 'lucide/gauge'],
          ['Search', 'rune/tools-search'],
          ['Payments', 'rune/money-credit-card'],
          ['Notifications', 'lucide/bell'],
        ]),
      },
      {
        id: 'sys-scale',
        name: 'Scale',
        items: items('sys-scale', [
          ['1k users', 'lucide/user', '1K'],
          ['100k users', 'rune/identity-users', '100K'],
          ['10M writes per day', 'lucide/database-zap', '10M/DAY'],
          ['1M concurrent', 'lucide/activity', '1M CONC'],
        ]),
      },
      {
        id: 'sys-constraint',
        name: 'Constraint',
        items: items('sys-constraint', [
          ['No managed services', 'rune/identity-shield-x', 'NO MANAGED'],
          ['Single region', 'lucide/globe', '1 REGION'],
          ['Read heavy', 'lucide/eye', 'READ HEAVY'],
          ['Eventual consistency', 'lucide/refresh-cw', 'EVENTUAL'],
          ['Budget: one server', 'lucide/server', '1 SERVER'],
        ]),
      },
    ],
  },
  {
    id: 'maths',
    name: 'Maths',
    reels: [
      {
        id: 'math-topic',
        name: 'Topic',
        items: items('math-topic', [
          ['Graphs', 'lucide/chart-line'],
          ['Probability', 'lucide/dices'],
          ['Number theory', 'lucide/hash'],
          ['Linear algebra', 'lucide/grid-3x3'],
          ['Topology', 'lucide/spline'],
        ]),
      },
      {
        id: 'math-level',
        name: 'Level',
        items: items('math-level', [
          ['Explain it plainly', 'lucide/message-circle', 'PLAIN'],
          ['Prove it', 'lucide/badge-check', 'PROOF'],
          ['Find a counterexample', 'lucide/crosshair', 'DISPROVE'],
          ['Implement it', 'lucide/code', 'CODE IT'],
        ]),
      },
      {
        id: 'math-output',
        name: 'Output',
        items: items('math-output', [
          ['A diagram', 'lucide/route', 'DIAGRAM'],
          ['A short note', 'rune/documents-file-text', 'NOTE'],
          ['A worked example', 'lucide/lightbulb', 'EXAMPLE'],
          ['A proof sketch', 'rune/tools-pencil', 'SKETCH'],
        ]),
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
