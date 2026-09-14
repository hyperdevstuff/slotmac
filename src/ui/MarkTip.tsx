import { useEffect, useRef } from 'react'
import { useHoverStore } from '../stores/hoverStore'
import styles from './MarkTip.module.css'

/**
 * The label that follows the cursor while a library mark on the back of the machine is
 * under it — names the brand and the domain it came from.
 *
 * Always mounted and faded in and out, so it keeps its node between hovers and does not
 * flash at the top-left corner before the first mouse move.
 */
export function MarkTip() {
  const mark = useHoverStore((state) => state.mark)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (event: MouseEvent) => {
      const node = ref.current
      if (!node) return
      node.style.transform = `translate3d(${event.clientX + 16}px, ${event.clientY + 18}px, 0)`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div ref={ref} className={styles.tip} data-show={mark !== null} aria-hidden={mark === null}>
      <span className={styles.name}>{mark?.name ?? ''}</span>
      <span className={styles.host}>{mark?.host ?? ''}</span>
    </div>
  )
}
