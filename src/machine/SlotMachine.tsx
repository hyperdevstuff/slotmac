import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import gsap from 'gsap'
import { useGameStore } from '../stores/gameStore'
import { Cabinet } from './Cabinet'
import { Reels } from './Reels'
import { CoinSlot } from './CoinSlot'
import { Buttons } from './Buttons'
import { Lever } from './Lever'
import { Glow } from './Glow'
import { useEntranceTimeline } from '../intro/useEntranceTimeline'

export function SlotMachine() {
  const group = useRef<THREE.Group>(null)
  const view = useGameStore((s) => s.view)
  const reduceMotion = useGameStore((s) => s.reduceMotion)
  const finishIntro = useGameStore((s) => s.finishIntro)

  useEntranceTimeline(group, { reduceMotion, offsetRight: true, onComplete: finishIntro })

  // leaving the landing: the machine slides in to take the centre of the screen
  useEffect(() => {
    const node = group.current
    if (!node || view !== 'play') return
    if (reduceMotion) {
      // don't route the reduced-motion path through an animation at all
      node.position.x = 0
      return
    }
    gsap.to(node.position, { x: 0, duration: 1.2, ease: 'power3.inOut' })
  }, [view, reduceMotion])

  return (
    <group ref={group}>
      <Cabinet />
      <Reels />
      <CoinSlot />
      <Buttons />
      <Lever />
      <Glow />
    </group>
  )
}
