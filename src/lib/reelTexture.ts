import * as THREE from 'three'
import { drumLabel, type DeckItem } from './deck'
import { runeGlyph } from './rune'

/**
 * Orientation of the tile line-work inside the reel texture.
 *
 * Derived from the real CylinderGeometry UVs (axis baked to X): with the default
 * texture.flipY, the canvas +x axis runs along the circumference (world down at the
 * front) and canvas +y runs along the reel axis. Drawing with this rotation puts the
 * tile's "up" along world +Y and its "right" along world +X, i.e. upright and unmirrored.
 */
export const REEL_UV_ROTATION = -Math.PI / 2

export interface ReelMarkStyle {
  ink: string
  accent: string
  strokeWidth: number
}

export interface ReelTextureOptions {
  tile?: number
  /** opaque backdrop painted behind the marks; null leaves the strip transparent */
  background?: string | null
}

/** width of a string with letter-spacing applied */
function measure(ctx: CanvasRenderingContext2D, text: string, tracking: number): number {
  const glyphs = [...text]
  return (
    glyphs.reduce((sum, glyph) => sum + ctx.measureText(glyph).width, 0) +
    tracking * Math.max(0, glyphs.length - 1)
  )
}

/** draws text centred on the origin, shrinking to fit rather than spilling off the tile */
function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  tracking: number,
  color: string,
  font: string,
) {
  let size = startSize
  ctx.font = `600 ${size}px ${font}`
  while (size > 20 && measure(ctx, text, tracking) > maxWidth) {
    size -= 2
    ctx.font = `600 ${size}px ${font}`
  }

  const total = measure(ctx, text, tracking)
  let x = -total / 2
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (const glyph of [...text]) {
    ctx.fillText(glyph, x, 0)
    x += ctx.measureText(glyph).width + tracking
  }
}

/**
 * One reel strip: every item in the deck gets a tile holding a rune mark derived from
 * its text, plus a short label. The label on the drum is abbreviated — the full text is
 * what the readout shows.
 */
export function makeReelTexture(
  items: DeckItem[],
  style: ReelMarkStyle,
  { tile = 256, background = null }: ReelTextureOptions = {},
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = tile * items.length
  canvas.height = tile
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const font = '"JetBrains Mono", ui-monospace, monospace'

  items.forEach((item, index) => {
    ctx.save()
    ctx.translate((index + 0.5) * tile, tile / 2)
    ctx.rotate(REEL_UV_ROTATION)

    // rune mark, sitting above the label
    const glyph = runeGlyph(item.label)
    const markSize = tile * 0.34
    ctx.save()
    ctx.translate(0, -tile * 0.13)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = style.accent
    ctx.lineWidth = style.strokeWidth * markSize
    glyph.strokes.forEach((poly, i) => {
      ctx.beginPath()
      poly.forEach(([x, y], pointIndex) => {
        const px = x * markSize
        const py = y * markSize
        if (pointIndex === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      if (glyph.closed.includes(i)) ctx.closePath()
      ctx.stroke()
    })
    ctx.restore()

    // short label
    ctx.save()
    ctx.translate(0, tile * 0.24)
    drawFittedText(ctx, drumLabel(item).toUpperCase(), tile * 0.84, 46, 2, style.ink, font)
    ctx.restore()

    ctx.restore()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/** rotation that brings item `index` to the read position of the reel */
export function angleForItem(index: number, count: number, offset = 0): number {
  return offset - ((index + 0.5) * (Math.PI * 2)) / count
}

/** the item currently reading on the payline for a given reel rotation */
export function itemAtAngle(angle: number, count: number, offset = 0): number {
  const step = (Math.PI * 2) / count
  const raw = Math.round((offset - angle) / step - 0.5)
  return ((raw % count) + count) % count
}

/** nearest rotation equivalent to `index`'s read position, without spinning extra turns */
export function nearestAngleForItem(current: number, index: number, count: number, offset = 0): number {
  const base = angleForItem(index, count, offset)
  const turns = Math.round((current - base) / (Math.PI * 2))
  return base + turns * Math.PI * 2
}
