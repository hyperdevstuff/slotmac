import { create } from 'zustand'
import type { DeckItem } from '../lib/deck'
import { useDeckStore } from './deckStore'

export type Phase = 'intro' | 'idle' | 'spinning' | 'result'
/** landing = the hero page, play = the machine itself */
export type View = 'landing' | 'play'

interface GameState {
  view: View
  phase: Phase
  /** whatever is reading on the payline, per reel — null until the first draw */
  reels: (DeckItem | null)[]
  muted: boolean
  reduceMotion: boolean
  /** incremented to request a spin; the reels watch this */
  spinId: number
  enter: () => void
  requestSpin: () => void
  setReel: (index: number, item: DeckItem) => void
  settle: () => void
  setMuted: (muted: boolean) => void
  setReduceMotion: (value: boolean) => void
  finishIntro: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  view: 'landing',
  phase: 'intro',
  reels: [null, null, null],
  muted: false,
  reduceMotion: false,
  spinId: 0,

  enter: () => set({ view: 'play' }),

  requestSpin: () => {
    const { phase, spinId, view } = get()
    if (view !== 'play') return
    // spins are ignored while the entrance animation is still running
    if (phase === 'spinning' || phase === 'intro') return
    set({ phase: 'spinning', reels: [null, null, null], spinId: spinId + 1 })
  },

  setReel: (index, item) =>
    set((state) => {
      const reels = [...state.reels]
      reels[index] = item
      return { reels }
    }),

  /** the last reel has stopped: the draw is complete and readable */
  settle: () => {
    set({ phase: 'result' })
    useDeckStore.getState().countBrief()
  },

  setMuted: (muted) => set({ muted }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  finishIntro: () => set({ phase: 'idle' }),
}))

export const canSpin = (phase: Phase) => phase === 'idle' || phase === 'result'

// dev-only handle so the store can be inspected/driven from the console
if (import.meta.env.DEV) {
  ;(globalThis as unknown as { __slot?: typeof useGameStore }).__slot = useGameStore
}
