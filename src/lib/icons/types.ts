/**
 * Icon vocabulary the machine draws from.
 *
 * Every icon — whichever library it came from — is line art on a 24 x 24 grid, so the
 * reels, the result readout and the deck editor can all render one the same way. That
 * is also why the third-party sets are vendored rather than consumed as components:
 * the drums are canvas textures, and canvas wants path data, not JSX.
 */
export type IconSource = 'rune' | 'lucide'

export interface IconPath {
  /** SVG path data on a 24 x 24 grid */
  d: string
  /** filled rather than stroked — a handful of marks have solid dots */
  fill?: boolean
}

export interface IconDef {
  /** namespaced and stable: `rune/nature-sun`, `lucide/star` — this is what a deck item stores */
  id: string
  name: string
  source: IconSource
  /** the library's own category, used to group the picker */
  group: string
  paths: IconPath[]
}
