import { useGameStore } from '../stores/gameStore'
import { sfx } from '../lib/audio'
import { Button } from './Button'
import { SoundIcon } from './icons'

export function SoundToggle() {
  const muted = useGameStore((s) => s.muted)
  const setMuted = useGameStore((s) => s.setMuted)

  return (
    <Button
      aria-pressed={muted}
      active={!muted}
      onClick={() => {
        sfx.unlock()
        setMuted(!muted)
      }}
    >
      <SoundIcon width={15} height={15} muted={muted} />
      {muted ? 'sound off' : 'sound on'}
    </Button>
  )
}
