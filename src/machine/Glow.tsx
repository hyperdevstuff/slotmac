import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useSceneTheme } from '../theme/materials'
import { GLOW_Z, REEL, REEL_OFFSET_X, SECTIONS } from './layout'
import { useGameStore } from '../stores/gameStore'

/**
 * Accent glow behind the reels plus a pool of light on the floor. The pool does the
 * grounding that a shadow normally would — a dark shadow is invisible against a
 * near-black backdrop, but a soft light spill still reads and gives the machine a
 * surface to sit on.
 *
 * This stands in for post-processing bloom on purpose: the canvas is transparent so
 * the CSS backdrop shows through, and a composer pass would flatten that to black.
 */
function makeRadialTexture(inner: string, mid: string): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, inner)
  gradient.addColorStop(0.45, mid)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const FLOOR_Y = SECTIONS.base.centerY - SECTIONS.base.height / 2 - 0.02

export function Glow() {
  const { def } = useSceneTheme()
  const phase = useGameStore((s) => s.phase)

  const texture = useMemo(() => makeRadialTexture(def.accent, `${def.accent}55`), [def.accent])
  const floorTexture = useMemo(() => makeRadialTexture(def.accent, `${def.accent}22`), [def.accent])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [texture],
  )
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: floorTexture,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    [floorTexture],
  )

  useEffect(
    () => () => {
      texture.dispose()
      floorTexture.dispose()
      material.dispose()
      floorMaterial.dispose()
    },
    [texture, floorTexture, material, floorMaterial],
  )

  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    const base = 0.18
    // lifts while a brief is sitting on the payline, so the draw is the lit moment
    const target = phase === 'result' ? base + 0.16 : base
    material.opacity += (target - material.opacity) * Math.min(1, delta * 4)
    if (ref.current) ref.current.scale.setScalar(1 + (material.opacity - base) * 0.35)
  })

  return (
    <group>
      <mesh ref={ref} position={[REEL_OFFSET_X, REEL.y, GLOW_Z]} material={material}>
        <planeGeometry args={[6.5, 4.4]} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, 0.5]}
        material={floorMaterial}
      >
        <planeGeometry args={[16, 12]} />
      </mesh>
    </group>
  )
}
