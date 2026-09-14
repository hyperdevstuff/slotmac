import * as THREE from 'three'
import type { DeckItem } from './deck'
import { iconFor } from './icons'
import { drawIcon } from './icons/draw'

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
  /** colour of the drawn mark */
  ink: string
  /** stroke width in the icon's own 24-grid units — the libraries draw at 2 */
  strokeWidth: number
}

export interface ReelStripOptions {
  /** resolution of one tile along the drum's axis */
  tile?: number
  /** opaque backdrop painted behind the marks; null leaves the strip transparent */
  background?: string | null
  /** drum circumference, in world units */
  circumference: number
  /** drum length along its axis, in world units */
  drumWidth: number
}

/** how much of the tile's short side a single icon fills */
const ICON_FILL = 0.66

/**
 * One reel strip: every item in the deck gets a tile holding its icon, and nothing else —
 * the item's text is what the readout under the drums is for.
 *
 * A tile is sized to match the piece of drum it actually lands on. That piece is
 * `circumference / count` wide and `drumWidth` long, which is almost never square, so
 * laying the tiles out as squares is what used to squash every mark. Keeping the tile's
 * aspect equal to its patch of drum makes the texture's texel density the same in both
 * directions, and a square icon then comes out square on the machine.
 */
export function makeReelTexture(
  items: DeckItem[],
  style: ReelMarkStyle,
  { tile = 256, background = null, circumference, drumWidth }: ReelStripOptions,
): THREE.CanvasTexture {
  const aspect = items.length > 0 ? circumference / (items.length * drumWidth) : 1
  const tileWidth = tile * aspect
  const iconSize = tile * ICON_FILL * Math.min(1, aspect)

  const canvas = document.createElement('canvas')
  // an emptied reel still gets a texture — it just has nothing on it
  canvas.width = Math.max(1, Math.round(tileWidth * items.length))
  canvas.height = tile
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  items.forEach((item, index) => {
    ctx.save()
    ctx.translate((index + 0.5) * tileWidth, tile / 2)
    ctx.rotate(REEL_UV_ROTATION)
    drawIcon(ctx, iconFor(item), {
      size: iconSize,
      x: 0,
      y: 0,
      color: style.ink,
      weight: style.strokeWidth,
    })
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
