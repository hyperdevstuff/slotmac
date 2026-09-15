import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingShapeProps {
  position: [number, number, number]
  baseRotation: [number, number, number]
  speed: number
  geometry: THREE.BufferGeometry
  scale: number
}

function FloatingShape({ position, baseRotation, speed, geometry, scale }: FloatingShapeProps) {
  const ref = useRef<THREE.Group>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + offset
    if (!ref.current) return
    ref.current.rotation.x = baseRotation[0] + Math.sin(t * speed * 0.3) * 0.3
    ref.current.rotation.y = baseRotation[1] + t * speed * 0.15
    ref.current.rotation.z = baseRotation[2] + Math.cos(t * speed * 0.2) * 0.2
    ref.current.position.y = position[1] + Math.sin(t * speed * 0.4) * 0.8
  })

  return (
    <group ref={ref} position={position} rotation={baseRotation} scale={scale}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#0b0f18" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#4d7cff" transparent opacity={0.4} />
      </lineSegments>
    </group>
  )
}

const GEOMETRY_TYPES = [
  () => new THREE.IcosahedronGeometry(1, 0),
  () => new THREE.OctahedronGeometry(1, 0),
  () => new THREE.TetrahedronGeometry(1, 0),
  () => new THREE.BoxGeometry(1.2, 1.2, 1.2),
  () => new THREE.ConeGeometry(0.8, 1.6, 6),
  () => new THREE.TorusGeometry(0.7, 0.25, 6, 12),
]

/**
 * The distant constellation of floating geometric forms that lives behind the
 * machine. Rendered inside the main Scene so the slot machine always stays in
 * front, but the shapes are semi-transparent and far enough back to never
 * compete for attention.
 */
export function RandomizedBackdrop() {
  const shapes = useMemo(() => {
    const count = 18
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 20 + Math.random() * 15
      const y = (Math.random() - 0.5) * 12
      return {
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        baseRotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        speed: 0.4 + Math.random() * 0.6,
        geometry: GEOMETRY_TYPES[Math.floor(Math.random() * GEOMETRY_TYPES.length)](),
        scale: 0.4 + Math.random() * 0.8,
      }
    })
  }, [])

  return (
    <group>
      {shapes.map((props, i) => (
        <FloatingShape key={i} {...props} />
      ))}
    </group>
  )
}
