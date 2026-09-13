import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { VIEW_DIR, ORBIT_TARGET } from './view'

const FOV = 30
const DEG = Math.PI / 180
/** world units the framing must contain */
const FIT_HEIGHT = 12.8
const FIT_WIDTH = 9.2
const TARGET = new THREE.Vector3(...ORBIT_TARGET)

/**
 * Frames the machine on load and keeps it framed when the viewport changes.
 *
 * The camera is otherwise owned by OrbitControls, so this only ever adjusts the
 * *distance* — it preserves whatever direction the user has dragged to, rather than
 * snapping the view back.
 */
export function IsoCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const first = useRef(true)

  useEffect(() => {
    const halfTan = Math.tan((FOV / 2) * DEG)
    const aspect = Math.max(0.2, size.width / size.height)
    // a perspective camera needs a distance rather than a zoom, and narrow viewports
    // need more of it
    const distance = Math.max(FIT_HEIGHT / 2 / halfTan, FIT_WIDTH / 2 / (halfTan * aspect))

    const direction = new THREE.Vector3()
    if (first.current) {
      direction.set(VIEW_DIR[0], VIEW_DIR[1], VIEW_DIR[2])
      first.current = false
    } else {
      direction.subVectors(camera.position, TARGET)
      if (direction.lengthSq() < 1e-6) direction.set(VIEW_DIR[0], VIEW_DIR[1], VIEW_DIR[2])
      direction.normalize()
    }

    camera.fov = FOV
    camera.position.copy(TARGET).addScaledVector(direction.normalize(), distance)
    camera.lookAt(TARGET)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  return null
}
