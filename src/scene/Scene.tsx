import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SlotMachine } from '../machine/SlotMachine'
import { IsoCamera } from './IsoCamera'
import { Lighting } from './Lighting'
import { Orbit } from './Orbit'
import { VIEW_DIR } from './view'

const START_DISTANCE = 26

export function Scene() {
  return (
    <div className="stage">
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{
          fov: 30,
          position: [
            VIEW_DIR[0] * START_DISTANCE,
            VIEW_DIR[1] * START_DISTANCE,
            VIEW_DIR[2] * START_DISTANCE,
          ],
          near: 0.5,
          far: 400,
        }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <IsoCamera />
        <Lighting />
        <Suspense fallback={null}>
          <SlotMachine />
        </Suspense>
        <Orbit />
      </Canvas>
    </div>
  )
}
