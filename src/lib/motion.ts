export const EASE = {
  /** reel spin-up */
  accel: 'power2.in',
  /** reel deceleration into the stop */
  decel: 'power3.out',
  /** mechanical bounce on landing */
  settle: 'back.out(1.7)',
  /** lever slam */
  slam: 'power3.in',
  /** lever return */
  return: 'back.out(1.8)',
  /** camera / onboarding travel */
  travel: 'power3.inOut',
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
