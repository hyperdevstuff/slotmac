import * as THREE from 'three'

export interface LabelOptions {
  width?: number
  height?: number
  font?: string
  fontSize?: number
  weight?: string
  color?: string
  background?: string | null
  /** extra px between characters */
  tracking?: number
  align?: 'center' | 'left' | 'right'
  /** vertical placement of the text baseline as a fraction of the canvas height */
  baselineY?: number
}

/**
 * Renders a single line of text into a CanvasTexture. Used for the fixed panel
 * lettering (marquee, readout, button caps) so the machine needs no font assets
 * beyond the ones already loaded for the DOM.
 */
export function makeLabelTexture(text: string, options: LabelOptions = {}): THREE.CanvasTexture {
  const width = options.width ?? 512
  const height = options.height ?? 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, width, height)

  if (options.background) {
    ctx.fillStyle = options.background
    ctx.fillRect(0, 0, width, height)
  }

  const weight = options.weight ?? '600'
  const family = options.font ?? '"Space Grotesk", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = options.color ?? '#d8e4ff'

  const tracking = options.tracking ?? 0
  const glyphs = [...text]

  /** width of the whole line with letter-spacing applied, at the current font */
  const lineWidth = () => {
    const widths = glyphs.map((glyph) => ctx.measureText(glyph).width)
    const total = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, glyphs.length - 1)
    return { widths, total }
  }

  /*
   * Shrink to fit. Without this, any string longer than the canvas is drawn at full size
   * and silently loses its first and last characters — which is how "EMPTY STATE" came
   * out as "MPTY STAT".
   */
  const maxWidth = width * 0.94
  let fontSize = options.fontSize ?? Math.round(height * 0.46)
  ctx.font = `${weight} ${fontSize}px ${family}`
  let measured = lineWidth()
  while (fontSize > 12 && measured.total > maxWidth) {
    fontSize = Math.max(12, Math.floor(fontSize * Math.min(0.94, maxWidth / measured.total)))
    ctx.font = `${weight} ${fontSize}px ${family}`
    measured = lineWidth()
  }
  const { widths, total } = measured

  let x =
    options.align === 'left'
      ? 0
      : options.align === 'right'
        ? width - total
        : (width - total) / 2
  const y = height * (options.baselineY ?? 0.5)

  glyphs.forEach((glyph, index) => {
    ctx.fillText(glyph, x, y)
    x += widths[index] + tracking
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/** canvas text needs the webfont to be loaded before it measures correctly */
export async function fontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.ready
  } catch {
    /* fall back to the default font */
  }
}
