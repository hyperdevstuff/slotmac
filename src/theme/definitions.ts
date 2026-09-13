import type { ReelMarkStyle } from '../lib/reelTexture'

export interface ThemeDef {
  tagline: string
  /** accent used for active reel / wins / glow */
  accent: string
  /** brighter accent for the winning states */
  accentHot: string
  /** primary outline colour */
  line: string
  /** dimmed outline colour — CSS / canvas labels only. three.js drops the alpha
   *  from rgba(), so 3D lines must use `line` with a real opacity instead. */
  lineDim: string
  /** face colour of the machine */
  surface: string
  surfaceOpacity: number
  /** second, slightly different solid used for inset plates and panels, so the
   *  machine reads as an object with parts rather than one flat box */
  panelSurface: string
  panelOpacity: number
  metalness: number
  roughness: number
  /** outline stroke width in world units (drei Line2) */
  edgeWidth: number
  edgeThreshold: number
  ambient: number
  keyIntensity: number
  pointIntensity: number
  /** opaque backdrop painted into the reel strips */
  reelBackground: string
  /** how each deck item is drawn on its drum: rune mark plus short label */
  mark: ReelMarkStyle
}

/**
 * One look for now. It stays behind an object rather than being inlined at every use
 * site, so a second look can be added back without touching the machine code — see
 * materials.tsx, which is the only place that turns these values into materials.
 */
export const THEME: ThemeDef = {
  tagline: 'isometric wireframe',
  accent: '#4d7cff',
  accentHot: '#8fb0ff',
  line: '#d8e4ff',
  lineDim: 'rgba(216,228,255,0.30)',
  surface: '#0a0e16',
  surfaceOpacity: 1,
  panelSurface: '#212a3d',
  panelOpacity: 1,
  metalness: 0.2,
  roughness: 0.72,
  edgeWidth: 1.5,
  edgeThreshold: 24,
  ambient: 0.55,
  keyIntensity: 1.7,
  pointIntensity: 24,
  reelBackground: '#0a0e16',
  mark: { ink: '#d8e4ff', accent: '#4d7cff', strokeWidth: 0.055 },
}
