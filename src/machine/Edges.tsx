import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface EdgesProps {
  geometry: THREE.BufferGeometry
  color: string
  lineWidth: number
  threshold?: number
  opacity?: number
}

/**
 * Thin, constant-width outlines. Uses drei's <Line> (Line2 / LineMaterial) so the
 * stroke has a real pixel width — a plain LineBasicMaterial is clamped to 1px on
 * most WebGL implementations, which kills the CAD/ink look.
 */
export function Edges({ geometry, color, lineWidth, threshold = 24, opacity = 1 }: EdgesProps) {
  const points = useMemo(() => {
    const edges = new THREE.EdgesGeometry(geometry, threshold)
    const position = edges.getAttribute('position')
    const out: [number, number, number][] = []
    for (let i = 0; i < position.count; i++) {
      out.push([position.getX(i), position.getY(i), position.getZ(i)])
    }
    edges.dispose()
    return out
  }, [geometry, threshold])

  if (points.length === 0) return null

  return (
    <Line
      points={points}
      segments
      color={color}
      lineWidth={lineWidth}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}
