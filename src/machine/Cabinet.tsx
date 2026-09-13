import { useEffect, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useSceneTheme } from '../theme/materials'
import { useFontsReady } from '../hooks/useFontsReady'
import { makeLabelTexture } from '../lib/labelTexture'
import { drumLabel } from '../lib/deck'
import { activeDeck, useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { Edges } from './Edges'
import {
  BODY_FRONT_Z,
  FRONT_Z,
  MARQUEE,
  PANEL,
  PAYLINE_Y,
  REEL,
  SECTIONS,
  WINDOW,
  WINDOW_BOTTOM,
  WINDOW_TOP,
} from './layout'

function Slab({
  size,
  position,
  variant = 'surface',
  children,
}: {
  size: [number, number, number]
  position: [number, number, number]
  variant?: 'surface' | 'panel'
  children?: ReactNode
}) {
  const { def, surface, panel } = useSceneTheme()
  const geometry = useMemo(
    () => new THREE.BoxGeometry(size[0], size[1], size[2]),
    [size[0], size[1], size[2]],
  )
  return (
    <group position={position}>
      <mesh geometry={geometry} material={variant === 'panel' ? panel : surface}>
        {children}
      </mesh>
      <Edges geometry={geometry} color={def.line} lineWidth={def.edgeWidth} threshold={def.edgeThreshold} />
    </group>
  )
}

function LabelPlane({
  text,
  size,
  position,
  color,
  fontSize = 44,
  weight = '600',
  tracking = 4,
  canvasWidth = 512,
  canvasHeight = 128,
}: {
  text: string
  size: [number, number]
  position: [number, number, number]
  color: string
  fontSize?: number
  weight?: string
  tracking?: number
  /** widen for long strings — text that runs past the canvas edge is silently cut */
  canvasWidth?: number
  canvasHeight?: number
}) {
  const fontsReady = useFontsReady()
  const texture = useMemo(
    () =>
      makeLabelTexture(text, {
        width: canvasWidth,
        height: canvasHeight,
        fontSize,
        weight,
        tracking,
        color,
      }),
    // `fontsReady` is deliberate: the label is redrawn once metrics are available
    [text, fontSize, weight, tracking, color, canvasWidth, canvasHeight, fontsReady],
  )
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function rectPoints(x0: number, y0: number, x1: number, y1: number, z: number) {
  return [
    [x0, y0, z],
    [x1, y0, z],
    [x1, y1, z],
    [x0, y1, z],
    [x0, y0, z],
  ] as [number, number, number][]
}

/** the ◄ ► marks either side of the payline */
function paylineArrow(x: number, direction: 1 | -1): [number, number, number][] {
  const z = FRONT_Z + 0.04
  const w = 0.22
  const h = 0.2
  return [
    [x, PAYLINE_Y, z],
    [x + w * direction, PAYLINE_Y + h, z],
    [x + w * direction, PAYLINE_Y - h, z],
    [x, PAYLINE_Y, z],
  ]
}

function sparkle(cx: number, cy: number, z: number, r: number): [number, number, number][] {
  return [
    [cx, cy + r, z],
    [cx + r * 0.4, cy, z],
    [cx, cy - r, z],
    [cx - r * 0.4, cy, z],
    [cx, cy + r, z],
  ]
}

export function Cabinet() {
  const { def, panel } = useSceneTheme()
  const z = FRONT_Z + 0.04

  const deck = useDeckStore(activeDeck)
  const reels = useGameStore((s) => s.reels)

  const screen = SECTIONS.screen
  const marquee = SECTIONS.marquee
  const mid = SECTIONS.mid
  const screenHalfW = screen.width / 2
  const screenHalfH = screen.height / 2
  const screenFrontZ = screen.depth / 2 - PANEL / 2
  const bezel = WINDOW.bar

  const dividerX = useMemo(() => [-REEL.spacing / 2, REEL.spacing / 2], [])

  const bolt = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 12)
    geometry.rotateX(Math.PI / 2)
    return geometry
  }, [])
  useEffect(() => () => bolt.dispose(), [bolt])

  const bolts = useMemo(() => {
    const points: [number, number, number][] = []
    for (const x of [-2.15, 2.15]) {
      for (const y of [marquee.centerY - 0.42, marquee.centerY + 0.42]) points.push([x, y, marquee.depth / 2 + 0.03])
      for (const y of [mid.centerY - 0.38, mid.centerY + 0.38]) points.push([x * 0.95, y, BODY_FRONT_Z + 0.1])
    }
    return points
  }, [marquee.centerY, marquee.depth, mid.centerY])

  return (
    <group>
      {/* ---------------- lower stack ---------------- */}
      <Slab
        size={[SECTIONS.base.width, SECTIONS.base.height, SECTIONS.base.depth]}
        position={[0, SECTIONS.base.centerY, 0]}
        variant="panel"
      />
      <Slab
        size={[SECTIONS.lower.width, SECTIONS.lower.height, SECTIONS.lower.depth]}
        position={[0, SECTIONS.lower.centerY, 0]}
      />
      <Slab
        size={[SECTIONS.console.width, SECTIONS.console.height, SECTIONS.console.depth]}
        position={[0, SECTIONS.console.centerY, 0]}
      />
      <Slab
        size={[SECTIONS.mid.width, SECTIONS.mid.height, SECTIONS.mid.depth]}
        position={[0, SECTIONS.mid.centerY, 0]}
      />

      {/* ---------------- screen housing ---------------- */}
      <group>
        <Slab size={[screen.width, screen.height, PANEL]} position={[0, screen.centerY, -screen.depth / 2 + PANEL / 2]} />
        <Slab size={[PANEL, screen.height, screen.depth]} position={[-screenHalfW + PANEL / 2, screen.centerY, 0]} />
        <Slab size={[PANEL, screen.height, screen.depth]} position={[screenHalfW - PANEL / 2, screen.centerY, 0]} />
        <Slab size={[screen.width, PANEL, screen.depth]} position={[0, screen.centerY + screenHalfH - PANEL / 2, 0]} />
        <Slab size={[screen.width, PANEL, screen.depth]} position={[0, screen.centerY - screenHalfH + PANEL / 2, 0]} />

        {/* front face, four strips around the aperture */}
        <Slab
          size={[screen.width, screen.centerY + screenHalfH - (WINDOW_TOP + bezel), PANEL]}
          position={[0, (WINDOW_TOP + bezel + screen.centerY + screenHalfH) / 2, screenFrontZ]}
        />
        <Slab
          size={[screen.width, WINDOW_BOTTOM - bezel - (screen.centerY - screenHalfH), PANEL]}
          position={[0, (WINDOW_BOTTOM - bezel + screen.centerY - screenHalfH) / 2, screenFrontZ]}
        />
        <Slab
          size={[screenHalfW - WINDOW.halfWidth - bezel, WINDOW.height + bezel * 2, PANEL]}
          position={[-(WINDOW.halfWidth + bezel + (screenHalfW - WINDOW.halfWidth - bezel) / 2), WINDOW.centerY, screenFrontZ]}
        />
        <Slab
          size={[screenHalfW - WINDOW.halfWidth - bezel, WINDOW.height + bezel * 2, PANEL]}
          position={[WINDOW.halfWidth + bezel + (screenHalfW - WINDOW.halfWidth - bezel) / 2, WINDOW.centerY, screenFrontZ]}
        />

        {/* thick bezel projecting forward around the aperture */}
        <Slab size={[WINDOW.halfWidth * 2 + bezel * 2, bezel, WINDOW.depth]} position={[0, WINDOW_TOP + bezel / 2, FRONT_Z]} />
        <Slab size={[WINDOW.halfWidth * 2 + bezel * 2, bezel, WINDOW.depth]} position={[0, WINDOW_BOTTOM - bezel / 2, FRONT_Z]} />
        <Slab size={[bezel, WINDOW.height, WINDOW.depth]} position={[-(WINDOW.halfWidth + bezel / 2), WINDOW.centerY, FRONT_Z]} />
        <Slab size={[bezel, WINDOW.height, WINDOW.depth]} position={[WINDOW.halfWidth + bezel / 2, WINDOW.centerY, FRONT_Z]} />

        <Line points={rectPoints(-WINDOW.halfWidth, WINDOW_BOTTOM, WINDOW.halfWidth, WINDOW_TOP, z)} color={def.line} lineWidth={def.edgeWidth} />
        {dividerX.map((x) => (
          <Line
            key={x}
            points={[
              [x, WINDOW_BOTTOM, z],
              [x, WINDOW_TOP, z],
            ]}
            color={def.line}
            lineWidth={def.edgeWidth * 0.8}
            transparent
            opacity={0.4}
          />
        ))}

        <Line points={paylineArrow(-WINDOW.halfWidth - 0.14, 1)} color={def.accent} lineWidth={def.edgeWidth} />
        <Line points={paylineArrow(WINDOW.halfWidth + 0.14, -1)} color={def.accent} lineWidth={def.edgeWidth} />

        {/* inner frame set back from the bezel, so the screen reads as a recess */}
        {(() => {
          const bar = 0.1
          const recessZ = FRONT_Z - 0.24
          return (
            <>
              <Slab size={[WINDOW.halfWidth * 2, bar, 0.48]} position={[0, WINDOW_TOP - bar / 2, recessZ]} variant="panel" />
              <Slab size={[WINDOW.halfWidth * 2, bar, 0.48]} position={[0, WINDOW_BOTTOM + bar / 2, recessZ]} variant="panel" />
              <Slab size={[bar, WINDOW.height, 0.48]} position={[-(WINDOW.halfWidth - bar / 2), WINDOW.centerY, recessZ]} variant="panel" />
              <Slab size={[bar, WINDOW.height, 0.48]} position={[WINDOW.halfWidth - bar / 2, WINDOW.centerY, recessZ]} variant="panel" />
            </>
          )
        })()}

        {/* vents on the right flank of the lower cabinet, now that the camera sees it */}
        {[-0.8, -0.25, 0.3, 0.85].map((dy) => (
          <Line
            key={dy}
            points={[
              [SECTIONS.lower.width / 2 + 0.01, SECTIONS.lower.centerY + dy, -1.1],
              [SECTIONS.lower.width / 2 + 0.01, SECTIONS.lower.centerY + dy, 1.1],
            ]}
            color={def.line}
            lineWidth={def.edgeWidth * 0.7}
            transparent
            opacity={0.35}
          />
        ))}
      </group>

      {/* ---------------- trim band where the marquee meets the screen ---------------- */}
      <Slab size={[marquee.width + 0.3, 0.14, screen.depth + 0.06]} position={[0, screen.centerY + screenHalfH + 0.07, 0]} variant="panel" />

      {/* ---------------- marquee ---------------- */}
      <group>
        <Slab size={[marquee.width, marquee.height, marquee.depth]} position={[0, marquee.centerY, 0]} />
        <Slab
          size={[marquee.width - 0.6, marquee.height - 0.36, 0.1]}
          position={[0, marquee.centerY, marquee.depth / 2 + 0.04]}
          variant="panel"
        />
        <LabelPlane
          text={MARQUEE.text}
          size={[3.2, 0.46]}
          position={[0, marquee.centerY, marquee.depth / 2 + 0.11]}
          color={def.line}
          fontSize={56}
          tracking={14}
        />
        <Line points={sparkle(-2.0, marquee.centerY, marquee.depth / 2 + 0.11, 0.14)} color={def.accent} lineWidth={def.edgeWidth * 0.9} />
        <Line points={sparkle(2.0, marquee.centerY, marquee.depth / 2 + 0.11, 0.14)} color={def.accent} lineWidth={def.edgeWidth * 0.9} />
      </group>

      {/* ---------------- readout: the drawn brief ---------------- */}
      <group>
        <Slab size={[5.4, 1.2, 0.28]} position={[0, mid.centerY, BODY_FRONT_Z - 0.04]} variant="panel" />

        {/* accent rules so the plate reads as a lit display rather than a blank box */}
        {[mid.centerY + 0.56, mid.centerY - 0.56].map((y) => (
          <Line
            key={y}
            points={[
              [-2.6, y, BODY_FRONT_Z + 0.13],
              [2.6, y, BODY_FRONT_Z + 0.13],
            ]}
            color={def.accent}
            lineWidth={def.edgeWidth}
            transparent
            opacity={0.55}
          />
        ))}

        <LabelPlane
          text={`${deck.name} · brief`}
          size={[1.68, 0.28]}
          position={[0, mid.centerY + 0.32, BODY_FRONT_Z + 0.14]}
          color={def.lineDim}
          fontSize={62}
          tracking={7}
          weight="500"
        />

        {/* one column per reel; plane aspects match the canvas (4:1) or text is squashed */}
        {[0, 1, 2].map((index) => {
          const item = reels[index]
          return (
            <LabelPlane
              key={index}
              text={item ? drumLabel(item).toUpperCase() : '—'}
              size={[1.5, 0.375]}
              position={[(index - 1) * 1.75, mid.centerY - 0.12, BODY_FRONT_Z + 0.14]}
              color={item ? def.accent : def.lineDim}
              fontSize={92}
              tracking={4}
            />
          )
        })}
      </group>

      {/* ---------------- front grille on the lower cabinet ---------------- */}
      <group>
        {[-0.45, -0.15, 0.15, 0.45].map((dy) => (
          <Line
            key={dy}
            points={[
              [-2.5, SECTIONS.lower.centerY + dy - 1.0, BODY_FRONT_Z + 0.03],
              [-1.75, SECTIONS.lower.centerY + dy - 1.0, BODY_FRONT_Z + 0.03],
            ]}
            color={def.line}
            lineWidth={def.edgeWidth * 0.7}
            transparent
            opacity={0.35}
          />
        ))}
      </group>

      {/* ---------------- rivets ---------------- */}
      {bolts.map((position) => (
        <mesh key={position.join(',')} geometry={bolt} material={panel} position={position} />
      ))}
    </group>
  )
}
