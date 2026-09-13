import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useSceneTheme } from '../theme/materials'
import { useFontsReady } from '../hooks/useFontsReady'
import { makeLabelTexture } from '../lib/labelTexture'
import { Edges } from './Edges'
import { SECTIONS } from './layout'
import { canSpin, useGameStore } from '../stores/gameStore'
import { sfx } from '../lib/audio'

const FRONT = SECTIONS.console.depth / 2
const SIDE = [0.52, 0.44, 0.2] as const
const SPIN = [1.9, 0.5, 0.24] as const

/** console deck: two small buttons flanking the wide SPIN bar */
export function Buttons() {
  const { def, surface, panel } = useSceneTheme()
  const requestSpin = useGameStore((s) => s.requestSpin)
  const phase = useGameStore((s) => s.phase)
  const live = canSpin(phase)
  const fontsReady = useFontsReady()
  const glowRef = useRef<THREE.Mesh>(null)

  const geometries = useMemo(
    () => ({
      side: new THREE.BoxGeometry(SIDE[0], SIDE[1], SIDE[2]),
      spin: new THREE.BoxGeometry(SPIN[0], SPIN[1], SPIN[2]),
    }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  const label = useMemo(
    () => makeLabelTexture('SPIN', { width: 512, height: 128, fontSize: 62, tracking: 16, color: def.accent }),
    [def.accent, fontsReady],
  )
  useEffect(() => () => label.dispose(), [label])

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(def.accent),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [def.accent],
  )
  useEffect(() => () => glowMaterial.dispose(), [glowMaterial])

  /** the SPIN bar breathes while a spin is available and goes dark while the reels run */
  useFrame((state, delta) => {
    const target = live ? 0.3 + Math.sin(state.clock.elapsedTime * 2.2) * 0.13 : 0
    glowMaterial.opacity += (target - glowMaterial.opacity) * Math.min(1, delta * 5)
    if (glowRef.current) glowRef.current.visible = glowMaterial.opacity > 0.01
  })

  const press = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    sfx.unlock()
    requestSpin()
  }

  return (
    <group position={[0, SECTIONS.console.centerY, 0]}>
      <mesh position={[0, 0, FRONT - 0.05]} material={panel}>
        <boxGeometry args={[4.9, 0.44, 0.14]} />
      </mesh>

      {[-1.55, 1.55].map((x) => (
        <group key={x} position={[x, 0.02, FRONT + 0.02]}>
          <mesh geometry={geometries.side} material={surface} />
          <Edges
            geometry={geometries.side}
            color={def.line}
            lineWidth={def.edgeWidth}
            threshold={def.edgeThreshold}
          />
        </group>
      ))}

      <group position={[0, 0.03, FRONT + 0.03]}>
        {/* glow sits just behind the bar so it reads as a backlit cap */}
        <mesh ref={glowRef} position={[0, 0, -0.16]} material={glowMaterial}>
          <planeGeometry args={[2.6, 0.95]} />
        </mesh>

        <mesh
          geometry={geometries.spin}
          material={surface}
          onPointerDown={press}
          onPointerOver={(event) => {
            event.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = ''
          }}
        />
        <Edges
          geometry={geometries.spin}
          color={def.accent}
          lineWidth={def.edgeWidth * 1.2}
          threshold={def.edgeThreshold}
        />
        <mesh position={[0, 0, SPIN[2] / 2 + 0.01]}>
          <planeGeometry args={[1.25, 0.3]} />
          <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
