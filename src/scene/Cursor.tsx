import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { attachCursor, setDragging } from '../lib/cursor'

/**
 * Gives the canvas its grab / grabbing cursor. The machine is always draggable, so the
 * pointer says so even before you touch it.
 */
export function Cursor() {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const node = gl.domElement
    const detach = attachCursor(node)
    const down = () => setDragging(true)
    const up = () => setDragging(false)

    node.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      detach()
      node.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl])

  return null
}
