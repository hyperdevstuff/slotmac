/**
 * Shared between the in-scene lever and the camera controls: OrbitControls listens on
 * the same canvas, so without this a lever drag would also spin the camera.
 */
export const interaction = { leverDrag: false }
