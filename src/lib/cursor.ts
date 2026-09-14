/**
 * What the mouse looks like over the machine. Three things want a say: dragging the
 * camera (grab → grabbing), a mark that can be clicked (pointer), and nothing in
 * particular (grab, because the machine can always be turned).
 *
 * It is a module rather than React state on purpose: the canvas is one element shared by
 * the scene and the controls, so the last writer has to win, and that is easier to get
 * right in one place than spread across hover handlers.
 */
let element: HTMLElement | null = null
let dragging = false
let pointing = false

function apply() {
  if (!element) return
  element.style.cursor = dragging ? 'grabbing' : pointing ? 'pointer' : 'grab'
}

/** take over the canvas's cursor; returns the detach handle */
export function attachCursor(node: HTMLElement): () => void {
  element = node
  apply()
  return () => {
    if (element === node) element = null
  }
}

export function setDragging(value: boolean) {
  dragging = value
  apply()
}

export function setPointing(value: boolean) {
  pointing = value
  apply()
}
