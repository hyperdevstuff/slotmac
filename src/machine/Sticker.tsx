import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useSceneTheme } from '../theme/materials'
import { makeMarkTexture, LUCIDE_MARK, RUNE_MARK, type MarkDef } from '../lib/stickerTexture'
import { setPointing } from '../lib/cursor'
import { useHoverStore } from '../stores/hoverStore'
import { BACK_MARKS } from './layout'

/**
 * The two stickers. `scale` compensates for how much of its own viewBox a mark actually
 * fills — the Lucide logo only spans about three quarters of its 24×24 box, so at the
 * same nominal size it would read smaller than the Rune glyph next to it.
 */
const MARKS: { mark: MarkDef; tilt: number; position: [number, number, number]; scale: number }[] = [
  { mark: RUNE_MARK, scale: 1, ...BACK_MARKS.rune },
  { mark: LUCIDE_MARK, scale: 1.25, ...BACK_MARKS.lucide },
]

const scratchA = new THREE.Vector3()
const scratchB = new THREE.Vector3()

/**
 * The marks face -z, and R3F only raycasts objects that have handlers — so the cabinet
 * does not block them, and hovering the *front* of the machine would light them up
 * through it. Gate on the camera actually being behind the machine.
 */
function isFacing(camera: THREE.Camera, position: readonly [number, number, number]): boolean {
  const direction = scratchA
    .subVectors(camera.position, scratchB.set(position[0], position[1], position[2]))
    .normalize()
  return direction.z < -0.2
}

/**
 * Two attribution stickers on the back of the display — Rune Icons and Lucide. Hovering
 * one names it and where it came from; clicking it opens that site. Nothing in the UI
 * points at them; you find them by dragging the machine around to the back.
 */
export function Sticker() {
  const { def } = useSceneTheme()
  const camera = useThree((state) => state.camera)
  const setMark = useHoverStore((state) => state.setMark)

  const textures = useMemo(
    () => MARKS.map(({ mark }) => makeMarkTexture(mark, def.line)),
    [def.line],
  )
  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures])

  const hovered = useRef<MarkDef | null>(null)

  const clear = () => {
    if (!hovered.current) return
    hovered.current = null
    setPointing(false)
    setMark(null)
  }

  // turning away from a sticker should drop its tooltip, even if the pointer stays put
  useFrame(() => {
    const mark = hovered.current
    if (!mark) return
    const placed = MARKS.find((entry) => entry.mark === mark)
    if (placed && !isFacing(camera, placed.position)) clear()
  })

  // leaving the scene (or the view) must not strand the tooltip or the pointer cursor
  useEffect(() => () => clear(), [])

  const over = (mark: MarkDef, position: [number, number, number]) => (event: ThreeEvent<PointerEvent>) => {
    if (!isFacing(camera, position)) return
    event.stopPropagation()
    hovered.current = mark
    setPointing(true)
    setMark({ name: mark.name, host: mark.host })
  }

  const out = (mark: MarkDef) => () => {
    if (hovered.current === mark) clear()
  }

  const click = (mark: MarkDef, position: [number, number, number]) => () => {
    if (!isFacing(camera, position)) return
    window.open(mark.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {MARKS.map(({ mark, tilt, position, scale }, index) => (
        <mesh
          key={mark.name}
          position={position}
          rotation={[0, Math.PI, tilt]}
          onPointerOver={over(mark, position)}
          onPointerOut={out(mark)}
          onClick={click(mark, position)}
        >
          <planeGeometry
            args={[
              BACK_MARKS.size *
                scale *
                (mark.viewBox.width / mark.viewBox.height),
              BACK_MARKS.size * scale,
            ]}
          />
          <meshBasicMaterial
            map={textures[index]}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}
