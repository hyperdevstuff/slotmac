import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useSceneTheme } from '../theme/materials'
import { Edges } from './Edges'
import { BODY_FRONT_Z, SECTIONS } from './layout'

/** coin entry and payout tray on the lower cabinet */
export function CoinSlot() {
  const { def, surface, panel } = useSceneTheme()

  const plate = useMemo(() => new THREE.BoxGeometry(2.5, 0.8, 0.22), [])
  const tray = useMemo(() => new THREE.BoxGeometry(2.9, 1.1, 0.6), [])
  const lip = useMemo(() => new THREE.BoxGeometry(2.5, 0.28, 0.3), [])

  const slotY = SECTIONS.lower.centerY + 0.95
  const trayY = SECTIONS.lower.centerY - 0.6

  return (
    <group>
      {/* coin entry */}
      <group position={[0, slotY, BODY_FRONT_Z - 0.02]}>
        <mesh geometry={plate} material={panel} />
        <Edges geometry={plate} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
        <Line
          points={[
            [-0.72, 0.06, 0.12],
            [0.72, 0.06, 0.12],
          ]}
          color={def.accent}
          lineWidth={def.edgeWidth * 1.6}
        />
        <Line
          points={[
            [-0.72, -0.2, 0.12],
            [0.72, -0.2, 0.12],
          ]}
          color={def.line}
          lineWidth={def.edgeWidth * 0.8}
          transparent
          opacity={0.4}
        />
      </group>

      {/* payout tray */}
      <group position={[0, trayY, BODY_FRONT_Z - 0.16]}>
        <mesh geometry={tray} material={panel} />
        <Edges geometry={tray} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
        <Line
          points={[
            [-1.25, 0.34, 0.32],
            [1.25, 0.34, 0.32],
            [1.25, -0.4, 0.32],
            [-1.25, -0.4, 0.32],
            [-1.25, 0.34, 0.32],
          ]}
          color={def.line}
          lineWidth={def.edgeWidth * 0.9}
          transparent
          opacity={0.4}
        />
      </group>

      {/* tray lip, poking out under the opening */}
      <group position={[0, trayY - 0.62, BODY_FRONT_Z + 0.02]}>
        <mesh geometry={lip} material={surface} />
        <Edges geometry={lip} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
      </group>
    </group>
  )
}
