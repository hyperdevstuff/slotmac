import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

const DURATION = 2.8
const START_SCALE = 0.26
const END_SCALE = 1

/** smootherstep — smooth departure and arrival, and deliberately no bounce */
function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export interface EntranceOptions {
  reduceMotion: boolean
  /** land offset right of centre, so the landing copy has the left of the screen */
  offsetRight: boolean
  /** called once when the machine has settled — this is what hands over to play */
  onComplete: () => void
}

/**
 * Entrance animation only — there is no onboarding UI, so this runs once on load and
 * then gets out of the way.
 *
 * One normalized progress value drives position, scale and rotation, so the machine
 * cannot drift out of sync with itself:
 *
 *   start  — small, in the upper-right
 *   travel — a cubic Bézier curve that visibly bows out before arriving
 *   turn   — exactly one full 2π rotation around the vertical axis
 *   settle — eased to a stop, ending square to the camera at the centre
 *
 * Positions come from the live viewport in world units, not from hardcoded pixels.
 */
export function useEntranceTimeline(
  group: RefObject<THREE.Group | null>,
  { reduceMotion, offsetRight, onComplete }: EntranceOptions,
) {
  const viewport = useThree((s) => s.viewport)

  const doneRef = useRef(onComplete)
  useEffect(() => {
    doneRef.current = onComplete
  }, [onComplete])

  const { curve, end } = useMemo(() => {
    const w = viewport.width
    const h = viewport.height
    const end = new THREE.Vector3(offsetRight ? w * 0.13 : 0, 0, 0)
    const start = new THREE.Vector3(end.x + w * 0.17, end.y + h * 0.3, -2.4)
    return {
      end,
      curve: new THREE.CubicBezierCurve3(
        start,
        new THREE.Vector3(start.x + w * 0.07, start.y + h * 0.16, start.z + 0.9),
        new THREE.Vector3(w * 0.17, h * 0.12, -0.9),
        end,
      ),
    }
  }, [viewport.width, viewport.height, offsetRight])

  const elapsed = useRef(0)
  const finished = useRef(false)

  // reduced motion: snap straight to the final pose, no travel and no spin
  useEffect(() => {
    const node = group.current
    if (!node || !reduceMotion) return
    node.position.copy(end)
    node.scale.setScalar(END_SCALE)
    node.rotation.set(0, 0, 0)
    finished.current = true
    doneRef.current()
  }, [group, reduceMotion, end])

  useFrame((_, delta) => {
    const node = group.current
    if (!node || reduceMotion || finished.current) return

    elapsed.current += delta
    const raw = Math.min(1, elapsed.current / DURATION)
    const t = smootherstep(raw)

    curve.getPoint(t, node.position)
    node.scale.setScalar(START_SCALE + (END_SCALE - START_SCALE) * t)
    node.rotation.y = t * Math.PI * 2

    if (raw >= 1) {
      finished.current = true
      doneRef.current()
    }
  })
}
