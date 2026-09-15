import { useEffect, useState } from 'react'
import { Backdrop } from './scene/Backdrop'
import { Scene } from './scene/Scene'
import { Hud } from './ui/Hud'
import { Landing } from './ui/Landing'
import { MarkTip } from './ui/MarkTip'
import { useAppSync } from './theme/useAppSync'
import { useGameStore } from './stores/gameStore'
import { hasWebGL } from './lib/webgl'

function NoWebGL() {
  return (
    <div className="stage fallback">
      <div className="fallback__panel">
        <p className="fallback__title">3D unavailable</p>
        <p className="fallback__body">
          This machine needs WebGL. Try a current desktop browser, or enable hardware acceleration.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  useAppSync()
  const [webgl] = useState(() => hasWebGL())
  const view = useGameStore((s) => s.view)
  const phase = useGameStore((s) => s.phase)
  const enter = useGameStore((s) => s.enter)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return
      event.preventDefault()
      const state = useGameStore.getState()
      if (state.view === 'landing') {
        if (state.phase !== 'intro') state.enter()
        return
      }
      state.requestSpin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const landingVisible = view === 'landing' && phase !== 'intro'

  return (
    <>
      <Backdrop />
      {webgl ? <Scene /> : <NoWebGL />}
      <Landing visible={landingVisible} onPlay={enter} />
      <Hud />
      <MarkTip />
    </>
  )
}
