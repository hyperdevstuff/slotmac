import { create } from 'zustand'

/** the origin a back-of-machine mark points back to */
export interface MarkTipInfo {
  name: string
  host: string
}

interface HoverState {
  mark: MarkTipInfo | null
  setMark: (mark: MarkTipInfo | null) => void
}

/**
 * The marks live inside the 3D canvas and the tooltip lives in the DOM, so the two need
 * somewhere to meet. Only the hovered mark goes in here — the pointer position is read
 * straight off the mouse by the tooltip itself, so hovering does not re-render the scene.
 */
export const useHoverStore = create<HoverState>((set) => ({
  mark: null,
  setMark: (mark) => set({ mark }),
}))
