import { create } from 'zustand'
import {
  SHIPPED_DECKS,
  STORAGE_VERSION,
  newId,
  type Deck,
  type DeckItem,
  type PersistedDecks,
} from '../lib/deck'

const STORAGE_KEY = 'slotui.decks'

function fresh(): PersistedDecks {
  return { version: STORAGE_VERSION, decks: SHIPPED_DECKS, activeDeckId: SHIPPED_DECKS[0].id }
}

function load(): PersistedDecks {
  const fallback = fresh()
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as PersistedDecks
    if (
      parsed?.version !== STORAGE_VERSION ||
      !Array.isArray(parsed.decks) ||
      parsed.decks.length === 0 ||
      !parsed.decks.every((deck) => Array.isArray(deck.reels))
    ) {
      return fallback
    }
    const activeDeckId = parsed.decks.some((deck) => deck.id === parsed.activeDeckId)
      ? parsed.activeDeckId
      : parsed.decks[0].id
    return { version: STORAGE_VERSION, decks: parsed.decks, activeDeckId }
  } catch {
    // a corrupt save should never take the app down with it
    return fallback
  }
}

function persist(state: Pick<DeckState, 'decks' | 'activeDeckId' | 'briefsTaken'>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, decks: state.decks, briefsTaken: state.briefsTaken }),
    )
  } catch {
    /* storage full or blocked — the app still works, it just forgets */
  }
}

interface DeckState {
  decks: Deck[]
  activeDeckId: string
  /** how many briefs have been taken, kept so practice feels like it accumulates */
  briefsTaken: number
  setActiveDeck: (deckId: string) => void
  addItem: (reelId: string, label: string) => void
  removeItem: (reelId: string, itemId: string) => void
  resetDecks: () => void
  countBrief: () => void
}

const initial = load()

export const useDeckStore = create<DeckState>((set, get) => {
  const commit = (patch: Partial<DeckState>) => {
    set(patch)
    const { decks, activeDeckId, briefsTaken } = get()
    persist({ decks, activeDeckId, briefsTaken })
  }

  return {
    decks: initial.decks,
    activeDeckId: initial.activeDeckId,
    briefsTaken: (initial as PersistedDecks & { briefsTaken?: number }).briefsTaken ?? 0,

    setActiveDeck: (activeDeckId) => commit({ activeDeckId }),

    addItem: (reelId, label) => {
      const trimmed = label.trim()
      if (!trimmed) return
      const item: DeckItem = { id: newId('item'), label: trimmed }
      commit({
        decks: get().decks.map((deck) => ({
          ...deck,
          reels: deck.reels.map((reel) =>
            reel.id === reelId ? { ...reel, items: [...reel.items, item] } : reel,
          ),
        })),
      })
    },

    removeItem: (reelId, itemId) =>
      commit({
        decks: get().decks.map((deck) => ({
          ...deck,
          reels: deck.reels.map((reel) =>
            reel.id === reelId ? { ...reel, items: reel.items.filter((item) => item.id !== itemId) } : reel,
          ),
        })),
      }),

    resetDecks: () => commit({ ...fresh(), briefsTaken: 0 }),
    countBrief: () => commit({ briefsTaken: get().briefsTaken + 1 }),
  }
})

export function activeDeck(state: Pick<DeckState, 'decks' | 'activeDeckId'>): Deck {
  return state.decks.find((deck) => deck.id === state.activeDeckId) ?? state.decks[0]
}

// dev-only handle so loaded decks can be inspected/driven from the console
if (import.meta.env.DEV) {
  ;(globalThis as unknown as { __decks?: typeof useDeckStore }).__decks = useDeckStore
}
