import { useEffect, useRef } from 'react'
import { useSponsorStore } from '../stores/sponsorStore'
import { Button } from './Button'
import styles from './Sponsors.module.css'

export function Sponsors() {
  const open = useSponsorStore((s) => s.open)

  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={styles.side} data-side={side} aria-label={`${side} sponsor spaces`}>
          {[2, 8].map((square) => (
            <button
              key={square}
              type="button"
              className={styles.tile}
              style={{ gridArea: `${square === 2 ? 1 : 3} / 2` }}
              aria-label={`Sponsor ${side} square ${square}`}
              onClick={() => open(`${side}-${square}` as 'left-2' | 'left-8' | 'right-2' | 'right-8')}
            >
              <span className={styles.plus} aria-hidden="true">+</span>
              <span className={styles.title}>Your brand here</span>
              <span className={styles.caption}>Sponsor slot ↗</span>
            </button>
          ))}
        </div>
      ))}
      <button type="button" className={styles.mobile} onClick={() => open('marquee')}>sponsor spaces</button>
    </>
  )
}

/** Native dialog supplies focus trapping, Escape dismissal and background inertness. */
export function SponsorDialog() {
  const placement = useSponsorStore((s) => s.placement)
  const close = useSponsorStore((s) => s.close)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (placement && !dialog.current?.open) dialog.current?.showModal()
    if (!placement && dialog.current?.open) dialog.current.close()
  }, [placement])

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="sponsor-title" aria-describedby="sponsor-description" onClose={close}>
      <div className={styles.dialogHead}>
        <h2 id="sponsor-title">Sponsor slot</h2>
        <Button onClick={close} aria-label="Close sponsorship details">close</Button>
      </div>
      <p id="sponsor-description">Want your brand here? Get in touch with Harsh.</p>
      <div className={styles.contacts}>
        <a href="https://x.com/work_with_harsh" target="_blank" rel="noopener noreferrer">
          <span className={styles.caption}>X / Twitter</span>
          <span>@work_with_harsh ↗</span>
        </a>
        <a href="mailto:harshch.work@proton.me">
          <span className={styles.caption}>Email</span>
          <span>harshch.work@proton.me ↗</span>
        </a>
      </div>
    </dialog>
  )
}
