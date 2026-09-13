import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { prefersReducedMotion } from '../lib/motion'
import { sfx } from '../lib/audio'

/**
 * Applies the environment settings that live outside React: the OS "reduce motion"
 * preference and the mute flag.
 */
export function useAppSync() {
  const setReduceMotion = useGameStore((s) => s.setReduceMotion)
  const muted = useGameStore((s) => s.muted)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(prefersReducedMotion())
    const onChange = () => setReduceMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [setReduceMotion])

  useEffect(() => {
    sfx.setMuted(muted)
  }, [muted])
}
