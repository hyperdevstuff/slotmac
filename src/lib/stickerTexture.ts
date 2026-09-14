import * as THREE from 'three'

/**
 * The two library marks stuck on the back of the screen — attribution easter eggs.
 * They carry no background plate, so they read as stamps on the cabinet rather than
 * logo cards. See THIRD-PARTY-NOTICES.md for the licence situation.
 */

export interface MarkPath {
  d: string
  /** drawn in the brand's own accent colour rather than the machine's ink */
  accent?: boolean
}

export interface MarkDef {
  name: string
  /** the domain the mark points back to, shown in the tooltip */
  host: string
  url: string
  paths: MarkPath[]
  /** the brand's own accent, where it has one */
  accent?: string
  /** solid glyph or line art — however the brand draws it */
  render: 'fill' | 'stroke'
  /** stroke weight in viewBox units, for stroked marks */
  weight?: number
  viewBox: { minX: number; minY: number; width: number; height: number }
}

/**
 * Rune Icons — the angled "R"-glyph.
 *
 * Source:  https://github.com/Nexvyn/runeicons (app/brand-mark.tsx)
 * Licence: Apache-2.0 (see THIRD-PARTY-NOTICES.md)
 */
export const RUNE_MARK: MarkDef = {
  name: 'Rune Icons',
  host: 'runeicons.com',
  url: 'https://runeicons.com',
  render: 'fill',
  accent: '#4d7cff',
  paths: [
    {
      d: 'M6.04019 0.407227C4.52011 0.407227 2.67278 2.19246 2.19775 2.82583L35.4918 38.4094C35.9668 38.2509 36.8219 39.4543 42.1422 36.0342C48.7926 31.7589 48.3175 18.4582 45.9423 13.2329C44.359 9.43272 38.2469 1.54729 30.2665 0.407227H6.04019Z',
    },
    { d: 'M0.881836 47.3635V32.6377L19.8829 52.5888H7.05718C2.78194 52.5888 0.881836 50.6887 0.881836 47.3635Z' },
    {
      d: 'M0.406982 19.8113V6.03556C0.406982 4.33028 1.67371 2.79155 2.30709 2.23535C17.508 17.4362 44.1093 46.8878 46.4845 49.738C47.7946 51.3101 44.1094 52.5881 43.1593 52.5881H30.8086L0.406982 19.8113Z',
    },
  ],
  viewBox: { minX: -1, minY: -1, width: 50, height: 55 },
}

/**
 * Lucide — the official logo, taken as released: two interlocking arcs, the second
 * carrying Lucide's own red.
 *
 * Source:  https://github.com/lucide-icons/lucide (docs/public/logo.svg)
 * Licence: ISC (see THIRD-PARTY-NOTICES.md)
 */
export const LUCIDE_MARK: MarkDef = {
  name: 'Lucide',
  host: 'lucide.dev',
  url: 'https://lucide.dev',
  render: 'stroke',
  weight: 2,
  accent: '#F56565',
  paths: [
    {
      d: 'M14 12C14 9.79086 12.2091 8 10 8C7.79086 8 6 9.79086 6 12C6 16.4183 9.58172 20 14 20C18.4183 20 22 16.4183 22 12C22 8.446 20.455 5.25285 18 3.05557',
    },
    {
      d: 'M10 12C10 14.2091 11.7909 16 14 16C16.2091 16 18 14.2091 18 12C18 7.58172 14.4183 4 10 4C5.58172 4 2 7.58172 2 12C2 15.5841 3.57127 18.8012 6.06253 21',
      accent: true,
    },
  ],
  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
}

/**
 * Paints a mark onto its own canvas. `ink` is the machine's line colour; the brand's own
 * accent is used for whichever paths ask for it.
 */
export function makeMarkTexture(mark: MarkDef, ink: string, size = 128): THREE.CanvasTexture {
  const { viewBox } = mark
  const weight = mark.render === 'stroke' ? (mark.weight ?? 2) : 0
  const scale = size / viewBox.height
  const pad = Math.ceil((weight * scale) / 2) + 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewBox.width * scale) + pad * 2
  canvas.height = Math.ceil(viewBox.height * scale) + pad * 2
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(pad, pad)
  ctx.scale(scale, scale)
  ctx.translate(-viewBox.minX, -viewBox.minY)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = weight

  for (const path of mark.paths) {
    const parsed = new Path2D(path.d)
    const colour = path.accent && mark.accent ? mark.accent : ink
    if (mark.render === 'fill') {
      ctx.fillStyle = colour
      ctx.fill(parsed)
    } else {
      ctx.strokeStyle = colour
      ctx.stroke(parsed)
    }
  }
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}
