import { create } from 'zustand'

export const SPONSOR_PLACEMENTS = [
  { id: 'left-2', label: 'Left · square 2', featured: false },
  { id: 'left-8', label: 'Left · square 8', featured: false },
  { id: 'right-2', label: 'Right · square 2', featured: false },
  { id: 'right-8', label: 'Right · square 8', featured: false },
  { id: 'marquee', label: 'Good Luck banner', featured: true },
] as const

export type SponsorPlacement = (typeof SPONSOR_PLACEMENTS)[number]['id']

/** Inquiry only: prices and booking periods are agreed directly, not advertised. */
export const useSponsorStore = create<{
  placement: SponsorPlacement | null
  open: (placement: SponsorPlacement) => void
  close: () => void
}>((set) => ({
  placement: null,
  open: (placement) => set({ placement }),
  close: () => set({ placement: null }),
}))
