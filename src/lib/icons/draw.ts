import type { IconDef } from './types'

/**
 * Draws a vendored icon into a 2D canvas — the drum strips and the sticker are both
 * canvas textures, so this is the one place the path data becomes pixels.
 *
 * Everything is drawn from the icon's own 24 x 24 coordinates, so `weight` is the
 * stroke width in those units: the sources draw at 2, and the reel strips thin it down
 * a little so the marks match the machine's own edges rather than shouting over them.
 */
export interface DrawIconOptions {
  /** side of the square the 24 x 24 grid is mapped onto, in canvas px */
  size: number
  /** centre of the icon, in canvas px */
  x: number
  y: number
  color: string
  /** stroke width in 24-grid units */
  weight?: number
}

interface BuiltPaths {
  stroke: Path2D
  fill: Path2D
  hasFill: boolean
}

/** parsing the path data once per icon is worth it — every rebuild redraws the strip */
const CACHE = new Map<string, BuiltPaths>()

function build(icon: IconDef): BuiltPaths {
  let built = CACHE.get(icon.id)
  if (!built) {
    const stroke = new Path2D()
    const fill = new Path2D()
    let hasFill = false
    for (const path of icon.paths) {
      const parsed = new Path2D(path.d)
      if (path.fill) {
        fill.addPath(parsed)
        hasFill = true
      } else {
        stroke.addPath(parsed)
      }
    }
    built = { stroke, fill, hasFill }
    CACHE.set(icon.id, built)
  }
  return built
}

export function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: IconDef,
  { size, x, y, color, weight = 2 }: DrawIconOptions,
): void {
  const scale = size / 24
  const built = build(icon)

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.translate(-12, -12)
  ctx.lineWidth = weight
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.stroke(built.stroke)
  if (built.hasFill) ctx.fill(built.fill)
  ctx.restore()
}
