import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useSceneTheme } from '../theme/materials'
import { REEL } from './layout'

interface ReelProps {
  geometry: THREE.BufferGeometry
  texture: THREE.Texture
  position: [number, number, number]
}

type Point = [number, number, number]

function rim(radius: number, x: number, segments = 56): Point[] {
  const points: Point[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    points.push([x, Math.cos(a) * radius, Math.sin(a) * radius])
  }
  return points
}

/**
 * The working end of a drum: a spoked wheel with a hub and a single rod off the hub
 * running down past the rim. Returned as loose segment pairs so one Line can draw the
 * whole thing, and drawn on both ends so it reads from either side.
 */
function wheelFace(x: number, radius: number): Point[] {
  const segments: Point[] = []
  const at = (angle: number, r: number): Point => [x, Math.cos(angle) * r, Math.sin(angle) * r]
  const push = (a: Point, b: Point) => segments.push(a, b)

  const rimRadius = radius * 0.9
  const hubRadius = radius * 0.22

  for (let i = 0; i < 40; i++) {
    push(at((i / 40) * Math.PI * 2, rimRadius), at(((i + 1) / 40) * Math.PI * 2, rimRadius))
  }
  for (let i = 0; i < 16; i++) {
    push(at((i / 16) * Math.PI * 2, hubRadius), at(((i + 1) / 16) * Math.PI * 2, hubRadius))
  }
  for (let i = 0; i < 6; i++) {
    push(at((i / 6) * Math.PI * 2, hubRadius), at((i / 6) * Math.PI * 2, rimRadius))
  }

  // the rod: one stick off the hub heading straight down, out past the rim
  push(at(-Math.PI / 2, hubRadius), at(-Math.PI / 2, radius * 1.08))

  // axle stub poking out of the middle
  const outward = x === 0 ? 1 : Math.sign(x)
  push([x, 0, 0], [x + outward * 0.2, 0, 0])

  return segments
}

/**
 * A drum whose symbol strip is a canvas texture. The geometry's axis is baked to X, so
 * the parent group spins the reel by rotating on X.
 */
export const Reel = forwardRef<THREE.Group, ReelProps>(function Reel({ geometry, texture, position }, ref) {
  const { def } = useSceneTheme()

  const transparent = def.reelBackground === null
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.85,
        transparent,
        depthWrite: !transparent,
        // without back faces the open-ended tube is see-through, and the far wheel
        // shows straight through the drum
        side: THREE.DoubleSide,
      }),
    [texture, transparent],
  )
  useEffect(() => () => material.dispose(), [material])

  const rims = useMemo(() => [rim(REEL.radius, -REEL.width / 2), rim(REEL.radius, REEL.width / 2)], [])
  const faces = useMemo(
    () => [wheelFace(-REEL.width / 2 - 0.02, REEL.radius), wheelFace(REEL.width / 2 + 0.02, REEL.radius)],
    [],
  )

  return (
    <group ref={ref} position={position}>
      <mesh geometry={geometry} material={material} />
      <Line points={rims[0]} color={def.line} lineWidth={def.edgeWidth * 0.7} transparent opacity={0.5} />
      <Line points={rims[1]} color={def.line} lineWidth={def.edgeWidth * 0.7} transparent opacity={0.5} />
      {faces.map((points, i) => (
        <Line
          key={i}
          points={points}
          segments
          color={def.line}
          lineWidth={def.edgeWidth * 0.6}
          transparent
          opacity={0.45}
        />
      ))}
    </group>
  )
})
