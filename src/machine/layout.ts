import { APERTURE_DESIGN_AZIMUTH, PROJECT_XZ, PROJECT_YZ } from '../scene/view'

/* ============================================================================
 * PROPORTIONS — tune the machine here. Everything else is derived from these.
 *
 * Two depths, deliberately separate:
 *   BODY_DEPTH   — the cabinet
 *   SCREEN_DEPTH — the display half. It can be slimmer, but only down to the
 *                  limit set by REEL.radius below, because a drum is 2 * radius
 *                  deep and has to fit inside the display's hollow.
 *
 * Quick recipes:
 *   slimmer overall        -> BODY_DEPTH down
 *   slimmer display        -> SCREEN_DEPTH down (watch REEL.radius)
 *   narrower machine       -> REEL.spacing down, then SECTIONS widths down to match
 *   slimmer frame/borders  -> PANEL down, WINDOW.bar down
 *   bigger symbols         -> REEL.radius up (and SCREEN_DEPTH up to match)
 *   reels further apart    -> REEL.spacing up (WINDOW.halfWidth follows)
 *   taller machine         -> SECTIONS heights below (keep the ranges contiguous)
 * ========================================================================== */

/** the cabinet */
export const BODY_DEPTH = 2.6
/** the display housing — the visible screen surround */
export const SCREEN_DEPTH = 2.1
/** wall thickness of the hollow screen box, and of the aperture frame */
export const PANEL = 0.16

/**
 * The cabinet is a stack of sections, bottom to top, each a plain box. The `centerY`
 * ranges must stay contiguous: base → lower cabinet → console → mid → screen → marquee.
 */
export const SECTIONS = {
  base: { width: 6.2, height: 0.55, depth: 2.9, centerY: -5.325 },
  lower: { width: 5.9, height: 3.55, depth: BODY_DEPTH, centerY: -3.275 },
  console: { width: 6.1, height: 0.6, depth: 2.9, centerY: -1.2 },
  mid: { width: 5.9, height: 1.5, depth: BODY_DEPTH, centerY: -0.15 },
  screen: { width: 6.8, height: 3.2, depth: SCREEN_DEPTH, centerY: 2.2 },
  marquee: { width: 4.9, height: 1.15, depth: 1.6, centerY: 4.375 },
}

/** front plane of the display — where the aperture, bezel and reels sit */
export const FRONT_Z = SCREEN_DEPTH / 2

/** front plane of the cabinet body — readout, coin slot, grille */
export const BODY_FRONT_Z = BODY_DEPTH / 2

/**
 * Bigger, wider drums are not just a taste call: the flatter the front of the drum the
 * less the neighbouring symbols foreshorten, and a wide drum still fills its window
 * when the view swings round (a narrow one thins out to a sliver).
 *
 * The radius is also the hard floor on SCREEN_DEPTH: the drum needs 2 * radius of
 * clearance inside a hollow that is SCREEN_DEPTH - 2 * PANEL deep. Leave more than a
 * sliver: the reel outlines are fat screen-space quads, and with only ~0.04 of
 * clearance they bleed straight through the frame at oblique angles.
 */
export const REEL = {
  count: 3,
  radius: 1,
  // narrower drums let the whole cabinet come in; the display is only as wide as
  // (spacing * 2) + the outer drum's apparent half-width
  width: 0.9,
  spacing: 1.8,
  // centred in the display's hollow
  y: 2.05,
  z: 0,
}

export const REEL_DEPTH = FRONT_Z - REEL.z

/** initial sideways nudge; `Reels` recomputes it every frame from the live camera angle */
export const REEL_OFFSET_X = -REEL_DEPTH * PROJECT_XZ

/**
 * The aperture is sized from the drums' *apparent* extent, not their physical size:
 * depth pushes the outer edges outwards and the whole drum upwards as it projects
 * forward. Sizing it by hand is how you end up showing two dials.
 *
 * Width allows for a swung camera; height is sized for the default view.
 */
const DESIGN_PX = Math.tan(APERTURE_DESIGN_AZIMUTH)
const DESIGN_PY = PROJECT_YZ

const APPARENT_HALF_WIDTH = REEL.width / 2 + (REEL_DEPTH + REEL.radius) * DESIGN_PX
const APPARENT_TOP = REEL.y + REEL.radius + (REEL_DEPTH + REEL.radius) * DESIGN_PY
const APPARENT_BOTTOM = REEL.y - REEL.radius + (REEL_DEPTH - REEL.radius) * DESIGN_PY

export const WINDOW = {
  halfWidth: REEL.spacing + APPARENT_HALF_WIDTH + 0.14,
  centerY: (APPARENT_TOP + APPARENT_BOTTOM) / 2,
  height: APPARENT_TOP - APPARENT_BOTTOM + 0.18,
  /** thickness of the frame projecting forward around the aperture */
  bar: 0.24,
  depth: 0.36,
}

export const WINDOW_TOP = WINDOW.centerY + WINDOW.height / 2
export const WINDOW_BOTTOM = WINDOW.centerY - WINDOW.height / 2

/**
 * The payline is the projected height of the drum's *front face* — the row a player
 * reads. It is deliberately NOT the aperture's centre: from any raised camera the
 * front of the drum sits a little below the middle of the visible curve.
 */
export const PAYLINE_Y = REEL.y + (REEL_DEPTH - REEL.radius) * PROJECT_YZ

/**
 * The result is the symbol at the drum's physical front (θ = 0), not the symbol that
 * happens to face the camera. That keeps "what won" fixed while the machine is
 * dragged around — an angle-dependent read would change the outcome by looking at it.
 */
export const REEL_READ_ANGLE = 0

/** the glow sits just behind the drums, against the display's back wall */
export const GLOW_Z = REEL.z - REEL.radius - 0.05

/**
 * The lever pivots on X so it swings forward and down alongside the cabinet. On Z it
 * sweeps across the front face instead, which reads as the arm going into the machine.
 */
export const LEVER = {
  pivot: [SECTIONS.screen.width / 2 + 0.5, REEL.y, 0.5] as [number, number, number],
  rest: -0.22,
  pull: 1.05,
  armLength: 1.95,
  knobRadius: 0.29,
}

export const MARQUEE = { text: 'GOOD LUCK', centerY: SECTIONS.marquee.centerY }

/** how far the stickers sit off the back panel, so they never z-fight with it */
const STICKER_GAP = 0.02

/**
 * The easter eggs: a sticker for each icon library the machine draws from, on the back
 * of the display. Nothing in the UI points at them — you find them by dragging the
 * machine around. They sit in opposite corners as seen from behind (the machine's +x is
 * the viewer's left once you are back there), each tilted its own way.
 */
export const BACK_MARKS = {
  /** nominal height of a mark, in world units — see Sticker for the per-mark scale */
  size: 0.85,
  rune: {
    tilt: 0.14,
    position: [
      SECTIONS.screen.width / 2 - 1.15,
      SECTIONS.screen.centerY - 0.25,
      -SCREEN_DEPTH / 2 - STICKER_GAP,
    ] as [number, number, number],
  },
  lucide: {
    tilt: -0.14,
    position: [
      -(SECTIONS.screen.width / 2 - 1.15),
      SECTIONS.screen.centerY + 0.25,
      -SCREEN_DEPTH / 2 - STICKER_GAP,
    ] as [number, number, number],
  },
}
