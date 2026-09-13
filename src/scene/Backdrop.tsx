/** CSS-only backdrop: the blueprint grid and vignette behind the transparent canvas. */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__grid" />
      <div className="backdrop__vignette" />
    </div>
  )
}
