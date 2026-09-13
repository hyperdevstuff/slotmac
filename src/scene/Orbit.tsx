import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { interaction } from '../lib/interaction'
import { ORBIT_TARGET } from './view'

/**
 * Drag to turn the machine around, wheel to zoom. Suspended while the lever is being
 * dragged, otherwise grabbing the lever would rotate the scene at the same time.
 *
 * Azimuth is unclamped — you can walk all the way around. Polar is limited only so you
 * cannot end up directly overhead or underneath the floor. Past roughly 25° off-square
 * the drums begin to fall outside their window, which is what looking through a window
 * at an angle actually does.
 */
export function Orbit() {
  const ref = useRef<OrbitControlsImpl>(null)

  // dev-only handle so the camera can be inspected from the console
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(globalThis as unknown as { __orbit?: OrbitControlsImpl | null }).__orbit = ref.current
  }, [])

  useFrame(() => {
    const controls = ref.current
    if (controls) controls.enabled = !interaction.leverDrag
  })

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={ORBIT_TARGET}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.65}
      zoomSpeed={0.6}
      minDistance={14}
      maxDistance={52}
      minPolarAngle={0.08}
      maxPolarAngle={1.62}
    />
  )
}
