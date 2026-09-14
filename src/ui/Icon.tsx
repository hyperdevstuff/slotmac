import type { IconDef } from '../lib/icons'

interface IconProps {
  icon: IconDef
  size?: number
  className?: string
  /** the sources draw at weight 2; small UI chips read better a touch lighter */
  weight?: number
}

/** Renders a vendored icon in the DOM, in the same stroke language as the drums. */
export function Icon({ icon, size = 24, className, weight = 2 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon.paths.map((path, index) => (
        <path key={index} d={path.d} fill={path.fill ? 'currentColor' : 'none'} />
      ))}
    </svg>
  )
}
