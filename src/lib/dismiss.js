import { useEffect, useRef } from 'react'

/*
 * Close a sheet, drawer or popup when the press lands outside it.
 *
 * It listens on pointerdown rather than click because a press that starts
 * outside and drifts onto the panel never fires a click on the page, and the
 * sheet would stay open. The listener is added on the next frame: the same
 * press that opened the panel is often still propagating, and binding
 * immediately would close it the instant it appeared.
 *
 * Escape is wired up here too — anything dismissable by clicking away should
 * answer the key as well, and both paths end in the same callback.
 */
export function useDismissOnOutside(ref, open, onClose) {
  // Callers pass a fresh arrow function every render. Holding it in a ref
  // keeps the effect keyed on `open` alone, so the listeners are bound once
  // per opening rather than torn down and rebuilt on every render.
  const latest = useRef(onClose)
  latest.current = onClose

  useEffect(() => {
    if (!open) return undefined

    let live = true

    function onDown(event) {
      const node = ref.current
      if (!node || node.contains(event.target)) return
      latest.current?.()
    }

    function onKey(event) {
      if (event.key === 'Escape') latest.current?.()
    }

    const frame = window.requestAnimationFrame(() => {
      if (!live) return
      document.addEventListener('pointerdown', onDown, true)
      document.addEventListener('keydown', onKey)
    })

    return () => {
      live = false
      window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open])
}
