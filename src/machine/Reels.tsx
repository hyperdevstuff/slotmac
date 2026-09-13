import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useFrame, useThree } from '@react-three/fiber'
import { useSceneTheme } from '../theme/materials'
import { Reel } from './Reel'
import { REEL, REEL_DEPTH, REEL_OFFSET_X, REEL_READ_ANGLE } from './layout'
import { ORBIT_TARGET } from '../scene/view'
import { angleForItem, makeReelTexture, nearestAngleForItem } from '../lib/reelTexture'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { EASE } from '../lib/motion'
import { sfx } from '../lib/audio'

/** the middle reel stops last, so the draw resolves on the centre of the window */
const STOP_ORDER = [2, 1, 0]
const TARGET = new THREE.Vector3(...ORBIT_TARGET)

export function Reels() {
  const { def } = useSceneTheme()
  const camera = useThree((s) => s.camera)
  const phase = useGameStore((s) => s.phase)
  const spinId = useGameStore((s) => s.spinId)
  const reduceMotion = useGameStore((s) => s.reduceMotion)
  const muted = useGameStore((s) => s.muted)
  const setReel = useGameStore((s) => s.setReel)
  const settle = useGameStore((s) => s.settle)

  const deck = useDeckStore(activeDeck)
  const contents = useMemo(() => deck.reels.map((reel) => reel.items), [deck])

  const rig = useRef<THREE.Group>(null)
  const groups = useRef<(THREE.Group | null)[]>([null, null, null])
  /** gsap-tweenable angle per reel, mirrored onto group.rotation.x every frame */
  const spin = useRef([{ a: 0 }, { a: 0 }, { a: 0 }])
  const cameraDir = useRef(new THREE.Vector3())

  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(REEL.radius, REEL.radius, REEL.width, 64, 1, true, 0, Math.PI * 2)
    g.rotateZ(-Math.PI / 2)
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  // one strip per reel: a deck's reels can hold different numbers of items
  const textures = useMemo(
    () => contents.map((items) => makeReelTexture(items, def.mark, { background: def.reelBackground })),
    [contents, def],
  )
  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures])

  useFrame((_, delta) => {
    /*
     * The drums sit behind the aperture plane, so where they *appear* depends on the
     * camera angle. Shift the rig sideways by that projection offset each frame, so the
     * reels stay centred in the window wherever the machine is dragged to.
     *
     * Only sideways: the read row is a fixed physical height, so shifting the rig up
     * and down would make the result drift as the camera rises.
     */
    const node = rig.current
    if (node) {
      const direction = cameraDir.current.subVectors(camera.position, TARGET)
      const azimuth = THREE.MathUtils.clamp(Math.atan2(direction.x, direction.z), -0.7, 0.7)
      node.position.x = -REEL_DEPTH * Math.tan(azimuth)
      node.position.y = REEL.y
    }

    if (phase === 'intro') {
      for (let i = 0; i < REEL.count; i++) spin.current[i].a -= delta * (6.4 + i * 0.6)
    }
    for (let i = 0; i < REEL.count; i++) {
      const group = groups.current[i]
      if (group) group.rotation.x = spin.current[i].a
    }
  })

  /** park each drum on a clean item, and tell the store what it is showing */
  const parkReels = (random: boolean) => {
    for (let i = 0; i < REEL.count; i++) {
      const items = contents[i]
      if (!items || items.length === 0) continue
      const index = random ? Math.floor(Math.random() * items.length) : 0
      setReel(i, items[index])
      gsap.to(spin.current[i], {
        a: nearestAngleForItem(spin.current[i].a, index, items.length, REEL_READ_ANGLE),
        duration: reduceMotion ? 0.15 : 0.6,
        ease: EASE.settle,
      })
    }
  }

  // snap the idling reels once the intro lands
  const previousPhase = useRef(phase)
  useEffect(() => {
    const cameFromIntro = previousPhase.current === 'intro'
    previousPhase.current = phase
    if (!cameFromIntro || phase !== 'idle') return
    parkReels(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduceMotion, setReel])

  // swapping decks re-labels every drum, so re-park on the new contents
  useEffect(() => {
    if (phase === 'intro') return
    parkReels(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.id])

  useEffect(() => {
    if (spinId === 0) return

    const spinning = STOP_ORDER.map((reelIndex, order) => ({ reelIndex, order })).filter(
      ({ reelIndex }) => (contents[reelIndex]?.length ?? 0) > 0,
    )
    if (spinning.length === 0) {
      settle()
      return
    }

    let ticker: number | undefined
    if (!muted) ticker = window.setInterval(() => sfx.tick(), 68)

    const pending = new Set(spinning.map(({ reelIndex }) => reelIndex))
    const finish = (reelIndex: number) => {
      pending.delete(reelIndex)
      if (pending.size > 0) return
      if (ticker) window.clearInterval(ticker)
      settle()
    }

    const timelines = spinning.map(({ reelIndex, order }) => {
      const items = contents[reelIndex]
      const proxy = spin.current[reelIndex]
      const start = proxy.a
      const index = Math.floor(Math.random() * items.length)

      // travel at least `turns` full rotations, then land exactly on the item
      let target = angleForItem(index, items.length, REEL_READ_ANGLE)
      const limit = start - (4 + order) * Math.PI * 2
      while (target > limit) target -= Math.PI * 2

      const spinUp = reduceMotion ? 0.12 : 0.34
      const travel = reduceMotion ? 0.3 : 1.35 + order * 0.14

      const timeline = gsap.timeline({
        delay: reduceMotion ? 0 : order * 0.24,
        onComplete: () => {
          proxy.a = target
          setReel(reelIndex, items[index])
          sfx.stop()
          finish(reelIndex)
        },
      })

      timeline
        .to(proxy, { a: start + (target - start) * 0.3, duration: spinUp, ease: EASE.accel })
        .to(proxy, { a: target, duration: travel, ease: EASE.decel })
        .to(proxy, { a: target - 0.07, duration: 0.08, ease: 'none' })
        .to(proxy, { a: target, duration: reduceMotion ? 0.1 : 0.34, ease: EASE.settle })

      return timeline
    })

    return () => {
      if (ticker) window.clearInterval(ticker)
      timelines.forEach((timeline) => timeline.kill())
    }
  }, [spinId, muted, reduceMotion, contents, settle, setReel])

  return (
    <group ref={rig} position={[REEL_OFFSET_X, REEL.y, REEL.z]}>
      {Array.from({ length: REEL.count }, (_, i) => (
        <Reel
          key={i}
          ref={(element) => {
            groups.current[i] = element
          }}
          geometry={geometry}
          texture={textures[i]}
          position={[(i - (REEL.count - 1) / 2) * REEL.spacing, 0, 0]}
        />
      ))}
    </group>
  )
}
