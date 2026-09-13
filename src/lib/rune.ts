export type Polyline = [number, number][]

/**
 * A deterministic line-art mark generated from an item's text.
 *
 * The machine's whole look is drawn symbols, but a deck holds arbitrary strings — so
 * every item gets a glyph derived from its own text. Same text, same mark, forever; no
 * assets, nothing to author, and it still reads as the rune/technical language the rest
 * of the machine is drawn in.
 *
 * Drawn inside a unit box spanning [-0.5, 0.5] on both axes, up = -y (canvas convention).
 */

/** small deterministic PRNG so a glyph never changes between renders */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface RuneGlyph {
  strokes: Polyline[]
  /** indices into `strokes` that should be closed */
  closed: number[]
}

export function runeGlyph(seed: string): RuneGlyph {
  const next = rng(hash(seed))
  const strokes: Polyline[] = []
  const closed: number[] = []

  // the stem — every glyph hangs off one vertical
  const top = -0.44
  const bottom = 0.44
  strokes.push([
    [0, top],
    [0, bottom],
  ])

  // 2-4 branches, alternating sides, biased upward so the marks read as runes
  const branches = 2 + Math.floor(next() * 3)
  for (let i = 0; i < branches; i++) {
    const side = i % 2 === 0 ? 1 : -1
    const at = top + ((i + 1) / (branches + 1)) * (bottom - top)
    const reach = 0.18 + next() * 0.26
    const rise = (next() - 0.35) * 0.3
    const point: [number, number] = [side * reach, at - rise]

    if (next() > 0.55) {
      // a forked tip
      strokes.push([
        [0, at],
        point,
        [point[0] + side * 0.12, point[1] - 0.14],
      ])
      strokes.push([
        point,
        [point[0] + side * 0.02, point[1] + 0.16],
      ])
    } else {
      strokes.push([
        [0, at],
        point,
      ])
    }
  }

  // occasional ring or crossbar for variety
  const flavour = next()
  if (flavour > 0.66) {
    const r = 0.1 + next() * 0.07
    const seg = 20
    const ring: Polyline = []
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2
      ring.push([Math.cos(a) * r, -0.26 + Math.sin(a) * r])
    }
    strokes.push(ring)
    closed.push(strokes.length - 1)
  } else if (flavour > 0.33) {
    const w = 0.16 + next() * 0.1
    strokes.push([
      [-w, 0.2],
      [w, 0.2],
    ])
  }

  return { strokes, closed }
}
