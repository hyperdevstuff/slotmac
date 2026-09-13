/**
 * View direction and framing.
 *
 * The default is square-on: straight front, slightly above. `AZIMUTH` is the
 * horizontal swing, `ELEVATION` the height above the machine's centre.
 *
 * The camera is a *perspective* lens — an orthographic one keeps every vertical
 * parallel, which is the main reason a front-on machine reads as a flat drawing.
 *
 * The orbit is deliberately unclamped, so the reels and the aperture have to cope
 * with being looked at from anywhere. See `Reels` and `machine/layout.ts`.
 */
const DEG = Math.PI / 180

/** horizontal swing of the default view. 0 = straight front. */
export const AZIMUTH = 0
/** height of the default view above centre. 0 = level with the machine. */
export const ELEVATION = 12 * DEG

/** horizontal shift per unit of depth, when projecting onto the front face */
export const PROJECT_XZ = Math.tan(AZIMUTH)
/** vertical shift per unit of depth */
export const PROJECT_YZ = Math.tan(ELEVATION) / Math.cos(AZIMUTH)

/** unit direction from the machine toward the camera */
export const VIEW_DIR: [number, number, number] = [
  Math.cos(ELEVATION) * Math.sin(AZIMUTH),
  Math.sin(ELEVATION),
  Math.cos(ELEVATION) * Math.cos(AZIMUTH),
]

/** the point the camera orbits, shared by the controls and the reel compensation */
export const ORBIT_TARGET: [number, number, number] = [0, -0.2, 0]

/**
 * The aperture is *sized* as if seen from this azimuth, so it still frames the drums
 * once the camera is swung round. Larger = looser frame at rest, less cropping when
 * rotated; smaller = tighter at rest, crops sooner.
 */
export const APERTURE_DESIGN_AZIMUTH = 12 * DEG
