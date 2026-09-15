import type { SVGProps } from 'react'

/**
 * Small line-art glyphs drawn inline rather than pulled from an icon package: they
 * only need to match the machine's stroke language (thin, round-capped, currentColor)
 * and there are four of them.
 */
const base: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

/** a typeface — two letterforms on a baseline */
export function TypeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19 9 5l5 14" />
      <path d="M5.8 14h6.4" />
      <path d="M16 19V9" />
      <path d="M16 13.6c.9-1.1 3.4-1.1 4 1.2V19" />
    </svg>
  )
}

/** a palette — an outline with three swatch dots */
export function ColourIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.5-1.9-.4-1.3.5-2.4 1.9-2.4h1.3A3.8 3.8 0 0 0 20.5 12 8.5 8.5 0 0 0 12 3.5Z" />
      <circle cx="8.6" cy="9.4" r="1" />
      <circle cx="12.4" cy="7.6" r="1" />
      <circle cx="16" cy="10.2" r="1" />
    </svg>
  )
}

/** a component — a frame with a block and a line inside */
export function ComponentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M7 8.5h6" />
      <path d="M7 12h10" />
      <path d="M7 15.5h4" />
    </svg>
  )
}

/** a play — triangle, the enter gesture */
export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 5v14l12-7z" />
    </svg>
  )
}

/** a lever — the machine's own gesture, used as the call-to-action mark */
export function LeverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19h6" />
      <path d="M8 19V9.5" />
      <path d="M8 9.5 16.5 5" />
      <circle cx="17.6" cy="4.4" r="2.1" />
    </svg>
  )
}

export function SoundIcon({ muted, ...props }: SVGProps<SVGSVGElement> & { muted?: boolean }) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z" />
      {muted ? <path d="M15 9.5l4 5M19 9.5l-4 5" /> : <path d="M15 9c1.4 1.6 1.4 4.4 0 6" />}
    </svg>
  )
}
