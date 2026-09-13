import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useSceneTheme } from '../theme/materials'
import { Edges } from './Edges'
import { LEVER } from './layout'
import { useGameStore } from '../stores/gameStore'
import { interaction } from '../lib/interaction'
import { EASE } from '../lib/motion'
import { sfx } from '../lib/audio'

/** screen pixels -> radians while dragging the handle */
const DRAG_SCALE = 0.013
/** below this pointer travel we treat it as a click, not a drag */
const CLICK_SLOP = 6
/** how far the lever must be pulled before it counts as a spin */
const TRIGGER = 0.35
const SHAFT_RADIUS = 0.1

/** ring radius is nudged outside the sphere: a circle drawn exactly on the surface
 *  z-fights with it and comes out dotted or missing */
const RING_SCALE = 1.03

function ring(radius: number, plane: 'xy' | 'yz' | 'xz', segments = 32): [number, number, number][] {
  const r = radius * RING_SCALE
  const points: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const c = Math.cos(a) * r
    const s = Math.sin(a) * r
    if (plane === 'xy') points.push([c, s, 0])
    else if (plane === 'yz') points.push([0, c, s])
    else points.push([c, 0, s])
  }
  return points
}

export function Lever() {
  const { def, surface } = useSceneTheme()
  const requestSpin = useGameStore((s) => s.requestSpin)
  const spinId = useGameStore((s) => s.spinId)
  const reduceMotion = useGameStore((s) => s.reduceMotion)

  const armRef = useRef<THREE.Group>(null)
  const proxy = useRef({ a: LEVER.rest })
  const drag = useRef({ active: false, startY: 0, moved: 0 })

  const { armLength, knobRadius } = LEVER
  const knobY = armLength + knobRadius * 0.75

  const geometry = useMemo(
    () => ({
      plate: new THREE.BoxGeometry(0.5, 1.7, 1.2),
      bracket: new THREE.BoxGeometry(0.46, 0.4, 0.4),
      // few segments on purpose: EdgesGeometry then draws every longitudinal seam,
      // so the arm keeps its outline from any camera angle. Contour lines at fixed
      // angles only read from one direction, which is why the arm looked missing.
      shaft: new THREE.CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS, armLength, 8),
      knob: new THREE.SphereGeometry(knobRadius, 28, 18),
      hit: new THREE.BoxGeometry(1.05, armLength + knobRadius * 2.2, 1.05),
    }),
    [armLength, knobRadius],
  )
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])

  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    [],
  )
  useEffect(() => () => hitMaterial.dispose(), [hitMaterial])

  const knobRings = useMemo(
    () => [
      { points: ring(knobRadius, 'xy'), accent: false },
      { points: ring(knobRadius, 'xz'), accent: true },
      { points: ring(knobRadius, 'yz'), accent: false },
    ],
    [knobRadius],
  )

  const onMove = useCallback((event: PointerEvent) => {
    if (!drag.current.active) return
    const dy = event.clientY - drag.current.startY
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dy))
    proxy.current.a = THREE.MathUtils.clamp(LEVER.rest + dy * DRAG_SCALE, LEVER.rest, LEVER.pull)
  }, [])

  const endDrag = useCallback(() => {
    drag.current.active = false
    interaction.leverDrag = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', endDrag)
    window.removeEventListener('blur', endDrag)
    // covers the cancelled-drag cases, where nothing else would spring the arm back;
    // a normal release immediately overrides this with its own tween
    gsap.to(proxy.current, { a: LEVER.rest, duration: 0.45, ease: EASE.return })
  }, [onMove])

  const onUp = useCallback(() => {
    if (!drag.current.active) return
    const moved = drag.current.moved
    endDrag()

    const progress = (proxy.current.a - LEVER.rest) / (LEVER.pull - LEVER.rest)
    const isClick = moved < CLICK_SLOP

    if (isClick || progress > TRIGGER) {
      // let the spinId effect own the release animation so lever and reels share one source
      gsap.killTweensOf(proxy.current)
      sfx.lever()
      requestSpin()
    } else {
      gsap.to(proxy.current, { a: LEVER.rest, duration: 0.5, ease: EASE.return })
    }
  }, [endDrag, requestSpin])

  useEffect(
    () => () => {
      interaction.leverDrag = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', endDrag)
    },
    [onMove, onUp, endDrag],
  )

  useEffect(() => {
    if (spinId === 0) return
    const current = proxy.current
    gsap.killTweensOf(current)

    if (Math.abs(current.a - LEVER.rest) < 0.02) {
      const timeline = gsap.timeline()
      timeline
        .to(current, { a: LEVER.pull, duration: reduceMotion ? 0.1 : 0.26, ease: EASE.slam })
        .to(current, { a: LEVER.rest, duration: reduceMotion ? 0.2 : 0.62, ease: EASE.return })
    } else {
      gsap.to(current, { a: LEVER.rest, duration: reduceMotion ? 0.2 : 0.55, ease: EASE.return })
    }
  }, [spinId, reduceMotion])

  useFrame(() => {
    // pivots on X: the arm swings forward and down beside the cabinet, never across its face
    if (armRef.current) armRef.current.rotation.x = proxy.current.a
  })

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    sfx.unlock()
    gsap.killTweensOf(proxy.current)
    drag.current = { active: true, startY: event.clientY, moved: 0 }
    // suspend camera orbit for the duration of the drag; pointercancel and blur are
    // registered too, or a release outside the window would leave orbit disabled
    interaction.leverDrag = true
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', endDrag)
  }

  return (
    <group>
      {/* mounting plate, sitting on the outside of the cabinet's right flank */}
      <mesh
        geometry={geometry.plate}
        material={surface}
        position={[LEVER.pivot[0] - 0.3, LEVER.pivot[1], LEVER.pivot[2]]}
      />
      <Edges
        geometry={geometry.plate}
        color={def.line}
        lineWidth={def.edgeWidth * 0.9}
        opacity={0.7}
        threshold={def.edgeThreshold}
      />

      <group position={LEVER.pivot}>
        <mesh geometry={geometry.bracket} material={surface}>
          <Edges geometry={geometry.bracket} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
        </mesh>

        <group ref={armRef}>
          <mesh geometry={geometry.shaft} position={[0, armLength / 2, 0]} material={surface}>
            <Edges geometry={geometry.shaft} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
          </mesh>

          <mesh geometry={geometry.knob} position={[0, knobY, 0]} material={surface}>
            {knobRings.map(({ points, accent }, i) => (
              <Line
                key={i}
                points={points}
                color={accent ? def.accent : def.line}
                lineWidth={accent ? def.edgeWidth * 1.3 : def.edgeWidth * 0.9}
              />
            ))}
          </mesh>

          {/* fat, invisible grab target that travels with the arm */}
          <mesh
            geometry={geometry.hit}
            position={[0, (armLength + knobRadius) / 2, 0]}
            material={hitMaterial}
            onPointerDown={onPointerDown}
            onPointerOver={(event) => {
              event.stopPropagation()
              document.body.style.cursor = 'grab'
            }}
            onPointerOut={() => {
              document.body.style.cursor = ''
            }}
          />
        </group>
      </group>
    </group>
  )
}
