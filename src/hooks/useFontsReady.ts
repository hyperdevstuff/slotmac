import { useEffect, useState } from 'react'
import { fontsReady } from '../lib/labelTexture'

/** flips true once the webfonts are loaded, so canvas-drawn labels re-measure correctly */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    fontsReady().then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  return ready
}
